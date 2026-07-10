<div align="center">

#  SmartCV

**AI-powered job application tracker that learns from your rejections.**

[![CI/CD](https://github.com/huynhnhan68/SmartCV/actions/workflows/deploy.yml/badge.svg)](https://github.com/huynhnhan68/SmartCV/actions/workflows/deploy.yml)
![AWS](https://img.shields.io/badge/AWS-Serverless-orange?logo=amazon-aws)
![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![License](https://img.shields.io/badge/License-MIT-green)

###  [Dùng thử SmartCV ngay](https://huynhnhan68.com/SmartCV/)
*Đang chạy trên môi trường production – Miễn phí.*

</div>

---

##  Giới thiệu

SmartCV là công cụ theo dõi ứng tuyển việc làm được hỗ trợ bởi AI. Nó ghi lại mọi đơn ứng tuyển bạn gửi đi, phát hiện các quy luật ẩn sau những lần từ chối — phiên bản CV nào có tỷ lệ chuyển đổi tốt nhất, kênh tìm việc nào hiệu quả, quy mô công ty nào phản hồi — và sử dụng **Amazon Bedrock** để biến dữ liệu đó thành lời khuyên hành động thực tế, thông qua giao diện chat và email digest hàng tuần.

Được xây dựng hoàn toàn trên AWS theo chuẩn production. Mọi service đều Serverless, infrastructure là code, và mỗi lần push code đều tự động deploy qua GitHub Actions.

> **Câu chuyện thực tế:** Khi đang tìm việc, tôi không có dữ liệu nào để hiểu tại sao mình bị từ chối. Sau vài tuần dùng SmartCV, tôi phát hiện ra rằng CV `v1-generic` của mình có tỷ lệ phản hồi 0% từ các công ty lớn, trong khi `v3-ml-focused` lại đang nhận được lịch phỏng vấn từ các startup qua kênh referral. **Đó mới là insight có thể hành động được.**

---

##  Tính năng chính

<details>
<summary><strong> Theo dõi đơn ứng tuyển</strong></summary>

- Ghi lại đơn ứng tuyển với đầy đủ thông tin: công ty, vị trí, kênh tìm việc, phiên bản CV, quy mô công ty, URL mô tả công việc, ngày follow-up
- **Kanban board** với kéo-thả cập nhật trạng thái: Applied → Screened → Interview → Offer / Rejected
- Xem chi tiết, chỉnh sửa toàn bộ fields, thay đổi trạng thái và xem timeline từng đơn
- Tìm kiếm theo công ty/vị trí, lọc theo kênh tìm việc
- Màu viền trái theo trạng thái để nhận diện nhanh
- Badge "Follow up" màu vàng cho các đơn quá hạn follow-up

</details>

<details>
<summary><strong>Theo dõi mục tiêu hàng tuần</strong></summary>

- Đặt mục tiêu số lượng đơn ứng tuyển mỗi tuần trực tiếp trên Dashboard
- Thanh tiến trình hiển thị tuần hiện tại so với mục tiêu, chuyển xanh khi đạt đủ
- Bộ đếm streak – số tuần liên tiếp đạt mục tiêu 
- Chỉnh sửa mục tiêu inline – click vào biểu tượng bút chì để cập nhật bất kỳ lúc nào

</details>

<details>
<summary><strong> AI Insight Engine</strong></summary>

- Phân tích quy luật theo **6 chiều**: kênh tìm việc, quy mô công ty, phiên bản CV, cấp bậc vai trò, tốc độ ứng tuyển hàng tuần, phễu trạng thái
- Tỷ lệ phản hồi được tính theo từng nhóm – cho thấy chính xác phiên bản CV hay kênh nào đang hiệu quả
- **AI coaching chat** được hỗ trợ bởi Amazon Bedrock – trả lời các câu hỏi như *"Tại sao tôi bị ghosted?"* dựa trên dữ liệu thực của bạn
- Render Markdown trong phản hồi chat
- **Email digest hàng tuần** mỗi thứ Hai với thống kê + một tip cá nhân hóa do AI tạo ra

</details>

<details>
<summary><strong>Quản lý phiên bản CV</strong></summary>

- Upload nhiều phiên bản PDF lên S3 qua presigned URL
- Xóa các phiên bản CV cũ không còn dùng
- Gán từng đơn ứng tuyển với phiên bản CV đã dùng
- Analytics hiển thị tỷ lệ chuyển đổi từng phiên bản song song

</details>

<details>
<summary><strong>Giao diện hiện đại</strong></summary>

- Landing Page được thiết kế lại hoàn toàn với showcase tính năng, FAQ, và deep dive
- Hỗ trợ đa ngôn ngữ (i18n)
- **Dark mode** đầy đủ với phát hiện tự động theo system preference, lưu vào localStorage
- Responsive trên mobile – sidebar hamburger trên màn hình nhỏ
- Empty states có ý nghĩa với call-to-action
- Toast notifications (top-center)

</details>

---

## Kiến trúc hệ thống

### Lambda Functions

| Function | Trigger | Mô tả |
|---|---|---|
| `applications` | API Gateway | CRUD đơn ứng tuyển, S3 presigned URL, Resume list/delete |
| `insights` | API Gateway | Pattern analysis engine + Bedrock AI chat |
| `settings` | API Gateway | Cấu hình mục tiêu hàng tuần, user preferences |
| `notes` | API Gateway | Timeline ghi chú theo từng đơn ứng tuyển |
| `digest` | EventBridge (Thứ Hai 8am UTC) | Tóm tắt hàng tuần qua Bedrock + gửi email SES |
| `followup` | EventBridge (Hàng ngày 9am UTC) | Nhắc nhở các đơn follow-up quá hạn qua SES |

---

##  API Routes

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

> Tất cả routes đều được bảo vệ bởi Cognito JWT authorizer.

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, react-i18next |
| **Auth** | Amazon Cognito (Email + JWT) |
| **API** | API Gateway REST + Lambda (Python 3.12, ARM64) |
| **AI / ML** | Amazon Bedrock – Amazon Nova Lite |
| **Database** | DynamoDB – Single-table design, PAY_PER_REQUEST |
| **Storage** | S3 – Resume versioning với presigned URL |
| **Hosting** | AWS Amplify, Route 53, GitHub Pages (fallback) |
| **Scheduling** | EventBridge cron |
| **Email** | Amazon SES |
| **IaC** | AWS CDK v2 TypeScript |
| **CI/CD** | GitHub Actions + OIDC |

---

##  Cài đặt cục bộ

### Yêu cầu

- Node.js 18+
- Python 3.12
- AWS CLI đã cấu hình (`aws configure`)
- AWS CDK CLI: `npm install -g aws-cdk`

### 1. Deploy Backend

```bash
# Build Lambda shared layer
bash scripts/build_layer.sh

# Deploy toàn bộ infrastructure lên AWS
cd cdk && npm install && cdk deploy
```

### 2. Chạy Frontend

```bash
cd frontend && npm install && npm run dev
```

### 3. Chạy Unit Tests

```bash
# Cài đặt dependencies
pip install pytest boto3 pydantic aws-lambda-powertools pytest-cov
pip install "moto[dynamodb,s3,ses,cognitoidp]"

# Chạy tests (yêu cầu coverage >= 70%)
python -m pytest tests/ -v --tb=short --cov=lambdas --cov-fail-under=70
```

### 4. Chạy Frontend Tests

```bash
cd frontend && npm run test
```

### 5. Seed dữ liệu demo

```bash
cd scripts && python seed_data.py --user-id YOUR_COGNITO_SUB
```

---

##  Cấu trúc thư mục

```
SmartCV/
├── .github/
│   ├── workflows/        # GitHub Actions CI/CD pipelines
│   └── dependabot.yml    # Tự động cập nhật dependencies
├── cdk/                  # AWS CDK infrastructure (TypeScript)
├── frontend/             # React + Vite + Tailwind CSS
│   └── src/
├── lambdas/              # Lambda functions (Python 3.12)
│   ├── applications/
│   ├── insights/
│   ├── settings/
│   ├── notes/
│   ├── digest/
│   ├── followup/
│   └── shared_layer/     # Shared utilities (models, auth, db)
├── scripts/
│   ├── build_layer.sh    # Build Lambda Layer zip
│   ├── seed_data.py      # Seeder dữ liệu demo
│   └── setup_oidc_v11.sh # Thiết lập OIDC cho GitHub Actions
├── tests/                # Unit tests
├── amplify.yml           # AWS Amplify build config
└── pytest.ini            # Cấu hình pytest
```

---

## CI/CD & Bảo mật

- **Zero secret storage**: GitHub Actions sử dụng **OIDC** để kết nối với AWS – không có AWS credentials nào được lưu trong GitHub Secrets.
- **Auto deploy**: Mỗi push lên `main` sẽ tự động build frontend và deploy Lambda functions.
- **Dependabot**: Tự động tạo PR cập nhật dependencies npm và pip.

---

##  Tác giả

**SmartCV Team** – [GitHub](https://github.com/huynhnhan68)

---

<div align="center">
<sub>Built with on AWS Serverless</sub>
</div>
