# 🧹 Hướng dẫn Dọn dẹp Tài nguyên AWS – SmartCV

> ⚠️ **Lưu ý quan trọng**: Hành động xóa tài nguyên là **không thể hoàn tác**. Hãy đảm bảo bạn đã **backup dữ liệu** trước khi thực hiện bất kỳ bước nào.

---

## 📋 Tổng quan tài nguyên cần xóa

| Thứ tự | Dịch vụ | Tên tài nguyên | Ghi chú |
|:---:|---|---|---|
| 1 | AWS Amplify | `SmartCV App` | Frontend hosting |
| 2 | EventBridge | `smartcv-weekly-digest` / `smartcv-daily-followup` | Cron rules |
| 3 | CloudWatch Alarms | `smartcv-*-errors`, `smartcv-*-latency` | Monitoring |
| 4 | CloudWatch Dashboard | `smartcv-overview` | Dashboard |
| 5 | SNS Topic | `smartcv-alarms` | Alert topic |
| 6 | API Gateway | `smartcv-api` | REST API |
| 7 | AWS Lambda | `smartcv-*` (7 functions) | Compute |
| 8 | Lambda Layer | `smartcv-shared` | Shared layer |
| 9 | Amazon Cognito | `smartcv-users` | Auth |
| 10 | Secrets Manager | `smartcv/google-oauth` | OAuth secret |
| 11 | Amazon SES | Email identities | Email service |
| 12 | Amazon S3 | `smartcv-resumes-<account-id>` | Resume storage |
| 13 | Amazon DynamoDB | `smartcv` | Database |
| 14 | CloudWatch Logs | `/aws/lambda/smartcv-*` | Log groups |
| 15 | IAM Roles | `SmartCVStack-*` | Tạo bởi CDK |
| 16 | AWS KMS | `alias/smartcv-key` | Encryption key |
| 17 | GitHub Actions OIDC | IAM Identity Provider | CI/CD |
| 18 | CDK Stack | `SmartCVStack` | CloudFormation |
| 19 | CDK Bootstrap | `CDKToolkit` | Chỉ xóa nếu không dùng CDK nữa |

---

## 🔧 Hướng dẫn xóa thủ công từng dịch vụ

### Bước 1: AWS Amplify

1. Đăng nhập **AWS Console** → Tìm kiếm **Amplify**
2. Chọn ứng dụng **SmartCV**
3. Vào **App settings** → **General**
4. Kéo xuống cuối trang → Click **Delete app**
5. Gõ tên app để xác nhận → Click **Delete**

---

### Bước 2: EventBridge Rules

1. Vào **AWS Console** → Tìm kiếm **EventBridge**
2. Chọn **Rules** ở menu bên trái
3. Chọn rule `smartcv-weekly-digest`:
   - Click **Disable** để tắt rule trước
   - Click **Delete** → Xác nhận
4. Lặp lại với rule `smartcv-daily-followup`

---

### Bước 3: CloudWatch Alarms

1. Vào **AWS Console** → Tìm kiếm **CloudWatch**
2. Chọn **Alarms** → **All alarms** ở menu bên trái
3. Tìm kiếm với từ khóa `smartcv`
4. Chọn tất cả alarm `smartcv-*` bằng checkbox
5. Click **Actions** → **Delete**
6. Xác nhận xóa

Danh sách alarm cần xóa:
- `smartcv-applications-errors`
- `smartcv-insights-errors`
- `smartcv-digest-errors`
- `smartcv-followup-errors`
- `smartcv-applications-p99-latency`
- `smartcv-insights-p99-latency`

---

### Bước 4: CloudWatch Dashboard

1. Vào **CloudWatch** → Chọn **Dashboards** ở menu bên trái
2. Tìm dashboard `smartcv-overview`
3. Tick checkbox chọn dashboard đó
4. Click **Delete** → Xác nhận

---

### Bước 5: SNS Topic

1. Vào **AWS Console** → Tìm kiếm **SNS**
2. Chọn **Topics** ở menu bên trái
3. Tìm topic `smartcv-alarms`
4. Click vào topic → Vào tab **Subscriptions**
5. Chọn tất cả subscriptions → Click **Delete subscriptions** → Xác nhận
6. Quay lại, click **Delete topic** → Gõ tên topic để xác nhận → Click **Delete**

---

### Bước 6: API Gateway

1. Vào **AWS Console** → Tìm kiếm **API Gateway**
2. Chọn **APIs** ở menu bên trái
3. Tìm API `smartcv-api`
4. Tick checkbox chọn API đó
5. Click **Actions** → **Delete** → Xác nhận

---

### Bước 7: Lambda Functions

1. Vào **AWS Console** → Tìm kiếm **Lambda**
2. Chọn **Functions** ở menu bên trái
3. Tìm kiếm `smartcv` trong ô tìm kiếm
4. Chọn từng function bằng checkbox (hoặc chọn tất cả):
   - `smartcv-applications`
   - `smartcv-insights`
   - `smartcv-digest`
   - `smartcv-followup`
   - `smartcv-settings`
   - `smartcv-notes`
   - `smartcv-cognito-verify`
5. Click **Actions** → **Delete** → Gõ `delete` để xác nhận → Click **Delete**

---

### Bước 8: Lambda Layer

1. Vào **Lambda** → Chọn **Layers** ở menu bên trái
2. Tìm layer `smartcv-shared`
3. Click vào layer → Xem danh sách **Versions**
4. Chọn tất cả versions → Click **Delete** → Xác nhận

---

### Bước 9: Amazon Cognito

> ⚠️ Xóa User Pool sẽ **xóa toàn bộ tài khoản người dùng**. Không thể khôi phục!

1. Vào **AWS Console** → Tìm kiếm **Cognito**
2. Chọn **User pools** ở menu bên trái
3. Click vào User Pool `smartcv-users`

**9a. Xóa App Client trước:**
- Vào tab **App integration**
- Kéo xuống phần **App clients**
- Click vào `WebClient` → Click **Delete** → Xác nhận

**9b. Xóa Hosted UI Domain:**
- Vào tab **App integration** → Phần **Domain**
- Click **Delete Cognito domain** → Gõ domain để xác nhận → **Delete**

**9c. Xóa Identity Provider (Google):**
- Vào tab **Sign-in experience** → Phần **Federated identity provider sign-in**
- Click vào `Google` → Click **Delete** → Xác nhận

**9d. Xóa User Pool:**
- Quay lại trang User pools
- Tick checkbox chọn `smartcv-users`
- Click **Delete** → Gõ `delete` để xác nhận → Click **Delete**

---

### Bước 10: Secrets Manager

1. Vào **AWS Console** → Tìm kiếm **Secrets Manager**
2. Tìm secret `smartcv/google-oauth`
3. Click vào secret → Click **Actions** → **Delete secret**
4. Chọn thời gian chờ xóa: **7 days** (tối thiểu) hoặc chọn **Disable waiting period** nếu muốn xóa ngay
5. Click **Schedule deletion**

---

### Bước 11: Amazon SES

1. Vào **AWS Console** → Tìm kiếm **Simple Email Service (SES)**
2. Chọn **Verified identities** ở menu bên trái
3. Tìm email identity `huynhnhandn68@gmail.com`
4. Tick checkbox → Click **Delete** → Xác nhận

---

### Bước 12: Amazon S3 – Resume Bucket

> ⚠️ Tất cả file CV của người dùng sẽ bị **xóa vĩnh viễn**!

**12a. Xóa toàn bộ objects trong bucket:**
1. Vào **AWS Console** → Tìm kiếm **S3**
2. Tìm bucket `smartcv-resumes-<account-id>`
3. Click vào bucket
4. Click **Empty** (nút màu cam)
5. Gõ `permanently delete` → Click **Empty**
6. Đợi cho đến khi xóa xong (có thể mất vài phút nếu có nhiều file)

**12b. Xóa bucket:**
1. Quay lại danh sách bucket
2. Tick checkbox chọn bucket `smartcv-resumes-*`
3. Click **Delete**
4. Gõ tên bucket để xác nhận → Click **Delete bucket**

---

### Bước 13: Amazon DynamoDB

> ⚠️ Tất cả dữ liệu ứng tuyển, ghi chú, cài đặt của người dùng sẽ bị **xóa vĩnh viễn**!

**(Tuỳ chọn) Export dữ liệu trước khi xóa:**
1. Click vào table `smartcv`
2. Vào tab **Exports and streams**
3. Click **Export to S3** → Chọn bucket backup → Click **Export**
4. Đợi export hoàn tất

**Xóa table:**
1. Vào **AWS Console** → Tìm kiếm **DynamoDB**
2. Chọn **Tables** ở menu bên trái
3. Tick checkbox chọn table `smartcv`
4. Click **Delete** → Gõ `confirm` để xác nhận → Click **Delete**

---

### Bước 14: CloudWatch Log Groups

1. Vào **CloudWatch** → Chọn **Log groups** ở menu bên trái
2. Tìm kiếm `/aws/lambda/smartcv` trong ô tìm kiếm
3. Chọn tất cả log groups hiện ra
4. Click **Actions** → **Delete log group(s)** → Xác nhận

Danh sách log groups cần xóa:
- `/aws/lambda/smartcv-applications`
- `/aws/lambda/smartcv-insights`
- `/aws/lambda/smartcv-digest`
- `/aws/lambda/smartcv-followup`
- `/aws/lambda/smartcv-settings`
- `/aws/lambda/smartcv-notes`
- `/aws/lambda/smartcv-cognito-verify`

---

### Bước 15: IAM Roles

1. Vào **AWS Console** → Tìm kiếm **IAM**
2. Chọn **Roles** ở menu bên trái
3. Tìm kiếm `SmartCVStack` trong ô tìm kiếm
4. Với từng role:
   - Click vào role
   - Vào tab **Permissions** → Detach tất cả policies
   - Quay lại → Tick checkbox → Click **Delete** → Gõ tên role → Xác nhận

---

### Bước 16: AWS KMS Key

> ⚠️ KMS Key không thể xóa ngay lập tức. AWS yêu cầu chờ **tối thiểu 7 ngày** trước khi xóa hẳn.

1. Vào **AWS Console** → Tìm kiếm **Key Management Service (KMS)**
2. Chọn **Customer managed keys** ở menu bên trái
3. Tìm key với alias `alias/smartcv-key`
4. Tick checkbox chọn key đó
5. Click **Key actions** → **Schedule key deletion**
6. Chọn **Waiting period**: `7` ngày (tối thiểu)
7. Tick xác nhận → Click **Schedule deletion**

---

### Bước 17: GitHub Actions OIDC Provider

1. Vào **IAM** → Chọn **Identity providers** ở menu bên trái
2. Tìm provider `token.actions.githubusercontent.com`
3. Tick checkbox → Click **Delete** → Xác nhận

---

### Bước 18: CDK Stack (CloudFormation)

Nếu còn tài nguyên nào CDK tạo nhưng chưa xóa:

1. Vào **AWS Console** → Tìm kiếm **CloudFormation**
2. Chọn **Stacks** ở menu bên trái
3. Tìm stack `SmartCVStack`
4. Click vào stack → Click **Delete** → Xác nhận
5. Đợi trạng thái chuyển thành `DELETE_COMPLETE`

> ℹ️ Nếu có lỗi `DELETE_FAILED`, vào tab **Events** để xem tài nguyên nào đang chặn → xóa thủ công tài nguyên đó rồi thử lại.

---

### Bước 19: CDK Bootstrap – CDKToolkit (Tuỳ chọn)

> ⚠️ Chỉ xóa nếu bạn **không còn dùng CDK** cho bất kỳ dự án nào trên AWS account này!

1. Vào **CloudFormation** → Chọn **Stacks**
2. Tìm stack `CDKToolkit`
3. Trước khi xóa, vào **S3** → Tìm bucket `cdk-*` → Empty bucket (xóa hết objects)
4. Quay lại CloudFormation → Chọn `CDKToolkit` → Click **Delete** → Xác nhận

---

## ✅ Checklist xác nhận đã dọn dẹp

Sau khi hoàn tất, kiểm tra lại trong AWS Console:

- [ ] **Amplify** – Không còn app SmartCV
- [ ] **EventBridge** – Không còn rule `smartcv-*`
- [ ] **CloudWatch** – Không còn alarm và dashboard `smartcv-*`
- [ ] **SNS** – Không còn topic `smartcv-alarms`
- [ ] **API Gateway** – Không còn API `smartcv-api`
- [ ] **Lambda** – Không còn function `smartcv-*`
- [ ] **Lambda Layers** – Không còn layer `smartcv-shared`
- [ ] **Cognito** – Không còn User Pool `smartcv-users`
- [ ] **Secrets Manager** – Secret `smartcv/google-oauth` đã được schedule xóa
- [ ] **SES** – Đã xóa verified identities (nếu muốn)
- [ ] **S3** – Đã empty và xóa bucket `smartcv-resumes-*`
- [ ] **DynamoDB** – Đã xóa table `smartcv`
- [ ] **CloudWatch Logs** – Đã xóa log groups `/aws/lambda/smartcv-*`
- [ ] **IAM** – Không còn roles `SmartCVStack-*`
- [ ] **KMS** – Key `alias/smartcv-key` đã được schedule xóa
- [ ] **IAM Identity Provider** – Đã xóa OIDC provider GitHub Actions
- [ ] **CloudFormation** – Stack `SmartCVStack` đã xóa
- [ ] **Cost Explorer** – Kiểm tra sau 24h để xác nhận không còn chi phí phát sinh

---

## 💰 Ước tính chi phí nếu không dọn dẹp

| Dịch vụ | Chi phí ước tính/tháng |
|---|---|
| DynamoDB (PAY_PER_REQUEST) | ~$0 nếu không có traffic |
| S3 (resume storage) | ~$0.023/GB |
| KMS Key | ~$1/key |
| CloudWatch Logs | ~$0.50/GB ingested |
| Cognito | Free: 50,000 MAU đầu tiên |
| SES | Free: 62,000 email/tháng (từ Lambda) |
| Amplify | ~$0.01/build minute + $0.15/GB served |
| Secrets Manager | ~$0.40/secret |

---

<div align="center">
<sub>SmartCV – Cleanup Guide | SmartCV Team</sub>
</div>
