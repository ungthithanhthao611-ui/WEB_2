import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, getProductVariants } from "../../services/productService";
import { addToCart } from "../../services/cartService";
import { getRecommendationsByProduct, saveRecommendation } from "../../services/recommendationService";
import UserLayout from "../../layouts/UserLayout";
import { notifyCartChanged, setCartItemMeta, showToast } from "../../services/shopConfigService";
import { getWishlist, addToWishlist, removeFromWishlist } from "../../services/authService";
import "./ProductDetailPage.css";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [wishlist, setWishlist] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);

  const loadProduct = async () => {
    try {
      const res = await getProductById(id);
      setProduct(res.data);
      const variants = (await getProductVariants(res.data.id)).data || [];
      setSizes(variants);
      setSelectedSize(variants.find(item => Number(item.stock) > 0) || variants[0] || null);

      // Load reviews
      try {
        const reviewsRes = await getRecommendationsByProduct(res.data.name);
        setReviews(reviewsRes.data || []);
      } catch (err) {
        console.error("Không tải được đánh giá", err);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      showToast("Vui lòng đăng nhập trước!", "error");
      navigate("/login");
      return;
    }

    try {
      const stock = Number(selectedSize?.stock ?? product.quantity ?? product.availability ?? 0);
      if (stock <= 0) return showToast("Sản phẩm đã hết hàng", "error");
      if (quantity > stock) return showToast(`Chỉ còn ${stock} sản phẩm`, "error");
      await addToCart(product.id, quantity, stock);
      setCartItemMeta(product.id, { size: selectedSize?.name || "Tiêu chuẩn", sku: selectedSize?.sku || "", price: currentPrice, stock });
      notifyCartChanged();
      showToast(`Đã thêm ${product.name} - size ${selectedSize?.name || "tiêu chuẩn"} vào giỏ`);
    } catch (error) {
      console.error(error);
      showToast("Thêm vào giỏ hàng thất bại!", "error");
    }
  };

  const loadWishlist = async () => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      try {
        const res = await getWishlist(userId);
        setWishlist(new Set(res.data));
      } catch (error) {
        console.error("Lỗi lấy wishlist:", error);
      }
    }
  };

  const handleToggleWishlist = async (productId) => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      showToast("Vui lòng đăng nhập để lưu sản phẩm yêu thích!", "error");
      return;
    }
    try {
      if (wishlist.has(productId)) {
        await removeFromWishlist(userId, productId);
        setWishlist(prev => { const next = new Set(prev); next.delete(productId); return next; });
        showToast("Đã bỏ yêu thích");
      } else {
        await addToWishlist(userId, productId);
        setWishlist(prev => { const next = new Set(prev); next.add(productId); return next; });
        showToast("Đã thêm vào yêu thích");
      }
    } catch (error) {
      showToast("Lỗi cập nhật yêu thích", "error");
    }
  };

  useEffect(() => {
    loadProduct();
    loadWishlist();
  }, [id]);

  const hasDiscount = product && product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const selectedRegularPrice = Number(selectedSize?.price || product?.originalPrice || product?.price || 0);
  const inheritedSale = hasDiscount && selectedRegularPrice === Number(product.originalPrice) ? Number(product.price) : null;
  const selectedSalePrice = selectedSize?.salePrice && Number(selectedSize.salePrice) < selectedRegularPrice ? Number(selectedSize.salePrice) : inheritedSale;
  const currentPrice = selectedSalePrice || selectedRegularPrice;
  const maxStock = Number(selectedSize?.stock ?? product?.quantity ?? product?.availability ?? 0);

  return (
    <UserLayout>
      <div className="container mt-4">
        <button className="product-back-button" onClick={() => navigate("/products")}><i className="fa-solid fa-arrow-left"></i> Quay lại thực đơn</button>
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : !product ? (
          <div className="alert alert-danger text-center">Sản phẩm đồ chơi không tồn tại!</div>
        ) : (
          <div className="product-detail-shell">
            <div className="row g-0">
              <div className="col-lg-6">
                <div className="product-gallery position-relative">
                  {hasDiscount && (
                    <span className="product-discount">-{discountPercentage}%</span>
                  )}
                  <button
                    className="btn btn-light position-absolute top-0 end-0 m-3 rounded-circle shadow-sm"
                    style={{ width: "42px", height: "42px", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={(e) => { e.preventDefault(); handleToggleWishlist(product.id); }}
                  >
                    <i className={`fa-heart fs-5 ${wishlist.has(product.id) ? "fa-solid text-danger" : "fa-regular text-secondary"}`}></i>
                  </button>
                  <img
                    src={product.imageUrl || "https://images.unsplash.com/photo-1585366119957-e5733f399e7c?w=500"}
                    alt={product.name}
                    className="product-main-image"
                  />
                  <div className="gallery-note"><i className="fa-solid fa-leaf"></i> Pha chế tươi mới mỗi ngày</div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="product-detail-content">
                  <span className="product-eyebrow">HIGHLANDS SIGNATURE</span>
                  <h1>{product.name}</h1>
                  <div className="product-rating"><span>★★★★★</span><small>Hương vị được yêu thích</small></div>
                  <p className="product-description">{product.description}</p>
                  
                  <div className="product-price-box">
                    <span>{selectedSalePrice ? "Giá ưu đãi" : "Giá sản phẩm"}</span>
                    <strong>{currentPrice.toLocaleString("vi-VN")}đ</strong>
                    {selectedSalePrice && (
                      <del>{selectedRegularPrice.toLocaleString("vi-VN")}đ</del>
                    )}
                  </div>

                  {sizes.length > 0 && <div className="product-option"><div className="option-heading"><b>Chọn kích cỡ</b><small>Giá thay đổi theo size</small></div><div className="size-options">{sizes.map((size)=>{const regular=Number(size.price);const inherited=hasDiscount&&regular===Number(product.originalPrice)?Number(product.price):null;const sale=size.salePrice&&Number(size.salePrice)<regular?Number(size.salePrice):inherited;const outOfStock=Number(size.stock)<=0;return <button key={size.name} disabled={outOfStock} className={`${selectedSize?.name===size.name?"active":""} ${outOfStock?"out-of-stock":""}`} onClick={()=>{setSelectedSize(size);setQuantity(1)}}><b>{size.name}</b><span>{Number(sale||regular).toLocaleString("vi-VN")}đ</span>{sale&&<del>{regular.toLocaleString("vi-VN")}đ</del>}{outOfStock&&<small>Hết hàng</small>}</button>})}</div></div>}

                  <div className="quantity-row">
                    <div><b>Số lượng</b><small>Tối đa theo tồn kho</small></div>
                    <div className="quantity-control">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                      <input
                        type="number"
                        className="quantity-input"
                        value={quantity}
                        min="1"
                        max={maxStock}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(maxStock, Number(e.target.value) || 1)))}
                      />
                      <button disabled={quantity >= maxStock} onClick={() => setQuantity(q => Math.min(maxStock, q + 1))}>+</button>
                    </div>
                  </div>
                  <button className="premium-cart-button" disabled={maxStock <= 0} onClick={handleAddToCart}>
                    <i className="fa-solid fa-bag-shopping"></i><span>Thêm vào giỏ hàng<small>Tổng {Number(currentPrice * quantity).toLocaleString("vi-VN")}đ</small></span><i className="fa-solid fa-arrow-right"></i>
                  </button>
                  <div className="product-benefits"><span><i className="fa-solid fa-bolt"></i> Giao nhanh 30 phút</span><span><i className="fa-solid fa-store"></i> Pha tại cửa hàng gần bạn</span><span><i className="fa-solid fa-shield-heart"></i> Nguyên liệu tuyển chọn</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {product && (
          <div className="product-reviews-section mt-5 pt-4 border-top">
            <h3 className="fw-bold mb-4">Đánh giá & Bình luận</h3>
            <div className="row justify-content-center">
              <div className="col-lg-10">
                {reviews.length === 0 ? (
                  <p className="text-muted text-center py-4">Chưa có đánh giá nào cho sản phẩm này.</p>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="review-card p-4 mb-3 border rounded-4 shadow-sm bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong className="text-danger fs-5">{rev.user?.userName || "Người dùng ẩn danh"}</strong>
                          <span className="text-muted small">
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("vi-VN") : ""}
                          </span>
                        </div>
                        <div className="text-warning mb-3 fs-5">
                          {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                        </div>
                        <p className="mb-3 fs-6">{rev.comment}</p>
                        {rev.imageUrl && (
                          <img src={rev.imageUrl} alt="Review attachment" className="img-thumbnail rounded-3" style={{ maxHeight: "200px" }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}

export default ProductDetailPage;

