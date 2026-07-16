# BÍ KÍP BẢO VỆ ĐỒ ÁN MICROSERVICES (BẢN FULL CHI TIẾT)

Tài liệu này được biên soạn đặc biệt để bạn đối phó với những giảng viên "khó tính" nhất. Mọi tính năng đều được chỉ rõ: Nó là gì? Tại sao dùng? Và code nằm ở đâu!

---

## PHẦN 1: GIẢI PHẪU CHI TIẾT LUỒNG ĐẶT HÀNG (ORDER FLOW) KÈM GIAO DIỆN

> *Thầy hỏi: "Mở hệ thống lên demo cho tôi xem luồng đặt hàng. Khách đặt xong làm sao báo về mail? Giao hàng xong thì sao?"*
> 
> **=> Bạn hãy vừa mở các trang web sau đây, vừa thuyết trình theo từng bước nhé:**

### Bước 1: Khách hàng (User) đặt hàng
- **👉 Mở màn hình:** Bạn đăng nhập tài khoản Khách, vào trang Giỏ Hàng (`CartPage.jsx` trên React) -> Bấm sang trang Thanh toán (`CheckoutPage.jsx`).
- **Thao tác:** Bấm nút "Đặt Hàng".
- **Code Backend xử lý:**
  - Request đi qua `api-gateway` -> Tới file `OrderController.java` trong thư mục của `order-service` (gọi hàm `POST /api/shop/orders/checkout`).
- **Công nghệ tham gia:**
  - **OpenFeign (Đồng bộ):** `order-service` dùng thư viện Feign để "nhấc máy gọi điện" sang `user-service` xin thông tin Tên, Email của khách.
  - **Kafka (Bất đồng bộ):** Lưu vào PostgreSQL xong, `order-service` không tự gửi mail mà ném 1 thông báo `ORDER_CREATED` vào Kafka.
  - **Spring Mail (Gửi Email):** Service thứ 3 tên là `notification-service` sẽ bắt được thông báo từ Kafka. Nó sử dụng thư viện `spring-boot-starter-mail` kết nối với máy chủ SMTP của Gmail để tự động gửi Email xác nhận vào hòm thư của khách.
  - *Bạn có thể mở hòm thư Gmail của tài khoản test lên để show cho thầy xem email vừa được gửi tới!*
- **Trạng thái đơn hàng lúc này:** `PENDING_CONFIRMATION` (Chờ xác nhận).

### Bước 2: Nhân viên (Staff/Admin) duyệt đơn
- **👉 Mở màn hình:** Mở một Tab ẩn danh khác, đăng nhập tài khoản Admin. Bấm vào menu "Quản lý Đơn Hàng" (Màn hình `AdminOrderPage.jsx`).
- **Thao tác:** Bạn sẽ thấy đơn hàng vừa đặt hiển thị ở đây. Bạn bấm nút "Phân công Shipper" và chọn 1 người giao hàng.
- **Code Backend xử lý:**
  - Gọi API `PUT /api/shop/order/{orderId}/shipper/assign`. Code xử lý nằm trong `CheckoutService.java` của `order-service`.
  - Lúc này ID của Shipper được lưu đính kèm vào Database của Đơn hàng.
- **Trạng thái đơn hàng:** Đổi thành `SHIPPING` (Đang giao hàng).

### Bước 3: Người giao hàng (Shipper) đi giao
- **👉 Mở màn hình:** Lại mở một trình duyệt khác (hoặc logout), đăng nhập tài khoản Shipper. Hệ thống tự động nhảy vào trang `ShipperDashboard.jsx`.
- **Thao tác:** Shipper sẽ chỉ nhìn thấy đúng cái đơn hàng vừa được gán cho mình. Shipper bấm nút "Giao thành công".
- **Code Backend xử lý:**
  - Gọi API `PUT /api/shop/order/{orderId}/status`. Hàm `changeStatus()` trong `CheckoutService.java` đổi trạng thái thành `COMPLETED` (Hoàn thành).
  - Lại tiếp tục dùng **Kafka** phát tín hiệu `ORDER_STATUS_CHANGED`.
  - `notification-service` lại bắt được tín hiệu, và dùng **JavaMailSender** gửi 1 email *"Cảm ơn quý khách đã nhận hàng!"*. 
  - *Bạn tiếp tục mở Gmail lên cho thầy xem cái email thứ 2 vừa tới.*

---

## PHẦN 2: GIẢI MÃ CHI TIẾT 15 TIÊU CHÍ CÔNG NGHỆ

### 1 & 2. Spring Boot & Microservices
- **👉 CÁCH DEMO:** Mở công cụ Docker Desktop lên (hoặc mở file `docker-compose.yml` ra) để thầy thấy rõ dự án được tách thành 5 cụm dịch vụ hoàn toàn độc lập (`user`, `product`, `order`...).
- **Khái niệm:** Thay vì gộp code thành 1 cục khổng lồ (Monolithic), ta chia nhỏ thành 5 module: `user-service` (quản lý user), `product-catalog-service` (quản lý hàng hóa), `order-service` (quản lý đơn), `payment-service` (thanh toán), `notification-service` (gửi mail).
- **File trong code:** Mỗi thư mục là một Service riêng biệt có file `pom.xml` chạy cổng riêng (8811, 8812, 8813...).
- **Tại sao dùng?** Lỡ `notification-service` bị sập (lỗi code gửi mail), người dùng VẪN CÓ THỂ đặt hàng và xem hàng bình thường. Nếu viết chung 1 cục, sập 1 chỗ là chết cả hệ thống.

### 3. Frontend (ReactJS)
- **👉 CÁCH DEMO:** Mở trình duyệt lên trang chủ `http://localhost:5173`. Ấn F12 -> chọn tab **Network** (Mạng) để thầy xem Frontend gọi API lấy data như thế nào.
- Dùng ReactJS gọi API thông qua thư viện `axios`. File cấu hình gốc nằm ở `frontend/src/api/axios.js`.

### 4. SQL Database (PostgreSQL)
- **👉 CÁCH DEMO:** Mở phần mềm **pgAdmin** (hoặc DBeaver) lên, kết nối vào database `ecommerce_microservices_db` để thầy xem các bảng (Tables) chứa dữ liệu thực tế.
- **Khái niệm:** Hệ quản trị CSDL quan hệ. Dữ liệu được chia thành các bảng (User, Product, Order) có khóa chính, khóa ngoại liên kết.
- **File trong code:** File `application.properties` ở từng service (`spring.datasource.url=jdbc:postgresql://localhost:5432/...`). Dùng Spring Data JPA để tạo bảng tự động (Entities).
- **Tại sao PostgreSQL mà không phải MySQL?** Vì PostgreSQL xử lý dữ liệu phức tạp (JSON, Array) cực tốt, quản lý đồng thời (Concurrency) và Transaction (Rollback khi lỗi) tốt hơn MySQL trong môi trường Microservices.

### 5. NoSQL Database (Redis)
- **👉 CÁCH DEMO:** Đăng nhập vào Admin. Ấn F12 -> tab **Application** (Ứng dụng) -> **Cookies**. Chỉ cho thầy xem cái mã cookie `SESSION` siêu dài. Đó chính là Session được lưu trên Redis!
- **Khái niệm:** CSDL phi quan hệ dạng Key-Value (Chìa khóa: Ổ khóa). Nó lưu dữ liệu trực tiếp lên RAM (bộ nhớ trong) thay vì ổ cứng HDD/SSD.
- **Ứng dụng ở đâu?** Lưu phiên đăng nhập (Spring Session) và làm Token Bucket đếm số request cho phần Rate Limiting.
- **Tại sao dùng?** Tốc độ đọc/ghi của Redis nhanh gấp hàng ngàn lần PostgreSQL. Dùng SQL để đếm số lần F5 của khách hàng thì chắc chắn Database sẽ bị nghẽn (quá tải) ngay lập tức.

### 6. Auth & Auth (JWT Security)
- **👉 CÁCH DEMO:** Ấn F12 -> tab **Application** -> **Local Storage**. Chỉ cho thầy xem biến `token` bắt đầu bằng chữ `eyJ...`. Đó chính là thẻ căn cước JWT. Xóa token này đi lập tức sẽ bị văng ra ngoài trang Login.
- **File trong code:** `JwtAuthenticationFilter.java` ở `api-gateway` và `JwtTokenProvider.java` ở `user-service`.
- **Cách hoạt động:** Khi login thành công, User nhận 1 chuỗi mã hóa (Token). Mỗi khi frontend gửi request mua hàng, nó nhét Token này vào Header. Cổng `api-gateway` sẽ "xé" Token ra kiểm tra, nếu đúng là người dùng hợp lệ mới mở cửa cho vào.

### 7. Load Balancing & Scaling (Eureka Server & API Gateway)
- **👉 CÁCH DEMO (CỰC HAY):** Mở link **http://localhost:8761** lên. Đây là giao diện Dashboard tuyệt đẹp của Eureka. Thầy sẽ thấy danh sách toàn bộ các Microservices đang "Sống" và kết nối vào hệ thống.
- **Eureka Server:** Máy chủ danh bạ. File `application.properties` của mọi service đều có dòng `eureka.client.service-url.defaultZone=http://localhost:8761/eureka` để báo danh.
- **API Gateway:** Đứng ở cổng `8900`. 
- **Tại sao dùng?** Lỡ trang web quá nổi tiếng, mình bật 3 cái `order-service` cùng lúc để xử lý. Gateway sẽ đứng làm trọng tài chia bài (Load Balancer - Cân bằng tải): Request 1 đưa cho Order 1, Request 2 đưa Order 2... giúp hệ thống không bao giờ bị sập do quá tải. 
- **Khác gì Docker?** Eureka/Gateway điều hướng LUỒNG DỮ LIỆU. Còn Docker đóng gói MÔI TRƯỜNG CHẠY CODE.

### 8. Giao tiếp đồng bộ (OpenFeign)
- **👉 CÁCH DEMO:** Thao tác quy trình Đặt Hàng. Khách bấm nút thanh toán, `order-service` "nhấc máy" gọi `user-service` xin địa chỉ. Giao tiếp xong lập tức đơn hàng được tạo.
- **File trong code:** `UserClient.java` (gắn `@FeignClient(name = "user-service")`) nằm trong thư mục `feignclient` của `order-service`.
- **Tại sao dùng OpenFeign?** Nó giúp các service nói chuyện với nhau dễ như gọi hàm bình thường (chỉ cần viết Interface) mà không cần code dài dòng lằng nhằng bằng RestTemplate.

### 9. Giao tiếp bất đồng bộ (Kafka vs RabbitMQ)
- **👉 CÁCH DEMO:** Chỉ cần mở Gmail lên, khoe cái email "Cảm ơn quý khách đã mua hàng" tự động nhảy vào máy. Giải thích là `order` vừa ném tin nhắn vào Kafka, `notification` bắt được tin nhắn rác rưởi là đi gửi email giùm luôn.
- **Ứng dụng ở đâu?** `OrderController.java` (Lúc gửi event: `kafkaTemplate.send("order-events", orderEvent)`).
- **Tại sao Kafka mà không phải RabbitMQ?** Kafka sinh ra để xử lý LUỒNG DỮ LIỆU KHỔNG LỒ (hàng triệu tin nhắn 1 giây). Nó lưu log tin nhắn ra ổ đĩa, lỡ `notification-service` chết, khi bật lại nó vẫn có thể đọc lại tin nhắn cũ từ Kafka. RabbitMQ gửi xong là xóa tin nhắn đi luôn.

### 10. Logging & Error Handling
- **👉 CÁCH DEMO:** Lên URL trình duyệt gõ bậy một cái đường dẫn không tồn tại (Ví dụ: `http://localhost:8900/api/catalog/san-pham-ma-de`). Màn hình thay vì văng lỗi trắng bóc 404 Tomcat xấu xí, sẽ hiện ra file JSON lỗi chuẩn mực.
- **File trong code:** `GlobalExceptionHandler.java` dùng annotation `@ControllerAdvice`.
- Bất cứ chỗ nào lỗi (Ví dụ: 404 Not Found, 400 Bad Request), nó sẽ tự động tóm lấy và đóng gói thành 1 file JSON đẹp mắt trả về cho Frontend, giúp Frontend không bị Crash màn hình trắng bóc.

### 11. Rate Limiting (Giới hạn truy cập)
- **👉 CÁCH DEMO:** Mở cái file HTML công cụ `test-rate-limit.html` mình đã làm cho bạn. Bấm nút "BẮN 30 REQUEST NGAY!". Chỉ cho thầy xem các request vượt quá giới hạn lập tức bị chặn (Mã lỗi 429).
- **File trong code:** `application.yml` và `RateLimiterConfig.java` ở `api-gateway`.
- **Giải thích:** Sử dụng thuật toán **Token Bucket** qua Redis. Mình cấp cho IP của người dùng 10 cái vé (token)/giây. Mỗi lần gọi API mất 1 vé. Hết vé thì ăn lỗi `429 Too Many Requests`. Chống Hacker DDoS.

### 12. Caching (Bộ nhớ đệm)
- **👉 CÁCH DEMO:** Mở trang chủ xem sản phẩm. Cứ đè nút F5 liên tục. Tốc độ load ảnh và sản phẩm sẽ xuất hiện TỨC THÌ (Zero delay). Đó là sức mạnh của Cache!
- **File trong code:** `RedisConfig.java` (đã sửa thành In-Memory Cache) ở `product-catalog-service`. Các hàm gắn `@Cacheable` và `@CacheEvict`.
- **Giải thích:** Khi 1000 người cùng vào xem 1 cái áo. Thay vì bắt PostgreSQL lục bảng 1000 lần, ta lục 1 lần đầu tiên rồi lưu thẳng lên RAM của Java. 999 người sau bốc từ RAM ra siêu nhanh!

### 13. Availability & Recovery (Circuit Breaker - Ngắt Mạch)
- **👉 CÁCH DEMO (TRÙM CUỐI):** Bạn tắt đột ngột cái `user-service` đi (để mô phỏng sập server). Sau đó vào web bấm Đặt hàng. Hệ thống không bị treo vòng vòng 30 giây rồi sập, mà lập tức văng ra thông báo lỗi **503 Service Unavailable** cực kỳ chuyên nghiệp.
- **File trong code:** Gắn `@CircuitBreaker(name = "userClient", fallbackMethod = "fallbackSaveOrder")` ở `OrderController.java`.
- **Tại sao phải dùng?** Lỡ `user-service` bị tắt. Thay vì `order-service` cố gọi, bị nghẽn mạng, treo 30 giây rồi chết chùm -> Mạch sẽ NGẮT NGAY LẬP TỨC. Nó lập tức chạy vào hàm dự phòng `fallbackSaveOrder` trả về lỗi lịch sự `503 Service Unavailable`, bảo vệ an toàn cho cả hệ thống.

### 14 & 15. Docker và Cloud
- **👉 CÁCH DEMO Docker:** Mở App Docker Desktop lên, cho thầy xem các container (Postgres, Kafka, Redis, Zookeeper) đang chạy xanh lè màu xanh lá cây.
- **👉 CÁCH DEMO Cloudinary:** Đăng nhập Admin, vào màn hình Quản lý Sản Phẩm (`AdminProductPage.jsx`). Bấm upload 1 tấm ảnh mới. Sau đó mở tấm ảnh đó sang Tab mới (Open image in new tab), chỉ cho thầy xem cái URL của ảnh đang nằm ở tận máy chủ Mỹ `https://res.cloudinary.com/...` chứ không hề nằm trong ổ cứng máy tính Của bạn.
- **Docker (`docker-compose.yml`):** Gom toàn bộ PostgreSQL, Kafka, Redis vào 1 file để chỉ cần 1 lệnh là chạy sạch bách, không cần cài cắm thủ công làm bẩn máy.
- **Cloudinary (`upload_to_cloudinary.py`):** Ảnh Admin đăng lên sẽ được phi thẳng lên Cloud của Mỹ (Cloudinary), thay vì nằm ở thư mục của máy tính cá nhân. Giúp web load ảnh nhanh do có CDN phân tán toàn cầu.
