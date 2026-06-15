import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { deleteNews, getNews, saveNews } from "../../services/contentService";

const EMPTY = { title: "", summary: "", imageUrl: "", content: "" };

function AdminNewsPage() {
  const [articles, setArticles] = useState(getNews());
  const [form, setForm] = useState(EMPTY);
  const [formOpen, setFormOpen] = useState(false);

  const closeForm = () => { setForm(EMPTY); setFormOpen(false); };
  const submit = (event) => {
    event.preventDefault();
    saveNews(form);
    setArticles(getNews());
    closeForm();
  };

  return <AdminLayout><div className="container py-4">
    <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
      <div><h2 className="fw-bold mb-1">Quản Lý Tin Tức</h2><p className="text-muted mb-0">Tạo và cập nhật nội dung hiển thị cho khách hàng.</p></div>
      {!formOpen && <button className="btn btn-danger rounded-pill px-4 text-nowrap" onClick={() => { setForm(EMPTY); setFormOpen(true); }}><i className="fa-solid fa-plus me-2"></i>Đăng tin</button>}
    </div>
    <div className="row g-4">
      {formOpen && <div className="col-lg-5"><form className="card border-0 shadow-sm rounded-4 p-4" onSubmit={submit}>
        <div className="d-flex justify-content-between align-items-center mb-3"><h5 className="fw-bold mb-0">{form.id ? "Chỉnh sửa tin" : "Đăng tin mới"}</h5><button type="button" className="btn-close" onClick={closeForm}></button></div>
        <input className="form-control mb-3" placeholder="Tiêu đề" required value={form.title} onChange={(e) => setForm({...form, title:e.target.value})}/>
        <input className="form-control mb-3" placeholder="Mô tả ngắn" value={form.summary} onChange={(e) => setForm({...form, summary:e.target.value})}/>
        <input className="form-control mb-3" placeholder="URL hình ảnh" value={form.imageUrl} onChange={(e) => setForm({...form, imageUrl:e.target.value})}/>
        <textarea className="form-control mb-3" rows="8" placeholder="Nội dung bài viết" required value={form.content} onChange={(e) => setForm({...form, content:e.target.value})}/>
        <div className="d-flex gap-2"><button type="button" className="btn btn-light flex-grow-1" onClick={closeForm}>Hủy</button><button className="btn btn-danger flex-grow-1">{form.id ? "Cập nhật" : "Đăng tin"}</button></div>
      </form></div>}
      <div className={formOpen ? "col-lg-7" : "col-12"}>
        {articles.map((article) => <div className="card border-0 shadow-sm rounded-4 p-3 mb-3" key={article.id}><div className="d-flex justify-content-between gap-3"><div><h5>{article.title}</h5><p className="text-muted mb-0">{article.summary}</p></div><div className="text-nowrap"><button className="btn btn-outline-secondary btn-sm me-2" onClick={() => { setForm(article); setFormOpen(true); }}>Sửa</button><button className="btn btn-outline-danger btn-sm" onClick={() => {deleteNews(article.id); setArticles(getNews());}}>Xóa</button></div></div></div>)}
        {!articles.length && <div className="alert alert-info">Chưa có tin tức.</div>}
      </div>
    </div>
  </div></AdminLayout>;
}
export default AdminNewsPage;
