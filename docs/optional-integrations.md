# Optional Integrations

**Version:** 1.0.0  
**Last Updated:** 2025-01-27  
**Purpose:** Documentation for optional third-party integrations (SAML, CloudWatch)  
**Status:** Active - Implementation complete, configuration required

---

## Overview

This document describes optional integrations that are implemented but require additional configuration to enable. These integrations are **not required** for core application functionality but provide enhanced capabilities for enterprise deployments.

---

## SAML Authentication

### Status
✅ **Implementation Complete** - Package installed and code uncommented

### Description
SAML (Security Assertion Markup Language) authentication allows organizations to use their existing identity providers (IdP) for single sign-on (SSO). This is commonly used in enterprise environments with Active Directory, Okta, Azure AD, or other SAML-compliant identity providers.

### Requirements
- ✅ `@node-saml/node-saml` package (installed)
- ✅ SAML implementation code (uncommented)
- ⚠️ SAML provider configuration in database

### Configuration Steps

#### 1. Configure SAML Provider in Database

Add a SAML provider record to the `sso_providers` table:

```sql
INSERT INTO sso_providers (
  id,
  organization_id,
  name,
  type,
  enabled,
  metadata
) VALUES (
  gen_random_uuid(),
  'your-organization-id',
  'Your SAML Provider',
  'saml',
  true,
  jsonb_build_object(
    'callbackUrl', 'https://your-domain.com/api/auth/saml/callback',
    'entryPoint', 'https://your-idp.com/sso/saml',
    'issuer', 'your-app-issuer-id',
    'cert', '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----'
  )
);
```

#### 2. Required Metadata Fields

- **callbackUrl**: The URL where SAML responses will be sent (must match IdP configuration)
- **entryPoint**: The SAML IdP SSO endpoint URL
- **issuer**: Your application's SAML issuer identifier
- **cert**: The IdP's X.509 certificate (for signature validation)

#### 3. Configure Your Identity Provider

In your SAML IdP (Okta, Azure AD, etc.), configure:
- **Assertion Consumer Service (ACS) URL**: `https://your-domain.com/api/auth/saml/callback`
- **Entity ID / Issuer**: Match the `issuer` value from your database
- **Name ID Format**: `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress` (recommended)
- **Attribute Mappings**: Map user attributes (email, name) to SAML attributes

#### 4. Test SAML Authentication

1. Navigate to your login page
2. Select the SAML provider (if multiple SSO options are available)
3. You should be redirected to your IdP
4. After authentication, you'll be redirected back to the application

### Files Modified
- `apps/web/src/lib/auth/sso.ts` - SAML response processing
- `apps/web/src/app/api/auth/saml/route.ts` - SAML initiation and callback handlers

### Troubleshooting

**Error: "SAML provider not found or disabled"**
- Verify the provider exists in `sso_providers` table
- Check that `enabled = true`
- Verify `organization_id` matches the user's organization

**Error: "Invalid SAML response"**
- Verify certificate matches IdP configuration
- Check that callback URL matches IdP ACS URL
- Ensure SAML response is properly formatted

**Error: "Failed to process SAML response"**
- Check IdP logs for authentication errors
- Verify attribute mappings in IdP configuration
- Ensure email attribute is mapped correctly

---

## CloudWatch Logging

### Status
✅ **Implementation Complete** - Package installed and code uncommented

### Description
Amazon CloudWatch Logs integration enables centralized log management and monitoring. Logs are automatically shipped to CloudWatch where they can be searched, analyzed, and monitored with CloudWatch alarms.

### Requirements
- ✅ `@aws-sdk/client-cloudwatch-logs` package (installed)
- ✅ CloudWatch implementation code (uncommented)
- ⚠️ AWS credentials and environment variables

### Configuration Steps

#### 1. Create CloudWatch Log Group

Create a log group in AWS CloudWatch:

```bash
aws logs create-log-group --log-group-name /aws/nexuscanon/app-logs
```

Or via AWS Console:
1. Navigate to CloudWatch > Logs > Log groups
2. Click "Create log group"
3. Name: `/aws/nexuscanon/app-logs` (or your preferred name)

#### 2. Set Environment Variables

Add the following environment variables to your `.env.local` or deployment configuration:

```env
# CloudWatch Logging (Optional)
AWS_CLOUDWATCH_LOG_GROUP=/aws/nexuscanon/app-logs
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

**Note:** For production deployments, use IAM roles instead of access keys when possible (e.g., EC2 instance roles, ECS task roles, Lambda execution roles).

#### 3. IAM Permissions

Ensure your AWS credentials have the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:log-group:/aws/nexuscanon/app-logs:*"
    }
  ]
}
```

#### 4. Verify Logging

After configuration, logs will automatically be shipped to CloudWatch:
- Logs are batched and sent every 5 seconds (or immediately for errors)
- Log stream names follow format: `app-logs-YYYY-MM-DD`
- Each log entry includes: level, message, context, and error details

### Files Modified
- `apps/web/src/lib/logger.ts` - CloudWatch log shipping implementation

### Log Format

Logs in CloudWatch are stored as JSON:

```json
{
  "level": "error",
  "message": "Failed to process request",
  "context": {
    "userId": "123",
    "route": "/api/documents"
  },
  "error": {
    "message": "Database connection failed",
    "stack": "Error: Database connection failed\n    at ..."
  }
}
```

### Troubleshooting

**Logs not appearing in CloudWatch**
- Verify environment variables are set correctly
- Check AWS credentials have proper permissions
- Verify log group exists and name matches `AWS_CLOUDWATCH_LOG_GROUP`
- Check application logs for CloudWatch errors

**Error: "Access Denied"**
- Verify IAM permissions include `logs:CreateLogStream` and `logs:PutLogEvents`
- Check that log group ARN matches IAM policy resource

**High CloudWatch costs**
- Consider filtering logs by level (only errors/warnings in production)
- Set up log retention policies in CloudWatch
- Use log sampling for high-volume applications

---

## Enabling/Disabling Integrations

### Disable SAML
Set `enabled = false` in the `sso_providers` table for the SAML provider, or remove the provider record entirely.

### Disable CloudWatch
Remove or comment out the `AWS_CLOUDWATCH_LOG_GROUP` environment variable. The logger will skip CloudWatch shipping if the variable is not set.

---

## Production Considerations

### SAML
- Use HTTPS for all SAML endpoints
- Implement proper certificate rotation
- Set up monitoring for SAML authentication failures
- Consider implementing SAML logout (SLO) for complete SSO experience

### CloudWatch
- Use IAM roles instead of access keys when possible
- Set up log retention policies (default: never expire)
- Monitor CloudWatch costs
- Consider using CloudWatch Insights for log analysis
- Set up alarms for critical errors

---

## Support

For issues or questions:
1. Check troubleshooting sections above
2. Review application logs for detailed error messages
3. Verify configuration matches requirements
4. Consult AWS/SAML provider documentation

---

*Last updated: 2025-01-27*