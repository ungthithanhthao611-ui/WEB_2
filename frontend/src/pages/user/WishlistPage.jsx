import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { getWishlist, removeFromWishlist } from "../../services/authService";
import { getProductById } from "../../services/productService";
import { showToast } from "../../services/shopConfigService";

function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadWishlist = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
      return;
    }
    
    try {
      const res = await getWishlist(userId);
      const productIds = res.data || [];
      
      const productPromises = productIds.map(id => getProductById(id).then(r => r.data).catch(() => null));
      const loadedProducts = (await Promise.all(productPromises)).filter(p => p !== null);
      
      setProducts(loadedProducts);
    } catch (error) {
      console.error("Lỗi lấy wishlist:", error);
      showToast("Không thể tải danh sách yêu thích", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId) => {
    const userId = sessionStorage.getItem("userId");
    try {
      await removeFromWishlist(userId, productId);
      setProducts(products.filter(p => p.id !== productId));
      showToast("Đã bỏ yêu thích");
    } catch (error) {
      showToast("Lỗi xóa sản phẩm", "error");
    }
  };

  return (
    <UserLayout>
      <div className="container mt-5 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0"><i className="fa-solid fa-heart text-danger me-2"></i>Sản Phẩm Yêu Thích</h2>
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>
        ) : products.length === 0 ? (
          <div className="alert alert-light text-center py-5 rounded-4 shadow-sm">
            <h5 className="mb-3">Danh sách yêu thích đang trống</h5>
            <p className="text-muted mb-4">Hãy thả tim những sản phẩm bạn yêu thích để xem lại sau nhé!</p>
            <Link to="/products" className="btn btn-danger px-4 py-2 rounded-pill fw-bold">Khám phá ngay</Link>
          </div>
        ) : (
          <div className="row g-4">
            {products.map(p => (
              <div className="col-12 col-md-6 col-lg-4" key={p.id}>
                <div className="card h-100 border-0 shadow-sm rounded-4 position-relative">
                  <button 
                    className="btn btn-light position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
                    style={{ width: "36px", height: "36px", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={(e) => { e.preventDefault(); handleRemove(p.id); }}
                  >
                    <i className="fa-solid fa-xmark text-secondary"></i>
                  </button>
                  <Link to={`/products/${p.id}`} className="text-decoration-none">
                    <img src={p.imageUrl || "https://images.unsplash.com/photo-1585366119957-e5733f399e7c?w=500"} className="card-img-top rounded-top-4" alt={p.name} style={{ height: "220px", objectFit: "cover" }} />
                  </Link>
                  <div className="card-body p-4 d-flex flex-column">
                    <h5 className="fw-bold text-dark mb-1">{p.name}</h5>
                    <p className="text-muted text-truncate mb-3" style={{ fontSize: "0.9rem" }}>{p.description}</p>
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <span className="text-danger fw-bold fs-5">{Number(p.price).toLocaleString("vi-VN")}đ</span>
                      <Link to={`/products/${p.id}`} className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold">Chi tiết</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}

export default WishlistPage;
