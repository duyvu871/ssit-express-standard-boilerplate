# Quy trình làm việc cho dự án


## Mục lục

- [Quy trình làm việc cho dự án](#quy-trình-làm-việc-cho-dự-án)
  - [Mục lục](#mục-lục)
  - [Quy trình quản lý Git](#quy-trình-quản-lý-git)
    - [1. Cấu trúc nhánh (Branching Strategy)](#1-cấu-trúc-nhánh-branching-strategy)
      - [Git Flow](#git-flow)
      - [GitHub Flow (đơn giản hơn)](#github-flow-đơn-giản-hơn)
    - [2. Quy trình làm việc hàng ngày](#2-quy-trình-làm-việc-hàng-ngày)
    - [3. Quy ước commit](#3-quy-ước-commit)
    - [4. Quy trình review code](#4-quy-trình-review-code)
    - [5. Quy trình merge code](#5-quy-trình-merge-code)
    - [6. Quy trình release](#6-quy-trình-release)
    - [7. Quy trình hotfix](#7-quy-trình-hotfix)
  - [Quy trình làm việc chung](#quy-trình-làm-việc-chung)
    - [1. Quản lý công việc](#1-quản-lý-công-việc)
    - [2. CI/CD](#2-cicd)
    - [3. Môi trường](#3-môi-trường)
    - [4. Tài liệu](#4-tài-liệu)
    - [5. Báo cáo và theo dõi tiến độ](#5-báo-cáo-và-theo-dõi-tiến-độ)

## Quy trình quản lý Git

### 1. Cấu trúc nhánh (Branching Strategy)

#### Git Flow

- **master/main**: Nhánh chính, chỉ chứa code sẵn sàng để triển khai sản phẩm
- **develop**: Nhánh phát triển chính
- **feature/X**: Nhánh phát triển tính năng mới (X là tên tính năng)
- **hotfix/X**: Nhánh sửa lỗi khẩn cấp
- **release/X.Y.Z**: Nhánh chuẩn bị phát hành

#### GitHub Flow (đơn giản hơn)

- **main**: Nhánh chính, luôn sẵn sàng triển khai
- **feature/X**: Nhánh phát triển tính năng mới

### 2. Quy trình làm việc hàng ngày

1. **Bắt đầu công việc mới**:
   ```bash
   git checkout develop  # Hoặc main nếu dùng GitHub Flow
   git pull
   git checkout -b feature/ten-tinh-nang
   ```

2. **Commit thường xuyên**:
   ```bash
   git add .
   git commit -m "feat: mô tả ngắn gọn về thay đổi"
   ```

3. **Cập nhật từ nhánh chính**:
   ```bash
   git checkout develop
   git pull
   git checkout feature/ten-tinh-nang
   git rebase develop  # Hoặc merge tùy vào quy ước
   ```

   **Chi tiết về Rebase vs Merge:**
   
   **Rebase:**
   ```bash
   git rebase develop
   ```
   - **Ưu điểm**: 
     - Tạo lịch sử commit sạch sẽ, tuyến tính
     - Tránh các commit merge không cần thiết
     - Dễ dàng theo dõi lịch sử thay đổi
   - **Nhược điểm**:
     - Có thể gây khó khăn khi xử lý conflict
     - Phải force push nếu đã push nhánh feature lên remote
     - Nguy hiểm hơn nếu không hiểu rõ về rebase
   - **Sử dụng khi**: 
     - Làm việc một mình trên nhánh feature
     - Muốn có lịch sử commit gọn gàng
     - Nhánh feature chưa được chia sẻ với team

   **Merge:**
   ```bash
   git merge develop
   ```
   - **Ưu điểm**:
     - An toàn hơn, không làm thay đổi lịch sử
     - Dễ dàng xử lý conflict
     - Giữ nguyên thông tin về việc merge từ đâu
   - **Nhược điểm**:
     - Tạo thêm commit merge
     - Lịch sử commit trở nên phức tạp với dự án lớn
   - **Sử dụng khi**:
     - Nhiều người cùng làm việc trên một nhánh feature
     - Nhánh feature đã được push lên remote
     - Đảm bảo an toàn là ưu tiên hàng đầu

   **Quy ước cho dự án**:
   - Nhánh cá nhân (chưa share): Ưu tiên sử dụng `rebase`
   - Nhánh đã share với team: Sử dụng `merge`
   - Khi push sau khi rebase: Sử dụng `git push --force-with-lease` thay vì `git push -f` để tránh ghi đè commit của người khác

4. **Đẩy code lên máy chủ**:
   ```bash
   git push origin feature/ten-tinh-nang
   ```

5. **Tạo Pull Request**:
   - Tạo PR từ nhánh feature của bạn vào develop/main
   - Yêu cầu ít nhất 1-2 người review

### 3. Quy ước commit

Sử dụng Conventional Commits để dễ dàng theo dõi:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Trong đó:
- **type**: feat, fix, docs, style, refactor, test, chore
- **scope**: phạm vi thay đổi (tùy chọn)
- **description**: mô tả ngắn gọn về thay đổi

Ví dụ:
```
feat(auth): thêm chức năng đăng nhập qua Google
fix(ui): sửa lỗi hiển thị menu trên thiết bị di động
docs: cập nhật README với hướng dẫn cài đặt
```

### 4. Quy trình review code

1. **Người review**:
   - Kiểm tra logic code
   - Đảm bảo tuân thủ coding standards
   - Kiểm tra độ phủ test

2. **Người được review**:
   - Giải thích rõ ràng mục đích của PR
   - Phản hồi và sửa theo góp ý

**Chi tiết về quy trình review code**:

a. **Chuẩn bị Pull Request**:
   - Đặt tiêu đề PR rõ ràng, có thêm mã issue/task nếu có (vd: "feat(auth): Implement Google login [ABC-123]")
   - Viết mô tả chi tiết về những gì đã làm, tại sao làm và cách thức triển khai
   - Tự review code trước khi yêu cầu người khác review
   - Đảm bảo các tests đều pass và không có lỗi lint
   - Thêm screenshots nếu có thay đổi UI

b. **Tiêu chí review code**:
   - **Chức năng**: Code có thực hiện đúng yêu cầu không?
   - **Hiệu suất**: Có vấn đề về hiệu suất không? (vòng lặp không cần thiết, truy vấn DB không tối ưu...)
   - **Bảo mật**: Có lỗ hổng bảo mật nào không? (SQL injection, XSS...)
   - **Khả năng mở rộng**: Code có dễ mở rộng trong tương lai không?
   - **Khả năng bảo trì**: Code có dễ đọc, dễ hiểu không?
   - **Tính nhất quán**: Code có tuân thủ chuẩn chung của dự án không?

c. **Quy trình thực hiện review**:
   1. Người review đọc mô tả PR để hiểu mục đích và phạm vi thay đổi
   2. Xem qua các file đã thay đổi để có cái nhìn tổng quan
   3. Review từng file, từng đoạn code chi tiết
   4. Để lại góp ý cụ thể, rõ ràng, tập trung vào code không phải người viết
   5. Phân loại góp ý: 
      - Blocking (cần sửa mới approve)
      - Non-blocking (góp ý nhưng không bắt buộc sửa)
      - Nitpick (góp ý nhỏ về style, format...)
   6. Nếu cần, gặp trực tiếp để thảo luận thay vì comment dài dòng

d. **Quy trình phản hồi và sửa code**:
   1. Người được review phản hồi từng góp ý
   2. Thực hiện sửa code theo yêu cầu
   3. Giải thích rõ lý do nếu không đồng ý với góp ý
   4. Đánh dấu đã xử lý các góp ý (resolved)
   5. Push commit sửa lỗi lên nhánh feature
   6. Yêu cầu review lại

e. **Quy trình approve và merge**:
   - PR cần ít nhất 1-2 người approve (tùy quy mô dự án)
   - Cần đảm bảo tất cả CI checks đều pass
   - Người tạo PR là người merge sau khi được approve
   - Sử dụng Squash & Merge để gộp tất cả commits thành một commit sạch sẽ
   - Xóa nhánh feature sau khi merge

f. **Thời gian review**:
   - Review code trong vòng 24 giờ sau khi được gán
   - PR nhỏ (<200 dòng): review trong ngày làm việc
   - PR lớn: có thể kéo dài tối đa 2-3 ngày
   - Nếu không thể review đúng hạn, thông báo và đề xuất người review khác

g. **Công cụ hỗ trợ**:
   - Sử dụng GitHub/GitLab Code Review
   - Tích hợp các công cụ kiểm tra tự động (SonarQube, CodeClimate...)
   - Sử dụng các mẫu (templates) cho PR và Review

### 5. Quy trình merge code

1. **Kiểm tra conflict trước khi commit**:
   ```bash
   # Cập nhật nhánh chính (develop hoặc main)
   git checkout develop
   git pull
   
   # Quay lại nhánh feature và kiểm tra xem có conflict không
   git checkout feature/ten-tinh-nang
   git merge develop --no-commit --no-ff
   ```
   
   Nếu không có conflict, bạn sẽ thấy thông báo về các file đã được merge. Bạn có thể hủy merge tạm thời này bằng:
   ```bash
   git merge --abort
   ```
   
   Sau đó tiếp tục làm việc và commit code của bạn.

2. **Xử lý conflict khi merge**:

   a. **Hiểu về conflict**:
   - Conflict xảy ra khi cùng một dòng code bị thay đổi ở cả hai nhánh
   - Git sẽ đánh dấu các vùng conflict trong file với cú pháp:
     ```
     <<<<<<< HEAD
     Code từ nhánh hiện tại (HEAD)
     =======
     Code từ nhánh đang được merge vào
     >>>>>>> branch-name
     ```

   b. **Các bước xử lý conflict**:
   
   1. **Xác định các file bị conflict**:
      ```bash
      git status
      ```
   
   2. **Mở các file bị conflict và chỉnh sửa**:
      - Xóa các marker conflict (<<<<<<, =======, >>>>>>>)
      - Giữ lại code phù hợp hoặc kết hợp cả hai phiên bản
      - Đảm bảo code vẫn hoạt động đúng sau khi sửa
   
   3. **Đánh dấu đã giải quyết conflict**:
      ```bash
      git add <file-đã-sửa-conflict>
      ```
   
   4. **Hoàn tất quá trình merge**:
      ```bash
      git commit -m "Merge branch 'develop' into feature/ten-tinh-nang và giải quyết conflict"
      ```

   c. **Công cụ hỗ trợ xử lý conflict**:
   - Sử dụng công cụ merge trong IDE (VS Code, IntelliJ, ...)
   - Sử dụng công cụ merge của Git:
     ```bash
     git mergetool
     ```

3. **Revert code merge bị lỗi**:

   a. **Revert commit merge gần nhất**:
   ```bash
   git reset --hard HEAD~1  # Quay lại commit trước merge
   ```
   
   b. **Revert một commit merge cụ thể**:
   ```bash
   git revert -m 1 <commit-hash>  # -m 1 để giữ lại nhánh chính
   ```
   
   c. **Hủy bỏ quá trình merge đang thực hiện**:
   ```bash
   git merge --abort
   ```
   
   d. **Khôi phục về trạng thái trước khi merge (đã push)**:
   ```bash
   git reset --hard ORIG_HEAD
   git push --force-with-lease  # Cẩn thận khi sử dụng force push
   ```

4. **Ví dụ về merge các nhánh**:

   a. **Merge feature vào develop**:
   ```bash
   # Đảm bảo nhánh feature đã cập nhật mới nhất
   git checkout feature/login
   git pull origin feature/login
   
   # Cập nhật nhánh develop
   git checkout develop
   git pull origin develop
   
   # Merge feature vào develop
   git merge --no-ff feature/login
   
   # Giải quyết conflict nếu có
   # ...
   
   # Push lên remote
   git push origin develop
   ```

   b. **Merge develop vào feature để cập nhật**:
   ```bash
   git checkout feature/payment-gateway
   git pull origin feature/payment-gateway
   
   # Merge develop vào feature
   git merge develop
   
   # Giải quyết conflict nếu có
   # ...
   
   # Push lên remote
   git push origin feature/payment-gateway
   ```

   c. **Merge release vào main và develop**:
   ```bash
   # Merge vào main
   git checkout main
   git pull origin main
   git merge --no-ff release/1.2.0
   git push origin main
   
   # Tạo tag cho phiên bản
   git tag -a v1.2.0 -m "Version 1.2.0"
   git push origin --tags
   
   # Merge ngược lại vào develop
   git checkout develop
   git pull origin develop
   git merge --no-ff release/1.2.0
   git push origin develop
   ```

   d. **Merge hotfix vào cả main và develop**:
   ```bash
   # Tạo nhánh hotfix từ main
   git checkout main
   git pull origin main
   git checkout -b hotfix/security-issue
   
   # Thực hiện sửa lỗi
   # ...
   git commit -m "fix: sửa lỗi bảo mật nghiêm trọng"
   
   # Merge vào main
   git checkout main
   git merge --no-ff hotfix/security-issue
   git tag -a v1.2.1 -m "Hotfix 1.2.1"
   git push origin main --tags
   
   # Merge vào develop
   git checkout develop
   git pull origin develop
   git merge --no-ff hotfix/security-issue
   git push origin develop
   ```

### 6. Quy trình release

1. **Chuẩn bị release** (sử dụng Git Flow):
   ```bash
   git checkout develop
   git pull
   git checkout -b release/1.0.0
   # Thực hiện các điều chỉnh cuối cùng, cập nhật version
   ```

   **Chi tiết về quy trình chuẩn bị release**:

   a. **Tạo nhánh release**:
   - Tạo nhánh release từ develop với quy ước đặt tên: `release/X.Y.Z` (tuân theo [Semantic Versioning](https://semver.org/))
   - X (major): phiên bản có thay đổi không tương thích với API cũ
   - Y (minor): phiên bản thêm tính năng mới nhưng tương thích ngược
   - Z (patch): phiên bản sửa lỗi, không thêm tính năng mới

   b. **Các hoạt động trong nhánh release**:
   - Cập nhật số phiên bản trong các file cấu hình (package.json, version.txt...)
   - Cập nhật CHANGELOG.md với các thay đổi chính
   - Thực hiện kiểm thử toàn diện
   - Sửa các lỗi nhỏ phát hiện được trong quá trình kiểm thử
   - KHÔNG thêm tính năng mới trong nhánh release

   c. **Kiểm thử trước khi release**:
   ```bash
   # Chạy tất cả các bộ kiểm thử
   npm run test
   
   # Kiểm tra xây dựng sản phẩm
   npm run build
   
   # Triển khai lên môi trường staging
   npm run deploy:staging
   ```

   d. **Xử lý phát sinh**:
   - Các lỗi phát hiện trong quá trình kiểm thử được sửa trực tiếp trên nhánh release
   - Đối với lỗi lớn, cân nhắc hoãn release và quay lại develop để xử lý
   - Các thay đổi trên nhánh release nên được merge ngược lại develop thường xuyên

   e. **Hoàn tất quá trình chuẩn bị**:
   - Tổ chức họp review final với team
   - Chuẩn bị tài liệu release notes
   - Thông báo cho các bên liên quan về lịch release

2. **Merge vào main và develop**:
   ```bash
   git checkout main
   git merge release/1.0.0 --no-ff
   git tag -a v1.0.0 -m "Version 1.0.0"
   git push origin main --tags
   
   git checkout develop
   git merge release/1.0.0 --no-ff
   git push origin develop
   ```

   **Chi tiết về quy trình merge và release**:

   a. **Merge vào nhánh main**:
   - Sử dụng tùy chọn `--no-ff` (no fast-forward) để đảm bảo luôn tạo một commit merge, ngay cả khi có thể fast-forward
   - Điều này giúp duy trì lịch sử rõ ràng về các lần release
   - Sau khi merge, main luôn ở trạng thái sẵn sàng để triển khai

   b. **Đánh tag cho phiên bản**:
   - Đánh tag để đánh dấu phiên bản cụ thể trong lịch sử
   - Sử dụng tag có chú thích (`-a`) để thêm thông tin chi tiết về phiên bản
   - Quy ước đặt tên tag: `v` + số phiên bản (vd: v1.0.0)
   - Tags cần được đẩy lên remote repository bằng lệnh riêng: `git push origin --tags`

   c. **Merge ngược trở lại develop**:
   - Đảm bảo tất cả các thay đổi trong nhánh release đều được cập nhật vào develop
   - Sử dụng `--no-ff` để duy trì lịch sử rõ ràng
   - Điều này đặc biệt quan trọng nếu có các sửa lỗi được thực hiện trực tiếp trên nhánh release

   d. **Triển khai sản phẩm**:
   ```bash
   # Triển khai lên môi trường sản xuất
   npm run deploy:production
   
   # Hoặc sử dụng CI/CD pipeline
   # (thường được kích hoạt tự động khi có tag mới)
   ```

   e. **Theo dõi sau khi phát hành**:
   - Theo dõi các metrics và logs sau khi triển khai
   - Sẵn sàng tạo hotfix nếu phát hiện vấn đề nghiêm trọng
   - Cập nhật tài liệu hướng dẫn sử dụng nếu cần

   f. **Xử lý nhánh release sau khi hoàn thành**:
   ```bash
   # Xóa nhánh release sau khi đã merge
   git branch -d release/1.0.0
   
   # Xóa nhánh release trên remote
   git push origin --delete release/1.0.0
   ```

### 7. Quy trình hotfix

1. **Tạo nhánh hotfix từ main**:
   ```bash
   git checkout main
   git pull
   git checkout -b hotfix/1.0.1
   # Thực hiện sửa lỗi
   ```

2. **Merge hotfix vào cả main và develop**:
   ```bash
   # Merge vào main
   git checkout main
   git merge --no-ff hotfix/1.0.1
   git tag -a v1.0.1 -m "Hotfix 1.0.1"
   git push origin main --tags
   
   # Merge vào develop
   git checkout develop
   git merge --no-ff hotfix/1.0.1
   git push origin develop
   
   # Xóa nhánh hotfix
   git branch -d hotfix/1.0.1
   git push origin --delete hotfix/1.0.1
   ```

## Quy trình làm việc chung

### 1. Quản lý công việc

- Sử dụng Jira, Trello hoặc GitHub Projects để quản lý công việc
- Mỗi task/issue nên có một nhánh tương ứng
- Liên kết commit và PR với task/issue tương ứng

### 2. CI/CD

- Thiết lập GitHub Actions hoặc GitLab CI để:
  - Chạy kiểm thử tự động khi push code
  - Kiểm tra chất lượng code (linting, formatting)
  - Triển khai tự động đến môi trường thử nghiệm sau khi merge
  - Triển khai tự động đến môi trường sản phẩm khi release

### 3. Môi trường

- **Development**: Môi trường phát triển cá nhân
- **Testing/Staging**: Môi trường thử nghiệm
- **Production**: Môi trường sản phẩm

### 4. Tài liệu

- Duy trì README cập nhật
- Tài liệu API (nếu có)
- Tài liệu hướng dẫn triển khai

### 5. Báo cáo và theo dõi tiến độ

- Stand-up meeting hàng ngày (nếu làm việc nhóm)
- Báo cáo tiến độ hàng tuần
- Retrospective sau mỗi sprint/milestone
