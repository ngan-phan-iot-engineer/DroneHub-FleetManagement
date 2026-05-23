# Hướng dẫn Thiết lập Backend Fullstack

## Thiết lập ban đầu (Lần đầu tiên)

### 1. Cài đặt các gói phụ thuộc (Dependencies)
```bash
npm install
```

### 2. Thiết lập PostgreSQL
Chọn một trong hai cách:

**Cách A: Sử dụng Docker (Khuyên dùng)**
```bash
npm run docker:up
# Cơ sở dữ liệu sẽ sẵn sàng trong khoảng 10 giây
```

**Cách B: Dùng PostgreSQL cài trực tiếp trên máy (Local)**
```bash
# Đảm bảo PostgreSQL 15 đang chạy
createdb fullstack_dev
psql fullstack_dev < init.sql  # nếu có file init
```

### 3. Thiết lập Biến môi trường
```bash
cp .env.example .env
# Chỉnh sửa file .env với các giá trị của bạn nếu cần thiết
```

### 4. Chạy việc Migrations cơ sở dữ liệu
```bash
npm run prisma:migrate:dev
```

### 5. Khởi tạo dữ liệu mẫu (Seed Database)
```bash
npm run prisma:seed
```

Script này sẽ tạo ra:
- Tài khoản Admin (admin@example.com / admin123)
- Tài khoản Demo (user@example.com / user123)
- Các mẫu chuyến bay (flights) và nhật ký (logs)

### 6. Khởi động Server môi trường Dev
```bash
npm run start:dev
```

## Các đường dẫn truy cập

- **API HTTP**: http://localhost:3000
- **WebSocket (Socket.io)**: ws://localhost:3000
- **Tài liệu API (Docs)**: http://localhost:3000/api/docs
- **RabbitMQ Admin**: http://localhost:15672 (đăng nhập: guest/guest, khi Docker đang chạy)
- **Prometheus**: http://localhost:9090 (khi Docker đang chạy)
- **Grafana**: http://localhost:3001 (đăng nhập bằng admin/admin, khi Docker đang chạy)
- **Truy cập ngoài Internet (Public)**: Có thể trỏ bằng Cloudflare Tunnels thay vì mở port router.

## Các câu lệnh phổ biến

```bash
# Phát triển
npm run start:dev       # Chế độ theo dõi lỗi và hot-reload (Watch mode)
npm run start:debug    # Chế độ Gỡ lỗi (Debug mode)

# Cơ sở dữ liệu
npm run prisma:studio  # Mở Prisma Studio để xem dữ liệu trên web
npm run prisma:seed    # Chạy lại dữ liệu mẫu

# Kiểm thử (Testing)
npm run test          # Chạy tất cả các bài test
npm run test:watch    # Kiếm thử với Watch mode
npm run test:cov      # Xem báo cáo độ bao phủ (Coverage report)

# Chất lượng Code
npm run lint          # Chạy kiểm tra bằng ESLint
npm run format        # Trình bày code lại chuẩn bằng Prettier

# Docker
npm run docker:up     # Bật các dịch vụ (container)
npm run docker:down   # Tắt các dịch vụ
npm run docker:build  # Xây dựng Docker image
```

## API cơ bản đầu tiên

```bash
# Đăng ký (Register)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Đăng nhập (Login)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Dùng accessToken lấy được đưa vào header Authorization
curl -H "Authorization: Bearer <accessToken>" http://localhost:3000/users
```

## Khái quát cấu trúc thư mục

```
Backend/
├── src/              # Mã nguồn dự án
├── prisma/           # Database schemas & migrations của Prisma
├── docker/           # Các file cấu hình của Docker
├── .github/          # Các luồng công việc (workflows) do GitHub Actions đảm nhiệm
├── monitoring/       # Cấu hình Prometheus & Grafana
└── package.json      # Danh sách packages & lệnh chạy scripts
```

## Xử lý sự cố (Troubleshooting)

| Lỗi (Issue) | Cách giải quyết (Solution) |
|-------|----------|
| `Database connection refused` (Bị từ chối kết nối CSDL) | Kiểm tra xem PostgreSQL có chạy không hoặc khởi động Docker: `npm run docker:up` |
| `Redis connection failed` (Lỗi kết nối Redis) | Kiểm tra Redis có đang chạy bằng lệnh: `redis-cli ping` |
| `Port 3000 already in use` (Cổng 3000 đã được dùng) | Thay đổi `APP_PORT` trong `.env` hoặc tắt process đang chiếm cổng: `lsof -i :3000` hoặc kill cổng theo OS. |
| `Prisma client not generated` (Client chưa được tạo) | Chạy lệnh này trước: `npm run prisma:generate` |
| `Module not found` (Không tìm thấy module) | Chạy lệnh: `npm install` |

## Các bước tiếp theo

1. ✅ Thiết lập xong!
2. 📖 Đọc hướng dẫn chính ở file [README.md](./README.md) để biết thêm chi tiết
3. 🔐 Sửa đổi chuỗi bí mật định danh JWT trong file `.env` khi chạy sản phẩm (Production)
4. 📝 Thiết lập nhánh (branch) riêng để thêm tính năng
5. 🧪 Nên viết test (bài test) cho các chức năng mới bạn sẽ làm
6. 🚀 Tự động triển khai dự án Production bởi GitHub Actions (xem file deploy.yml)

## Hỗ trợ

Trong trường hợp có câu hỏi hay bị lỗi:
1. Bạn hãy kiểm tra lại bằng file hướng dẫn gốc [README.md](/README.md)
2. Đọc các lỗi (Issues) trên nền tảng GitHub 
3. Tìm chi tiết theo Docker logs: `docker logs fullstack_backend`
4. Tìm lỗi trong logs của App sinh ra: lệnh `tail -f logs/combined.log`
