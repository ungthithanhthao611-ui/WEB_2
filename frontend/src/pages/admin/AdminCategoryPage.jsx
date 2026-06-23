import { useEffect, useState } from "react";
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/productService";
import { uploadImageToCloudinary } from "../../services/cloudinaryService";
import AdminLayout from "../../layouts/AdminLayout";
import { showToast } from "../../services/shopConfigService";

const EMPTY_FORM = { name: "", description: "", imageUrl: "" };

function AdminCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await getAdminCategories();
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingCategory(null);
    setFormMode(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setForm({ ...form, imageUrl: url });
    } catch (error) {
      showToast("Lỗi upload ảnh lên Cloudinary! Vui lòng thử lại.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    setEditingCategory(null);
    setFormMode("create");
  };

  const handleStartEdit = (cat) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      description: cat.description || "",
      imageUrl: cat.imageUrl || "",
    });
    setFormMode("edit");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formMode === "create") {
        await createCategory(form);
        showToast("Thêm danh mục thành công!");
      } else {
        await updateCategory(editingCategory.id, form);
        showToast("Cập nhật danh mục thành công!");
      }
      resetForm();
      loadCategories();
    } catch (error) {
      showToast(formMode === "create" ? "Thêm danh mục thất bại!" : "Cập nhật danh mục thất bại!", "error");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      await deleteCategory(id);
      showToast("Xóa danh mục thành công!");
      loadCategories();
    } catch (error) {
      showToast("Xóa danh mục thất bại!", "error");
      console.error(error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-1">Quản Lý Danh Mục</h2>
          <p className="text-muted mb-0">Chỉ hiển thị danh mục do admin thêm vào hệ thống</p>
        </div>
        <button
          className="btn btn-danger rounded-pill px-4 py-2 fw-bold"
          onClick={handleOpenCreate}
        >
          <i className="fa-solid fa-plus me-2"></i>Thêm danh mục
        </button>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center my-5 py-4 text-muted">
            <i className="fa-solid fa-layer-group fs-1 mb-3 d-block opacity-50"></i>
            Chưa có danh mục nào. Bấm <strong>Thêm danh mục</strong> để bắt đầu.
          </div>
        ) : (
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3" style={{ width: "80px" }}>ID</th>
                <th className="py-3" style={{ width: "220px" }}>Tên danh mục</th>
                <th className="py-3" style={{ width: "100px" }}>Hình ảnh</th>
                <th className="py-3">Mô tả</th>
                <th className="py-3 text-center" style={{ width: "180px" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-4 py-3 fw-bold">#{cat.id}</td>
                  <td className="py-3 fw-semibold text-dark">{cat.name}</td>
                  <td className="py-3"><img src={cat.imageUrl || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200"} alt={cat.name} width="64" height="48" className="rounded-3" style={{objectFit:"cover"}} /></td>
                  <td className="py-3 text-muted text-truncate" style={{ maxWidth: "400px" }}>
                    {cat.description || "Không có mô tả"}
                  </td>
                  <td className="py-3 text-center">
                    <button
                      className="btn btn-outline-danger btn-sm rounded-3 px-2.5 me-2"
                      onClick={() => handleStartEdit(cat)}
                    >
                      <i className="fa-solid fa-pen-to-square me-1"></i> Sửa
                    </button>
                    <button
                      className="btn btn-danger btn-sm rounded-3 px-2.5"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <i className="fa-solid fa-trash-can me-1"></i> Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {formMode && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <form onSubmit={handleSubmit}>
                <div className="modal-header border-bottom-0 pt-4 px-4 pb-2">
                  <h5 className="modal-title fw-bold text-dark">
                    {formMode === "create" ? "Thêm Danh Mục Mới" : "Chỉnh Sửa Danh Mục"}
                  </h5>
                  <button type="button" className="btn-close" onClick={resetForm}></button>
                </div>
                <div className="modal-body px-4 py-3">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tên danh mục</label>
                    <input
                      name="name"
                      type="text"
                      className="form-control rounded-3"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Ví dụ: Bánh Ngọt, Cà Phê, Trà"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Ảnh danh mục (Tải lên)</label>
                    <div className="d-flex align-items-center gap-3">
                      <input type="file" accept="image/*" className="form-control rounded-3" onChange={handleImageUpload} disabled={uploadingImage} />
                      {uploadingImage && (
                        <div className="spinner-border spinner-border-sm text-danger" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      )}
                    </div>
                    {form.imageUrl && (
                      <div className="mt-2 position-relative d-inline-block">
                        <img src={form.imageUrl} alt="Xem trước" className="rounded-3 shadow-sm" style={{ width: "100%", height: "140px", objectFit: "cover" }} />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 start-100 translate-middle rounded-circle"
                          style={{ width: "24px", height: "24px", padding: 0 }}
                          onClick={() => setForm({ ...form, imageUrl: "" })}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Mô tả danh mục</label>
                    <textarea
                      name="description"
                      className="form-control rounded-3"
                      rows="3"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Mô tả ngắn về danh mục này..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pb-4 px-4 pt-2 justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-3 px-4 py-2 fw-semibold"
                    onClick={resetForm}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-danger rounded-3 px-4 py-2 fw-bold" disabled={uploadingImage}>
                    {formMode === "create" ? "Lưu Danh Mục" : "Cập Nhật"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminCategoryPage;
