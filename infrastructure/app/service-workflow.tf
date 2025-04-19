# 
# IAM 
# 

resource "aws_iam_role" "workflow_task_definition_iam_role" {
  name               = "${terraform.workspace}_workflow_task_definition_role"
  assume_role_policy = file("${path.module}/policies/ecs_task_role.json")

  tags = {
    Environment = terraform.workspace
  }
}

resource "aws_iam_role_policy" "workflow_task_definition_iam_role_policy" {
  name = "${terraform.workspace}-workflow_ecs_role_policy"
  role = aws_iam_role.workflow_task_definition_iam_role.id

  policy = file("${path.module}/policies/ecs_access.json")
}

# 
# LOGS
# 

resource "aws_cloudwatch_log_group" "workflow_cloudwatch_log_group" {
  name = "/ecs/${terraform.workspace}_workflow_logs"

  tags = {
    Environment = terraform.workspace
  }
}

# 
# TASKS
# 

variable "workflow_image" {
  type = string
}

resource "aws_secretsmanager_secret" "workflow_env" {
  name                    = "${terraform.workspace}-workflow-env"
  recovery_window_in_days = 0

  tags = {
    Environment = terraform.workspace
  }
}

resource "aws_secretsmanager_secret_version" "workflow_env_secret_version" {
  secret_id = aws_secretsmanager_secret.workflow_env.id
  secret_string = jsonencode({
    # ENV
    OPENAI_API_KEY = var.OPENAI_API_KEY
    # AUTH0
    AUTH0_CLIENT_ID       = var.AUTH0_CLIENT_ID
    AUTH0_CLIENT_SECRET   = var.AUTH0_CLIENT_SECRET
    AUTH0_SECRET          = var.AUTH0_SECRET
    AUTH0_ISSUER_BASE_URL = local.AUTH0_ISSUER_BASE_URL
    AUTH0_BASE_URL        = "https://${var.domain}"
    # AWS
    AWS_ACCESS_KEY_ID     = var.AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY = var.AWS_SECRET_ACCESS_KEY
    AWS_REGION            = "ca-central-1"
    AWS_DEFAULT_REGION    = "ca-central-1"
    # AWS RESOURCES
    POSTGRES_PRISMA_URL = "${data.tfe_outputs.services.values.DATABASE_URL}?connection_limit=20&pool_timeout=30"
    # QUEUES + TOPICS
    PDFCO_JOB_TOPIC_ARN               = data.tfe_outputs.services.values.PDFCO_JOB_TOPIC_ARN
    WORKER_SQS_QUEUE                  = data.tfe_outputs.services.values.WORKER_SQS_QUEUE
    RECEIVE_PDFCO_SQS_QUEUE           = data.tfe_outputs.services.values.RECEIVE_PDFCO_SQS_QUEUE
    STRUCTURED_DATA_JOB_SPAWNER_QUEUE = data.tfe_outputs.services.values.STRUCTURED_DATA_JOB_SPAWNER_QUEUE
    STRUCTURED_DATA_JOB_QUEUE         = data.tfe_outputs.services.values.STRUCTURED_DATA_JOB_QUEUE
    DOCUMENTS_TOPIC_ARN               = data.tfe_outputs.services.values.DOCUMENTS_TOPIC_ARN
    ENTITIES_TOPIC_ARN                = data.tfe_outputs.services.values.ENTITIES_TOPIC_ARN
    ENTITY_EMBEDDINGS_QUEUE           = data.tfe_outputs.services.values.ENTITY_EMBEDDINGS_QUEUE
    NEW_RELIC_API_KEY                 = var.NEW_RELIC_API_KEY,
    LANGCHAIN_API_KEY                 = var.LANGCHAIN_API_KEY
  })
}

# Defines the api container task definition
resource "aws_ecs_task_definition" "workflow_container" {
  family = "${terraform.workspace}-workflow_container"

  container_definitions = templatefile("${path.module}/task-definitions/workflow.json", {
    IMAGE                   = var.worker_image,
    AWSLOGS_REGION          = var.aws_region,
    BRAILLE_ENV             = var.BRAILLE_ENV,
    LANGCHAIN_TRACING_V2    = var.LANGCHAIN_TRACING_V2
    AWSLOGS                 = aws_cloudwatch_log_group.workflow_cloudwatch_log_group.name,
    ENV_SECRET              = aws_secretsmanager_secret.workflow_env.arn
    REDIS_HOST              = data.tfe_outputs.services.values.REDIS_HOST
    ACTION_EXECUTION_QUEUE  = data.tfe_outputs.services.values.ACTION_EXECUTION_QUEUE
    INGESTION_SPAWNER_QUEUE = data.tfe_outputs.services.values.INGESTION_SPAWNER_QUEUE
    INGESTION_TASK_QUEUE    = data.tfe_outputs.services.values.INGESTION_TASK_QUEUE
    WORKSPACE               = terraform.workspace
  })

  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024

  execution_role_arn = aws_iam_role.workflow_task_definition_iam_role.arn
  task_role_arn      = aws_iam_role.workflow_task_definition_iam_role.arn
}


# 
# SERVICE
# 

resource "aws_ecs_service" "workflow" {
  name                       = "${terraform.workspace}-workflow"
  cluster                    = aws_ecs_cluster.app_cluster.id
  task_definition            = aws_ecs_task_definition.workflow_container.arn
  launch_type                = "FARGATE"
  desired_count              = 1
  deployment_maximum_percent = 300
  enable_execute_command     = true

  network_configuration {
    subnets          = data.tfe_outputs.services.values.private_subnets
    security_groups  = [aws_security_group.workflow_service_sg.id]
    assign_public_ip = false
  }

  service_connect_configuration {
    enabled   = true
    namespace = "private.braille"

    service {
      discovery_name = "workflow"
      port_name      = "workflow-service"
      client_alias {
        port     = 9001
        dns_name = "workflow.private.braille"
      }
    }
  }
}


resource "aws_security_group" "workflow_service_sg" {
  name        = "workflow_service_sg_${terraform.workspace}"
  description = "Workflow Service Security Group"
  vpc_id      = data.aws_vpc.vpc.id

  ingress {
    from_port   = 9001
    to_port     = 9001
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.vpc.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Environment = terraform.workspace
  }
}

