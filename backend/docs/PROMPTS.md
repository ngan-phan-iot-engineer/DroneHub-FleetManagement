# AI Prompts Library cho Backend Project

Tài liệu này chứa danh sách các câu lệnh (prompts) được thiết kế tối ưu riêng cho dự án backend (sử dụng NestJS, Prisma, Docker). Hãy copy các câu lệnh này dán vào GitHub Copilot Chat để đảm bảo AI sinh ra code đúng chuẩn quy trình.

## 1. 🏗️ Phát triển tính năng (NestJS Controllers, Services, DTO)

### Tạo API CRUD chuẩn NestJS:
> "Hãy tạo Controller và Service cho module `[TÊN_MODULE]`. Yêu cầu: Sử dụng `PrismaService` để thao tác DB. Thêm các Decorator của Swagger, dùng `class-validator` cho DTOs, và bảo vệ tất cả route (trừ GET) bằng `@UseGuards(JwtAuthGuard)`. Code ngắn gọn, không giải thích dài dòng."

### Xử lý nghiệp vụ phức tạp (WebSockets):
> "Trong file `events.gateway.ts`, hãy thêm một sự kiện (`@SubscribeMessage`) tên là `[TÊN_SỰ_KIỆN]` để phát dữ liệu tới tất cả client kết nối. Đảm bảo có xử lý xác thực token JWT qua Socket.io middlewares trước khi cho kết nối."

## 2. 🗄️ Database & Prisma

### Tạo quan hệ trong Schema:
> "Tôi cần mở rộng `schema.prisma`. Hãy viết code định nghĩa model `[MODEL_A]` có quan hệ một-nhiều với model `[MODEL_B]`. Khóa ngoại có hành vi `onDelete: Cascade`. Đừng quên cung cấp lệnh terminal để tạo migration."

### Tối ưu hóa Query (Chống lỗi N+1 API):
> "Đoạn code trong `[TEN_SERVICE].ts` sau đang dùng Prisma để lấy danh sách dữ liệu. Hãy kiểm tra xem có nguy cơ vướng lỗi N+1 query không? Nếu có, hãy cấu trúc lại query sử dụng `include` hoặc `select` để gom lại thành 1 câu SQL duy nhất."

## 3. 🛡️ Authentication & Authorization (JWT Guard, Roles)

### Mở rộng Auth phân quyền:
> "Trong module Auth, tôi muốn thêm tính năng phân quyền theo Role (Role-based access control). Hãy tạo ra một custom decorator `@Roles()` và một `RolesGuard` tích hợp với `JwtAuthGuard` hiện tại của NestJS. Đảm bảo return `ForbiddenException` nếu không đủ quyền."

## 4. 🧪 Testing (Jest & E2E)

### Viết Unit Test cho Service:
> "Viết Unit Test bằng Jest cho file `[PATH_TƠI_SERVICE].ts`. Hãy mock đối tượng `PrismaService`. Cung cấp ít nhất 2 test case: 1 luồng happy path (trả về dữ liệu đúng) và 1 luồng failed (cố tình ném ra `NotFoundException` hoặc `BadRequestException`)."

### Viết Unit Test cho Controller:
> "Viết Unit Test cho file `[PATH_TỚI_CONTROLLER].ts`. Mock Service tương ứng. Kiểm tra xem các Route đã trả về đúng mã trạng thái HTTP (200 / 201) hay chưa."

## 5. 🐳 DevOps & CI/CD (Docker, GitHub Actions)

### Tối ưu CI/CD Cache:
> "Bạn hãy đánh giá file `.github/workflows/deploy.yml`. Hãy cấu hình thêm tính năng caching của Github Actions cho Docker (dùng `type=gha` trong `build-push-action`) để tăng tốc độ build docker image ở các lần đẩy code tiếp theo. Chỉ xuất ra block code cần sửa."

### Tạo Docker Compose môi trường Dev:
> "Hãy sinh ra cấu hình `docker-compose.override.yml` dùng cho môi trường local. Nó cần mount volume code hiện tại vào trong container NestJS để hỗ trợ hot-reload, và mở port của thư mục monitoring."

## 6. 📊 Tracking & Giám sát (Prometheus, Grafana)

### Thêm Metrics mới:
> "Trong file `prometheus.service.ts` và middleware `prometheus.middleware.ts`, hãy thêm một custom metric (kiểu Histogram) để đo lường thời gian phản hồi (response time) riêng của các API thuộc module `flights`. Bỏ qua các API route thuộc module `health`."

## 7. 🐛 Debugging & Fixing (Dùng khi có lỗi xảy ra)

### Tìm nguyên nhân bắt rễ (Root Cause):
> "Khi tôi chạy lệnh/api `[LỆNH/API_BỊ_LỖI]`, tôi nhận được lỗi sau ở màn hình console:
> ```
> [PASTE_ĐOẠN_LOG_LỖI_VÀO_ĐÂY]
> ```
> Context liên quan là ở file `[TÊN_FILE].ts`. Hãy tìm hiểu root cause và đưa ra code sửa tận gốc rễ thuật toán (không dùng try-catch bừa bãi làm band-aid fix)."

## 8. 📝 Code Review & Refactoring

### Đánh giá chất lượng Code:
> "Vui lòng review đoạn code sau trong file `[TÊN_FILE].ts` dựa trên các nguyên tắc thiết kế SOLID và hướng dẫn từ `.github/copilot-instructions.md`. Chỉ ra những vị trí có thể gây ra memory leak, code smell hoặc thiết kế chưa tốt. Đưa ra đề xuất sửa chữa với thay đổi nhỏ nhất có thể."

### Refactor Hàm/Class quá dài:
> "Hàm `[TÊN_HÀM]` trong `[TÊN_FILE].ts` đang quá dài và làm quá nhiều nhiệm vụ (hơn 100 dòng). Hãy tách nó thành các hàm nhỏ hơn (private methods) hoặc chuyển logic tương ứng xuống các service tách biệt để tuân thủ nguyên tắc Single Responsibility, đảm bảo không làm thay đổi luồng nghiệp vụ."

## 9. 🧠 TypeScript, Validation & Swagger DTO

### Sinh DTO từ Prisma Model:
> "Từ Prisma model `[TÊN_MODEL]`, hãy viết một lớp `Create[TênModel]Dto`. Yêu cầu: Sử dụng đầy đủ các Decorator từ thư viện `@nestjs/swagger` (`@ApiProperty`) và `class-validator` (`@IsString`, `@IsEmail`, `@IsOptional`...) sao cho ánh xạ chính xác với kiểu dữ liệu của schema Prisma."

### Tạo Update DTO (Partial Types):
> "Dựa vào `Create[TênModel]Dto` đang có trong file `[TÊN_FILE].ts`, hãy tạo `Update[TênModel]Dto` bằng cách kế thừa qua `PartialType` của NestJS Swagger/mapped-types để tránh việc phải định nghĩa lại các trường."

## 10. 🌱 Database Seeding & Mock Data

### Viết kịch bản Seed dữ liệu:
> "Trong file `prisma/seed.ts`, hãy tạo kịch bản chèn dữ liệu mẫu (Seeding) cho model `[TÊN_MODEL]`. Tự động sinh ra khoảng 50 bản ghi sử dụng thư viện Faker (hoặc logic ngẫu nhiên tùy chỉnh), chứa danh sách dữ liệu giả định chân thực. Yêu cầu xử lý xóa dữ liệu cũ một cách an toàn trước khi seed nếu cần thiết."

## 11. 📜 Logging & Exception Handling

### Tích hợp Custom Logger chuyên sâu:
> "Service `[TÊN_SERVICE].ts` đang thực hiện luồng nghiệp vụ quan trọng. Hãy bổ sung `Logger` (hoặc `LoggerService` tùy chỉnh của module `logs`). Yêu cầu ghi log đầy đủ ở 3 giai đoạn: bắt đầu xử lý, cảnh báo nếu sai lệch dữ liệu nội bộ, và lỗi nghiêm trọng (Error) khi thao tác với cơ sở dữ liệu thất bại. Che giấu (mask) các thông tin nhạy cảm của User."

### Viết Global Exception Filter:
> "Hãy tạo một `AllExceptionsFilter` (implement từ `ExceptionFilter`) của NestJS để bắt toàn bộ các lỗi Unhandled Exception. Logic cần định dạng lại chuẩn JSON error trả về cho client gồm: `statusCode`, `timestamp`, `path`, và `message`, đồng thời log lỗi ra console."

## 12. 🚀 Hiệu suất & Caching (Redis/Memory)

### Áp dụng Caching cho API chậm:
> "API lấy danh sách `[TÊN_RESOURCE]` trong file `[TÊN_FILE].ts` đang phản hồi chậm do query database nặng. Hãy tích hợp Cache Manager của NestJS (cấu hình trong repository hiện tại) để cache lại kết quả của hàm này trong 60 giây. Cập nhật luôn logic xóa cache (invalidate) khi có dữ liệu mới được thao tác qua hàm Create/Update."

## 13. 🔒 Bảo mật (Security)

### Kiểm tra và phòng chống lỗ hổng API:
> "Review các Controller trong đoạn code sau. Hãy đề xuất (và viết code) các biện pháp chống Brute Force, Rate Limiting (thường dùng `@nestjs/throttler`), hoặc ngăn chặn NoSQL/SQL Injection dựa trên cấu hình đang có. Mục tiêu là để an toàn hơn khi public API này lên môi trường Production."

### Mã hóa thông tin nhạy cảm:
> "Tôi đang xử lý việc lưu trữ `[TÊN_TRƯỜNG_NHẠY_CẢM]` (ví dụ: mật khẩu, API key) ở file `[TÊN_FILE].ts`. Hãy viết một hàm dùng thư viện `bcrypt` hoặc module `crypto` có sẵn của Node.js để hash/mã hóa dữ liệu này trước khi Prisma lưu xuống database."

## 14. 🌐 Giao tiếp HTTP (Tích hợp Third-Party API)

### Viết Service gọi API ngoài (Axios / HTTPModule):
> "Trong module `flights`, tôi cần gọi tới một API của bên thứ ba (VD: `[URL_ĐỐI_TÁC]`). Hãy sử dụng `HttpModule` của NestJS để tạo một HTTP Request (phương thức GET/POST). Xử lý việc bắt timeout, thêm Header xác thực, và trả về một custom error message nếu đối tác trả về mã lỗi 5xx."

## 15. 📚 Sinh tài liệu API (Swagger & Markdown)

### Mô tả API Swagger tự động từ thuật toán:
> "Hãy đọc logic của đoạn code hàm `[TÊN_HÀM]` bên dưới và thêm các Decorator `@ApiOperation`, `@ApiResponse`, và `@ApiParam` của NestJS Swagger. Đảm bảo mô tả rõ các HTTP status code có thể xảy ra như 200 (Thành công), 400 (Dữ liệu sai), và 404 (Không tìm thấy)."

### Sinh tài liệu Markdown cho Project (README):
> "Dựa vào hệ thống API thuộc `[TÊN_MODULE]` (có trong thư mục cụ thể), hãy viết một file Markdown (API_DOCS.md) tóm tắt các endpoint hiện có, định dạng Request Body, và phản hồi Success/Error bằng ví dụ JSON dễ hiểu để đội Frontend có thể tự đọc và ghép nối."
