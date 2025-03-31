variable "AWS_SECRET_ACCESS_KEY" {
  description = "AWS Secret Access Key"
  type        = string
  sensitive   = true  # Marks the variable as sensitive (Terraform v0.14+)
}

variable "AWS_REGION" {
  description = "AWS region to deploy resources"
  type        = string
}