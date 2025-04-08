terraform {
  backend "remote" {
    organization = "braille-dev"

    workspaces {
      prefix = "braille-application-"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
    github = {
      source  = "integrations/github"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ca-central-1"
}

provider "aws" {
  alias  = "east"
  region = "us-east-1"
}


data "tfe_outputs" "services" {
  organization = "braille-dev"
  workspace    = replace(terraform.workspace, "application", "services")
}

locals {
  AUTH0_ISSUER_BASE_URL = "https://${var.AUTH0_DOMAIN}"
}

variable "AUTH0_CLIENT_ID" {
  type = string
}

variable "BRAILLE_ENV" {
  type = string
}

variable "AUTH0_CLIENT_SECRET" {
  type = string
}

variable "AUTH0_DOMAIN" {
  type = string
}

variable "AUTH0_SECRET" {
  type = string
}

variable "OPENAI_API_KEY" {
  type      = string
  sensitive = true
}

variable "AWS_ACCESS_KEY_ID" {
  type = string
}

variable "AWS_SECRET_ACCESS_KEY" {
  type      = string
  sensitive = true
}

variable "PDF_CO_API_ENDPOINT" {
  type = string
}

variable "APP_DOMAIN" {
  type = string
}

variable "EMAIL_FROM_ADDRESS" {
  type = string
}

variable "PDF_CO_API_KEY" {
  type      = string
  sensitive = true
}

variable "aws_region" {
  type    = string
  default = "ca-central-1"
}


variable "STATSIG_API_KEY" {
  type = string
}

data "aws_vpc" "vpc" {
  id = data.tfe_outputs.services.values.vpc_id
}

variable "LANGCHAIN_TRACING_V2" {
  type = bool
}

variable "LANGCHAIN_API_KEY" {
  type      = string
  sensitive = true
}

variable "AUTH0_CONNECTION_ID" {
  type = string
}
variable "AUTH0_MANAGEMENT_DOMAIN" {
  type = string
}

variable "NEW_RELIC_API_KEY" {
  type      = string
  sensitive = true
}
