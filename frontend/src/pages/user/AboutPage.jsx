import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import "./BrandPages.css";

function AboutPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-active");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right, .reveal-stagger > div");
    elements.forEach((el) => observer.observe(el));

    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <UserLayout>
      <div className="brand-page">
        {/* Hero Section */}
        <section className="about-hero-new">
          <div className="container h-100 d-flex align-items-center">
            <div className="hero-content reveal-up">
              <span className="brand-kicker text-white opacity-75">— VỀ CHÚNG TÔI</span>
              <h1>Đậm Đà<br />Bản Sắc<br />Việt Nam</h1>
              <p>
                Tôn vinh hương vị nguyên bản của cà phê Việt<br />
                qua từng tách cà phê chất lượng và trải nghiệm<br />
                đầy cảm hứng.
              </p>
              <div className="hero-actions">
                <a href="#story" className="brand-primary-btn px-4 py-2 me-3">
                  Khám phá câu chuyện <i className="fa-solid fa-arrow-right ms-2"></i>
                </a>
                <Link to="/stores" className="brand-outline-btn px-4 py-2 text-white border-white">
                  Tìm cửa hàng gần bạn <i className="fa-solid fa-location-dot ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section id="story" className="brand-section brand-story">
          <div className="story-image reveal-left">
            <img src="https://www.highlandscoffee.com.vn/vnt_upload/home/1_1.jpg" alt="Highlands Coffee story" />
          </div>
          <div className="story-content reveal-right">
            <span className="brand-kicker">— CÂU CHUYỆN THƯƠNG HIỆU</span>
            <h2>Khởi Nguồn Từ<br />Tình Yêu Cà Phê Việt</h2>
            <p>
              HIGHLANDS COFFEE được xây dựng từ niềm đam mê mãnh liệt với hạt cà phê Việt Nam – mảnh đất màu mỡ của những hạt cà phê Robusta đậm đà và Arabica thơm ngát.
            </p>
            <p>
              Chúng tôi không ngừng tìm kiếm, tuyển chọn những hạt cà phê chất lượng nhất từ các vùng trồng nổi tiếng, kết hợp cùng bí quyết rang xay và pha chế riêng để tạo nên những ly cà phê mang đậm bản sắc Việt.
            </p>
            <blockquote>
              "Mỗi ly cà phê là một lời cam kết về chất lượng, văn hóa và tình yêu với cà phê Việt."
            </blockquote>
          </div>
        </section>

        {/* Core Values */}
        <section className="brand-values">
          <div className="brand-section">
            <div className="text-center reveal-up">
              <span className="brand-kicker">— GIÁ TRỊ CỐT LÕI</span>
              <h2>Giá Trị Trong Từng Trải Nghiệm</h2>
              <p className="section-desc mx-auto">
                Chúng tôi theo đuổi những giá trị bền vững để mang đến trải nghiệm cà phê trọn vẹn và góp phần tạo nên một cộng đồng tốt đẹp hơn.
              </p>
            </div>
            
            <div className="value-grid reveal-stagger">
              <div className="value-card">
                <div className="value-icon"><i className="fa-solid fa-seedling"></i></div>
                <h3>Nguyên liệu tuyển chọn</h3>
                <p>Tuyển chọn kỹ lưỡng những hạt cà phê chất lượng từ các vùng trồng tốt nhất Việt Nam và thế giới.</p>
              </div>
              <div className="value-card">
                <div className="value-icon"><i className="fa-solid fa-mug-hot"></i></div>
                <h3>Pha chế tận tâm</h3>
                <p>Bí quyết rang xay và pha chế riêng biệt, mang đến hương vị đậm đà, nhất quán trong từng tách cà phê.</p>
              </div>
              <div className="value-card">
                <div className="value-icon"><i className="fa-solid fa-people-group"></i></div>
                <h3>Kết nối cộng đồng</h3>
                <p>Tạo nên không gian gặp gỡ ấm áp, gắn kết con người qua những trải nghiệm cà phê ý nghĩa.</p>
              </div>
              <div className="value-card">
                <div className="value-icon"><i className="fa-solid fa-leaf"></i></div>
                <h3>Phát triển bền vững</h3>
                <p>Gắn kết hài hòa giữa phát triển kinh doanh và trách nhiệm với môi trường, xã hội và cộng đồng địa phương.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Big Quote */}
        <section className="big-quote-section reveal-up">
          <div className="container text-center">
            <i className="fa-solid fa-quote-left quote-mark"></i>
            <h2>Cà phê không chỉ là thức uống,<br />đó là phong cách sống và niềm tự hào của người Việt.</h2>
            <i className="fa-solid fa-quote-right quote-mark"></i>
          </div>
        </section>

        {/* Timeline */}
        <section className="brand-section brand-timeline">
          <div className="text-center reveal-up">
            <span className="brand-kicker">— DẤU ẤN HÀNH TRÌNH</span>
            <h2>Hành Trình Kiến Tạo Giá Trị</h2>
          </div>
          
          <div className="timeline-new reveal-stagger mt-5">
            <div className="timeline-item">
              <div className="tl-icon"><i className="fa-solid fa-seedling"></i></div>
              <strong>1999</strong>
              <p>Những hạt giống đầu tiên được ươm mầm với khát vọng tôn vinh cà phê Việt Nam.</p>
            </div>
            <div className="timeline-item">
              <div className="tl-icon"><i className="fa-solid fa-shop"></i></div>
              <strong>2010+</strong>
              <p>Mở rộng hệ thống cửa hàng, mang trải nghiệm cà phê chất lượng đến nhiều khách hàng hơn.</p>
            </div>
            <div className="timeline-item">
              <div className="tl-icon"><i className="fa-solid fa-users"></i></div>
              <strong>500+</strong>
              <p>Hơn 500 cửa hàng tại Việt Nam, trở thành điểm đến yêu thích của hàng triệu khách hàng.</p>
            </div>
            <div className="timeline-item">
              <div className="tl-icon"><i className="fa-solid fa-heart"></i></div>
              <strong>Hôm nay</strong>
              <p>Tiếp tục đổi mới mỗi ngày để lan tỏa giá trị cà phê Việt tới tương lai.</p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="cta-banner-section reveal-up">
          <div className="container">
            <div className="cta-banner-card">
              <div className="cta-content">
                <h2>Cùng thưởng thức<br />hương vị cà phê Việt</h2>
                <p>Khám phá menu đa dạng và tìm cửa hàng gần bạn nhất.</p>
                <div className="hero-actions mt-4">
                  <Link to="/products" className="brand-primary-btn px-4 py-2 me-3">
                    Khám phá thực đơn <i className="fa-solid fa-arrow-right ms-2"></i>
                  </Link>
                  <Link to="/stores" className="brand-outline-btn px-4 py-2">
                    Tìm cửa hàng gần bạn <i className="fa-solid fa-location-dot ms-2"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </UserLayout>
  );
}

export default AboutPage;
