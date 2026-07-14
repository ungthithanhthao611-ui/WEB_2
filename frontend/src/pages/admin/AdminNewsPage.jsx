import { useState, useRef, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { deleteNews, getNews, saveNews } from "../../services/contentService";
import { uploadImageToCloudinary } from "../../services/cloudinaryService";

const EMPTY = { title: "", slug: "", summary: "", content: "", category: "", imageUrl: "", isFeatured: false, metaTitle: "", metaDesc: "", publishDate: "" };

// Simple Rich Text Editor component
function SimpleEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const isTyping = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isTyping.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    isTyping.current = true;
    onChange(editorRef.current.innerHTML);
  };

  const handleBlur = () => {
    isTyping.current = false;
    onChange(editorRef.current.innerHTML);
  };

  const exec = (command, val = null) => {
    document.execCommand(command, false, val);
    editorRef.current.focus();
    handleInput();
  };

  return (
    <div className="border rounded">
      <div className="border-bottom bg-light p-2 d-flex gap-2 flex-wrap">
        <div className="btn-group btn-group-sm">
          <button type="button" className="btn btn-white bg-white border text-muted px-2" onClick={() => exec('bold')} title="In đậm"><i className="fa-solid fa-bold"></i></button>
          <button type="button" className="btn btn-white bg-white border text-muted px-2" onClick={() => exec('italic')} title="In nghiêng"><i className="fa-solid fa-italic"></i></button>
          <button type="button" className="btn btn-white bg-white border text-muted px-2" onClick={() => exec('underline')} title="Gạch chân"><i className="fa-solid fa-underline"></i></button>
          <button type="button" className="btn btn-white bg-white border text-muted px-2" onClick={() => exec('strikeThrough')} title="Gạch ngang"><i className="fa-solid fa-strikethrough"></i></button>
        </div>
        <div className="btn-group btn-group-sm">
          <button type="button" className="btn btn-white bg-white border text-muted px-2" onClick={() => exec('insertUnorderedList')} title="Danh sách chấm"><i className="fa-solid fa-list-ul"></i></button>
          <button type="button" className="btn btn-white bg-white border text-muted px-2" onClick={() => exec('insertOrderedList')} title="Danh sách số"><i className="fa-solid fa-list-ol"></i></button>
        </div>
        <div className="btn-group btn-group-sm">
          <button type="button" className="btn btn-white bg-white border text-muted px-2" onClick={() => {
            const url = prompt("Nhập đường dẫn liên kết:");
            if (url) exec('createLink', url);
          }} title="Chèn link"><i className="fa-solid fa-link"></i></button>
          <button type="button" className="btn btn-white bg-white border text-muted px-2" onClick={() => {
             const url = prompt("Nhập URL hình ảnh:");
             if (url) exec('insertImage', url);
          }} title="Chèn ảnh"><i className="fa-regular fa-image"></i></button>
        </div>
        <button type="button" className="btn btn-white bg-white border text-muted px-2 btn-sm" onClick={() => exec('removeFormat')} title="Xóa định dạng"><i className="fa-solid fa-eraser"></i></button>
      </div>
      <div 
        ref={editorRef}
        className="form-control border-0 p-3"
        contentEditable
        style={{ minHeight: "280px", outline: "none", overflowY: "auto" }}
        onInput={handleInput}
        onBlur={handleBlur}
      />
    </div>
  );
}

function AdminNewsPage() {
  const [articles, setArticles] = useState(getNews());
  const [form, setForm] = useState(EMPTY);
  const [formOpen, setFormOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const closeForm = () => { setForm(EMPTY); setFormOpen(false); };
  
  const submit = (event) => {
    event.preventDefault();
    saveNews(form);
    setArticles(getNews());
    closeForm();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await uploadImageToCloudinary(file);
      setForm({ ...form, imageUrl: url });
    } catch (error) {
      alert("Lỗi upload ảnh: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        
        {!formOpen ? (
          // --- LIST VIEW ---
          <div>
            <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
              <div>
                <h2 className="fw-bold mb-1">Quản Lý Bài Viết</h2>
                <p className="text-muted mb-0">Tạo và cập nhật nội dung hiển thị cho khách hàng.</p>
              </div>
              <button 
                className="btn btn-primary rounded px-4 py-2 text-nowrap fw-bold shadow-sm" 
                onClick={() => { setForm(EMPTY); setFormOpen(true); }}
                style={{ backgroundColor: "#0d6efd", border: "none" }}
              >
                <i className="fa-solid fa-plus me-2"></i> Đăng tin mới
              </button>
            </div>
            
            <div className="card border-0 shadow-sm rounded-3 p-4">
              {articles.map((article) => (
                <div className="border-bottom py-3 d-flex justify-content-between align-items-center gap-3" key={article.id}>
                  <div className="d-flex gap-3 align-items-center">
                    {article.imageUrl ? (
                       <img src={article.imageUrl} alt="" style={{width: "80px", height: "60px", objectFit: "cover", borderRadius: "8px"}} />
                    ) : (
                       <div className="bg-light border rounded" style={{width: "80px", height: "60px"}}></div>
                    )}
                    <div>
                      <h6 className="mb-1 fw-bold">{article.title}</h6>
                      <small className="text-muted">{article.summary?.substring(0, 80)}...</small>
                    </div>
                  </div>
                  <div className="text-nowrap">
                    <button className="btn btn-light btn-sm me-2 fw-bold" onClick={() => { setForm(article); setFormOpen(true); }}>
                      <i className="fa-solid fa-pen"></i> Sửa
                    </button>
                    <button className="btn btn-outline-danger btn-sm fw-bold" onClick={() => {
                       if(window.confirm("Xóa bài viết này?")) {
                          deleteNews(article.id); 
                          setArticles(getNews());
                       }
                    }}>
                      <i className="fa-solid fa-trash"></i> Xóa
                    </button>
                  </div>
                </div>
              ))}
              {!articles.length && <div className="text-center py-5 text-muted">Chưa có bài viết nào.</div>}
            </div>
          </div>
        ) : (
          // --- CREATE / EDIT VIEW ---
          <form onSubmit={submit}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold mb-0">{form.id ? "Chỉnh sửa bài viết" : "Thêm bài viết mới"}</h3>
              <button type="button" className="btn btn-light shadow-sm bg-white fw-bold text-muted border" onClick={closeForm}>
                <i className="fa-solid fa-arrow-left me-2"></i> Quay lại
              </button>
            </div>

            <div className="row g-4">
              {/* Left Column */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
                  <div className="mb-3">
                    <label className="fw-bold mb-2 text-dark" style={{fontSize:"0.95rem"}}>Tiêu đề bài viết <span className="text-danger">*</span></label>
                    <input className="form-control" placeholder="Nhập tiêu đề..." required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}/>
                  </div>
                  
                  <div className="mb-3">
                    <label className="fw-bold mb-2 text-dark" style={{fontSize:"0.95rem"}}>Đường dẫn (Slug) <span className="text-danger">*</span></label>
                    <input className="form-control mb-1" value={form.slug || ""} onChange={(e) => setForm({...form, slug: e.target.value})}/>
                    <small className="text-muted" style={{fontSize:"0.8rem"}}>Đường dẫn tự động tạo từ tiêu đề nhưng bạn có thể tùy chỉnh.</small>
                  </div>

                  <div className="mb-3">
                    <label className="fw-bold mb-2 text-dark" style={{fontSize:"0.95rem"}}>Mô tả ngắn</label>
                    <textarea className="form-control" rows="3" placeholder="Tóm tắt nội dung bài viết..." value={form.summary} onChange={(e) => setForm({...form, summary: e.target.value})}></textarea>
                    <div className="text-end text-muted mt-1"><small style={{fontSize:"0.8rem"}}>0/500 ký tự</small></div>
                  </div>

                  <div className="mb-3">
                    <label className="fw-bold mb-2 text-dark" style={{fontSize:"0.95rem"}}>Nội dung chi tiết <span className="text-danger">*</span></label>
                    
                    {/* Working Rich Text Editor */}
                    <SimpleEditor 
                      value={form.content} 
                      onChange={(html) => setForm({...form, content: html})}
                    />

                  </div>

                  <div className="mb-3 mt-5">
                    <label className="fw-bold mb-2 text-dark" style={{fontSize:"0.95rem"}}>Thẻ Meta Title (SEO)</label>
                    <input className="form-control" value={form.metaTitle || ""} onChange={(e) => setForm({...form, metaTitle: e.target.value})}/>
                  </div>
                  
                  <div className="mb-0">
                    <label className="fw-bold mb-2 text-dark" style={{fontSize:"0.95rem"}}>Thẻ Meta Description (SEO)</label>
                    <textarea className="form-control" rows="2" value={form.metaDesc || ""} onChange={(e) => setForm({...form, metaDesc: e.target.value})}></textarea>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
                  <h6 className="fw-bold border-bottom pb-3 mb-4 text-dark" style={{fontSize:"1rem"}}>Thông tin bài viết</h6>
                  
                  <div className="mb-4">
                    <label className="fw-bold mb-2 text-dark" style={{fontSize:"0.95rem"}}>Chuyên mục <span className="text-danger">*</span></label>
                    <select className="form-select text-muted" required value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                      <option value="">-- Chọn chuyên mục --</option>
                      <option value="tin-tuc">Tin tức & Sự kiện</option>
                      <option value="khuyen-mai">Khuyến mãi</option>
                      <option value="kien-thuc">Kiến thức Cà phê</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="fw-bold mb-2 text-dark" style={{fontSize:"0.95rem"}}>Ảnh đại diện</label>
                    <div 
                      className="text-center p-4 rounded bg-light cursor-pointer position-relative mb-2"
                      style={{ border: "1px dashed #ccc", cursor: "pointer" }}
                      onClick={() => fileInputRef.current.click()}
                    >
                      {isUploading ? (
                         <div className="spinner-border text-primary" role="status"></div>
                      ) : form.imageUrl ? (
                         <img src={form.imageUrl} alt="preview" className="img-fluid rounded" style={{maxHeight: "150px", objectFit: "contain"}}/>
                      ) : (
                        <>
                          <i className="fa-solid fa-cloud-arrow-up text-muted mb-2" style={{fontSize: "2.5rem"}}></i>
                          <p className="mb-0 text-muted small fw-medium">Kéo thả ảnh hoặc click để chọn</p>
                          <div className="d-flex mt-3 mx-auto justify-content-center bg-white border rounded p-1 shadow-sm" style={{width: "max-content"}}>
                             <span className="bg-secondary bg-opacity-10 text-dark px-2 py-1 rounded small me-2 border">Choose File</span>
                             <span className="text-muted small py-1 pe-2">No file chosen</span>
                          </div>
                        </>
                      )}
                    </div>
                    <input type="file" className="d-none" ref={fileInputRef} onChange={handleImageUpload} accept="image/*"/>
                    <small className="text-muted d-block mt-1" style={{fontSize: "0.75rem"}}>Kích thước khuyến nghị: 1200 x 675px. Tối đa 5MB.</small>
                  </div>

                  <div className="mb-4 d-flex align-items-center">
                    <div className="form-check form-switch mb-0">
                      <input className="form-check-input" type="checkbox" id="featuredCheck" checked={form.isFeatured || false} onChange={(e) => setForm({...form, isFeatured: e.target.checked})}/>
                      <label className="form-check-label fw-bold text-dark ms-2" htmlFor="featuredCheck" style={{fontSize:"0.95rem"}}>Nổi bật trên trang chủ</label>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="fw-bold mb-2 text-dark" style={{fontSize:"0.95rem"}}>Ngày đăng (Tùy chọn)</label>
                    <input type="date" className="form-control text-muted" value={form.publishDate || ""} onChange={(e) => setForm({...form, publishDate: e.target.value})}/>
                  </div>
                </div>

                <div className="card border-0 shadow-sm rounded-3 p-4">
                  <button type="submit" className="btn btn-primary w-100 mb-3 py-2.5 fw-bold" style={{ backgroundColor: "#0d6efd", border: "none" }}>
                    <i className="fa-solid fa-paper-plane me-2"></i> Lưu và đăng bài
                  </button>
                  <button type="button" className="btn btn-white w-100 mb-3 py-2.5 fw-bold text-secondary border shadow-sm bg-white" onClick={closeForm}>
                    <i className="fa-solid fa-floppy-disk me-2"></i> Lưu bản nháp
                  </button>
                  <button type="button" className="btn btn-white w-100 py-2.5 fw-bold text-info border shadow-sm bg-white">
                    <i className="fa-regular fa-eye me-2"></i> Xem trước
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminNewsPage;
