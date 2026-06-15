import { useEffect, useState } from "react";
import { getCategories, getProducts } from "../../services/productService";
import { addToCart } from "../../services/cartService";
import { Link, useSearchParams } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { notifyCartChanged, showToast } from "../../services/shopConfigService";
import { fetchBanners } from "../../services/commerceService";

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageBanner, setPageBanner] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get("category");
  const saleOnly = searchParams.get("sale") === "true";
  const priceRange = searchParams.get("price") || "all";

  const priceRanges = [
    { value: "all", label: "Tất cả mức giá" },
    { value: "under-30000", label: "Dưới 30.000 VNĐ", min: 0, max: 30000 },
    { value: "30000-50000", label: "30.000 - 50.000 VNĐ", min: 30000, max: 50000 },
    { value: "50000-70000", label: "50.000 - 70.000 VNĐ", min: 50000, max: 70000 },
    { value: "over-70000", label: "Trên 70.000 VNĐ", min: 70000, max: Infinity },
  ];

  const updateFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value || value === "all") nextParams.delete(key);
    else nextParams.set(key, value);
    setSearchParams(nextParams);
  };

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      const data = res.data || [];
      const selectedRange = priceRanges.find((range) => range.value === priceRange);
      setProducts(data.filter((product) => {
        const matchesCategory = !categoryId
          || String(product.categoryId || product.category) === categoryId;
        const matchesSale = !saleOnly
          || (Number(product.originalPrice) > Number(product.price));
        const price = Number(product.price);
        const matchesPrice = !selectedRange?.min && selectedRange?.min !== 0
          ? true
          : price >= selectedRange.min && price <= selectedRange.max;
        return matchesCategory && matchesSale && matchesPrice;
      }));
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      showToast("Vui lòng đăng nhập trước khi mua hàng!", "error");
      return;
    }

    try {
      await addToCart(productId, 1);
      notifyCartChanged();
      showToast("Đã thêm sản phẩm vào giỏ hàng");
    } catch (error) {
      showToast("Thêm vào giỏ hàng thất bại!", "error");
      console.error(error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [categoryId, saleOnly, priceRange]);

  useEffect(() => {
    getCategories()
      .then((response) => setCategories(response.data || []))
      .catch((error) => console.error("Lỗi lấy danh mục:", error));

    fetchBanners()
      .then(({ data }) => setPageBanner(
        data.find((banner) => banner.position === "PRODUCT_PAGE")
          || data.find((banner) => banner.position === "CONTENT")
          || null
      ))
      .catch((error) => console.error("Lỗi lấy banner trang sản phẩm:", error));
  }, []);

  return (
    <UserLayout>
      <div className="full-width-page-banner">
        <img
          src={pageBanner?.imageUrl || "https://www.highlandscoffee.com.vn/vnt_upload/weblink/2025/HCO_7825_SUMMERDI_DC_BANNER_1920x926.jpg"}
          alt={pageBanner?.title || "Banner trang sản phẩm"}
        />
      </div>

      <div className="container mt-5">
        <div className="row g-4 align-items-start">
          <aside className="col-12 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 sticky-lg-top" style={{ top: "210px" }}>
              <h5 className="fw-bold border-bottom pb-3 mb-3">DANH MỤC</h5>
              <button className={`btn text-start mb-1 ${!categoryId && !saleOnly ? "btn-danger" : "btn-light"}`} onClick={() => setSearchParams({})}>Tất cả sản phẩm</button>
              {categories.map((category) => (
                <button
                  className={`btn text-start mb-1 ${categoryId === String(category.id) ? "btn-danger" : "btn-light"}`}
                  key={category.id}
                  onClick={() => setSearchParams({ category: String(category.id) })}
                >
                  {category.name}
                </button>
              ))}
              <button className={`btn text-start mb-3 ${saleOnly ? "btn-danger" : "btn-light"}`} onClick={() => setSearchParams({ sale: "true" })}>
                <i className="fa-solid fa-tags me-2"></i>Sản phẩm Sale
              </button>

              <h5 className="fw-bold border-bottom pb-3 mb-3">LỌC THEO GIÁ</h5>
              {priceRanges.map((range) => (
                <label className="d-flex align-items-center gap-2 py-2" key={range.value}>
                  <input
                    className="form-check-input mt-0"
                    type="radio"
                    name="priceRange"
                    checked={priceRange === range.value}
                    onChange={() => updateFilter("price", range.value)}
                  />
                  <span>{range.label}</span>
                </label>
              ))}
            </div>
          </aside>

          <section className="col-12 col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-extrabold text-dark mb-0">{saleOnly ? "SẢN PHẨM KHUYẾN MÃI" : "SẢN PHẨM"} ({products.length})</h3>
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
                <div className="col-12 col-sm-6 col-xl-4" key={p.id}>
                  <div className="card h-100 product-card position-relative p-2 border-0 shadow-sm rounded-4">
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
          </section>
        </div>
      </div>
    </UserLayout>
  );
}

export default ProductListPage;
