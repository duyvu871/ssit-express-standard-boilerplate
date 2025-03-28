# Hướng dẫn sử dụng Docker

## 1. Cài đặt và chạy ứng dụng

### 1.1 Yêu cầu hệ thống
- Docker Engine phiên bản 20.10+
- Docker Compose phiên bản 2.0+

### 1.2 Khởi động ứng dụng
```bash
docker-compose up -d
```

Lệnh này sẽ:
- Build và khởi động các dịch vụ:
  - PostgreSQL (database)
  - Redis (cache)
  - MinIO (object storage)
  - Server (Express.js)

## 2. Cấu hình Docker Compose

### 2.1 Các dịch vụ chính
- **server**: Ứng dụng Express.js
  - Port: ${SERVER_PORT}
  - Phụ thuộc vào PostgreSQL, Redis và MinIO
  - Volume: đồng bộ thư mục logs

- **postgres**: Cơ sở dữ liệu PostgreSQL
  - Volume: postgres_data

- **redis**: Bộ nhớ cache Redis
  - Volume: redis_data

- **minio**: Object storage MinIO
  - Volume: minio_data

### 2.2 Tùy chỉnh cấu hình
Chỉnh sửa file `.env` để thay đổi các thông số:
- SERVER_PORT
- Database connection
- Redis connection
- MinIO credentials

## 3. Các trường hợp sử dụng

### 3.1 Phát triển ứng dụng
- Chạy toàn bộ hệ thống với một lệnh
- Đồng bộ môi trường giữa các thành viên

### 3.2 Kiểm thử
- Chạy kiểm thử trong môi trường đồng nhất
- Dễ dàng reset dữ liệu test

### 3.3 Triển khai production
- Đóng gói ứng dụng và các phụ thuộc
- Dễ dàng mở rộng hệ thống

## 4. Lệnh hữu ích

### 4.1 Build lại dịch vụ
```bash
docker-compose up -d --no-deps --build --no-cache <tên_dịch_vụ>
```

### 4.2 Xem log
```bash
docker-compose logs -f
```

### 4.3 Dừng và xóa
```bash
docker-compose down
```

## 5. Tùy chỉnh Nginx
Cấu hình Nginx được đặt trong thư mục `nginx`:
- Virtual host: `nginx/sites-available`
- SSL certificate: `nginx/ssl`

Chỉnh sửa file cấu hình Nginx và khởi động lại dịch vụ để áp dụng thay đổi.