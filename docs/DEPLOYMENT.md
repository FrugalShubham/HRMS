# AWS Deployment Guide

## Resources

| Service | Purpose |
|---------|---------|
| ECS Fargate | API + optional worker |
| ALB | HTTPS termination |
| S3 + CloudFront | Frontend static + uploads |
| Atlas MongoDB | Primary database |
| ElastiCache Redis | Sessions, queues |
| Secrets Manager | API keys |
| Route 53 | `*.hrflow.ai` |
| ACM | SSL certificates |

## Deploy Steps

1. Push images to ECR via GitHub Actions (`ci-cd.yml`)
2. Task definition env from Secrets Manager
3. ECS service auto-scaling: CPU 70%, min 2 max 20 tasks
4. CloudFront origin → S3 bucket for `frontend/dist`
5. Atlas IP allowlist + VPC peering

## Environment Variables (API)

See `backend/.env.example` for full list.

## Health Checks

- `GET /health` — liveness
- `GET /ready` — MongoDB + Redis connectivity

## Monitoring

- CloudWatch logs from ECS
- X-Ray optional tracing
- Alerts: 5xx rate, payment webhook failures, WhatsApp queue depth
