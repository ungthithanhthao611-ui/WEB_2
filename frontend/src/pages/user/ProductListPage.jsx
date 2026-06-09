import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService";
import { addToCart } from "../../services/cartService";
import { Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      alert("Vui lòng đăng nhập trước khi mua hàng!");
      return;
    }

    try {
      await addToCart(productId, 1);
      alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
    } catch (error) {
      alert("Thêm vào giỏ hàng thất bại!");
      console.error(error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <UserLayout>
      <div className="container mt-4">
        {/* Banner header của trang danh mục đồ chơi */}
        <div className="bg-danger text-white p-4 rounded-4 mb-4 text-center position-relative overflow-hidden" style={{ minHeight: "150px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <div className="position-absolute w-100 h-100 start-0 top-0 bg-warning opacity-10" style={{ pointerEvents: "none" }}></div>
          <h2 className="fw-extrabold text-white position-relative z-1 mb-1">VƯƠNG QUỐC ĐỒ CHƠI CHÍNH HÃNG</h2>
          <p className="lead fs-6 mb-0 text-white-50 position-relative z-1">Thế giới đồ chơi LEGO, Búp bê, Xe mô hình chất lượng cao cho bé</p>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-extrabold text-dark">TẤT CẢ SẢN PHẨM ({products.length})</h3>
        </div>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="alert alert-info text-center rounded-4 py-5">
            <h4>Chưa có sản phẩm nào!</h4>
            <p className="text-muted">Vui lòng đăng nhập tài khoản ADMIN để thêm sản phẩm mới.</p>
          </div>
        ) : (
          <div className="row g-4">
            {products.map((p) => {
              const hasDiscount = p.originalPrice && p.originalPrice > p.price;
              const discountPercentage = hasDiscount ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
              return (
                <div className="col-12 col-md-3" key={p.id}>
                  <div className="card h-100 toy-card position-relative p-2">
                    {hasDiscount && (
                      <span className="toy-badge-discount">-{discountPercentage}%</span>
                    )}
                    
                    <div className="position-relative bg-light rounded-4 overflow-hidden" style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img
                        src={p.imageUrl || "https://images.unsplash.com/photo-1585366119957-e5733f399e7c?w=500"}
                        className="card-img-top w-100 h-100"
                        alt={p.name}
                        style={{ objectFit: "cover" }}
                      />
                    </div>

                    <div className="card-body d-flex flex-column p-3">
                      <h5 className="card-title fw-bold text-dark text-truncate mb-1">{p.name}</h5>
                      <p className="card-text text-muted text-truncate mb-2" style={{ fontSize: "0.85rem" }}>{p.description}</p>
                      
                      <div className="mb-3" style={{ minHeight: "48px" }}>
                        <span className="text-danger fw-extrabold fs-5">
                          {p.price.toLocaleString("vi-VN")} VNĐ
                        </span>
                        {hasDiscount && (
                          <>
                            <br />
                            <span className="text-muted text-decoration-line-through me-2" style={{ fontSize: "0.85rem" }}>
                              {p.originalPrice.toLocaleString("vi-VN")} VNĐ
                            </span>
                          </>
                        )}
                      </div>

                      <div className="mt-auto d-flex gap-2">
                        <Link to={`/products/${p.id}`} className="btn btn-outline-danger btn-sm rounded-pill fw-bold flex-grow-1" style={{ borderWidth: "2px" }}>
                          Chi tiết
                        </Link>
                        <button
                          className="btn btn-danger btn-sm rounded-pill px-3"
                          onClick={() => handleAddToCart(p.id)}
                        >
                          <i className="fa-solid fa-cart-shopping"></i> Mua
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </UserLayout>
  );
}

export default ProductListPage;
