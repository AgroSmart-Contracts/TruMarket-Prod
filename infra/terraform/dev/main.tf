provider "aws" {
  region = var.region
}

data "aws_availability_zones" "available" {}

locals {
  name        = terraform.workspace == "dev" ? "trumarket-dev" : "trumarket"
  environment = terraform.workspace
  domain      = terraform.workspace == "prod" ? "app.trumarket.tech" : "dev-app.trumarket.tech"


  vpc_cidr = "10.0.0.0/16"
  azs      = slice(data.aws_availability_zones.available.names, 0, 2)

  api_name           = "api"
  api_container_port = 3000

  as_group = "${local.name}-as-group"

  tags = {
    Name        = local.name
    Environment = local.environment
    Repository  = var.repository
  }
}

################################################################################
# SSM parameters
################################################################################


data "aws_caller_identity" "current" {}

data "aws_ssm_parameter" "api_database" {
  name = terraform.workspace == "prod" ? "/trumarket/api-database" : "/trumarket-dev/api-database"
}

data "aws_ssm_parameter" "deals_manager_address" {
  name = terraform.workspace == "prod" ? "/trumarket/deals-manager-address" : "/trumarket-dev/deals-manager-address"
}

data "aws_ssm_parameter" "private_key" {
  name = terraform.workspace == "prod" ? "/trumarket/private-key" : "/trumarket-dev/private-key"
}

data "aws_ssm_parameter" "rpc_url" {
  name = terraform.workspace == "prod" ? "/trumarket/rpc-url" : "/trumarket-dev/rpc-url"
}

data "aws_ssm_parameter" "email_host" {
  name = "/trumarket-dev/email-host"
}


data "aws_ssm_parameter" "email_username" {
  name = "/trumarket-dev/email-username"
}


data "aws_ssm_parameter" "email_password" {
  name = "/trumarket-dev/email-password"
}

data "aws_ssm_parameter" "vapid_public_key" {
  name = "/trumarket-dev/vapid-public-key"
}

data "aws_ssm_parameter" "vapid_private_key" {
  name = "/trumarket-dev/vapid-private-key"
}

data "aws_ssm_parameter" "onfido_api_token" {
  name = terraform.workspace == "prod" ? "/trumarket/onfido-api-token" : "/trumarket-dev/onfido-api-token"
}

data "aws_ssm_parameter" "onfido_workflow_id" {
  name = terraform.workspace == "prod" ? "/trumarket/onfido-workflow-id" : "/trumarket-dev/onfido-workflow-id"
}

data "aws_ssm_parameter" "onfido_webhook_token" {
  name = terraform.workspace == "prod" ? "/trumarket/onfido-webhook-token" : "/trumarket-dev/onfido-webhook-token"
}

data "aws_ssm_parameter" "ecs_optimized_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2/recommended"
}


################################################################################
# Cluster
################################################################################

module "ecs_cluster" {
  source = "terraform-aws-modules/ecs/aws//modules/cluster"

  cluster_name = local.name

  # Capacity provider - autoscaling groups
  default_capacity_provider_use_fargate = false
  autoscaling_capacity_providers = {
    # On-demand instances
    (local.as_group) = {
      auto_scaling_group_arn         = module.autoscaling[local.as_group].autoscaling_group_arn
      managed_termination_protection = "ENABLED"

      managed_scaling = {
        maximum_scaling_step_size = 5
        minimum_scaling_step_size = 1
        status                    = "ENABLED"
        target_capacity           = 100
      }

      default_capacity_provider_strategy = {
        weight = 100
        base   = 20
      }
    }

  }

  tags = local.tags
}

module "ecs_service_web" {
  source = "terraform-aws-modules/ecs/aws//modules/service"

  # Service
  name        = "${local.name}-web"
  cluster_arn = module.ecs_cluster.arn

  # Add deployment configuration - kill all tasks first
  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 100

  cpu    = 256
  memory = 512

  # Task Definition
  requires_compatibilities = ["EC2"]
  capacity_provider_strategy = {
    (local.as_group) = {
      capacity_provider = module.ecs_cluster.autoscaling_capacity_providers[local.as_group].name
      weight            = 1
      base              = 1
    }
  }

  # Container definition(s)
  container_definitions = {
    web = {
      essential = true
      image     = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.region}.amazonaws.com/trumarket-web:latest-${local.environment}"

      port_mappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]

      environment = []
    }
  }

  load_balancer = {
    service = {
      target_group_arn = module.alb.target_groups["trumarket_web"].arn
      container_name   = "web"
      container_port   = 3000
    }
  }

  tasks_iam_role_name        = "${local.name}-web-tasks"
  tasks_iam_role_description = "Web tasks IAM role for ${local.name}"
  tasks_iam_role_policies = {
    ReadOnlyAccess = "arn:aws:iam::aws:policy/ReadOnlyAccess"
  }
  tasks_iam_role_statements = [
    {
      actions   = ["s3:GetObject"]
      resources = ["arn:aws:s3:::*"]
    }
  ]

  subnet_ids = module.vpc.private_subnets
  security_group_rules = {
    alb_ingress = {
      type                     = "ingress"
      from_port                = 3000
      to_port                  = 3000
      protocol                 = "tcp"
      description              = "Service port"
      source_security_group_id = module.alb.security_group_id
    }
    egress_all = {
      type        = "egress"
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  tags = local.tags
}

module "ecs_service_api" {
  source = "terraform-aws-modules/ecs/aws//modules/service"

  # Service
  name        = "${local.name}-${local.api_name}"
  cluster_arn = module.ecs_cluster.arn

  # Add deployment configuration - kill all tasks first
  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 100

  cpu    = 512
  memory = 512

  # Task Definition
  requires_compatibilities = ["EC2"]
  capacity_provider_strategy = {
    # On-demand instances
    (local.as_group) = {
      capacity_provider = module.ecs_cluster.autoscaling_capacity_providers[local.as_group].name
      weight            = 1
      base              = 1
    }
  }

  # Container definition(s)
  container_definitions = {
    (local.api_name) = {
      essential = true
      # image     = data.aws_ecr_image.api.image_uri
      image = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.region}.amazonaws.com/trumarket-api:latest-${local.environment}"

      health_check = {
        # command = ["CMD-SHELL", "curl -f http://localhost:${local.api_container_port}/ || exit 1"]
      }

      port_mappings = [
        {
          name          = local.api_name
          containerPort = local.api_container_port
          hostPort      = local.api_container_port
          protocol      = "tcp"
        }
      ]

      readonly_root_filesystem = false

      enable_cloudwatch_logging = true

      environment : [
        {
          name  = "APP_DOMAIN",
          value = "https://app.trumarket.tech"
        },
        {
          name = "DATABASE_URL",
          # value = "mongodb://${local.mongo_name}/"
          value = data.aws_ssm_parameter.api_database.value
        },
        {
          name  = "BLOCKCHAIN_RPC_URL",
          value = data.aws_ssm_parameter.rpc_url.value
        },
        {
          name  = "BLOCKCHAIN_EXPLORER",
          value = terraform.workspace == "prod" ? "https://basescan.org/" : "https://sepolia.etherscan.io"
        },
        {
          name  = "BLOCKCHAIN_PRIVATE_KEY",
          value = data.aws_ssm_parameter.private_key.value
        },
        {
          name  = "BLOCKCHAIN_CHAIN_ID",
          value = terraform.workspace == "prod" ? 8453 : 11155111
        },
        {
          name  = "DEALS_MANAGER_CONTRACT_ADDRESS",
          value = data.aws_ssm_parameter.deals_manager_address.value
        },
        {
          name  = "INVESTMENT_TOKEN_CONTRACT_ADDRESS",
          value = terraform.workspace == "prod" ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" : "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0"
        },
        {
          name  = "INVESTMENT_TOKEN_SYMBOL",
          value = terraform.workspace == "prod" ? "USDC" : "USDT"
        },
        {
          name  = "INVESTMENT_TOKEN_DECIMALS",
          value = terraform.workspace == "prod" ? "6" : "6"
        },
        {
          name  = "AUTOMATIC_DEALS_ACCEPTANCE",
          value = "true"
        },
        {
          name  = "EMAIL_HOST",
          value = data.aws_ssm_parameter.email_host.value
        },
        {
          name  = "EMAIL_USERNAME",
          value = data.aws_ssm_parameter.email_username.value
        },
        {
          name  = "EMAIL_PASSWORD",
          value = data.aws_ssm_parameter.email_password.value
        },
        {
          name  = "MAIL_TO",
          value = "Alessandro.cordano@trumarket.tech"
        },
        {
          name  = "VAPID_PUBLIC_KEY",
          value = data.aws_ssm_parameter.vapid_public_key.value
        },
        {
          name  = "VAPID_PRIVATE_KEY",
          value = data.aws_ssm_parameter.vapid_private_key.value
        },
        {
          name  = "PORT",
          value = local.api_container_port
        },
        {
          name  = "S3_BUCKET",
          value = aws_s3_bucket.bucket.bucket
        },
        {
          name  = "AWS_REGION",
          value = var.region
        },
        {
          name  = "NODE_ENV",
          value = "production"
        },
        {
          name  = "LOG_LEVEL",
          value = "debug"
        },
        {
          name  = "ONFIDO_API_TOKEN",
          value = data.aws_ssm_parameter.onfido_api_token.value
        },
        {
          name  = "ONFIDO_WORKFLOW_ID",
          value = data.aws_ssm_parameter.onfido_workflow_id.value
        },
        {
          name  = "ONFIDO_WEBHOOK_TOKEN",
          value = data.aws_ssm_parameter.onfido_webhook_token.value
        },
        {
          name  = "ICP_CANISTER_ID",
          value = terraform.workspace == "prod" ? "uibem-miaaa-aaaal-qr7qq-cai" : ""
        },
        {
          name  = "ICP_RPC_PROVIDER",
          value = terraform.workspace == "prod" ? "https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io" : ""
        }
      ]
    }
  }
  load_balancer = {
    service = {
      target_group_arn = module.alb.target_groups["trumarket_api"].arn
      container_name   = local.api_name
      container_port   = local.api_container_port
    }
  }

  tasks_iam_role_name        = "${local.name}-tasks"
  tasks_iam_role_description = "Example tasks IAM role for ${local.name}"
  tasks_iam_role_policies = {
    ReadOnlyAccess = "arn:aws:iam::aws:policy/ReadOnlyAccess"
  }
  tasks_iam_role_statements = [
    {
      actions   = ["s3:GetObject", "s3:PutObject"]
      resources = ["arn:aws:s3:::*"]
    }
  ]

  subnet_ids = module.vpc.private_subnets
  security_group_rules = {
    alb_ingress = {
      type                     = "ingress"
      from_port                = local.api_container_port
      to_port                  = local.api_container_port
      protocol                 = "tcp"
      description              = "Service port"
      source_security_group_id = module.alb.security_group_id
    }
    egress_all = {
      type        = "egress"
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  tags = local.tags
}

################################################################################
# Load Balancers
################################################################################

module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 9.0"

  name = "${local.name}-api-lb"

  load_balancer_type = "application"

  vpc_id  = module.vpc.vpc_id
  subnets = module.vpc.public_subnets

  # For example only
  enable_deletion_protection = false

  # Security Group
  security_group_ingress_rules = {
    all_http = {
      from_port   = 80
      to_port     = 80
      ip_protocol = "tcp"
      cidr_ipv4   = "0.0.0.0/0"
    }
    all_https = {
      from_port   = 443
      to_port     = 443
      ip_protocol = "tcp"
      description = "HTTPS web traffic"
      cidr_ipv4   = "0.0.0.0/0"
    }
  }
  security_group_egress_rules = {
    all = {
      ip_protocol = "-1"
      cidr_ipv4   = module.vpc.vpc_cidr_block
    }
  }

  listeners = {
    http = {
      port     = 80
      protocol = "HTTP"

      redirect = {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }


  target_groups = {
    trumarket_web = {
      backend_protocol                  = "HTTP"
      backend_port                      = 3000
      target_type                       = "ip"
      deregistration_delay              = 5
      load_balancing_cross_zone_enabled = true

      health_check = {
        enabled             = true
        healthy_threshold   = 5
        interval            = 30
        matcher             = "200"
        path                = "/"
        port                = "traffic-port"
        protocol            = "HTTP"
        timeout             = 5
        unhealthy_threshold = 2
      }

      # ECS will attach the IPs of the tasks to this target group
      create_attachment = false
    }

    trumarket_api = {
      backend_protocol                  = "HTTP"
      backend_port                      = local.api_container_port
      target_type                       = "ip"
      deregistration_delay              = 5
      load_balancing_cross_zone_enabled = true

      health_check = {
        enabled             = true
        healthy_threshold   = 5
        interval            = 30
        matcher             = "200"
        path                = "/api/v2"
        port                = "traffic-port"
        protocol            = "HTTP"
        timeout             = 5
        unhealthy_threshold = 2
      }

      # Theres nothing to attach here in this definition. Instead,
      # ECS will attach the IPs of the tasks to this target group
      create_attachment = false
    }
  }



  tags = local.tags
}

resource "aws_lb_listener" "https-forward" {
  load_balancer_arn = module.alb.arn
  port              = 443
  protocol          = "HTTPS"
  certificate_arn   = "arn:aws:acm:eu-west-1:590183941756:certificate/157dbcb2-a594-4958-a239-0a1fc5a0f689"

  default_action {
    type             = "forward"
    target_group_arn = module.alb.target_groups["trumarket_web"].arn
  }
}

resource "aws_lb_listener_rule" "web" {
  listener_arn = aws_lb_listener.https-forward.arn

  action {
    type             = "forward"
    target_group_arn = module.alb.target_groups["trumarket_web"].arn
  }

  condition {
    path_pattern {
      values = ["/"]
    }
  }
}

resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.https-forward.arn

  action {
    type             = "forward"
    target_group_arn = module.alb.target_groups["trumarket_api"].arn
  }

  condition {
    path_pattern {
      values = ["/api/v2*"]
    }

  }
}

################################################################################
# Auto Scaling groups
################################################################################



module "autoscaling" {
  source  = "terraform-aws-modules/autoscaling/aws"
  version = "~> 6.5"

  for_each = {
    (local.as_group) = {
      instance_type              = "t2.micro"
      desired_capacity           = 1
      use_mixed_instances_policy = false
      mixed_instances_policy = {
        #   override = [
        #     {
        #       instance_type     = "t3.small"
        #       weighted_capacity = "2"
        #     }
        #   ]
      }
      user_data = <<-EOT
        #!/bin/bash

        cat <<'EOF' >> /etc/ecs/ecs.config
        ECS_CLUSTER=${local.name}
        ECS_LOGLEVEL=debug
        ECS_CONTAINER_INSTANCE_TAGS=${jsonencode(local.tags)}
        ECS_ENABLE_TASK_IAM_ROLE=true
        EOF
      EOT
    }
  }

  name = "${local.name}-${each.key}"

  image_id      = jsondecode(data.aws_ssm_parameter.ecs_optimized_ami.value)["image_id"]
  instance_type = each.value.instance_type

  security_groups                 = [module.autoscaling_sg.security_group_id]
  user_data                       = base64encode(each.value.user_data)
  ignore_desired_capacity_changes = true

  create_iam_instance_profile = true
  iam_role_name               = local.name
  iam_role_description        = "ECS role for ${local.name}"
  iam_role_policies = {
    AmazonEC2ContainerServiceforEC2Role = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
    AmazonSSMManagedInstanceCore        = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  }

  vpc_zone_identifier = module.vpc.private_subnets
  health_check_type   = "EC2"

  # https://github.com/hashicorp/terraform-provider-aws/issues/12582
  autoscaling_group_tags = {
    AmazonECSManaged = true
  }

  min_size         = 1
  max_size         = 1
  desired_capacity = 1

  # Required for  managed_termination_protection = "ENABLED"
  protect_from_scale_in = true

  # Spot instances
  use_mixed_instances_policy = each.value.use_mixed_instances_policy
  mixed_instances_policy     = each.value.mixed_instances_policy

  tags = local.tags
}

module "autoscaling_sg" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "${local.name}-autoscaling-sg"
  description = "Autoscaling group security group"
  vpc_id      = module.vpc.vpc_id

  computed_ingress_with_source_security_group_id = [
    {
      rule                     = "http-80-tcp"
      source_security_group_id = module.alb.security_group_id
    }
  ]
  number_of_computed_ingress_with_source_security_group_id = 1

  egress_rules = ["all-all"]

  tags = local.tags
}

################################################################################
# Network
################################################################################

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${local.name}-vpc"
  cidr = local.vpc_cidr

  azs             = local.azs
  private_subnets = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 4, k)]
  public_subnets  = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k + 48)]

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = local.tags
}

################################################################################
# CLI and scheduled tasks
################################################################################

resource "aws_iam_role" "task_role" {
  name = "${local.name}-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "sts:AssumeRole"
        ],
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  managed_policy_arns = ["arn:aws:iam::aws:policy/ReadOnlyAccess"]

}

resource "aws_iam_role" "task_execution_role" {
  name = "${local.name}-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "sts:AssumeRole"
        ],
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  inline_policy {
    name = "${local.name}-task-role-execution-policy"

    policy = jsonencode({ Version = "2012-10-17"
      Statement = [
        {
          "Action" = [
            "logs:PutLogEvents",
            "logs:CreateLogStream"
          ],
          "Effect"   = "Allow",
          "Resource" = "*",
          "Sid"      = "Logs"
        },
        {
          "Action" = [
            "ecr:GetDownloadUrlForLayer",
            "ecr:GetAuthorizationToken",
            "ecr:BatchGetImage",
            "ecr:BatchCheckLayerAvailability"
          ],
          "Effect"   = "Allow",
          "Resource" = "*",
          "Sid"      = "ECR"
        },
        {
          "Action"   = "ssm:GetParameters",
          "Effect"   = "Allow",
          "Resource" = "arn:aws:ssm:*:*:parameter/*",
          "Sid"      = "GetSSMParams"
        },
        {
          "Action"   = "secretsmanager:GetSecretValue",
          "Effect"   = "Allow",
          "Resource" = "arn:aws:secretsmanager:*:*:secret:*",
          "Sid"      = "GetSecrets"
        }
      ]
    })
  }
}


resource "aws_security_group" "allow_outbound" {
  name        = "allow_outbound"
  description = "Allow all outbound traffic"
  vpc_id      = module.vpc.vpc_id

  tags = local.tags
}

resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4" {
  security_group_id = aws_security_group.allow_outbound.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}


################################################################################
# Route 53
################################################################################

resource "aws_route53_zone" "zone" {
  name = "trumarket.tech"

  tags = local.tags
}

resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.zone.zone_id
  name    = local.domain
  type    = "A"

  alias {
    name                   = module.alb.dns_name
    zone_id                = module.alb.zone_id
    evaluate_target_health = true
  }
}

################################################################################
# S3
################################################################################


resource "aws_s3_bucket" "bucket" {
  bucket = "${local.name}-bucket"

  tags = local.tags
}

resource "aws_s3_bucket_public_access_block" "bucket" {
  bucket = aws_s3_bucket.bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_cors_configuration" "bucket_cors" {
  bucket = aws_s3_bucket.bucket.id

  cors_rule {
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_policy" "policy" {
  bucket = aws_s3_bucket.bucket.id
  policy = <<POLICY
{
    "Version": "2012-10-17",
    "Statement": [
      {
          "Sid": "PublicReadGetObject",
          "Effect": "Allow",
          "Principal": "*",
          "Action": [
             "s3:GetObject"
          ],
          "Resource": [
             "arn:aws:s3:::${aws_s3_bucket.bucket.id}/*"
          ]
      }
    ]
}
POLICY
}

################################################################################
# ECR
################################################################################

data "aws_ecr_image" "api" {
  repository_name = "trumarket-api"
  image_tag       = "latest-${local.environment}"
}
