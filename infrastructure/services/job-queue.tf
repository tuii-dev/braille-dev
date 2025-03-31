# TOPICS
locals {
  PDF_JOB_CREATED_TOPIC_NAME  = "${terraform.workspace}-uploads-topic"
  DOCUMENTS_TOPIC_NAME        = "${terraform.workspace}-documents-topic"
  ENTITY_TOPIC_NAME           = "${terraform.workspace}-entity-topic"
  ACTION_EXECUTION_TOPIC_NAME = "${terraform.workspace}-action-topic"
}

# QUEUES
locals {
  JOB_QUEUE_NAME                                  = "${terraform.workspace}-job-queue"
  RETRIEVE_PDFCO_QUEUE_NAME                       = "${terraform.workspace}-pdfco-retrieve-queue"
  STRUCTURED_DATA_EXTRACTION_JOB_SPAWN_QUEUE_NAME = "${terraform.workspace}-structure-data-job-spawner-queue"
  STRUCTURED_DATA_EXTRACTION_JOB_QUEUE_NAME       = "${terraform.workspace}-structure-data-job-queue"
  ENTITY_EMBEDDINGS_QUEUE                         = "${terraform.workspace}-entity-embeddings-queue"
  ACTION_EXECUTION_QUEUE                          = "${terraform.workspace}-action-execution-queue"
}


# DOCUMENT UPLOAD QUEUE
# The queue responsible for uploading documents to PDFco

resource "aws_sqs_queue" "job_queue" {
  name                       = local.JOB_QUEUE_NAME
  delay_seconds              = 0
  visibility_timeout_seconds = 60
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.job_deadletter_queue.arn
    maxReceiveCount     = 4
  })

  policy = data.aws_iam_policy_document.upload_bucket_queue.json
}

resource "aws_sqs_queue" "job_deadletter_queue" {
  name                       = "${local.JOB_QUEUE_NAME}-deadletter"
  delay_seconds              = 0
  visibility_timeout_seconds = 60
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10
}

### Policy that allows s3 to send messages to the job queue
data "aws_iam_policy_document" "upload_bucket_queue" {
  statement {
    effect = "Allow"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions   = ["sqs:SendMessage"]
    resources = ["arn:aws:sqs:*:*:${local.JOB_QUEUE_NAME}"]

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_s3_bucket.uploads.arn]
    }
  }
}

# Sends PDF uploads to the  job queue
resource "aws_s3_bucket_notification" "bucket_pdf_upload_notification" {
  bucket = aws_s3_bucket.uploads.id

  queue {
    queue_arn     = aws_sqs_queue.job_queue.arn
    events        = ["s3:ObjectCreated:*"]
    filter_suffix = ".pdf"
  }
}


# PDFCO RETRIEVAL QUEUE
# The queue responsible for retrieving job results from PDFco

resource "aws_sqs_queue" "pdfco_retrive_queue" {
  name                       = local.RETRIEVE_PDFCO_QUEUE_NAME
  delay_seconds              = 5
  visibility_timeout_seconds = 10
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.pdfco_retrive_deadletter_queue.arn
    maxReceiveCount     = 4
  })
}

resource "aws_sqs_queue" "pdfco_retrive_deadletter_queue" {
  name                       = "${local.RETRIEVE_PDFCO_QUEUE_NAME}-deadletter"
  delay_seconds              = 0
  visibility_timeout_seconds = 60
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10
}

# JOB SPAWN QUEUE
# The queue responsible for creating extraction jobs and placing extraction jobs in the extraction queue

resource "aws_sqs_queue" "structured_data_job_spawn_queue" {
  name                       = local.STRUCTURED_DATA_EXTRACTION_JOB_SPAWN_QUEUE_NAME
  delay_seconds              = 0
  visibility_timeout_seconds = 60 * 6
  max_message_size           = 2048
  message_retention_seconds  = 86400

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.structured_data_job_spawn_queue_deadletter_queue.arn
    maxReceiveCount     = 2
  })
}

resource "aws_sqs_queue" "structured_data_job_spawn_queue_deadletter_queue" {
  name                       = "${local.STRUCTURED_DATA_EXTRACTION_JOB_SPAWN_QUEUE_NAME}-deadletter"
  delay_seconds              = 0
  visibility_timeout_seconds = 60 * 6
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10
}

# STRUCTURED DATA EXTRACTION

resource "aws_sqs_queue" "structure_data_job_queue" {
  name                       = local.STRUCTURED_DATA_EXTRACTION_JOB_QUEUE_NAME
  delay_seconds              = 0
  visibility_timeout_seconds = 60
  max_message_size           = 2048
  message_retention_seconds  = 86400

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.structure_data_job_queue_deadletter_queue.arn
    maxReceiveCount     = 1
  })
}

resource "aws_sqs_queue" "structure_data_job_queue_deadletter_queue" {
  name                       = "${local.STRUCTURED_DATA_EXTRACTION_JOB_QUEUE_NAME}-deadletter"
  delay_seconds              = 0
  visibility_timeout_seconds = 60
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10
}

# DOCUMENT CREATION TOPIC + SUBSCRIPTION

resource "aws_sns_topic" "document_created" {
  name = "${terraform.workspace}-document-created-topic"
}

# OUTPUTS


output "WORKER_SQS_QUEUE" {
  value       = aws_sqs_queue.job_queue.url
  description = "The SQS queue uploading PDF processing jobs to PDFco"
}

output "RECEIVE_PDFCO_SQS_QUEUE" {
  value       = aws_sqs_queue.pdfco_retrive_queue.url
  description = "The SQS queue for retrieving processed PDFs from PDFco"
}

output "STRUCTURED_DATA_JOB_SPAWNER_QUEUE" {
  value       = aws_sqs_queue.structured_data_job_spawn_queue.url
  description = "The SQS queue responsible for spawining data extraction jobs"
}

output "STRUCTURED_DATA_JOB_QUEUE" {
  value       = aws_sqs_queue.structure_data_job_queue.url
  description = "The SQS queue responsible for processing data extraction jobs"
}

output "ENTITY_EMBEDDINGS_QUEUE" {
  value       = aws_sqs_queue.entity_embeddings_queue.url
  description = "The SQS queue responsible for processing entity embeddings"
}


### TOPIC NOTIFIED OF PDFCO JOB CREATION
resource "aws_sns_topic" "pdf_co_job_created" {
  name = local.PDF_JOB_CREATED_TOPIC_NAME
}

# SETUP SUBSCRIPTION TO FEED SNS TO SQS
# Immediately put into queue as is a polling check
resource "aws_sns_topic_subscription" "pdfco_job_created" {
  topic_arn = aws_sns_topic.pdf_co_job_created.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.pdfco_retrive_queue.arn
}


resource "aws_sqs_queue_policy" "queue_policy" {
  queue_url = aws_sqs_queue.pdfco_retrive_queue.url

  policy = jsonencode({
    Version = "2012-10-17",
    Id      = "PdfcoSQSPolicy",
    Statement = [
      {
        Sid       = "Allow-SNS-Messages",
        Effect    = "Allow",
        Principal = "*",
        Action    = "sqs:SendMessage",
        Resource  = aws_sqs_queue.pdfco_retrive_queue.arn,
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.pdf_co_job_created.arn
          }
        }
      },
    ]
  })
}

output "PDFCO_JOB_TOPIC_ARN" {
  value       = aws_sns_topic.pdf_co_job_created.arn
  description = "The SNS topic notified of job creation"
}


######
# DOCUMENT TOPIC
#

resource "aws_sns_topic" "document_upload" {
  name = local.DOCUMENTS_TOPIC_NAME
}

output "DOCUMENTS_TOPIC_ARN" {
  value = aws_sns_topic.document_upload.arn
}



# SETUP SUBSCRIPTION TO FEED SNS TO SQS
# Subscribes to the document topic to queue up a job spawner job

resource "aws_sns_topic_subscription" "document_upload_to_extraction_job_spawner_queue" {
  topic_arn = aws_sns_topic.document_upload.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.structured_data_job_spawn_queue.arn
}

resource "aws_sqs_queue_policy" "extraction_job_spawner_queue_policy" {
  queue_url = aws_sqs_queue.structured_data_job_spawn_queue.url

  policy = jsonencode({
    Version = "2012-10-17",
    Id      = "ExtractionJobSpawnerSQSPolicy",
    Statement = [
      {
        Sid       = "Allow-SNS-Messages",
        Effect    = "Allow",
        Principal = "*",
        Action    = "sqs:SendMessage",
        Resource  = aws_sqs_queue.structured_data_job_spawn_queue.arn,
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.document_upload.arn
          }
        }
      },
    ]
  })
}


###
# ENTITY TOPIC
#

resource "aws_sns_topic" "entity_index" {
  name = local.ENTITY_TOPIC_NAME
}

output "ENTITIES_TOPIC_ARN" {
  value = aws_sns_topic.entity_index.arn
}


# EMBEDDINGS QUEUE

resource "aws_sqs_queue" "entity_embeddings_queue" {
  name                       = local.ENTITY_EMBEDDINGS_QUEUE
  delay_seconds              = 0
  visibility_timeout_seconds = 60
  max_message_size           = 2048
  message_retention_seconds  = 86400

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.entity_embeddings_deadletter_queue.arn
    maxReceiveCount     = 2
  })
}

resource "aws_sqs_queue" "entity_embeddings_deadletter_queue" {
  name                       = "${local.ENTITY_EMBEDDINGS_QUEUE}-deadletter"
  delay_seconds              = 0
  visibility_timeout_seconds = 60
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10
}


# QUEUE INDEXED ENTITIES FOR EMBEDDINGS

resource "aws_sns_topic_subscription" "entity_to_embeddings" {
  topic_arn = aws_sns_topic.entity_index.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.entity_embeddings_queue.arn
}

resource "aws_sqs_queue_policy" "entity_embeddings_queue_policy" {
  queue_url = aws_sqs_queue.entity_embeddings_queue.url

  policy = jsonencode({
    Version = "2012-10-17",
    Id      = "EntityEmbeddingsSQSPolicy",
    Statement = [
      {
        Sid       = "Allow-SNS-Messages",
        Effect    = "Allow",
        Principal = "*",
        Action    = "sqs:SendMessage",
        Resource  = aws_sqs_queue.entity_embeddings_queue.arn,
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.entity_index.arn
          }
        }
      },
    ]
  })
}


###
# ACTION EXECUTION TOPIC
#

resource "aws_sns_topic" "action_execution" {
  name = local.ACTION_EXECUTION_TOPIC_NAME
}

output "ACTION_EXECUTION_TOPIC_ARN" {
  value = aws_sns_topic.action_execution.arn
}

# ACTION_EXECUTION QUEUE

resource "aws_sqs_queue" "action_execution_queue" {
  name                       = local.ACTION_EXECUTION_QUEUE
  delay_seconds              = 0
  visibility_timeout_seconds = 60
  max_message_size           = 2048
  message_retention_seconds  = 86400

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.action_execution_deadletter_queue.arn
    maxReceiveCount     = 1
  })
}

resource "aws_sqs_queue" "action_execution_deadletter_queue" {
  name                       = "${local.ACTION_EXECUTION_QUEUE}-deadletter"
  delay_seconds              = 0
  visibility_timeout_seconds = 60
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10
}


# QUEUE ACTION EXECUTIONS

resource "aws_sns_topic_subscription" "queue_action_executions" {
  topic_arn = aws_sns_topic.action_execution.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.action_execution_queue.arn
}

resource "aws_sqs_queue_policy" "action_executions_queue_policy" {
  queue_url = aws_sqs_queue.action_execution_queue.url

  policy = jsonencode({
    Version = "2012-10-17",
    Id      = "ActionExecutionSQSPolicy",
    Statement = [
      {
        Sid       = "Allow-SNS-Messages",
        Effect    = "Allow",
        Principal = "*",
        Action    = "sqs:SendMessage",
        Resource  = aws_sqs_queue.action_execution_queue.arn,
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.action_execution.arn
          }
        }
      },
    ]
  })
}

output "ACTION_EXECUTION_QUEUE" {
  value       = aws_sqs_queue.action_execution_queue.url
  description = "The SQS queue responsible for handling action executions"
}
