import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { deleteBannerApi, fetchBanners, saveBannerApi, uploadBannerApi } from "../../services/commerceService";
import { showToast } from "../../services/shopConfigService";

const EMPTY = { label:"", title:"", description:"", imageUrl:"", link:"/products", position:"PROMOTION", featured:false, active:true, sortOrder:1, startsAt:"", endsAt:"" };
const positions = { HERO:"Slider đầu trang", PROMOTION:"Ưu đãi hot", NEW_PRODUCT:"Món mới", CONTENT:"Banner nội dung", PRODUCT_PAGE:"Trang sản phẩm" };

function AdminBannerPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const load = () => fetchBanners(true).then((r) => setItems(r.data)).catch(() => showToast("Không tải được banner", "error"));
  useEffect(() => { load(); }, []);

  const closeForm = () => { setForm(EMPTY); setFormOpen(false); };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadBannerApi(file);
      setForm((current) => ({ ...current, imageUrl:data.url }));
      showToast("Đã tải ảnh lên máy chủ");
    } catch (error) { showToast(error.response?.data?.message || "Tải ảnh thất bại", "error"); }
    finally { setUploading(false); }
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!form.imageUrl) return showToast("Vui lòng chọn ảnh", "error");
    await saveBannerApi({ ...form, sortOrder:Number(form.sortOrder), startsAt:form.startsAt || null, endsAt:form.endsAt || null });
    closeForm(); load(); showToast("Đã lưu banner");
  };

  return <AdminLayout><div className="container py-4">
    <div className="d-flex justify-content-between align-items-start gap-3 mb-4"><div><h2 className="fw-bold mb-1">Quản lý banner</h2><p className="text-muted mb-0">Ảnh được tải lên máy chủ và hiển thị chung trên mọi thiết bị.</p></div>{!formOpen && <button className="btn btn-danger rounded-pill px-4 text-nowrap" onClick={() => { setForm(EMPTY); setFormOpen(true); }}><i className="fa-solid fa-plus me-2"></i>Thêm banner</button>}</div>
    <div className="row g-4">
      {formOpen && <div className="col-xl-5"><form className="card border-0 shadow-sm rounded-4 p-4" onSubmit={submit}>
        <div className="d-flex justify-content-between align-items-center mb-3"><h5 className="fw-bold mb-0">{form.id ? "Chỉnh sửa banner" : "Thêm banner mới"}</h5><button type="button" className="btn-close" onClick={closeForm}></button></div>
        <div className="row g-3"><div className="col-8"><label className="form-label">Vị trí</label><select className="form-select" value={form.position} onChange={(e) => setForm({...form,position:e.target.value})}>{Object.entries(positions).map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></div><div className="col-4"><label className="form-label">Thứ tự</label><input type="number" min="1" className="form-control" value={form.sortOrder} onChange={(e) => setForm({...form,sortOrder:e.target.value})}/></div>
          <div className="col-12"><label className="form-label">Tiêu đề</label><input required className="form-control" value={form.title} onChange={(e) => setForm({...form,title:e.target.value})}/></div>
          <div className="col-12"><label className="form-label">Mô tả</label><textarea className="form-control" value={form.description} onChange={(e) => setForm({...form,description:e.target.value})}/></div>
          <div className="col-12"><label className="form-label">Ảnh từ máy</label><input type="file" accept="image/*" className="form-control" disabled={uploading} onChange={upload}/></div>
          <div className="col-12"><label className="form-label">Hoặc URL ảnh</label><input className="form-control" value={form.imageUrl} onChange={(e) => setForm({...form,imageUrl:e.target.value})}/>{form.imageUrl && <img src={form.imageUrl} alt="Xem trước banner" className="w-100 rounded mt-2" style={{height:180,objectFit:"cover"}}/>}</div>
          <div className="col-12"><label className="form-label">Liên kết</label><input className="form-control" value={form.link} onChange={(e) => setForm({...form,link:e.target.value})}/></div>
          <div className="col-6"><label className="form-label">Bắt đầu</label><input type="datetime-local" className="form-control" value={form.startsAt} onChange={(e) => setForm({...form,startsAt:e.target.value})}/></div><div className="col-6"><label className="form-label">Kết thúc</label><input type="datetime-local" className="form-control" value={form.endsAt} onChange={(e) => setForm({...form,endsAt:e.target.value})}/></div>
        </div><div className="d-flex gap-2 mt-4"><button type="button" className="btn btn-light flex-grow-1" onClick={closeForm}>Hủy</button><button className="btn btn-danger flex-grow-1">{form.id ? "Cập nhật" : "Thêm banner"}</button></div>
      </form></div>}
      <div className={formOpen ? "col-xl-7" : "col-12"}>{items.map((banner) => <article className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3" key={banner.id}><div className="row g-0"><div className="col-4"><img src={banner.imageUrl} alt={banner.title} className="w-100 h-100" style={{objectFit:"cover",minHeight:150}}/></div><div className="col-8 p-3"><span className="badge bg-danger">{positions[banner.position] || banner.position}</span><h5 className="mt-2">{banner.title}</h5><p className="small text-muted">{banner.description}</p><button className="btn btn-outline-secondary btn-sm me-2" onClick={() => { setForm({...banner,startsAt:banner.startsAt?.slice(0,16) || "",endsAt:banner.endsAt?.slice(0,16) || ""}); setFormOpen(true); }}>Sửa</button><button className="btn btn-outline-danger btn-sm" onClick={async () => { await deleteBannerApi(banner.id); load(); }}>Xóa</button></div></div></article>)}</div>
    </div>
  </div></AdminLayout>;
}
export default AdminBannerPage;
