import os
import cloudinary
import cloudinary.uploader

# ==========================================
# CẤU HÌNH CLOUDINARY (Lấy từ ảnh màn hình)
# ==========================================
cloudinary.config( 
  cloud_name = "dpetnxe5v", 
  api_key = "216652881776236", 
  api_secret = "9vo3Q34LBQtq7a90mrnwq68T8vc",
  secure = True
)

# ==========================================
# CẤU HÌNH THƯ MỤC CẦN QUÉT
# ==========================================
# Khai báo các thư mục trong dự án mà bạn muốn lấy ảnh. Ví dụ:
TARGET_DIRECTORIES = [
    r"d:\Web2_\e-commerce-microservices\frontend\src\assets",
    r"d:\Web2_\e-commerce-microservices\frontend\public"
]

# Thư mục gốc trên Cloudinary (nếu muốn gom tất cả vào 1 nơi)
CLOUDINARY_BASE_FOLDER = "web2"

# Các định dạng file ảnh hợp lệ
VALID_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'}

def upload_images():
    print("🚀 Bắt đầu quét và tải ảnh lên Cloudinary...")
    
    for directory in TARGET_DIRECTORIES:
        if not os.path.exists(directory):
            print(f"⚠️ Bỏ qua thư mục {directory} vì không tồn tại.")
            continue
            
        for root, dirs, files in os.walk(directory):
            # Bỏ qua các thư mục không cần thiết
            if "node_modules" in root or ".git" in root:
                continue
                
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in VALID_EXTENSIONS:
                    file_path = os.path.join(root, file)
                    
                    # Tạo đường dẫn thư mục trên Cloudinary dựa trên cấu trúc thư mục local
                    # Ví dụ: frontend\src\assets\images -> my_ecommerce_project/frontend/src/assets/images
                    relative_folder = os.path.relpath(root, r"d:\Web2_\e-commerce-microservices").replace("\\", "/")
                    cloudinary_folder = f"{CLOUDINARY_BASE_FOLDER}/{relative_folder}"
                    
                    print(f"⏳ Đang tải lên: {file_path} -> Thư mục: {cloudinary_folder}")
                    
                    try:
                        # Upload lên Cloudinary
                        response = cloudinary.uploader.upload(
                            file_path, 
                            folder=cloudinary_folder,
                            use_filename=True, # Giữ nguyên tên file
                            unique_filename=False # Không thêm ký tự ngẫu nhiên vào tên file
                        )
                        print(f"✅ Thành công! Link ảnh: {response['secure_url']}")
                    except Exception as e:
                        print(f"❌ Lỗi khi tải lên {file_path}: {e}")

if __name__ == "__main__":
    print("=======================================")
    print("    CÔNG CỤ UPLOAD ẢNH CLOUDINARY")
    print("=======================================")
    print("Lưu ý: Bạn cần cài đặt thư viện cloudinary trước khi chạy.")
    print("Lệnh cài đặt: pip install cloudinary")
    print("=======================================\n")
    
    upload_images()
    print("\n🎉 Hoàn thành quá trình tải lên!")
