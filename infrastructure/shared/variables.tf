variable "AWS_ACCESS_KEY_ID" {
  description = "AWS Access Key ID"
  type        = string
  sensitive   = true
}

variable "AWS_SECRET_ACCESS_KEY" {
  description = "AWS Secret Access Key"
  type        = string
  sensitive   = true # Marks the variable as sensitive (Terraform v0.14+)
}

variable "AWS_REGION" {
  description = "AWS region to deploy resources"
  type        = string
}

variable "AWS_DEFAULT_REGION" {
  description = "Default AWS region if not specified"
  type        = string
  default     = "us-east-1"
}