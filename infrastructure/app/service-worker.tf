# 
# IAM 
# 

resource "aws_iam_role" "worker_task_definition_iam_role" {
  name               = "${terraform.workspace}_worker_task_definition_role"
  assume_role_policy = file("${path.module}/policies/ecs_task_role.json")

  tags = {
    Environment = terraform.workspace
  }
}

resource "aws_iam_role_policy" "worker_task_definition_iam_role_policy" {
  name = "${terraform.workspace}-worker_ecs_role_policy"
  role = aws_iam_role.worker_task_definition_iam_role.id

  policy = file("${path.module}/policies/ecs_access.json")
}

# 
# LOGS
# 

resource "aws_cloudwatch_log_group" "worker_cloudwatch_log_group" {
  name = "/ecs/${terraform.workspace}_worker_logs"

  tags = {
    Environment = terraform.workspace
  }
}

# 
# TASKS
# 

variable "worker_image" {
  type = string
}

resource "aws_secretsmanager_secret" "worker_env" {
  name                    = "${terraform.workspace}-worker-env"
  recovery_window_in_days = 0

  tags = {
    Environment = terraform.workspace
  }
}

resource "aws_secretsmanager_secret_version" "worker_env_secret_version" {
  secret_id = aws_secretsmanager_secret.worker_env.id
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
    AWS_REGION            = "ap-southeast-2"
    AWS_DEFAULT_REGION    = "ap-southeast-2"
    # PDFCO
    PDF_CO_API_ENDPOINT = var.PDF_CO_API_ENDPOINT
    PDF_CO_API_KEY      = var.PDF_CO_API_KEY
    # AWS RESOURCES
    POSTGRES_PRISMA_URL = "${data.tfe_outputs.services.values.DATABASE_URL}?connection_limit=20&pool_timeout=30"
    S3_UPLOAD_BUCKET    = data.tfe_outputs.services.values.S3_UPLOAD_BUCKET
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
resource "aws_ecs_task_definition" "worker_container" {
  family = "${terraform.workspace}-worker_container"

  container_definitions = templatefile("${path.module}/task-definitions/worker.json", {
    IMAGE                   = var.worker_image,
    AWSLOGS_REGION          = var.aws_region,
    BRAILLE_ENV             = var.BRAILLE_ENV,
    LANGCHAIN_TRACING_V2    = var.LANGCHAIN_TRACING_V2
    AWSLOGS                 = aws_cloudwatch_log_group.worker_cloudwatch_log_group.name,
    ENV_SECRET              = aws_secretsmanager_secret.worker_env.arn
    REDIS_HOST              = data.tfe_outputs.services.values.REDIS_HOST
    ACTION_EXECUTION_QUEUE  = data.tfe_outputs.services.values.ACTION_EXECUTION_QUEUE
    INGESTION_SPAWNER_QUEUE = data.tfe_outputs.services.values.INGESTION_SPAWNER_QUEUE
    INGESTION_TASK_QUEUE    = data.tfe_outputs.services.values.INGESTION_TASK_QUEUE
  })

  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024

  execution_role_arn = aws_iam_role.worker_task_definition_iam_role.arn
}


# 
# SERVICE
# 

resource "aws_ecs_service" "worker" {
  name                       = "${terraform.workspace}-worker"
  cluster                    = aws_ecs_cluster.app_cluster.id
  task_definition            = aws_ecs_task_definition.worker_container.arn
  launch_type                = "FARGATE"
  desired_count              = 1
  deployment_maximum_percent = 300

  network_configuration {
    subnets          = data.tfe_outputs.services.values.private_subnets
    security_groups  = [aws_security_group.worker_service_sg.id]
    assign_public_ip = false
  }

  service_connect_configuration {
    enabled   = true
    namespace = "private.braille"

    service {
      discovery_name = "worker"
      port_name      = "service"
      client_alias {
        port     = 9000
        dns_name = "worker.private.braille"
      }
    }
  }
}


resource "aws_security_group" "worker_service_sg" {
  name        = "worker_service_sg_${terraform.workspace}"
  description = "Worker Service Security Group"
  vpc_id      = data.aws_vpc.vpc.id

  ingress {
    from_port   = 9000
    to_port     = 9000
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

