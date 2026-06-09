import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../../services/productService";
import { addToCart } from "../../services/cartService";
import UserLayout from "../../layouts/UserLayout";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const loadProduct = async () => {
    try {
      const res = await getProductById(id);
      setProduct(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      alert("Vui lòng đăng nhập trước!");
      navigate("/login");
      return;
    }

    try {
      await addToCart(product.id, quantity);
      alert("Đã thêm sản phẩm đồ chơi vào giỏ hàng thành công!");
    } catch (error) {
      console.error(error);
      alert("Thêm vào giỏ hàng thất bại!");
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const hasDiscount = product && product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <UserLayout>
      <div className="container mt-4">
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : !product ? (
          <div className="alert alert-danger text-center">Sản phẩm đồ chơi không tồn tại!</div>
        ) : (
          <div className="card shadow-sm border-0 rounded-5 overflow-hidden p-4 bg-white">
            <div className="row g-4">
              <div className="col-md-6">
                <div className="bg-light rounded-4 overflow-hidden position-relative p-2" style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {hasDiscount && (
                    <span className="toy-badge-discount" style={{ top: "25px", left: "25px" }}>-{discountPercentage}% OFF</span>
                  )}
                  <img
                    src={product.imageUrl || "https://images.unsplash.com/photo-1585366119957-e5733f399e7c?w=500"}
                    alt={product.name}
                    className="w-100 h-100"
                    style={{ objectFit: "cover", borderRadius: "20px" }}
                  />
                </div>
              </div>
              <div className="col-md-6 d-flex flex-column justify-content-between py-2">
                <div>
                  <span className="badge bg-danger mb-2 px-3 py-2 rounded-pill fw-bold" style={{ fontSize: "0.85rem" }}>LEGO & ĐỒ CHƠI CAO CẤP</span>
                  <h1 className="fw-extrabold text-dark mb-2" style={{ fontSize: "2rem" }}>{product.name}</h1>
                  <p className="text-muted mb-4 fs-6" style={{ lineHeight: "1.6" }}>{product.description}</p>
                  
                  <div className="card bg-light border-0 rounded-4 p-3 mb-4">
                    <span className="text-muted" style={{ fontSize: "0.9rem" }}>{hasDiscount ? "Giá khuyến mãi:" : "Giá bán:"}</span>
                    <h3 className="text-danger fw-extrabold mb-1">{product.price.toLocaleString("vi-VN")} VNĐ</h3>
                    {hasDiscount && (
                      <span className="text-muted text-decoration-line-through" style={{ fontSize: "0.85rem" }}>
                        {product.originalPrice.toLocaleString("vi-VN")} VNĐ
                      </span>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-4">
                    <span className="fw-bold text-dark">Số lượng mua:</span>
                    <div className="d-flex align-items-center border rounded-pill bg-white px-2 py-1" style={{ width: "130px" }}>
                      <button className="btn btn-link text-danger fw-bold border-0 p-0 fs-5 mx-2" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                      <input
                        type="number"
                        className="form-control text-center border-0 p-0 fw-bold fs-5 text-dark"
                        value={quantity}
                        min="1"
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        style={{ boxShadow: "none" }}
                      />
                      <button className="btn btn-link text-danger fw-bold border-0 p-0 fs-5 mx-2" onClick={() => setQuantity(q => q + 1)}>+</button>
                    </div>
                  </div>
                </div>
                <div>
                  <button className="btn btn-toy-primary btn-lg w-100 py-3 rounded-pill fw-bold" onClick={handleAddToCart}>
                    <i className="fa-solid fa-cart-plus me-2"></i> THÊM VÀO GIỎ HÀNG
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}

export default ProductDetailPage;
