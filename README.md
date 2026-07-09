# SmartCV

![CI/CD](https://github.com/huynhnhan68/SmartCV/actions/workflows/deploy.yml/badge.svg)

> AI-powered job application tracker that learns from your rejections.

###  [Start Using SmartCV](https://smartcvknight.click/)
*Live in production. Free to use.*

SmartCV tracks every job application you submit, detects patterns across rejections (which resume version converts best, which source channel works, which company sizes respond), and uses Amazon Bedrock to turn that data into actionable coaching - delivered as a chat interface and a weekly email digest.

Built end-to-end on AWS as a production-grade application. Every service is serverless, infrastructure is code, and every push auto-deploys via GitHub Actions.

---

## Why I Built This

I was job hunting and had no data on why I was getting rejected. I had a spreadsheet with company names and "rejected" written next to most of them - but no signal on *why*. Was it my resume? The channel? The company size?

So I instrumented my own job search. Every application became a data point. After a few weeks I had enough data to see that my `v1-generic` resume had a 0% response rate from enterprise companies, while `v3-ml-focused` was getting interviews from startups via referrals. That's the kind of insight you can act on.

---

## Key Features

**Application tracking**
- Log applications with company, role, source channel, resume version, company size, job description URL, follow-up date
- Kanban board with drag-and-drop status updates (Applied - Screened - Interview - Offer / Rejected)
- Click any card to view full detail, edit all fields, change status, see timeline
- Search by company/role, filter by source channel
- Color-coded left border per status on kanban cards for instant visual scanning
- Amber "Follow up" badge on overdue cards

**Weekly goal tracking**
- Set a weekly application target on the Dashboard
- Progress bar showing current week vs goal, turns green when met
- Streak counter - consecutive weeks hitting your goal (fire icon)
- Inline goal editing - click the pencil to update your target anytime

**AI insight engine**
- Pattern analysis across 6 dimensions: source channel, company size, resume version, role seniority, weekly velocity, status funnel
- Response rate computed per bucket - shows exactly which resume version or source is working
- AI coaching chat powered by Bedrock - answers questions like "why am I getting ghosted?" using your actual data as context
- Markdown rendering in chat responses
- Weekly email digest every Monday with stats + one AI-generated personalised tip

**Resume version tracker**
- Upload multiple PDF versions to S3 via presigned URLs
- Delete outdated resume versions
- Tag each application with which version was used
- Analytics shows conversion rate per version side-by-side

**Modern UI / UX**
- Fully revamped Landing Page with feature showcases, FAQs, and deep dives.
- Multi-language support (i18n).
- Full dark mode with system preference detection, persisted to localStorage
- Mobile responsive - hamburger sidebar on small screens
- Meaningful empty states with calls to action
- Toast notifications (top-center)

---

## Architecture

SmartCV is built using a modern 100% Serverless architecture on AWS.

**Frontend Layer**
- React + Vite + Tailwind CSS
- Hosted on **AWS Amplify** (primary) and **GitHub Pages** (fallback)

**Auth Layer**
- **Amazon Cognito**: Email + Password authentication, issuing JWTs (Access + ID).

**API Layer**
- **API Gateway (REST)**: Protected by Cognito JWT Authorizer.

**Compute Layer (AWS Lambda - ARM64 / Python 3.12)**
- `applications`: CRUD + status transitions, S3 presigned URL generation, Resume list/delete.
- `insights`: Pattern analysis engine + Bedrock AI chat.
- `settings`: Weekly goal config, user preferences.
- `notes`: Per-application notes timeline.
- `digest` (EventBridge Mon 8am UTC): Weekly summary via Bedrock + SES email.
- `followup` (EventBridge Daily 9am UTC): Overdue reminders + SES email.

**Data & Storage**
- **Amazon DynamoDB**: Single-table design (Entities: Applications, Notes, Settings, Users, Streaks).
- **Amazon S3**: Private resume bucket with time-limited presigned URLs for reads/writes.
- **Amazon Bedrock**: Amazon Nova Lite model for AI insights and chat.

---

## API Routes

```
GET    /v1/applications
POST   /v1/applications
GET    /v1/applications/{appId}
PUT    /v1/applications/{appId}
DELETE /v1/applications/{appId}
POST   /v1/applications/{appId}/status
GET    /v1/applications/{appId}/notes
POST   /v1/applications/{appId}/notes
DELETE /v1/applications/{appId}/notes/{noteId}
POST   /v1/resumes/upload-url
GET    /v1/resumes/list
DELETE /v1/resumes/{versionName}
GET    /v1/insights
POST   /v1/insights/chat
GET    /v1/users/settings
PUT    /v1/users/settings
```

All routes protected by Cognito JWT authorizer.

---

## Tech Stack

| Layer | Service |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, react-i18next |
| Auth | Amazon Cognito (email + JWT) |
| API | API Gateway REST + Lambda (Python 3.12, ARM64) |
| AI / ML | Amazon Bedrock - Amazon Nova Lite |
| Database | DynamoDB - single-table design, PAY_PER_REQUEST |
| Storage | S3 - resume versioning |
| Hosting | AWS Amplify / GitHub Pages |
| Scheduling | EventBridge cron |
| Email | Amazon SES |
| IaC | AWS CDK v2 TypeScript |
| CI/CD | GitHub Actions |

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.12
- AWS CLI configured (`aws configure`)
- AWS CDK CLI: `npm install -g aws-cdk`

### Deploy backend
```bash
bash scripts/build_layer.sh
cd cdk && npm install && cdk deploy
```

### Run frontend locally
```bash
cd frontend && npm install && npm run dev
```

### Run tests
```bash
pip install pytest boto3 pydantic aws-lambda-powertools pytest-cov
pip install "moto[dynamodb,s3,ses,cognitoidp]"
python -m pytest tests/ -v --tb=short --cov=lambdas --cov-fail-under=70
```

### Run frontend tests
```bash
cd frontend && npm run test
```

### Seed demo data
```bash
cd scripts && python seed_data.py --user-id YOUR_COGNITO_SUB
```

---

## Author

**SmartCV Team** - [Github](https://github.com/huynhnhan68)
