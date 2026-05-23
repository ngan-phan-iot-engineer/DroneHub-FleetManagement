# Ghi chú Phát triển Backend

## Tổng quan dự án

Đây là một **Backend NestJS cấp Doanh nghiệp** được xây dựng cho Ứng dụng Fullstack React với:

- **NestJS 10+** cùng TypeScript
- **Cơ sở dữ liệu:** Prisma ORM với PostgreSQL
- Mật khẩu mã hoá và Xác thực **JWT + Session**
- **Tiêu chuẩn Giao tiếp:** REST API và **WebSocket (Socket.io)**
- Truyền tải thông điệp với Message Broker: **RabbitMQ**
- **Bộ nhớ đệm:** Redis dùng cho bộ đệm (caching) & phiên (sessions)
- **Hạ tầng Ảo hóa:** Docker & Docker Compose (sử dụng Anonymous volume để tránh lỗi binary)
- **DevOps:** GitHub Actions (CI/CD) & Cloudflare Tunnels (Zero Trust Reverse Proxy, bảo mật DDoS/SSL)
- **Giám sát:** Prometheus + Grafana
- Tài liệu API qua **OpenAPI/Swagger**

## Các quyết định Kiến trúc

### Cơ sở dữ liệu (Prisma + PostgreSQL)
- ✅ ORM an toàn kiểu dữ liệu (Type-safe) với tự động di chuyển (migrations)
- ✅ Tự động tạo client (Client generation)
- ✅ Quản lý phiên bản schema tích hợp sẵn
- ✅ Hỗ trợ các truy vấn phức tạp mà không cần raw SQL

### Xác thực (JWT + Theo phiên)
- ✅ API phi trạng thái (Stateless) với JWT
- ✅ Dự phòng bằng Session cho các thao tác nhạy cảm
- ✅ Xoay vòng Refresh token để bảo mật
- ✅ Kiểm soát truy cập dựa trên vai trò (RBAC)

### Chiến lược Bộ nhớ đệm (Caching)
- ✅ Redis để cache phản hồi (flights, teams, logs)
- ✅ Tự động xóa bộ đệm (invalidation) khi có thay đổi (mutations)
- ✅ Hết hạn dựa trên TTL
- ✅ Hỗ trợ bộ đệm phân tán trong tương lai

### Giám sát (Monitoring)
- ✅ Thu thập số liệu qua Prometheus
- ✅ Bảng điều khiển Grafana để trực quan hóa
- ✅ Đo lường số liệu HTTP request tùy chỉnh
- ✅ Các endpoint kiểm tra sức khỏe hệ thống (liveness, readiness)

## Cấu trúc Module

| Module | Mục đích | Các tính năng chính |
|--------|---------|--------------|
| **auth** | Xác thực | JWT, Sessions, Đăng ký/Đăng nhập |
| **users** | Quản lý người dùng | Hồ sơ, Cài đặt, Tính năng Admin |
| **flights** | Dữ liệu chuyến bay | CRUD, Caching, Phân trang |
| **logs** | Theo dõi hoạt động | Nhật ký kiểm toán, Hành động của người dùng |
| **teams** | Cộng tác nhóm | Thành viên, Vai trò, Quyền sở hữu |
| **health** | Trạng thái hệ thống | Probes cho K8s, Uptime |

## Các Mô hình Phát triển Chính

### Tầng Dịch vụ (Service Layer)
- Logic nghiệp vụ được tách biệt khỏi controller
- Dependency injection để dễ dàng kiểm thử
- Logic caching nằm trong các services

### Thiết kế Controller
- Các endpoint RESTful phù hợp với nhu cầu frontend
- Phân quyền dựa trên Guard
- Tài liệu Swagger trên các endpoint

### Truy cập Cơ sở dữ liệu
- Prisma đảm nhiệm mọi thao tác DB
- Tự động tải các mối quan hệ (relation loading)
- Hỗ trợ Transaction cho các thao tác phức tạp

### Xử lý Lỗi (Error Handling)
- Các bộ lọc ngoại lệ toàn cục (Global exception filters - cần triển khai)
- Phản hồi lỗi theo cấu trúc chuẩn
- Ghi log Request/Response

## Danh sách Kiểm tra Bảo mật

- ✅ Cấu hình CORS theo từng môi trường
- ✅ Sử dụng Helmet cho các HTTP headers
- ✅ Băm mật khẩu (Hashing) với bcrypt
- ✅ Quản lý chuỗi bí mật (secret) cho JWT
- ✅ Bảo vệ các biến môi trường
- ⚠️ Rate limiting (đã sẵn sàng để triển khai)
- ⚠️ Bảo vệ khỏi SQL injection (thông qua Prisma)
- ⚠️ Bảo vệ khỏi XSS (thông qua Helmet)

## Tối ưu Hiệu suất

1. **Tầng Caching**
   - Cache phản hồi cho các endpoint có tần suất đọc cao
   - Lưu trữ session trong Redis
   - Xóa cache khi có thao tác thay đổi dữ liệu

2. **Tối ưu Cơ sở dữ liệu**
   - Đánh index đúng cách cho các trường thường xuyên bị truy vấn
   - Phân trang cho các tập kết quả lớn
   - Chỉ SELECT các trường thực sự cần thiết

3. **Connection Pooling**
   - Đã cấu hình connection pool cho PostgreSQL
   - Tái sử dụng kết nối Redis
   - Xử lý tắt ứng dụng một cách êm ái (Graceful shutdown)

## Chiến lược Kiểm thử

| Loại | Phạm vi | Công cụ |
|------|----------|------|
| Unit (Đơn vị) | Services | Jest |
| Integration (Tích hợp) | API endpoints | Supertest |
| E2E (Đầu cuối) | Toàn bộ luồng dữ liệu | NestJS Testing |
| Performance (Hiệu suất)| Tải hệ thống (Load testing) | k6 (tùy chọn) |

## Quy trình Triển khai (Deployment)

```
Push Code → CI/CD Pipeline → Tests → Build → Push Image → Cập nhật lên Server
```

1. **GitHub Actions** tự động chạy khi push lên nhánh main
2. Chạy linter, tests, kiểm tra độ bao phủ (coverage)
3. Build Docker image
4. Đẩy (Push) lên registry
5. Triển khai qua SSH lên server
6. Chạy di chuyển cơ sở dữ liệu (Database migration)
7. Khởi động lại dịch vụ

## Lược đồ Cơ sở dữ liệu (Schema)

**Các Bảng Cốt lõi:**
- `users` - Tài khoản người dùng và vai trò
- `teams` - Dữ liệu đội nhóm/không gian làm việc
- `team_members` - Thuộc tính thành viên nhóm và vai trò
- `flights` - Hồ sơ chuyến bay kèm theo dõi trạng thái
- `logs` - Nhật ký kiểm toán cho mọi thao tác người dùng

**Indexes:**
- `users.email` - UNIQUE dùng cho đăng nhập
- `flights.userId` - Để lọc theo người sở hữu
- `flights.status` - Để lọc theo trạng thái
- `logs.userId` - Để lọc theo người dùng
- `logs.createdAt` - Truy vấn mốc thời gian (Timeline)

## Cách sử dụng Redis

| Key Pattern | Mục đích | TTL |
|------------|---------|-----|
| `flights:${userId}:*` | Bộ đệm phản hồi | 5 phút |
| `teams:${userId}:*` | Bộ đệm danh sách đội/nhóm | 5 phút |
| `session:*` | Bộ nhớ Session | 24h |
| `rate_limit:*` | Rate limiting | 1 phút |

## Cấu hình Môi trường

| Môi trường | Database | Redis | Debug |
|-----|----------|-------|-------|
| development | Môi trường ảo (Local) | Local | Được bật |
| staging | Cloud | Cloud | Giới hạn |
| production | Cloud | Cloud | Bị tắt |

## Kiểm tra Sức khỏe

```
GET /health          → Sức khỏe hệ thống (200 = healthy)
GET /health/ready    → Sẵn sàng nhận traffic (K8s readiness)
GET /health/live     → Còn sống/không bị treo (K8s liveness)
```

Sử dụng chúng cho việc điều phối với Kubernetes/Docker Swarm.

## Nâng cấp trong Tương lai

1. **Cải tiến Caching**
   - Triển khai các chiến lược vô hiệu hóa bộ nhớ đệm
   - Thêm hỗ trợ bộ nhớ đệm phân tán
   - Làm ấm (cache warming) cho các dữ liệu trọng yếu

2. **Quản lý Phiên bản API**
   - Hỗ trợ cả API v1, v2 đồng thời
   - Chiến lược loại bỏ từ từ

3. **Tính năng Thời gian thực (Real-time)**
   - Hỗ trợ WebSocket cho các cập nhật trực tiếp
   - Dùng SignalR cho hệ thống thông báo

4. **Xác thực Nâng cao**
   - Xác thực đa yếu tố (MFA)
   - Tích hợp OAuth2
   - Quản lý API key

5. **Giám sát**
   - Các quy tắc cảnh báo tùy chỉnh
   - Gửi thông báo qua Slack/Email
   - Theo dõi lỗi (Sentry)

## Gỡ lỗi Phổ biến

```bash
# Kiểm tra kết nối CSDL
docker logs fullstack_postgres

# Kiểm tra Redis xem có hoạt động không
docker exec -it fullstack_redis redis-cli ping

# Xem log theo thời gian thực ứng dụng
docker logs -f fullstack_backend

# Khởi chạy truy cập CSDL bằng console psql
docker exec -it fullstack_postgres psql -U user -d fullstack_dev
```

## Phong cách Code (Code Style)

- Ở chế độ siêu nghiêm ngặt của TypeScript (strict mode)
- Áp dụng chuẩn ESLint + Prettier
- Sử dụng các Decorator của NestJS cho Dependency Injection (DI)
- Dùng Async/await thay cho callbacks
- Lập trình ưu tiên Type (Type-first development)

## Số liệu Hiệu suất đánh giá

- Thời gian phản hồi API: < 100ms (với bộ nhớ đệm)
- Câu lệnh Database: < 50ms (đã index)
- Mục tiêu tỉ lệ hit của bộ nhớ đệm: > 80%
- Mục tiêu Uptime (thời gian hoạt động liên tục): 99.9%

---

**Cập nhật lần cuối**: Tháng 4 năm 2026  
**Phiên bản**: 1.0.0  
**Tình trạng**: Đã sẵn sàng cho môi trường Chạy thật (Production-Ready)
