variable "DATABASE_USERNAME" {
  type    = string
  default = "dbmaster"
}

# AWS

variable "AWS_ACCESS_KEY_ID" {
  type = string
}

variable "AWS_SECRET_ACCESS_KEY" {
  type      = string
  sensitive = true
}

variable "AWS_DEFAULT_REGION" {
  type    = string
  default = "ca-central-1"
}

# LOCALSTACK

variable "LOCALSTACK" {
  type        = bool
  default     = false
  description = "Whether applying in Localstack environment"
}

# 

variable "SIGNING_PRIVATE_KEY" {
  type      = string
  sensitive = true
}

variable "SIGNING_PUBLIC_KEY" {
  type = string
}
