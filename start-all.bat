@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-21"
echo Starting all e-commerce microservices...

echo Starting Eureka Server...
start "Eureka Server" cmd /k "cd eureka-server && mvnw.cmd spring-boot:run"

echo Waiting 15 seconds for Eureka to initialize...
timeout /t 15

echo Starting API Gateway...
start "API Gateway" cmd /k "cd api-gateway && mvnw.cmd spring-boot:run"

echo Waiting 5 seconds for API Gateway...
timeout /t 5

echo Starting Backend Services...
start "User Service" cmd /k "cd user-service && mvnw.cmd spring-boot:run"
start "Product Catalog Service" cmd /k "cd product-catalog-service && mvnw.cmd spring-boot:run"
start "Order Service" cmd /k "cd order-service && mvnw.cmd spring-boot:run"
start "Payment Service" cmd /k "cd payment-service && mvnw.cmd spring-boot:run"
start "Notification Service" cmd /k "cd notification-service && mvnw.cmd spring-boot:run"
start "Product Recommendation Service" cmd /k "cd product-recommendation-service && mvnw.cmd spring-boot:run"

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo All services are starting up! Close the individual windows to stop them.
