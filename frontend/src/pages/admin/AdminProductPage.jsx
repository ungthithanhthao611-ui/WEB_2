import { useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from "../../services/productService";
import AdminLayout from "../../layouts/AdminLayout";

function AdminProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    quantity: "",
    imageUrl: "",
    categoryId: "",
  });

  // State cho chỉnh sửa sản phẩm
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    quantity: "",
    imageUrl: "",
    categoryId: "",
  });

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
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
      await createProduct({
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        quantity: Number(form.quantity),
        categoryId: String(form.categoryId), // Lưu ID dưới dạng chuỗi khớp với kiểu String của Backend
      });

      alert("Thêm sản phẩm thành công!");
      setForm({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        quantity: "",
        imageUrl: "",
        categoryId: "",
      });
      loadProducts();
    } catch (error) {
      alert("Thêm sản phẩm thất bại!");
      console.error(error);
    }
  };

  const handleStartEdit = (p) => {
    setEditingProduct(p);
    setEditForm({
      name: p.name || p.productName || "",
      description: p.description || p.discription || "",
      price: p.price || "",
      originalPrice: p.originalPrice || "",
      quantity: p.quantity || p.availability || "",
      imageUrl: p.imageUrl || "",
      categoryId: p.categoryId || p.category || "",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProduct(editingProduct.id, {
        ...editForm,
        price: Number(editForm.price),
        originalPrice: editForm.originalPrice ? Number(editForm.originalPrice) : null,
        quantity: Number(editForm.quantity),
        categoryId: String(editForm.categoryId),
      });

      alert("Cập nhật sản phẩm thành công!");
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      alert("Cập nhật sản phẩm thất bại!");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      await deleteProduct(id);
      alert("Xóa sản phẩm thành công!");
      loadProducts();
    } catch (error) {
      alert("Xóa sản phẩm thất bại!");
      console.error(error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Hàm phụ trợ để lấy tên danh mục từ ID
  const getCategoryName = (catId) => {
    const found = categories.find((cat) => String(cat.id) === String(catId));
    return found ? found.name : `Danh mục #${catId}`;
  };

  return (
    <AdminLayout>
      <div className="container mt-4 mb-5">
        <h2 className="fw-bold mb-4">Quản Lý Sản Phẩm</h2>

        {/* Form thêm sản phẩm */}
        <form onSubmit={handleCreate} className="card shadow-sm border-0 rounded-4 p-4 mb-4">
          <h5 className="fw-bold text-primary mb-3">Thêm sản phẩm mới</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Tên sản phẩm</label>
              <input
                name="name"
                type="text"
                className="form-control rounded-3"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Giá bán (VNĐ)</label>
              <input
                name="price"
                type="number"
                className="form-control rounded-3"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Giá gốc (VNĐ)</label>
              <input
                name="originalPrice"
                type="number"
                className="form-control rounded-3"
                placeholder="Để trống nếu không giảm giá"
                value={form.originalPrice}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Số lượng trong kho</label>
              <input
                name="quantity"
                type="number"
                className="form-control rounded-3"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Đường dẫn hình ảnh (URL)</label>
              <input
                name="imageUrl"
                type="url"
                className="form-control rounded-3"
                placeholder="https://example.com/image.png"
                value={form.imageUrl}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Danh mục đồ chơi</label>
              <select
                name="categoryId"
                className="form-select rounded-3"
                value={form.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Mô tả sản phẩm</label>
              <textarea
                name="description"
                className="form-control rounded-3"
                rows="3"
                value={form.description}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
          <button type="submit" className="btn btn-primary px-4 py-2.5 rounded-3 fw-bold mt-4 align-self-start">
            <i className="fa-solid fa-plus me-1"></i> Lưu Sản Phẩm
          </button>
        </form>

        {/* Bảng danh sách sản phẩm */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          {loading ? (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center my-4 py-4 text-muted">Chưa có sản phẩm nào được tạo.</div>
          ) : (
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3" style={{ width: "80px" }}>ID</th>
                  <th className="py-3" style={{ width: "90px" }}>Hình ảnh</th>
                  <th className="py-3">Tên sản phẩm</th>
                  <th className="py-3">Danh mục</th>
                  <th className="py-3">Giá bán</th>
                  <th className="py-3">Giá gốc</th>
                  <th className="py-3">Số lượng kho</th>
                  <th className="py-3 text-center" style={{ width: "200px" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 fw-bold">#{p.id}</td>
                    <td className="py-3">
                      <img
                        src={p.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop"}
                        alt={p.name || p.productName}
                        width="50"
                        height="50"
                        className="rounded-3"
                        style={{ objectFit: "cover" }}
                      />
                    </td>
                    <td className="py-3 fw-semibold">{p.name || p.productName}</td>
                    <td className="py-3">
                      <span className="badge bg-light text-dark border px-2.5 py-1.5 rounded-3">
                        {getCategoryName(p.categoryId || p.category)}
                      </span>
                    </td>
                    <td className="py-3 text-danger fw-bold">{(p.price || 0).toLocaleString("vi-VN")} VNĐ</td>
                    <td className="py-3 text-muted text-decoration-line-through">
                      {p.originalPrice ? `${p.originalPrice.toLocaleString("vi-VN")} VNĐ` : "-"}
                    </td>
                    <td className="py-3 fw-medium">{p.quantity || p.availability} chiếc</td>
                    <td className="py-3 text-center">
                      <button
                        className="btn btn-outline-primary btn-sm rounded-3 px-2.5 me-2"
                        onClick={() => handleStartEdit(p)}
                      >
                        <i className="fa-solid fa-pen-to-square me-1"></i> Sửa
                      </button>
                      <button
                        className="btn btn-danger btn-sm rounded-3 px-2.5"
                        onClick={() => handleDelete(p.id)}
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

      {/* Modal Sửa Sản Phẩm */}
      {editingProduct && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <form onSubmit={handleUpdate}>
                <div className="modal-header border-bottom-0 pt-4 px-4 pb-2">
                  <h5 className="modal-title fw-bold text-dark">Chỉnh Sửa Sản Phẩm</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditingProduct(null)}
                  ></button>
                </div>
                <div className="modal-body px-4 py-3">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Tên sản phẩm</label>
                      <input
                        name="name"
                        type="text"
                        className="form-control rounded-3"
                        value={editForm.name}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Danh mục đồ chơi</label>
                      <select
                        name="categoryId"
                        className="form-select rounded-3"
                        value={editForm.categoryId}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Giá bán (VNĐ)</label>
                      <input
                        name="price"
                        type="number"
                        className="form-control rounded-3"
                        value={editForm.price}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Giá gốc (VNĐ)</label>
                      <input
                        name="originalPrice"
                        type="number"
                        className="form-control rounded-3"
                        placeholder="Không giảm giá"
                        value={editForm.originalPrice || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Số lượng trong kho</label>
                      <input
                        name="quantity"
                        type="number"
                        className="form-control rounded-3"
                        value={editForm.quantity}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Đường dẫn hình ảnh (URL)</label>
                      <input
                        name="imageUrl"
                        type="url"
                        className="form-control rounded-3"
                        value={editForm.imageUrl}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Mô tả sản phẩm</label>
                      <textarea
                        name="description"
                        className="form-control rounded-3"
                        rows="3"
                        value={editForm.description}
                        onChange={handleEditChange}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pb-4 px-4 pt-2 justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-3 px-4 py-2 fw-semibold"
                    onClick={() => setEditingProduct(null)}
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

export default AdminProductPage;
