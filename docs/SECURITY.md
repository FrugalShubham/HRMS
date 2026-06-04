# Production Security Best Practices

## Authentication
- Access JWT: 15m expiry, HS256 or RS256
- Refresh tokens: httpOnly cookie or secure storage, rotation on use
- Password: bcrypt cost 12, breach list check optional
- Rate limit login: 5/min per IP + email

## Multi-Tenant
- Never trust `companyId` from request body
- Validate employee belongs to tenant on every resource ID lookup

## API
- Helmet, CORS whitelist, request size limits
- Input validation via Zod on all routes
- Sanitize NoSQL injection (mongoose + express-mongo-sanitize)

## Data
- Encrypt PII at rest (MongoDB CSFLE or field-level for salary)
- S3 presigned URLs with short TTL for selfies/documents
- Audit log all admin mutations

## Payments
- Verify Razorpay/Stripe webhook signatures
- Idempotency keys on payment create

## WhatsApp
- Verify Meta webhook challenge + signature
- Map phone → employee only after OTP/linking

## Infrastructure
- Secrets in AWS Secrets Manager
- TLS 1.2+, WAF on ALB
- VPC private subnets for MongoDB Atlas peering

## Compliance
- Data export/delete per company (GDPR-style)
- Retention policy on audit logs and attendance media
