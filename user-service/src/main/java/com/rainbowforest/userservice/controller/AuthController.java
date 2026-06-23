package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.security.JwtTokenProvider;
import com.rainbowforest.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.time.LocalDateTime;

import com.rainbowforest.userservice.service.EmailService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = userService.getUserByName(loginRequest.getUsername());
        if (user == null) {
            user = userService.getUserByEmail(loginRequest.getUsername());
        }
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tài khoản hoặc email không chính xác");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getUserPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mật khẩu không chính xác");
        }

        String role = user.getRole() != null ? user.getRole().getRoleName() : "ROLE_USER";
        String token = jwtTokenProvider.generateToken(user.getUserName(), role);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("username", user.getUserName());
        response.put("role", role);
        response.put("userId", user.getId());

        return ResponseEntity.ok(response);
    }

    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("Email không được để trống");
        }

        User user = userService.getUserByEmail(email);
        if (user == null) {
            return ResponseEntity.badRequest().body("Không tìm thấy tài khoản với email này");
        }

        // Generate 6 digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setResetOtp(otp);
        user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(2)); // OTP valid for 2 minutes
        userService.updateUser(user);

        // Send Email
        String subject = "Mã OTP khôi phục mật khẩu từ Highlands Coffee";
        String userName = user.getUserName();
        if (user.getUserDetails() != null) {
            String firstName = user.getUserDetails().getFirstName() != null ? user.getUserDetails().getFirstName() : "";
            String lastName = user.getUserDetails().getLastName() != null ? user.getUserDetails().getLastName() : "";
            if (lastName.equals("Huynh") && firstName.equals("Phụ")) {
                // Fallback for old default test data
                userName = user.getUserName();
            } else {
                userName = (firstName + " " + lastName).trim();
                // If it's something like "Tí Huynh" from old data, we try to clean it if it was obviously an error, but let's just trim it.
                if (lastName.equals("Huynh") && !firstName.isEmpty()) {
                    userName = firstName;
                }
            }
        }
        if (userName == null || userName.isEmpty()) {
            userName = "Quý khách";
        }
        
        String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;\">"
                + "<div style=\"text-align: center; margin-bottom: 20px;\">"
                + "<h2 style=\"color: #b22830; margin: 0; font-size: 24px;\">HIGHLANDS COFFEE</h2>"
                + "<p style=\"color: #666; margin-top: 5px; font-size: 14px;\">Khôi phục mật khẩu tài khoản của bạn</p>"
                + "<hr style=\"border: none; border-top: 2px solid #b22830; width: 100%; margin: 15px auto;\">"
                + "</div>"
                + "<div style=\"color: #333; line-height: 1.6;\">"
                + "<p>Kính chào <strong>" + userName + "</strong>,</p>"
                + "<p>Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu của bạn. Dưới đây là mã xác thực OTP của bạn:</p>"
                + "<div style=\"text-align: center; margin: 30px 0;\">"
                + "<span style=\"display: inline-block; padding: 15px 40px; font-size: 28px; font-weight: bold; color: #b22830; border: 2px dashed #b22830; border-radius: 8px; letter-spacing: 5px;\">"
                + otp
                + "</span>"
                + "</div>"
                + "<p style=\"text-align: center; color: #666; font-size: 13px;\">Mã xác thực này có hiệu lực trong vòng 2 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>"
                + "</div>"
                + "<div style=\"margin-top: 40px; text-align: center; font-size: 12px; color: #999;\">"
                + "<p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>"
                + "<p>&copy; Highlands Coffee. All rights reserved.</p>"
                + "</div>"
                + "</div>";
        
        try {
            emailService.sendEmail(email, subject, htmlContent);
            return ResponseEntity.ok("Mã OTP đã được gửi đến email của bạn");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi gửi email: " + e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (email == null || otp == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Vui lòng cung cấp đủ thông tin");
        }

        User user = userService.getUserByEmail(email);
        if (user == null) {
            return ResponseEntity.badRequest().body("Không tìm thấy tài khoản với email này");
        }

        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp)) {
            return ResponseEntity.badRequest().body("Mã OTP không chính xác");
        }

        if (user.getResetOtpExpiry() == null || user.getResetOtpExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Mã OTP đã hết hạn");
        }

        // Reset password
        user.setUserPassword(passwordEncoder.encode(newPassword));
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);
        userService.updateUser(user);

        return ResponseEntity.ok("Mật khẩu đã được cập nhật thành công");
    }
}
