import { useEffect, useState } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../services/productService";
import AdminLayout from "../../layouts/AdminLayout";

function AdminCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  
  // State phục vụ Edit
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCategory(form);
      alert("Thêm danh mục thành công!");
      setForm({ name: "", description: "" });
      loadCategories();
    } catch (error) {
      alert("Thêm danh mục thất bại!");
      console.error(error);
    }
  };

  const handleStartEdit = (cat) => {
    setEditingCategory(cat);
    setEditForm({
      name: cat.name,
      description: cat.description || "",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateCategory(editingCategory.id, editForm);
      alert("Cập nhật danh mục thành công!");
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      alert("Cập nhật danh mục thất bại!");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      await deleteCategory(id);
      alert("Xóa danh mục thành công!");
      loadCategories();
    } catch (error) {
      alert("Xóa danh mục thất bại!");
      console.error(error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <AdminLayout>
      <div className="container mt-4">
        <h2 className="fw-bold mb-4">Quản Lý Danh Mục</h2>

        <div className="row">
          {/* Cột trái: Form Thêm */}
          <div className="col-lg-4 mb-4">
            <form onSubmit={handleCreate} className="card shadow-sm border-0 rounded-4 p-4">
              <h5 className="fw-bold text-primary mb-3">Thêm danh mục mới</h5>
              <div className="mb-3">
                <label className="form-label fw-semibold">Tên danh mục</label>
                <input
                  name="name"
                  type="text"
                  className="form-control rounded-3"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: LEGO Lắp Ráp"
                  required
                />
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
              <button type="submit" className="btn btn-primary w-100 py-2.5 rounded-3 fw-bold mt-2">
                <i className="fa-solid fa-plus me-1"></i> Lưu Danh Mục
              </button>
            </form>
          </div>

          {/* Cột phải: Danh sách danh mục */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              {loading ? (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center my-5 text-muted">Chưa có danh mục nào được tạo.</div>
              ) : (
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3" style={{ width: "80px" }}>ID</th>
                      <th className="py-3" style={{ width: "220px" }}>Tên danh mục</th>
                      <th className="py-3">Mô tả</th>
                      <th className="py-3 text-center" style={{ width: "180px" }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id}>
                        <td className="px-4 py-3 fw-bold">#{cat.id}</td>
                        <td className="py-3 fw-semibold text-dark">{cat.name}</td>
                        <td className="py-3 text-muted text-truncate" style={{ maxWidth: "250px" }}>
                          {cat.description || "Không có mô tả"}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            className="btn btn-outline-primary btn-sm rounded-3 px-2.5 me-2"
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
          </div>
        </div>
      </div>

      {/* Modal chỉnh sửa Danh mục */}
      {editingCategory && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <form onSubmit={handleUpdate}>
                <div className="modal-header border-bottom-0 pt-4 px-4 pb-2">
                  <h5 className="modal-title fw-bold text-dark">Chỉnh Sửa Danh Mục</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditingCategory(null)}
                  ></button>
                </div>
                <div className="modal-body px-4 py-3">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tên danh mục</label>
                    <input
                      name="name"
                      type="text"
                      className="form-control rounded-3"
                      value={editForm.name}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Mô tả danh mục</label>
                    <textarea
                      name="description"
                      className="form-control rounded-3"
                      rows="3"
                      value={editForm.description}
                      onChange={handleEditChange}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pb-4 px-4 pt-2 justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-3 px-4 py-2 fw-semibold"
                    onClick={() => setEditingCategory(null)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary rounded-3 px-4 py-2 fw-bold">
                    Cập Nhật
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
