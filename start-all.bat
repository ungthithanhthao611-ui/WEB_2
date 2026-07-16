@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-21"
echo Starting all e-commerce microservices...

echo Starting Eureka Server...
start "Eureka Server" cmd /k "cd eureka-server && set MAVEN_OPTS=-Xms32m -Xmx128m -Dfile.encoding=UTF-8 && mvnw.cmd spring-boot:run -Dspring-boot.run.fork=false"

echo Waiting 15 seconds for Eureka to initialize...
timeout /t 15

echo Starting API Gateway...
start "API Gateway" cmd /k "cd api-gateway && set MAVEN_OPTS=-Xms64m -Xmx192m -Dfile.encoding=UTF-8 && mvnw.cmd spring-boot:run -Dspring-boot.run.fork=false"

echo Waiting 5 seconds for API Gateway...
timeout /t 5

echo Starting Backend Services...
start "User Service" cmd /k "cd user-service && set MAVEN_OPTS=-Xms64m -Xmx256m -Dfile.encoding=UTF-8 && mvnw.cmd spring-boot:run -Dspring-boot.run.fork=false"
start "Product Catalog Service" cmd /k "cd product-catalog-service && set MAVEN_OPTS=-Xms64m -Xmx256m -Dfile.encoding=UTF-8 && mvnw.cmd spring-boot:run -Dspring-boot.run.fork=false"
start "Order Service" cmd /k "cd order-service && set MAVEN_OPTS=-Xms64m -Xmx256m -Dfile.encoding=UTF-8 && mvnw.cmd spring-boot:run -Dspring-boot.run.fork=false"
start "Payment Service" cmd /k "cd payment-service && set MAVEN_OPTS=-Xms64m -Xmx256m -Dfile.encoding=UTF-8 && mvnw.cmd spring-boot:run -Dspring-boot.run.fork=false"
start "Notification Service" cmd /k "cd notification-service && set MAVEN_OPTS=-Xms32m -Xmx128m -Dfile.encoding=UTF-8 && mvnw.cmd spring-boot:run -Dspring-boot.run.fork=false"
start "Product Recommendation Service" cmd /k "cd product-recommendation-service && set MAVEN_OPTS=-Xms32m -Xmx192m -Dfile.encoding=UTF-8 && mvnw.cmd spring-boot:run -Dspring-boot.run.fork=false"

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo All services are starting up! Close the individual windows to stop them.
