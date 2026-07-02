# 📋 SmartCV — Tài liệu minh chứng thiết lập AWS

> **Ngày thực hiện:** 30/06/2026  
> **Chủ sở hữu:** huynhnhandn68@gmail.com  
> **GitHub:** huynhnhan68  
> **AWS Account ID:** 168992393828  
> **AWS Region:** ap-southeast-1 (Singapore)

---

## ✅ BƯỚC 1 — Tạo IAM Access Key

**Thực hiện tại:** `console.aws.amazon.com/iam` → Users → admin-user → Security credentials

| Thông tin | Giá trị |
|---|---|
| IAM Username | `admin-user` |
| Access Key ID | `AKIASOWF3JJSLNFQFQ4L` |
| User ARN | `arn:aws:iam::168992393828:user/admin-user` |
| Tạo lúc | 30/06/2026 ~11:37 AM (GMT+7) |

> 📸 **Ảnh cần chụp:** `docs/setup-screenshots/01-iam-access-key.png`

---

## ✅ BƯỚC 2 — Cài & cấu hình AWS CLI

**Phiên bản:** `aws-cli/2.35.12 Python/3.14.5 Windows/11`

```powershell
aws configure set aws_access_key_id     AKIASOWF3JJSLNFQFQ4L
aws configure set aws_secret_access_key "***"
aws configure set default.region        ap-southeast-1
aws configure set default.output        json
```

**Kết quả `aws sts get-caller-identity`:**
```json
{
    "UserId":  "AIDASOWF3JJSODSDXIBVV",
    "Account": "168992393828",
    "Arn":     "arn:aws:iam::168992393828:user/admin-user"
}
```

> 📸 **Ảnh cần chụp:** `docs/setup-screenshots/02-aws-cli-verify.png`

---

## ✅ BƯỚC 3 — Copy source code SmartCV → SmartCV

**Source:** `SmartCV-main/SmartCV-main/`  
**Đích:** `SmartCV/`

**Thay đổi chính trong CDK stack:**

| Thuộc tính | SmartCV (cũ) | SmartCV (mới) |
|---|---|---|
| Stack name | `SmartCVStack` | `SmartCVStack` |
| DynamoDB table | `SmartCV` | `smartcv` |
| S3 Resume | `SmartCV-resumes-{account}` | `smartcv-resumes-{account}` |
| S3 Frontend | `SmartCV-frontend-{account}` | `smartcv-frontend-{account}` |
| Cognito Pool | `SmartCV-users` | `smartcv-users` |
| Cognito Domain | `SmartCV-auth.auth.us-east-1...` | `smartcv-auth.auth.ap-southeast-1...` |
| Lambda prefix | `SmartCV-*` | `smartcv-*` |
| Bedrock model | `amazon.nova-lite-v1:0` | `anthropic.claude-3-haiku-20240307-v1:0` |
| Owner email | `huynhnhan687@gmail.com` | `huynhnhandn68@gmail.com` |
| GitHub Pages | `huynhnhan68.github.io/SmartCV` | `huynhnhan68.github.io/smartcv` |
| Region | `us-east-1` | `ap-southeast-1` |

---

## ✅ BƯỚC 4 — Tạo Google OAuth Secret trong Secrets Manager

**Google Client ID:** `1036751707949-em15imtd5asi505llg7g6c80se5nul2r.apps.googleusercontent.com`

```powershell
aws secretsmanager create-secret `
  --name "smartcv/google-oauth" `
  --secret-string '{"client_id":"...","client_secret":"..."}' `
  --region ap-southeast-1
```

**Kết quả:**
```json
{
    "ARN":  "arn:aws:secretsmanager:ap-southeast-1:168992393828:secret:smartcv/google-oauth-pJDZJw",
    "Name": "smartcv/google-oauth"
}
```

> 📸 **Ảnh cần chụp:** `docs/setup-screenshots/03-secrets-manager.png`  
> URL: `ap-southeast-1.console.aws.amazon.com/secretsmanager`

---

## ✅ BƯỚC 5 — CDK Bootstrap

```powershell
cdk bootstrap aws://168992393828/ap-southeast-1
```

**Kết quả:**
```
✅  Environment aws://168992393828/ap-southeast-1 bootstrapped.
CDKToolkit | 12/12 | CREATE_COMPLETE | AWS::CloudFormation::Stack | CDKToolkit
```

> 📸 **Ảnh cần chụp:** `docs/setup-screenshots/04-cdk-bootstrap.png`  
> URL: `ap-southeast-1.console.aws.amazon.com/cloudformation` → Stack `CDKToolkit`

---

## 🔄 BƯỚC 6 — CDK Deploy SmartCVStack

```powershell
cdk deploy SmartCVStack --require-approval never
```

**Trạng thái:** 🔄 **ĐANG CHẠY...**

**Tài nguyên sẽ tạo:**

| Tài nguyên | Tên | Config |
|---|---|---|
| DynamoDB | `smartcv` | PAY_PER_REQUEST, PITR, TTL |
| S3 | `smartcv-resumes-168992393828` | Private, versioned |
| S3 | `smartcv-frontend-168992393828` | CloudFront OAC |
| CloudFront | Auto domain | HTTPS only |
| Cognito Pool | `smartcv-users` | Email + Google OAuth |
| Cognito Domain | `smartcv-auth.auth.ap-southeast-1...` | Hosted UI |
| Lambda | `smartcv-applications` | ARM64 512MB 30s |
| Lambda | `smartcv-insights` | ARM64 1024MB 60s |
| Lambda | `smartcv-digest` | ARM64 512MB 120s |
| Lambda | `smartcv-followup` | ARM64 512MB 120s |
| Lambda | `smartcv-settings` | ARM64 512MB 30s |
| Lambda | `smartcv-notes` | ARM64 512MB 30s |
| Lambda | `smartcv-cognito-verify` | ARM64 256MB 10s |
| API Gateway | `smartcv-api` | REST v1, Cognito auth |
| EventBridge | `smartcv-weekly-digest` | Mon 8am UTC |
| EventBridge | `smartcv-daily-followup` | Daily 9am UTC |
| SNS | `smartcv-alarms` | → huynhnhandn68@gmail.com |
| CloudWatch | `smartcv-overview` | Dashboard |

> 📸 **Ảnh cần chụp sau khi deploy xong:**
> - `05-cloudformation-stack.png` — Stack SmartCVStack = CREATE_COMPLETE
> - `06-dynamodb-table.png` — Table `smartcv`
> - `07-s3-buckets.png` — 2 buckets `smartcv-*`
> - `08-lambda-functions.png` — 7 functions `smartcv-*`
> - `09-api-gateway.png` — API `smartcv-api`
> - `10-cognito-userpool.png` — User Pool + Google IdP
> - `11-cloudfront.png` — Distribution URL

---

## ⏳ BƯỚC 7 — Tạo file `.env.local` (sau deploy)

**File:** `SmartCV/frontend/.env.local`
```env
VITE_USER_POOL_ID=ap-southeast-1_XXXXXXXX
VITE_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXX
VITE_API_URL=https://XXXXXXXXXX.execute-api.ap-southeast-1.amazonaws.com/v1
```

---

## ⏳ BƯỚC 8 — Chạy frontend local

```powershell
cd SmartCV/frontend
npm install
npm run dev
# → http://localhost:5173
```

> 📸 **Ảnh cần chụp:**
> - `12-app-login.png` — Trang Login SmartCV
> - `13-google-oauth.png` — Đăng nhập Google thành công
> - `14-dashboard.png` — Dashboard sau khi login

---

## 📐 Kiến trúc hệ thống SmartCV

```
Browser (React + Vite + TailwindCSS)
    │
    ├── Email/Password ──→ Amazon Cognito
    └── Google OAuth ────→ Google Cloud → Cognito Hosted UI
                               │
                        JWT ID Token
                               │
                    API Gateway: smartcv-api/v1
                    + Cognito JWT Authorizer
                               │
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
  /applications          /insights              /users/settings
  /resumes               /insights/chat         /{appId}/notes
       │                       │
  Lambda ARM64           Lambda ARM64
  smartcv-applications   smartcv-insights
       │                       │
  DynamoDB (smartcv)     Amazon Bedrock
  S3 (smartcv-resumes)   claude-3-haiku

EventBridge Cron:
├── Mon 8am UTC  → smartcv-digest   → Bedrock → SES email
└── Daily 9am UTC→ smartcv-followup → SES email

Hosting:
├── CloudFront + S3 (Primary HTTPS)
└── GitHub Pages: huynhnhan68.github.io/smartcv

Monitoring:
├── CloudWatch Dashboard: smartcv-overview
├── CloudWatch Alarms → SNS → huynhnhandn68@gmail.com
└── X-Ray distributed tracing
```

---

## 💰 Chi phí ước tính

| Dịch vụ | Tháng (dev/demo) |
|---|---|
| Lambda | $0 |
| API Gateway | $0 |
| DynamoDB | $0–1 |
| S3 + CloudFront | $0–1 |
| Cognito | $0 |
| Bedrock Claude Haiku | $2–5 |
| CloudWatch | $1–2 |
| Secrets Manager | $0.40 |
| SES | $0 |
| **Tổng** | **$3–10/tháng** |

> **$200 credits → dùng được ~20–60 tháng** ✅

---

*Tài liệu tạo ngày 30/06/2026 trong quá trình setup SmartCV*



