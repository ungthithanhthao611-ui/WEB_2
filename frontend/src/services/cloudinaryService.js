export const uploadImageToCloudinary = async (file) => {
  const CLOUD_NAME = "dpetnxe5v";
  const API_KEY = "216652881776236";
  const API_SECRET = "9vo3Q34LBQtq7a90mrnwq68T8vc";
  const FOLDER = "web2";

  // Tạo timestamp
  const timestamp = Math.round((new Date()).getTime() / 1000);

  // Tạo signature thủ công bằng Web Crypto API (SHA-1)
  const msg = `folder=${FOLDER}&timestamp=${timestamp}${API_SECRET}`;
  const msgBuffer = new TextEncoder().encode(msg);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  // Chuẩn bị form data
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", API_KEY);
  formData.append("timestamp", timestamp);
  formData.append("folder", FOLDER);
  formData.append("signature", signature);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Cloudinary error details:", errorData);
      let errorMessage = "Lỗi upload ảnh lên Cloudinary";
      try {
        const parsed = JSON.parse(errorData);
        if (parsed.error && parsed.error.message) {
          errorMessage += ": " + parsed.error.message;
        }
      } catch (e) {
        errorMessage += ": " + errorData;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.secure_url; // Trả về đường dẫn ảnh
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
