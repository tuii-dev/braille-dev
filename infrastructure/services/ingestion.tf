locals {
  INGESTION_SPAWNER_QUEUE = "${terraform.workspace}-ingestion-spawner-queue"
  INGESTION_TASK_QUEUE    = "${terraform.workspace}-ingestion-tasks-queue"
}


# INGESTION SPAWNER QUEUE

resource "aws_sqs_queue" "ingestion_spawner_queue" {
  name                       = local.INGESTION_SPAWNER_QUEUE
  delay_seconds              = 5
  visibility_timeout_seconds = 10
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.ingestion_spawner_deadletter_queue.arn
    maxReceiveCount     = 2
  })
}

resource "aws_sqs_queue" "ingestion_spawner_deadletter_queue" {
  name                       = "${local.INGESTION_SPAWNER_QUEUE}-deadletter"
  delay_seconds              = 0
  visibility_timeout_seconds = 60
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10
}


# INGESTION TASK QUEUE

resource "aws_sqs_queue" "ingestion_task_queue" {
  name                       = local.INGESTION_TASK_QUEUE
  delay_seconds              = 5
  visibility_timeout_seconds = 10
  max_message_size           = 2048
  message_retention_seconds  = 900
  receive_wait_time_seconds  = 10
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.ingestion_task_deadletter_queue.arn
    maxReceiveCount     = 2
  })
}

resource "aws_sqs_queue" "ingestion_task_deadletter_queue" {
  name                       = "${local.INGESTION_TASK_QUEUE}-deadletter"
  delay_seconds              = 0
  visibility_timeout_seconds = 60
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10
}

# SCHEDULER TO SPAWN INGESTION TASKS

resource "aws_iam_role" "ingestion_scheduler_role" {
  name = "ingestion-scheduler-role"

  inline_policy {
    name = "ingestion-scheduler-role-inline-policy"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action   = "sqs:SendMessage"
          Effect   = "Allow"
          Resource = aws_sqs_queue.ingestion_spawner_queue.arn
        }
      ]
    })
  }

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
      },
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "scheduler.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_scheduler_schedule" "ingestion_scheduler" {
  name = "ingestion-schedule"

  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression = "cron(0 14 * * ? *)"

  target {
    arn      = "arn:aws:scheduler:::aws-sdk:sqs:sendMessage"
    role_arn = aws_iam_role.ingestion_scheduler_role.arn

    input = jsonencode({
      MessageBody = "SPAWN INGESTION TASKS"
      QueueUrl    = aws_sqs_queue.ingestion_spawner_queue.url
    })
  }
}

output "INGESTION_SPAWNER_QUEUE" {
  value       = aws_sqs_queue.ingestion_spawner_queue.url
  description = "The SQS queue where ingestion tasks are scheduled to be spawned."
}

output "INGESTION_TASK_QUEUE" {
  value       = aws_sqs_queue.ingestion_task_queue.url
  description = "The SQS queue where ingestion tasks are sent to be processed."
}
