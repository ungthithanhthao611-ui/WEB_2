import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories, getProducts } from "../../services/productService";
import { addToCart } from "../../services/cartService";
import Navbar from "../../components/Navbar";
import { notifyCartChanged, showToast } from "../../services/shopConfigService";
import { fetchBanners } from "../../services/commerceService";
import "./HomePage.css"; 

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  // For slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const defaultSlides = [
    "https://www.highlandscoffee.com.vn/vnt_upload/weblink/2025/HCO_7825_SUMMERDI_DC_BANNER_1920x926.jpg",
    "https://www.highlandscoffee.com.vn/vnt_upload/weblink/HCO_7801_MISMATCHES_DISCOUNT_FA_MWB_1920x926_1.png",
    "https://www.highlandscoffee.com.vn/vnt_upload/weblink/HCO_7820_MATCHA_LAUNCH_DC_MWB_1920X926.jpg"
  ];
  const slides = heroBanners.length ? heroBanners : defaultSlides.map((imageUrl,index)=>({id:`default-${index}`,imageUrl,link:"/products"}));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const loadProducts = async () => {
    try {
      const [res, categoryRes] = await Promise.all([getProducts(), getCategories()]);
      setProducts(res.data.slice(0, 4)); // Lấy 4 sản phẩm
      setCategories(categoryRes.data || []);
    } catch (error) {
      console.error("Lỗi lấy sản phẩm nổi bật:", error);
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
    fetchBanners().then(({data}) => {
      setHeroBanners(data.filter(item => item.position === "HERO"));
      setCampaigns(data.filter(item => item.position !== "HERO"));
    }).catch(console.error);
  }, []);

  return (
    <div className="highlands-home">
      <Navbar />

      <main>
          {/* Hero Slider */}
          <section className="hero-slider">
              <div className="slider-container">
                  {slides.map((slide, index) => (
                    <Link
                      to={slide.link || "/products"}
                      key={slide.id || index}
                      className={`slide ${index === currentSlide ? 'active' : ''}`} 
                      style={{ backgroundImage: `url('${slide.imageUrl}')` }}
                      aria-label={slide.title || `Banner ${index + 1}`}
                    ></Link>
                  ))}
              </div>
              <div className="slider-nav">
                  <button className="prev-slide" onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}>
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button className="next-slide" onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}>
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
              </div>
              <div className="slider-dots">
                  {slides.map((_, index) => (
                    <div 
                      key={index}
                      className={`dot ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                    ></div>
                  ))}
              </div>
          </section>

          {/* App Banner */}
          <section className="section app-banner-section">
              <div className="container">
                  <div className="card-horizontal">
                      <div className="card-image">
                          <img src="https://www.highlandscoffee.com.vn/vnt_upload/home/Website_bannerr.png" alt="App Thành Viên HighlandsĐI" />
                      </div>
                      <div className="card-content">
                          <h2>App Thành Viên <span>HighlandsĐI</span></h2>
                          <p>Đặt trước - Lấy ngay, không cần đợi</p>
                          <a href="#" className="btn btn-primary">TẢI APP NGAY</a>
                      </div>
                  </div>
              </div>
          </section>

          <section className="section campaign-section">
              <div className="container">
                  <div className="campaign-heading"><div><span className="section-kicker">HIGHLANDS STORIES</span><h2>Mùa Hè Đậm Vị, Trọn Từng Khoảnh Khắc</h2><p>Khám phá ưu đãi giới hạn, món mới theo mùa và những trải nghiệm được tuyển chọn riêng cho bạn.</p></div><Link to="/vouchers">Xem tất cả ưu đãi <i className="fa-solid fa-arrow-right"></i></Link></div>
                  <div className="campaign-grid">{campaigns.slice(0,3).map((campaign,index)=><Link to={campaign.link||"/products"} className={`campaign-card ${(campaign.featured||index===0)?"campaign-large":""}`} key={campaign.id}><img src={campaign.imageUrl} alt={campaign.title}/><div className="campaign-content"><span>{campaign.label}</span><h3>{campaign.title}</h3><p>{campaign.description}</p>{index===0&&<b>Khám phá ngay <i className="fa-solid fa-arrow-right"></i></b>}</div></Link>)}</div>
              </div>
          </section>

          {/* Products Highlight (Dynamic) */}
          <section className="section products-section">
              <div className="container">
                  <span className="section-kicker d-block text-center">MENU COLLECTION</span><h2 className="section-title">Khám Phá Thực Đơn</h2>
                  {loading ? (
                    <div style={{textAlign: 'center', padding: '50px 0'}}>Đang tải sản phẩm...</div>
                  ) : (
                    <div className="grid-2">
                        {categories.length > 0 ? categories.map(category => (
                          <Link to={`/products?category=${category.id}`} className="card product-card category-showcase" key={category.id}>
                              <div className="card-image-wrap">
                                  <img src={category.imageUrl || "https://www.highlandscoffee.com.vn/vnt_upload/home/web_banner_2000x2000.jpg"} alt={category.name} />
                              </div>
                              <div className="card-overlay"><span>KHÁM PHÁ</span><h3>{category.name}</h3><p>{category.description || "Thưởng thức hương vị Highlands theo cách của bạn"}</p><b>Xem sản phẩm <i className="fa-solid fa-arrow-right"></i></b></div>
                          </Link>
                        )) : (
                          <>
                            <div className="card product-card">
                                <div className="card-image-wrap">
                                    <img src="https://www.highlandscoffee.com.vn/vnt_upload/home/web_banner_2000x2000.jpg" alt="NƯỚC NGON THƯỞNG VỊ" />
                                </div>
                                <div className="card-overlay">
                                    <h3>NƯỚC NGON THƯỞNG VỊ</h3>
                                </div>
                            </div>
                            <div className="card product-card">
                                <div className="card-image-wrap">
                                    <img src="https://www.highlandscoffee.com.vn/vnt_upload/home/2.png" alt="BÁNH NGON NO ĐẦY" />
                                </div>
                                <div className="card-overlay">
                                    <h3>BÁNH NGON NO ĐẦY</h3>
                                </div>
                            </div>
                          </>
                        )}
                    </div>
                  )}
              </div>
          </section>

          {/* Store Locator */}
          <section className="section store-locator-section">
              <div className="container">
                  <div className="card-horizontal reversed">
                      <div className="card-image">
                          <img src="https://www.highlandscoffee.com.vn/vnt_upload/home/1_1.jpg" alt="Cửa Hàng Highlands Gần Bạn" />
                      </div>
                      <div className="card-content">
                          <h2>Cửa Hàng <span>Highlands Gần Bạn</span></h2>
                          <p>Bạn ở đâu, có Highlands ở đó!</p>
                          <a href="#" className="btn btn-primary">KHÁM PHÁ NGAY</a>
                      </div>
                  </div>
              </div>
          </section>
      </main>

      <footer>
          <div className="container">
              <div className="footer-grid">
                  <div className="footer-brand">
                      <img src="https://www.highlandscoffee.com.vn/vnt_upload/weblink/ftlogo.png" alt="Logo" />
                  </div>
                  <div className="footer-links">
                      <h4>Về Highlands</h4>
                      <ul>
                          <li><a href="#">Nguồn gốc</a></li>
                          <li><a href="#">Dịch vụ</a></li>
                          <li><a href="#">Nghề Nghiệp</a></li>
                          <li><a href="#">Hỗ trợ</a></li>
                      </ul>
                  </div>
                  <div className="footer-links">
                      <h4>Hệ thống cửa hàng</h4>
                      <ul>
                          <li><a href="#">Tìm cửa hàng gần nhất</a></li>
                      </ul>
                  </div>
                  <div className="footer-social">
                      <h4>Theo dõi chúng tôi</h4>
                      <div className="social-icons">
                          <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
                          <a href="#"><i className="fa-brands fa-instagram"></i></a>
                          <a href="#"><i className="fa-brands fa-youtube"></i></a>
                          <a href="#"><i className="fa-brands fa-tiktok"></i></a>
                      </div>
                  </div>
              </div>
              <div className="footer-bottom">
                  <p>&copy; {new Date().getFullYear()} Highlands Coffee Clone in Microservices. All rights reserved.</p>
              </div>
          </div>
      </footer>
    </div>
  );
}

export default HomePage;
