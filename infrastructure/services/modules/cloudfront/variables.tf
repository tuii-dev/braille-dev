variable "bucket" {
  type = string
}

variable "caa" {
  type = string
}

variable "zone_id" {
  type = string
}

variable "APP_DOMAIN" {
  type = string
}

variable "SIGNING_PRIVATE_KEY" {
  type      = string
  sensitive = true
}

variable "SIGNING_PUBLIC_KEY" {
  type = string
}
