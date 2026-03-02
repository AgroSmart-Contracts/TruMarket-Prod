variable "region" {
  type        = string
  description = "AWS Region"
  default     = "eu-west-1"
}

variable "repository" {
  type        = string
  description = "Source code repository"
  default     = "https://github.com/AgroSmartContracts/trumarket"
}
