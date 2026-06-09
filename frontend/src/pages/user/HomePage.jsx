import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { addToCart } from "../../services/cartService";
import "./HomePage.css"; 

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // For slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    "https://www.highlandscoffee.com.vn/vnt_upload/weblink/2025/HCO_7825_SUMMERDI_DC_BANNER_1920x926.jpg",
    "https://www.highlandscoffee.com.vn/vnt_upload/weblink/HCO_7801_MISMATCHES_DISCOUNT_FA_MWB_1920x926_1.png",
    "https://www.highlandscoffee.com.vn/vnt_upload/weblink/HCO_7820_MATCHA_LAUNCH_DC_MWB_1920X926.jpg"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data.slice(0, 4)); // Lấy 4 sản phẩm
    } catch (error) {
      console.error("Lỗi lấy sản phẩm nổi bật:", error);
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
    
    // Header scroll effect
    const handleScroll = () => {
      const header = document.getElementById('highlands-header');
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="highlands-home">
      <header id="highlands-header">
          <div className="header-container">
              <div className="nav-left">
                  <ul className="nav-menu">
                      <li><Link to="/products">Thực Đơn</Link></li>
                      <li><a href="#">Về Highlands</a></li>
                      <li><a href="#">Tin tức</a></li>
                      <li><a href="#">Hỗ Trợ</a></li>
                  </ul>
              </div>
              <div className="logo">
                  <Link to="/">
                      <img src="https://www.highlandscoffee.com.vn/vnt_upload/weblink/red_BG_logo800.png" alt="Highlands Coffee" />
                  </Link>
              </div>
              <div className="nav-right">
                  <ul className="nav-tools">
                      <li><Link to="/cart" className="btn-delivery">Giỏ hàng</Link></li>
                      <li><Link to="/login"><i className="fa-solid fa-user"></i> Tài khoản</Link></li>
                      <li className="lang"><img src="https://www.highlandscoffee.com.vn/vnt_upload/lang/flag-vn.jpg" alt="VN" /></li>
                  </ul>
              </div>
              <div className="menu-toggle" onClick={() => alert("Chức năng menu mobile đang hoàn thiện.")}>
                  <i className="fa-solid fa-bars"></i>
              </div>
          </div>
      </header>

      <main>
          {/* Hero Slider */}
          <section className="hero-slider">
              <div className="slider-container">
                  {slides.map((slide, index) => (
                    <div 
                      key={index}
                      className={`slide ${index === currentSlide ? 'active' : ''}`} 
                      style={{ backgroundImage: `url('${slide}')` }}
                    ></div>
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

          {/* Companion Section */}
          <section className="section companion-section">
              <div className="container">
                  <h2 className="section-title">Đồng Hành Cùng Highlands</h2>
                  <div className="grid-3">
                      <div className="card">
                          <div className="card-image-wrap">
                              <img src="https://www.highlandscoffee.com.vn/vnt_upload/home/WEB_Banner.png" alt="HIGHLANDS REWARDS" />
                          </div>
                          <div className="card-title">
                              <h3>HIGHLANDS REWARDS</h3>
                          </div>
                      </div>
                      <div className="card">
                          <div className="card-image-wrap">
                              <img src="https://www.highlandscoffee.com.vn/vnt_upload/home/bbimg2.jpg" alt="THẺ HIGHLANDS" />
                          </div>
                          <div className="card-title">
                              <h3>THẺ HIGHLANDS</h3>
                          </div>
                      </div>
                      <div className="card">
                          <div className="card-image-wrap">
                              <img src="https://www.highlandscoffee.com.vn/vnt_upload/home/505392773_1120548066764868_2724070916068790506_n.jpg" alt="CƠ HỘI NGHỀ NGHIỆP" />
                          </div>
                          <div className="card-title">
                              <h3>CƠ HỘI NGHỀ NGHIỆP</h3>
                          </div>
                      </div>
                  </div>
              </div>
          </section>

          {/* Products Highlight (Dynamic) */}
          <section className="section products-section">
              <div className="container">
                  <h2 className="section-title">Khám Phá Thực Đơn</h2>
                  {loading ? (
                    <div style={{textAlign: 'center', padding: '50px 0'}}>Đang tải sản phẩm...</div>
                  ) : (
                    <div className="grid-2">
                        {products.length > 0 ? products.map(p => (
                          <div className="card product-card" key={p.id}>
                              <div className="card-image-wrap">
                                  <img src={p.imageUrl || "https://www.highlandscoffee.com.vn/vnt_upload/home/web_banner_2000x2000.jpg"} alt={p.name} />
                              </div>
                              <div className="card-overlay" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '20px' }}>
                                  <h3 style={{ marginBottom: '10px' }}>{p.name}</h3>
                                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px' }}>{p.price.toLocaleString("vi-VN")} VNĐ</p>
                                  <div>
                                    <button onClick={() => handleAddToCart(p.id)} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                                      <i className="fa-solid fa-cart-plus"></i> Chọn Mua
                                    </button>
                                  </div>
                              </div>
                          </div>
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
