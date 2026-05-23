# WebGCS03

Tai lieu nay mo ta cach cau hinh du an de KHONG hardcode API URL, va cach trien khai theo pipeline:
Local -> Docker Build -> Registry -> AWS EC2.

## 1. Nguyen tac bat buoc

- Khong viet truc tiep URL API trong code giao dien.
- Chi su dung bien moi truong.
- Component khong goi URL day du, chi goi endpoint tuong doi, vi du `/login`.

## 2. Cau hinh moi truong

### Local (Vite dev)

File [ .env.development ](.env.development) dung cho `npm run dev`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=WebGCS03 (Development)
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
VITE_MAPBOX_STYLE_URL=mapbox://styles/mapbox/satellite-streets-v12
```

### Production build fallback (Vite)

File [ .env.production ](.env.production) duoc dung khi `npm run build` neu khong co runtime injection:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_APP_NAME=WebGCS03
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
VITE_MAPBOX_STYLE_URL=mapbox://styles/mapbox/satellite-streets-v12
```

### Runtime container (khuyen nghi khi deploy)

Khi chay container, truyen 2 bien runtime:

- `API_BASE_URL`
- `APP_NAME`
- `MAPBOX_ACCESS_TOKEN`
- `MAPBOX_STYLE_URL`

Frontend uu tien doc runtime config truoc, sau do moi fallback ve `VITE_*`.

## 3. Cac file quan trong

- Runtime config fallback: [src/config/env.js](src/config/env.js)
- Axios client dung chung: [src/utils/apiClient.js](src/utils/apiClient.js)
- Auth API: [src/features/auth/authApi.js](src/features/auth/authApi.js)
- Runtime script local default: [public/env-config.js](public/env-config.js)
- Docker runtime injection script: [docker/40-env-config.sh](docker/40-env-config.sh)
- Nginx SPA config: [docker/nginx.conf](docker/nginx.conf)

## 4. Chay local

```powershell
npm install
npm run dev
```

Mo trinh duyet: `http://localhost:5173`

## 5. Build production local

```powershell
npm run build
npm run preview
```

## 6. Docker Build va Run

### Cach A: dung Docker command

Build image:

```powershell
docker build -t webgcs03:latest .
```

Run voi runtime env:

```powershell
docker run -d --name webgcs03 -p 8080:80 `
	-e API_BASE_URL="https://api.your-domain.com/api" `
	-e APP_NAME="WebGCS03 Production" `
	-e MAPBOX_ACCESS_TOKEN="your_mapbox_access_token" `
	-e MAPBOX_STYLE_URL="mapbox://styles/mapbox/satellite-streets-v12" `
	webgcs03:latest
```

Mo: `http://localhost:8080`

### Cach B: dung Docker Compose

File [docker-compose.yml](docker-compose.yml) da co san service mau.

```powershell
docker compose up -d --build
```

## 7. Day image len Registry

### Docker Hub

```powershell
docker tag webgcs03:latest <dockerhub-user>/webgcs03:latest
docker push <dockerhub-user>/webgcs03:latest
```

### AWS ECR

```powershell
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker tag webgcs03:latest <account>.dkr.ecr.<region>.amazonaws.com/webgcs03:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/webgcs03:latest
```

## 8. Deploy tren AWS EC2

SSH vao EC2 va chay:

```bash
docker pull <image-uri>
docker stop webgcs03 || true
docker rm webgcs03 || true
docker run -d --name webgcs03 -p 80:80 \
	-e API_BASE_URL="https://api.your-domain.com/api" \
	-e APP_NAME="WebGCS03" \
	-e MAPBOX_ACCESS_TOKEN="your_mapbox_access_token" \
	-e MAPBOX_STYLE_URL="mapbox://styles/mapbox/satellite-streets-v12" \
	<image-uri>

## 10. Cau hinh Mapbox chuan doanh nghiep

- Neu chua co token, man hinh ban do van hien thi bang fallback map de UX khong bi trang.
- De su dung ban do ve tinh enterprise, cap token va style URL nhu cac bien moi truong o tren.
- Sau khi cap nhat bien moi truong trong local, hay khoi dong lai Vite dev server.
```

## 9. Checklist tranh hardcode API

- Co `fetch("http://...")` hoac `axios.get("http://...")` trong component hay khong.
- Tat ca API deu di qua `apiClient`.
- URL goc phai nam o env, khong nam trong source code component.
- `.env*` that duoc ignore trong git, chi commit [ .env.example ](.env.example).
