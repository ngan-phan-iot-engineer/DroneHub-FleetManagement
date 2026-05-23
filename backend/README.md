# Fullstack Backend

API Backend chuẩn doanh nghiệp được xây dựng bằng NestJS, PostgreSQL, Redis và các quy trình thực hành DevOps hiện đại.

## Công nghệ sử dụng

- **Framework**: NestJS 10+ với TypeScript
- **Cơ sở dữ liệu**: PostgreSQL 15
- **Bộ nhớ đệm (Cache)**: Redis 7
- **Message Broker**: RabbitMQ 3 (Microservices)
- **Thời gian thực (Real-time)**: WebSocket (Socket.io)
- **ORM**: Prisma
- **Xác thực**: JWT + Theo phiên (Session-based)
- **Tài liệu API**: Swagger/OpenAPI
- **Giám sát (Monitoring)**: Prometheus + Grafana
- **Bảo mật & Triển khai (DevOps)**: Docker, GitHub Actions, Cloudflare Tunnels (Khuyên dùng)

## Bắt đầu nhanh

### Yêu cầu hệ thống
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15 (or use Docker)
- Redis 7 (or use Docker)

### Thiết lập môi trường phát triển

```bash
# 1. Clone repository
git clone <repo-url>
cd Backend

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Cài đặt biến môi trường
cp .env.example .env

# 4. Thiết lập cơ sở dữ liệu
npm run prisma:migrate:dev
npm run prisma:seed

# 5. Khởi động server
npm run start:dev
```

### Thiết lập với Docker

```bash
# Build và chạy tất cả các dịch vụ
npm run docker:up

# Xem log
docker logs -f fullstack_backend

# Dừng các dịch vụ
npm run docker:down
```

## Cấu trúc thư mục

```
src/
├── app.module.ts           # Module gốc
├── app.controller.ts       # Kiểm tra cấu hình trạng thái
├── common/                 # Các module dùng chung
│   ├── prisma/            # Cơ sở dữ liệu
│   ├── logger/            # Cơ chế log hệ thống
│   └── monitoring/        # Metrics cho Prometheus
├── config/                # Cấu hình
├── modules/               # Các module tính năng chính
│   ├── auth/             # Xác thực
│   ├── users/            # Quản lý người dùng
│   ├── flights/          # Quản lý chuyến bay
│   ├── logs/             # Nhật ký hoạt động
│   ├── teams/            # Quản lý đội ngũ
│   └── health/           # Log trạng thái hệ thống
└── main.ts               # Điểm gốc của ứng dụng

prisma/
├── schema.prisma         # Schema Cơ sở dữ liệu
├── seed.ts              # Database seeding
└── migrations/          # Migration files

docker/
├── Dockerfile           # Production image
├── Dockerfile.prod      # Multi-stage build
└── docker-compose.yml   # Development stack

.github/workflows/
├── test.yml            # Testing pipeline
├── deploy.yml          # Deployment pipeline
└── quality.yml         # Code quality checks
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

### Users
- `GET /users` - List all users (paginated)
- `GET /users/:id` - Get user by ID

### Flights
- `GET /flights` - List user flights (cached)
- `GET /flights/:id` - Get flight details
- `POST /flights` - Create new flight
- `PUT /flights/:id` - Update flight
- `DELETE /flights/:id` - Delete flight

### Logs
- `GET /logs` - List activity logs
- `GET /logs/:id` - Get log entry
- `POST /logs` - Create log entry

### Teams
- `GET /teams` - List user teams
- `GET /teams/:id` - Get team details
- `POST /teams` - Create team
- `PUT /teams/:id` - Update team
- `DELETE /teams/:id` - Delete team
- `POST /teams/:teamId/members` - Add member
- `DELETE /teams/:teamId/members/:memberId` - Remove member

### Health
- `GET /` - Health check
- `GET /health` - Detailed health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

## Documentation

- **API Docs**: http://localhost:3000/api/docs (Swagger UI)
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

## Environment Variables

See `.env.example` for all available options. Key variables:

```env
NODE_ENV=development
APP_PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/fullstack_dev
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

## Database

### Migrations

```bash
# Create new migration
npm run prisma:migrate:dev -- --name description

# Apply migrations
npm run prisma:migrate:deploy

# Open Prisma Studio
npm run prisma:studio
```

### Seeding

```bash
# Run seed script
npm run prisma:seed
```

## Testing

```bash
# Run unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

## Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Monitoring

### Prometheus

Metrics are exposed at `GET /metrics`

Custom metrics:
- `http_request_duration_ms` - Request duration histogram
- `http_requests_total` - Total request counter

### Grafana

1. Navigate to http://localhost:3001
2. Login with `admin/admin`
3. Data source: Prometheus (auto-configured)
4. Import dashboards or create custom ones

## Deployment

### GitHub Actions

Three workflows included:

1. **test.yml** - Runs on push/PR to main/develop
   - Installs dependencies
   - Runs linter
   - Runs tests
   - Uploads coverage

2. **deploy.yml** - Runs on push to main
   - Builds application
   - Runs tests
   - Builds Docker image
   - Pushes to Docker Hub
   - Deploys to server

3. **quality.yml** - Code quality checks
   - ESLint
   - Prettier
   - SonarQube integration

### Manual Deployment

```bash
# Build Docker image
npm run docker:build

# Push to registry
docker tag fullstack-backend:latest yourusername/fullstack-backend:latest
docker push yourusername/fullstack-backend:latest

# Deploy to production
ssh user@server
cd /app/fullstack-backend
docker pull yourusername/fullstack-backend:latest
docker-compose -f docker-compose.prod.yml up -d
```

## Security

- ✅ CORS enforcement
- ✅ Helmet for HTTP headers
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation (class-validator)
- ✅ Environment variable protection
- ✅ Rate limiting ready
- ⚠️ HTTPS in production required

## Performance

- ✅ Redis caching for frequent queries
- ✅ Database indexing on key fields
- ✅ Pagination support
- ✅ Connection pooling
- ✅ Prometheus metrics
- ✅ Health checks for orchestration

## Troubleshooting

### Database connection failed
```bash
# Check PostgreSQL is running
docker-compose ps

# Check DATABASE_URL in .env
# Default: postgresql://user:password@localhost:5432/fullstack_dev
```

### Redis connection issues
```bash
# Verify Redis is running
redis-cli ping

# Check REDIS_HOST and REDIS_PORT in .env
```

### Docker build fails
```bash
# Clean build
docker-compose down
docker system prune -a
npm run docker:up
```

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/name`
4. Create Pull Request

## License

MIT
