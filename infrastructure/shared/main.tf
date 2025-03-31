terraform {
  backend "remote" {
    organization = "braille"

    workspaces {
      name = "braille-shared-resources"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-southeast-2"
}
