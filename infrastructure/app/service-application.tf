# 
# IAM 
# 


resource "aws_iam_role" "application_task_definition_iam_role" {
  name               = "${terraform.workspace}_application_task_definition_role"
  assume_role_policy = file("${path.module}/policies/ecs_task_role.json")

  tags = {
    Environment = terraform.workspace
  }
}

resource "aws_iam_role_policy" "application_task_definition_iam_role_policy" {
  name = "${terraform.workspace}-application_ecs_role_policy"
  role = aws_iam_role.application_task_definition_iam_role.id

  policy = file("${path.module}/policies/ecs_access.json")
}

# 
# LOGS
# 

resource "aws_cloudwatch_log_group" "application_cloudwatch_log_group" {
  name = "/ecs/${terraform.workspace}_application_logs"

  tags = {
    Environment = terraform.workspace
  }
}

resource "aws_cloudwatch_log_group" "workflow_cloudwatch_log_group" {
  name = "/ecs/braille-workflow"

  tags = {
    Environment = terraform.workspace
  }
}

# 
# TASKS
# 

variable "application_image" {
  type = string
}

resource "aws_secretsmanager_secret" "application_env" {
  name                    = "${terraform.workspace}-app-env"
  recovery_window_in_days = 0

  tags = {
    Environment = terraform.workspace
  }
}

resource "aws_secretsmanager_secret_version" "application_env_secret_version" {
  secret_id = aws_secretsmanager_secret.application_env.id
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
    # PDFCO
    PDF_CO_API_ENDPOINT = var.PDF_CO_API_ENDPOINT
    PDF_CO_API_KEY      = var.PDF_CO_API_KEY
    # AWS RESOURCES
    POSTGRES_PRISMA_URL     = "${data.tfe_outputs.services.values.DATABASE_URL}?connection_limit=20"
    S3_UPLOAD_BUCKET        = data.tfe_outputs.services.values.S3_UPLOAD_BUCKET
    WORKER_SQS_QUEUE        = data.tfe_outputs.services.values.WORKER_SQS_QUEUE
    RECEIVE_PDFCO_SQS_QUEUE = data.tfe_outputs.services.values.RECEIVE_PDFCO_SQS_QUEUE
    SIGNING_KEY_ID          = data.tfe_outputs.services.values.SIGNING_KEY_ID
    NEW_RELIC_API_KEY       = var.NEW_RELIC_API_KEY
  })
}

# Defines the api container task definition
resource "aws_ecs_task_definition" "application_container" {
  family = "${terraform.workspace}-application_container"

  container_definitions = templatefile("${path.module}/task-definitions/application.json", {
    IMAGE                      = var.application_image,
    AWSLOGS_REGION             = var.aws_region
    AWSLOGS                    = aws_cloudwatch_log_group.application_cloudwatch_log_group.name,
    ENV_SECRET                 = aws_secretsmanager_secret.application_env.arn
    UPLOADS_HOSTNAME           = data.tfe_outputs.services.values.DOCUMENTS_HOSTNAME
    SIGNING_PRIVATE_KEY_SECRET = data.tfe_outputs.services.values.SIGNING_PRIVATE_KEY_SECRET
    REDIS_HOST                 = data.tfe_outputs.services.values.REDIS_HOST
    STRUCTURED_DATA_JOB_QUEUE  = data.tfe_outputs.services.values.STRUCTURED_DATA_JOB_QUEUE
    ACTION_EXECUTION_TOPIC_ARN = data.tfe_outputs.services.values.ACTION_EXECUTION_TOPIC_ARN
    INGESTION_SPAWNER_QUEUE    = data.tfe_outputs.services.values.INGESTION_SPAWNER_QUEUE
    AUTH0_CONNECTION_ID        = var.AUTH0_CONNECTION_ID
    AUTH0_MANAGEMENT_DOMAIN    = var.AUTH0_MANAGEMENT_DOMAIN
    STATSIG_API_KEY            = var.STATSIG_API_KEY
    BASE_URL                   = "https://${var.domain}"
    AUTH0_SESSION_AUTO_SAVE    = false
    AUTH0_DOMAIN               = var.AUTH0_DOMAIN
    APP_DOMAIN                 = var.APP_DOMAIN
    EMAIL_FROM_ADDRESS         = var.EMAIL_FROM_ADDRESS
  })

  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 1024
  memory                   = 2048

  execution_role_arn = aws_iam_role.application_task_definition_iam_role.arn
}


# 
# SERVICE
# 

resource "aws_ecs_service" "application" {
  name                              = "${terraform.workspace}-application"
  cluster                           = aws_ecs_cluster.app_cluster.id
  task_definition                   = aws_ecs_task_definition.application_container.arn
  health_check_grace_period_seconds = 300
  launch_type                       = "FARGATE"
  desired_count                     = 1
  deployment_maximum_percent        = 300
  # depends on is required to ensure the listener target groups listener is ready
  depends_on = [aws_lb_listener.app_listener]

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "braille-application"
    container_port   = 3000
  }

  network_configuration {
    subnets          = data.tfe_outputs.services.values.public_subnets
    security_groups  = [aws_security_group.app_service_sg.id]
    assign_public_ip = true
  }

  service_connect_configuration {
    enabled   = true
    namespace = "private.braille"
  }
}

resource "aws_security_group" "app_service_sg" {
  name        = "app_service_sg_${terraform.workspace}"
  description = "App Service Security Group"
  vpc_id      = data.aws_vpc.vpc.id

  ingress {
    from_port   = 3000
    to_port     = 3000
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


# LOAD BALANCER TARGET GROUP

resource "aws_lb_target_group" "app" {
  name        = "${terraform.workspace}-app"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.vpc.id
  target_type = "ip"

  health_check {
    path     = "/healthcheck"
    interval = 30
  }
}
