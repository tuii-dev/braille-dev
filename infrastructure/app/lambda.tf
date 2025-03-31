# resource "aws_lambda_function" "test_lambda" {
#   function_name = "my_first_terraform_docker_lambda"
#   role          = aws_iam_role.lambda_ecr_iam_role.arn

#   package_type = "Image"
#   image_uri    = "337704890535.dkr.ecr.ap-southeast-2.amazonaws.com/braille-vercel-project_ecr:worker_777702e31999fb4d08d822161998ccf33f1a1879"
# }

# resource "aws_iam_role" "lambda_ecr_iam_role" {
#   name               = "${terraform.workspace}_lambda_ecr_role"
#   assume_role_policy = data.aws_iam_policy_document.assume_role.json

#   tags = {
#     Environment = terraform.workspace
#   }
# }

# data "aws_iam_policy_document" "assume_role" {
#   statement {
#     effect  = "Allow"
#     actions = ["sts:AssumeRole"]

#     principals {
#       type        = "Service"
#       identifiers = ["lambda.amazonaws.com"]
#     }
#   }
# }
