import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { createSupportRequest } from "../../services/contentService";
import { showToast } from "../../services/shopConfigService";
import "./BrandPages.css";

const faqs = [
  {"q":"Làm sao kiểm tra trạng thái đơn hàng?","a":"Đăng nhập tài khoản, chọn Tài khoản và mở Lịch sử mua hàng để theo dõi từng bước xử lý. Bạn có thể kiểm tra trạng thái đơn hàng trong ứng dụng Highlands Coffee, tại mục \"Đơn hàng của tôi\" hoặc truy cập trang Tra cứu đơn hàng và nhập mã đơn."},
  {"q":"Tôi có thể thay đổi hoặc hủy đơn hàng không?","a":"Bạn nên gửi yêu cầu hỗ trợ sớm nhất khi đơn vẫn ở trạng thái Chờ xác nhận. Nếu đơn đã được cửa hàng tiếp nhận và đang chuẩn bị, bạn sẽ không thể hủy."},
  {"q":"Voucher được sử dụng như thế nào?","a":"Lưu voucher tại trang Khuyến mãi, sau đó chọn mã đã lưu trong bước thanh toán trước khi xác nhận đặt hàng."},
  {"q":"Highlands giao hàng tại khu vực nào?","a":"Hệ thống hiện hỗ trợ các khu vực được cấu hình tại TP.HCM và các thành phố lớn với giao thường và giao hỏa tốc."},
  {"q":"Phương thức thanh toán nào được chấp nhận?","a":"Chúng tôi chấp nhận thanh toán qua Tiền mặt khi nhận hàng (COD), thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB), và các ví điện tử phổ biến như MoMo, ZaloPay."},
  {"q":"Chính sách đổi trả và hoàn tiền như thế nào?","a":"Vui lòng liên hệ với chúng tôi trong vòng 24 giờ kể từ khi nhận hàng nếu có bất kỳ sai sót nào về món nước. Việc hoàn tiền sẽ phụ thuộc vào quy định của Highlands."}
];

function SupportPage() {
  const [open, setOpen] = useState(0);
  const [form, setForm] = useState({ name: "", email: sessionStorage.getItem("email") || "", phone: "", topic: "Đơn hàng", orderId: "", message: "" });

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) entry.target.classList.add("reveal-active");
      });
    }, { threshold: 0.1 });
    const hiddenElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-stagger');
    hiddenElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if(!form.name.trim() || !form.email.trim() || form.message.trim().length < 10) return showToast("Vui lòng điền đầy đủ thông tin hỗ trợ", "error");
    createSupportRequest({ ...form, userId: sessionStorage.getItem("userId") });
    setForm({ ...form, message: "" });
    showToast("Yêu cầu đã được gửi. Highlands sẽ phản hồi sớm.");
  };

  return (
    <UserLayout>
      <div className="brand-page support-page">
        {/* HERO SECTION */}
        <section className="support-hero-new reveal-up">
          <div className="hero-content">
            <span className="brand-kicker">CHÚNG TÔI Ở ĐÂY ĐỂ HỖ TRỢ BẠN</span>
            <h1>Highlands Có Thể<br/>Giúp Gì Cho Bạn?</h1>
            <p>Đội ngũ Highlands luôn sẵn sàng lắng nghe và hỗ trợ bạn mọi lúc, mọi nơi để hành trình thưởng thức cà phê của bạn luôn trọn vẹn.</p>
            <div className="d-flex gap-3 flex-wrap">
              <button className="btn brand-primary-btn m-0 border-0 shadow"><i className="fa-solid fa-phone me-2"></i>Gọi ngay 1900 1755</button>
              <button className="btn brand-outline-btn m-0">Gửi yêu cầu hỗ trợ</button>
            </div>
          </div>
          <div className="support-hero-card-new">
            <div>
              <div className="d-flex align-items-start gap-3 mb-4">
                <i className="fa-solid fa-headset fs-3 text-white mt-1"></i>
                <div>
                  <small className="text-white-50 d-block">Hotline hỗ trợ</small>
                  <strong className="fs-3 fw-bold">1900 1755</strong>
                  <div className="text-white-50 small mt-1">08:00 - 22:00 mỗi ngày</div>
                </div>
              </div>
              <div className="d-flex align-items-start gap-3 mb-4">
                <i className="fa-regular fa-clock fs-3 text-white mt-1"></i>
                <div>
                  <small className="text-white-50 d-block">Thời gian phản hồi</small>
                  <strong className="fs-5 fw-bold">Trong vòng 24h</strong>
                  <div className="text-white-50 small mt-1">(Thường nhanh hơn)</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-top border-secondary d-flex align-items-center gap-2">
                <div className="bg-success rounded-circle" style={{width: 10, height: 10}}></div>
                <small>Chúng tôi đang trực tuyến</small>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT CARDS */}
        <section className="contact-cards-section reveal-stagger">
          <div className="contact-card">
            <i className="fa-solid fa-phone main-icon"></i>
            <h4>Gọi cho chúng tôi</h4>
            <p>Tổng đài hỗ trợ 24/7, sẵn sàng giải đáp mọi thắc mắc.</p>
            <a href="#">Gọi ngay 1900 1755 <i className="fa-solid fa-arrow-right ms-1"></i></a>
          </div>
          <div className="contact-card">
            <i className="fa-regular fa-envelope main-icon"></i>
            <h4>Email hỗ trợ</h4>
            <p>Gửi yêu cầu và chúng tôi sẽ phản hồi trong vòng 24 giờ.</p>
            <a href="#">support@highlandscoffee.com.vn <i className="fa-solid fa-arrow-right ms-1"></i></a>
          </div>
          <div className="contact-card">
            <i className="fa-solid fa-location-dot main-icon"></i>
            <h4>Hệ thống cửa hàng</h4>
            <p>Tìm cửa hàng gần bạn hoặc xem thông tin chi tiết.</p>
            <Link to="#">Tìm cửa hàng gần bạn <i className="fa-solid fa-arrow-right ms-1"></i></Link>
          </div>
          <div className="contact-card">
            <i className="fa-regular fa-comment-dots main-icon"></i>
            <h4>Chat trực tuyến</h4>
            <p>Trò chuyện ngay với nhân viên hỗ trợ.</p>
            <a href="#">Bắt đầu chat <i className="fa-solid fa-arrow-right ms-1"></i></a>
          </div>
        </section>

        {/* FAQ & FORM */}
        <section className="faq-form-section reveal-up">
          <div className="row g-5">
            {/* FAQ Column */}
            <div className="col-lg-6">
              <span className="brand-kicker">CÂU HỎI THƯỜNG GẶP</span>
              <h2 className="display-6 fw-bold mb-3" style={{fontFamily: '"Times New Roman", Times, serif', color: '#493329'}}>Có Thể Bạn Đang Tìm</h2>
              <p className="text-muted mb-4">Những câu hỏi phổ biến từ khách hàng của Highlands.</p>
              
              <div className="faq-list mt-4 border rounded-4 bg-white shadow-sm overflow-hidden">
                {faqs.map((faq, index) => (
                  <button 
                    className={`px-4 py-3 ${open === index ? "bg-light" : "bg-white"} ${index !== 0 ? 'border-top' : 'border-0'}`} 
                    style={{width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
                    onClick={() => setOpen(open === index ? -1 : index)} 
                    key={faq.q}
                  >
                    <div style={{flex: 1}}>
                      <b style={{color: open === index ? '#b22830' : '#493329'}}>{faq.q}</b>
                      {open === index && <p className="mb-0 mt-2 text-muted" style={{fontSize: '0.95rem'}}>{faq.a}</p>}
                    </div>
                    <i className={`fa-solid ${open === index ? "fa-minus text-danger" : "fa-plus text-dark"} ms-3`}></i>
                  </button>
                ))}
              </div>
            </div>

            {/* FORM Column */}
            <div className="col-lg-6">
              <form className="support-form" onSubmit={submit}>
                <span className="brand-kicker">GỬI YÊU CẦU</span>
                <h2 className="display-6 fw-bold mb-2" style={{fontFamily: '"Times New Roman", Times, serif', color: '#493329'}}>Chúng Tôi Luôn Lắng Nghe</h2>
                <p className="text-muted mb-4">Điền thông tin bên dưới, chúng tôi sẽ liên hệ hỗ trợ bạn sớm nhất.</p>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="fw-semibold mb-1">Họ và tên <span className="text-danger">*</span></label>
                    <input className="form-control" placeholder="Nhập họ và tên" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold mb-1">Email <span className="text-danger">*</span></label>
                    <input type="email" className="form-control" placeholder="example@mail.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})}/>
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold mb-1">Số điện thoại <span className="text-danger">*</span></label>
                    <input className="form-control" placeholder="Nhập số điện thoại" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}/>
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold mb-1">Chủ đề <span className="text-danger">*</span></label>
                    <select className="form-select" value={form.topic} onChange={e => setForm({...form, topic: e.target.value})}>
                      <option>Chọn chủ đề</option>
                      <option>Đơn hàng</option>
                      <option>Sản phẩm</option>
                      <option>Thanh toán & voucher</option>
                      <option>Tài khoản</option>
                      <option>Góp ý dịch vụ</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="fw-semibold mb-1">Mã đơn hàng (nếu có)</label>
                    <input className="form-control" placeholder="VD: HC12345678" value={form.orderId} onChange={e => setForm({...form, orderId: e.target.value})}/>
                  </div>
                  <div className="col-12">
                    <label className="fw-semibold mb-1">Nội dung hỗ trợ <span className="text-danger">*</span></label>
                    <textarea className="form-control" rows="5" placeholder="Mô tả chi tiết vấn đề của bạn..." value={form.message} onChange={e => setForm({...form, message: e.target.value})}/>
                    <div className="text-end text-muted mt-1"><small>0/1000</small></div>
                  </div>
                </div>
                <button className="btn brand-primary-btn w-100 mt-2 border-0 shadow-sm"><i className="fa-solid fa-paper-plane me-2"></i> Gửi yêu cầu hỗ trợ</button>
                <div className="text-center mt-3 text-muted small">
                  <i className="fa-solid fa-shield-check me-1"></i> Thông tin của bạn được bảo mật và chỉ sử dụng để hỗ trợ khách hàng.
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* QUICK SUPPORT */}
        <section className="reveal-left">
          <div className="quick-support-banner">
            <div className="quick-support-title">
              <span className="brand-kicker">CẦN HỖ TRỢ NHANH?</span>
              <h2>Chúng tôi luôn ở đây vì bạn</h2>
              <i className="fa-solid fa-seedling fs-1 mt-3" style={{color: '#f0e6dd'}}></i>
            </div>
            <div className="quick-support-grid">
              <div className="quick-card">
                <i className="fa-solid fa-headset q-icon"></i>
                <div>
                  <h5>Hotline 24/7</h5>
                  <strong>1900 1755</strong>
                  <p className="mb-2 mt-1">08:00 - 22:00 mỗi ngày</p>
                  <a href="#">Gọi ngay <i className="fa-solid fa-arrow-right ms-1"></i></a>
                </div>
              </div>
              <div className="quick-card">
                <i className="fa-solid fa-store q-icon"></i>
                <div>
                  <h5>Tìm cửa hàng</h5>
                  <p className="mb-2">Hơn 600 cửa hàng trên toàn quốc</p>
                  <a href="#">Xem ngay <i className="fa-solid fa-arrow-right ms-1"></i></a>
                </div>
              </div>
              <div className="quick-card">
                <i className="fa-solid fa-bag-shopping q-icon"></i>
                <div>
                  <h5>Hỗ trợ đơn hàng</h5>
                  <p className="mb-2">Tra cứu, đổi trả và các vấn đề đơn hàng</p>
                  <a href="#">Xem hướng dẫn <i className="fa-solid fa-arrow-right ms-1"></i></a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="cta-banner-section reveal-up">
          <div className="cta-banner-card">
            <div className="cta-content">
              <span className="brand-kicker text-white" style={{letterSpacing: '3px'}}>HIGHLANDS LUÔN BÊN BẠN</span>
              <h2 className="my-3">Luôn đồng hành cùng trải nghiệm của bạn</h2>
              <p className="mb-4">Cảm ơn bạn đã tin tưởng và lựa chọn Highlands Coffee.<br/>Chúng tôi sẽ tiếp tục nỗ lực để mang đến trải nghiệm tốt nhất.</p>
              <div className="d-flex gap-3 flex-wrap">
                <button className="btn brand-primary-btn m-0 border-0" style={{backgroundColor: '#b8744f'}}><i className="fa-solid fa-location-dot me-2"></i> Tìm cửa hàng gần bạn</button>
                <button className="btn brand-outline-btn m-0">Xem câu hỏi thường gặp</button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </UserLayout>
  );
}
export default SupportPage;
