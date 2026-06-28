package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.http.header.HeaderGenerator;
import com.rainbowforest.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.text.NumberFormat;
import java.util.Locale;
import com.rainbowforest.userservice.service.EmailService;

@RestController
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private HeaderGenerator headerGenerator;
    
    @Autowired
    private EmailService emailService;
    
    @GetMapping (value = "/users")
    public ResponseEntity<List<User>> getAllUsers(){
        List<User> users =  userService.getAllUsers();
        if(!users.isEmpty()) {
        	return new ResponseEntity<List<User>>(
        		users,
        		headerGenerator.getHeadersForSuccessGetMethod(),
        		HttpStatus.OK);
        }
        return new ResponseEntity<List<User>>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @GetMapping (value = "/users", params = "name")
    public ResponseEntity<User> getUserByName(@RequestParam("name") String userName){
    	User user = userService.getUserByName(userName);
    	if(user != null) {
    		return new ResponseEntity<User>(
    				user,
    				headerGenerator.
    				getHeadersForSuccessGetMethod(),
    				HttpStatus.OK);
    	}
        return new ResponseEntity<User>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @GetMapping (value = "/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") Long id){
        User user = userService.getUserById(id);
        if(user != null) {
    		return new ResponseEntity<User>(
    				user,
    				headerGenerator.
    				getHeadersForSuccessGetMethod(),
    				HttpStatus.OK);
    	}
        return new ResponseEntity<User>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @PostMapping (value = "/users")
    public ResponseEntity<User> addUser(@RequestBody User user, HttpServletRequest request){
    	if(user != null)
    		try {
    			userService.saveUser(user);
    			return new ResponseEntity<User>(
    					user,
    					headerGenerator.getHeadersForSuccessPostMethod(request, user.getId()),
    					HttpStatus.CREATED);
    		}catch (Exception e) {
    			e.printStackTrace();
    			return new ResponseEntity<User>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
    	return new ResponseEntity<User>(HttpStatus.BAD_REQUEST);
    }

    @DeleteMapping(value = "/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id) {
        User user = userService.getUserById(id);
        if (user != null) {
            try {
                userService.deleteUser(id);
                return new ResponseEntity<Void>(
                        headerGenerator.getHeadersForSuccessGetMethod(),
                        HttpStatus.OK);
            } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<Void>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return new ResponseEntity<Void>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/users/{id}/wishlist")
    public ResponseEntity<java.util.Set<Long>> getWishlist(@PathVariable("id") Long id) {
        User user = userService.getUserById(id);
        if (user != null) {
            return new ResponseEntity<>(user.getWishlist(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping(value = "/users/{id}/wishlist/{productId}")
    public ResponseEntity<java.util.Set<Long>> addToWishlist(@PathVariable("id") Long id, @PathVariable("productId") Long productId) {
        User user = userService.getUserById(id);
        if (user != null) {
            user.getWishlist().add(productId);
            try {
                userService.saveUser(user);
                return new ResponseEntity<>(user.getWishlist(), HttpStatus.OK);
            } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping(value = "/users/{id}/wishlist/{productId}")
    public ResponseEntity<java.util.Set<Long>> removeFromWishlist(@PathVariable("id") Long id, @PathVariable("productId") Long productId) {
        User user = userService.getUserById(id);
        if (user != null) {
            user.getWishlist().remove(productId);
            try {
                userService.saveUser(user);
                return new ResponseEntity<>(user.getWishlist(), HttpStatus.OK);
            } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/users/send-invoice")
    public ResponseEntity<Void> sendInvoice(@RequestBody Map<String, Object> event) {
        String email = value(event, "email");
        if (email == null || email.isBlank() || !email.contains("@")) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        try {
            String eventType = value(event, "eventType");
            String subject = "ORDER_CREATED".equals(eventType)
                    ? "Đặt hàng thành công - " + value(event, "orderCode")
                    : ("ITEM_ISSUE_REPORTED".equals(eventType) ? "Sự cố đơn hàng: Báo thiếu món - " + value(event, "orderCode") : "Cập nhật đơn hàng - " + value(event, "orderCode"));
            
            String htmlBody = buildHtmlBody(event);
            emailService.sendEmail(email, subject, htmlBody);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String buildHtmlBody(Map<String, Object> event) {
        NumberFormat nf = NumberFormat.getInstance(new Locale("vi", "VN"));
        String recipient = value(event, "recipientName");
        String orderCode = value(event, "orderCode");
        String status = value(event, "status");
        String total = formatMoney(event.get("total"), nf);
        String shipping = formatMoney(event.get("shippingFee"), nf);
        String discount = formatMoney(event.get("discount"), nf);

        StringBuilder html = new StringBuilder();
        html.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;'>");
        
        String eventType = value(event, "eventType");
        if ("ITEM_ISSUE_REPORTED".equals(eventType)) {
            html.append("<div style='background-color: #ff9800; padding: 20px; text-align: center; color: white;'>");
            html.append("<h2 style='margin: 0;'>Sự Cố Đơn Hàng</h2>");
            html.append("<p style='margin: 5px 0 0 0;'>Cửa hàng đã báo lỗi một món trong đơn hàng của bạn</p>");
            html.append("</div>");
            html.append("<div style='padding: 20px;'>");
            html.append("<p>Xin chào <strong>").append(recipient).append("</strong>,</p>");
            html.append("<p>Rất tiếc, cửa hàng đã báo lỗi một số món trong đơn hàng <strong>").append(orderCode).append("</strong> của bạn.</p>");
            html.append("<p style='background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107;'><strong>Vui lòng đăng nhập vào website và vào mục Lịch sử mua hàng để xác nhận tiếp tục mua các món còn lại hoặc hủy toàn bộ đơn.</strong></p>");
        } else {
            html.append("<div style='background-color: #e30613; padding: 20px; text-align: center; color: white;'>");
            html.append("<h2 style='margin: 0;'>Xác Nhận Đơn Hàng</h2>");
            html.append("<p style='margin: 5px 0 0 0;'>Cảm ơn bạn đã mua sắm tại Highlands Coffee</p>");
            html.append("</div>");
            html.append("<div style='padding: 20px;'>");
            html.append("<p>Xin chào <strong>").append(recipient).append("</strong>,</p>");
            html.append("<p>Đơn hàng <strong>").append(orderCode).append("</strong> của bạn hiện đang ở trạng thái: <span style='color: #e30613; font-weight: bold;'>").append(status).append("</span>.</p>");
        }
        
        html.append("<h3 style='border-bottom: 2px solid #eee; padding-bottom: 10px;'>Chi tiết đơn hàng</h3>");
        html.append("<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>");
        html.append("<thead><tr style='background-color: #f9f9f9; text-align: left;'>");
        html.append("<th style='padding: 10px; border: 1px solid #ddd;'>Sản phẩm</th>");
        html.append("<th style='padding: 10px; border: 1px solid #ddd; text-align: center;'>SL</th>");
        html.append("<th style='padding: 10px; border: 1px solid #ddd; text-align: right;'>Đơn giá</th>");
        html.append("<th style='padding: 10px; border: 1px solid #ddd; text-align: right;'>Thành tiền</th>");
        html.append("</tr></thead><tbody>");

        if (event.get("items") instanceof List) {
            List<Map<String, Object>> items = (List<Map<String, Object>>) event.get("items");
            for (Map<String, Object> item : items) {
                String name = value(item, "productName") + (item.get("size") != null ? " (" + item.get("size") + ")" : "");
                String qty = value(item, "quantity");
                String price = formatMoney(item.get("unitPrice"), nf);
                String sub = formatMoney(item.get("subTotal"), nf);
                
                html.append("<tr>");
                html.append("<td style='padding: 10px; border: 1px solid #ddd;'>").append(name).append("</td>");
                html.append("<td style='padding: 10px; border: 1px solid #ddd; text-align: center;'>").append(qty).append("</td>");
                html.append("<td style='padding: 10px; border: 1px solid #ddd; text-align: right;'>").append(price).append(" đ</td>");
                html.append("<td style='padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;'>").append(sub).append(" đ</td>");
                html.append("</tr>");
            }
        }

        html.append("</tbody></table>");
        
        html.append("<table style='width: 100%; border-collapse: collapse;'>");
        html.append("<tr><td style='padding: 5px 0; text-align: right;'>Phí vận chuyển:</td><td style='padding: 5px 0; text-align: right; width: 120px;'>").append(shipping).append(" đ</td></tr>");
        html.append("<tr><td style='padding: 5px 0; text-align: right;'>Giảm giá:</td><td style='padding: 5px 0; text-align: right; color: #28a745;'>-").append(discount).append(" đ</td></tr>");
        html.append("<tr><td style='padding: 10px 0; text-align: right; font-weight: bold; font-size: 1.1em; border-top: 1px solid #ddd;'>Tổng thanh toán:</td><td style='padding: 10px 0; text-align: right; font-weight: bold; font-size: 1.2em; color: #e30613; border-top: 1px solid #ddd;'>").append(total).append(" đ</td></tr>");
        html.append("</table>");
        
        html.append("<p style='margin-top: 30px; font-size: 0.9em; color: #666;'>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ bộ phận hỗ trợ khách hàng của chúng tôi.</p>");
        html.append("</div></div>");
        
        return html.toString();
    }

    private String formatMoney(Object amount, NumberFormat nf) {
        if (amount == null) return "0";
        try {
            return nf.format(Double.parseDouble(amount.toString()));
        } catch (Exception e) {
            return "0";
        }
    }

    private String value(Map<String, Object> map, String key) {
        return map.get(key) == null ? "" : String.valueOf(map.get(key));
    }
}
