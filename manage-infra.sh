#!/bin/bash

set -e

# Default values
WORKSPACE="dev"
REGION="ca-central-1"

# Infrastructure root directory
INFRA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/infrastructure"
COMPONENTS=("shared" "services" "app")

function usage() {
    echo "Usage: $0 [options] {deploy|destroy}"
    echo "Options:"
    echo "  -w, --workspace WORKSPACE      Terraform workspace (default: dev)"
    echo "  -r, --region REGION           AWS region (default: ca-central-1)"
    echo "  -p, --profile PROFILE         AWS profile to use"
    echo "  -t, --tf-token TOKEN         Terraform Cloud token"
    echo "  -a, --app-image IMAGE        Application Docker image tag"
    echo "  -k, --worker-image IMAGE     Worker Docker image tag"
    echo "  -h, --help                   Show this help message"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -w|--workspace)
            WORKSPACE="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -p|--profile)
            AWS_PROFILE="$2"
            shift 2
            ;;
        -t|--tf-token)
            TF_TOKEN="$2"
            shift 2
            ;;
        -a|--app-image)
            APP_IMAGE="$2"
            shift 2
            ;;
        -k|--worker-image)
            WORKER_IMAGE="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        deploy|destroy)
            COMMAND="$1"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Validate required inputs
if [ -z "$COMMAND" ]; then
    echo "Error: Command (deploy or destroy) is required"
    usage
fi

# Validate required variables for deploy command
if [ "$COMMAND" = "deploy" ]; then
    if [ -z "$APP_IMAGE" ]; then
        echo "Error: Application image (-a, --app-image) is required for deployment"
        usage
    fi
    if [ -z "$WORKER_IMAGE" ]; then
        echo "Error: Worker image (-k, --worker-image) is required for deployment"
        usage
    fi
fi

# Set up environment
function setup_environment() {
    # Export AWS region
    export AWS_DEFAULT_REGION="$REGION"
    
    # Set AWS profile if provided
    if [ ! -z "$AWS_PROFILE" ]; then
        export AWS_PROFILE="$AWS_PROFILE"
    fi
    
    # Set Terraform token if provided
    if [ ! -z "$TF_TOKEN" ]; then
        export TF_TOKEN_app="$TF_TOKEN"
        export TF_TOKEN_services="$TF_TOKEN"
        export TF_TOKEN_shared="$TF_TOKEN"
    fi
    
    # Verify AWS credentials
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        echo "Error: Unable to authenticate with AWS. Please check your credentials."
        exit 1
    fi
}

function log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

function destroy_infrastructure() {
    log "Starting infrastructure destruction..."
    
    # Set up environment
    setup_environment
    
    # Destroy in reverse order (app -> services -> shared)
    for component in $(printf '%s\n' "${COMPONENTS[@]}" | tac); do
        log "Destroying $component infrastructure..."
        
        # Initialize Terraform and handle workspace
        init_terraform "$component"
        
        # Destroy infrastructure
        if terraform destroy -auto-approve; then
            log "Successfully destroyed $component infrastructure"
        else
            log "Error destroying $component infrastructure"
            return 1
        fi
    done
}

function reset_state() {
    log "Resetting Terraform state..."
    
    for component in "${COMPONENTS[@]}"; do
        log "Resetting state for $component..."
        
        # Initialize Terraform and handle workspace
        init_terraform "$component"
        
        # List all resources in state
        resources=$(terraform state list || echo "")
        
        if [ ! -z "$resources" ]; then
            # Remove each resource from state
            echo "$resources" | while read -r resource; do
                log "Removing $resource from state..."
                terraform state rm "$resource" || true
            done
        fi
        
        log "State reset complete for $component"
    done
}

function create_tfvars() {
    local component=$1
    local tfvars_file="$INFRA_ROOT/$component/terraform.auto.tfvars"
    
    # Create or truncate tfvars file
    > "$tfvars_file"
    
    # Add variables based on component
    case "$component" in
        "app")
            if [ ! -z "$APP_IMAGE" ]; then
                echo "application_image = \"$APP_IMAGE\"" >> "$tfvars_file"
            fi
            if [ ! -z "$WORKER_IMAGE" ]; then
                echo "worker_image = \"$WORKER_IMAGE\"" >> "$tfvars_file"
            fi
            ;;
    esac
}

function init_terraform() {
    local component=$1
    cd "$INFRA_ROOT/$component"
    
    # Initialize Terraform
    terraform init
    
    # Handle workspace selection for components that support it
    case "$component" in
        "app"|"services")
            # Create workspace if it doesn't exist
            terraform workspace new "$WORKSPACE" 2>/dev/null || true
            # Select workspace
            terraform workspace select "$WORKSPACE"
            ;;
        "shared")
            # Shared infrastructure doesn't use workspaces
            log "Skipping workspace selection for shared infrastructure"
            ;;
    esac
    
    # Create tfvars file
    create_tfvars "$component"
}

function deploy_infrastructure() {
    log "Starting infrastructure deployment..."
    
    # Set up environment
    setup_environment
    
    # Deploy in order (shared -> services -> app)
    for component in "${COMPONENTS[@]}"; do
        log "Deploying $component infrastructure..."
        
        # Initialize Terraform and handle workspace
        init_terraform "$component"
        
        # Apply infrastructure
        if terraform apply -auto-approve; then
            log "Successfully deployed $component infrastructure"
        else
            log "Error deploying $component infrastructure"
            return 1
        fi
    done
}

# Main script execution
case "$COMMAND" in
    "destroy")
        destroy_infrastructure
        reset_state
        log "Infrastructure destroyed and state reset complete"
        ;;
    "deploy")
        deploy_infrastructure
        log "Infrastructure deployment complete"
        ;;
    *)
        echo "Invalid command: $COMMAND"
        usage
        ;;
esac
