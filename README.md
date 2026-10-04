# Production Node.js DevOps Demo

A production-style DevOps portfolio project demonstrating containerization, reverse proxying, CI, cloud provisioning and configuration management.

## Architecture

Client -> NGINX -> Node.js API -> PostgreSQL
                         |
                        Redis

The application exposes liveness/readiness endpoints, structured logs, a PostgreSQL-backed counter and a Redis cache.

## Stack

- Node.js 22 / Express
- PostgreSQL 17
- Redis 
- Docker / Docker Compose
- NGINX
- GitHub Actions
- AWS EC2 + Terraform
- Ansible
- Linux / Bash

## Run locally

```bash
cp .env.example .env
docker compose up --build
curl http://localhost:8080/health/live
curl http://localhost:8080/health/ready
curl -X POST http://localhost:8080/api/v1/visits
curl http://localhost:8080/api/v1/stats
```

## CI

Every push to `main` and every pull request runs syntax checks, tests and a Docker image build.

## AWS deployment

The Terraform example provisions an EC2 instance. In a real environment, add a VPC/security group/SSH key strategy, remote state, IAM least privilege, encrypted secrets and an ALB/HTTPS certificate before production use.

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

Then configure `deploy/ansible/inventory.ini` and run the playbook from an environment with the required Ansible Docker collection installed.

## Production hardening checklist

- Store secrets in AWS Secrets Manager or SSM Parameter Store.
- Use private subnets for databases and Redis.
- Restrict security groups to required ports only.
- Put TLS at an ALB or NGINX and use a real domain/certificate.
- Use Terraform remote state with locking.
- Pin container image digests for controlled releases.
- Add centralized metrics/log aggregation and alerting.
- Add automated rollback and database migration strategy.
- Back up PostgreSQL and test restore procedures.

## Resume bullet

Built and deployed a production-style Node.js platform using Docker Compose, NGINX, PostgreSQL and Redis; automated CI with GitHub Actions and infrastructure provisioning with Terraform/Ansible, including health checks, structured logging, reverse proxying and Linux deployment workflows.
