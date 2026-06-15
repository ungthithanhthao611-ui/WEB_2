import { useEffect, useState } from "react";
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminCategories,
  getProductVariants,
  saveProductVariants,
} from "../../services/productService";
import AdminLayout from "../../layouts/AdminLayout";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  quantity: "",
  imageUrl: "",
  categoryId: "",
};

function AdminProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [hasSale, setHasSale] = useState(false);
  const [sizes, setSizes] = useState([{ name: "M", sku:"", price: "", salePrice: "", stock:0 }, { name: "L", sku:"", price: "", salePrice: "", stock:0 }]);

  const loadProducts = async () => {
    try {
      const res = await getAdminProducts();
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await getAdminCategories();
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
      setCategories([]);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setHasSale(false);
    setEditingProduct(null);
    setFormMode(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    setHasSale(false);
    setEditingProduct(null);
    setFormMode("create");
    setSizes([{ name: "M", price: "", salePrice: "" }, { name: "L", price: "", salePrice: "" }]);
  };

  const handleStartEdit = async (p) => {
    const originalPrice = p.originalPrice || "";
    setEditingProduct(p);
    setForm({
      name: p.name || p.productName || "",
      description: p.description || p.discription || "",
      price: p.price || "",
      originalPrice,
      quantity: p.quantity || p.availability || "",
      imageUrl: p.imageUrl || "",
      categoryId: p.categoryId || p.category || "",
    });
    setHasSale(!!originalPrice);
    setFormMode("edit");
    try { const response=await getProductVariants(p.id,true); setSizes(response.data.length?response.data:[{name:"M",sku:"",price:p.originalPrice||p.price||"",salePrice:p.originalPrice?p.price:"",stock:p.quantity||0}]); } catch { setSizes([{name:"M",sku:"",price:p.price||"",salePrice:"",stock:p.quantity||0}]); }
  };

  const buildPayload = () => ({
    ...form,
    price: Number(form.price),
    originalPrice: hasSale && form.originalPrice ? Number(form.originalPrice) : null,
    quantity: Number(form.quantity),
    categoryId: String(form.categoryId),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hasSale && Number(form.originalPrice) <= Number(form.price)) {
      alert("Giá gốc phải lớn hơn giá sale!");
      return;
    }

    try {
      const payload = buildPayload();
      if (formMode === "create") {
        const response = await createProduct(payload);
        await saveProductVariants(response.data.id, sizes.filter((size) => size.name && size.price).map((size) => ({...size, price:Number(size.price), salePrice:size.salePrice?Number(size.salePrice):null,stock:Number(size.stock||0),active:true})));
        alert("Thêm sản phẩm thành công!");
      } else {
        await updateProduct(editingProduct.id, payload);
        await saveProductVariants(editingProduct.id, sizes.filter((size) => size.name && size.price).map((size) => ({...size, price:Number(size.price), salePrice:size.salePrice?Number(size.salePrice):null,stock:Number(size.stock||0),active:true})));
        alert("Cập nhật sản phẩm thành công!");
      }
      resetForm();
      loadProducts();
    } catch (error) {
      alert(formMode === "create" ? "Thêm sản phẩm thất bại!" : "Cập nhật sản phẩm thất bại!");
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

  const getCategoryName = (catId) => {
    const found = categories.find((cat) => String(cat.id) === String(catId));
    return found ? found.name : `Danh mục #${catId}`;
  };

  const renderFormFields = () => (
    <div className="row g-3">
      <div className="col-md-6">
        <label className="form-label fw-semibold">Tên sản phẩm</label>
        <input
          name="name"
          type="text"
          className="form-control rounded-3"
          placeholder="Ví dụ: Bánh Tiramisu"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="col-md-6">
        <label className="form-label fw-semibold">Danh mục</label>
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
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="hasSale"
            checked={hasSale}
            onChange={(e) => {
              setHasSale(e.target.checked);
              if (!e.target.checked) setForm({ ...form, originalPrice: "" });
            }}
          />
          <label className="form-check-label fw-semibold" htmlFor="hasSale">
            Sản phẩm đang giảm giá (có giá sale)
          </label>
        </div>
      </div>
      <div className="col-12">
        <label className="form-label fw-semibold">Size, giá gốc và giá sale</label>
        <div className="row g-2 mb-1 px-1 text-muted small fw-semibold">
          <div className="col-2">Size</div><div className="col-2">SKU</div><div className="col-2">Giá gốc</div><div className="col-2">Giá sale</div><div className="col-2">Tồn kho</div><div className="col-2"></div>
        </div>
        {sizes.map((size, index) => <div className="row g-2 mb-2 align-items-center" key={index}><div className="col-2"><input className="form-control" placeholder="Size" value={size.name} onChange={(e) => setSizes(sizes.map((item,i)=>i===index?{...item,name:e.target.value}:item))}/></div><div className="col-2"><input className="form-control" placeholder="SKU" value={size.sku||""} onChange={(e) => setSizes(sizes.map((item,i)=>i===index?{...item,sku:e.target.value}:item))}/></div><div className="col-2"><input className="form-control" type="number" placeholder="Giá gốc" value={size.price} onChange={(e) => setSizes(sizes.map((item,i)=>i===index?{...item,price:e.target.value}:item))}/></div><div className="col-2"><input className="form-control" type="number" placeholder="Giá sale" value={size.salePrice||""} onChange={(e) => setSizes(sizes.map((item,i)=>i===index?{...item,salePrice:e.target.value}:item))}/></div><div className="col-2"><input className="form-control" type="number" min="0" placeholder="Tồn kho" value={size.stock||0} onChange={(e) => setSizes(sizes.map((item,i)=>i===index?{...item,stock:e.target.value}:item))}/></div><div className="col-2"><button type="button" className="btn btn-outline-danger w-100" onClick={()=>setSizes(sizes.filter((_,i)=>i!==index))}>Xóa</button></div></div>)}
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={()=>setSizes([...sizes,{name:"",sku:"",price:"",salePrice:"",stock:0}])}>+ Thêm size</button>
      </div>

      {hasSale ? (
        <>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Giá gốc (VNĐ)</label>
            <input
              name="originalPrice"
              type="number"
              className="form-control rounded-3"
              placeholder="Giá trước khi giảm"
              value={form.originalPrice}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Giá sale (VNĐ)</label>
            <input
              name="price"
              type="number"
              className="form-control rounded-3"
              placeholder="Giá bán sau giảm"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
        </>
      ) : (
        <div className="col-md-6">
          <label className="form-label fw-semibold">Giá bán (VNĐ)</label>
          <input
            name="price"
            type="number"
            className="form-control rounded-3"
            placeholder="Giá bán sản phẩm"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>
      )}

      <div className="col-md-6">
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
      <div className="col-12">
        <label className="form-label fw-semibold">Mô tả sản phẩm</label>
        <textarea
          name="description"
          className="form-control rounded-3"
          rows="3"
          placeholder="Mô tả ngắn về sản phẩm..."
          value={form.description}
          onChange={handleChange}
        ></textarea>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-1">Quản Lý Sản Phẩm</h2>
          <p className="text-muted mb-0">Chỉ hiển thị sản phẩm do admin thêm vào hệ thống</p>
        </div>
        <button
          className="btn btn-danger rounded-pill px-4 py-2 fw-bold"
          onClick={handleOpenCreate}
        >
          <i className="fa-solid fa-plus me-2"></i>Thêm sản phẩm
        </button>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center my-5 py-4 text-muted">
            <i className="fa-solid fa-mug-hot fs-1 mb-3 d-block opacity-50"></i>
            Chưa có sản phẩm nào. Bấm <strong>Thêm sản phẩm</strong> để bắt đầu.
          </div>
        ) : (
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3" style={{ width: "80px" }}>ID</th>
                <th className="py-3" style={{ width: "90px" }}>Hình ảnh</th>
                <th className="py-3">Tên sản phẩm</th>
                <th className="py-3">Danh mục</th>
                <th className="py-3">Giá bán / Sale</th>
                <th className="py-3">Giá gốc</th>
                <th className="py-3">Tồn kho</th>
                <th className="py-3 text-center" style={{ width: "200px" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 fw-bold">#{p.id}</td>
                  <td className="py-3">
                    <img
                      src={
                        p.imageUrl ||
                        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop"
                      }
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
                  <td className="py-3 text-danger fw-bold">
                    {(p.price || 0).toLocaleString("vi-VN")} VNĐ
                  </td>
                  <td className="py-3 text-muted text-decoration-line-through">
                    {p.originalPrice ? `${p.originalPrice.toLocaleString("vi-VN")} VNĐ` : "-"}
                  </td>
                  <td className="py-3 fw-medium">{p.quantity || p.availability}</td>
                  <td className="py-3 text-center">
                    <button
                      className="btn btn-outline-danger btn-sm rounded-3 px-2.5 me-2"
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

      {formMode && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <form onSubmit={handleSubmit}>
                <div className="modal-header border-bottom-0 pt-4 px-4 pb-2">
                  <h5 className="modal-title fw-bold text-dark">
                    {formMode === "create" ? "Thêm Sản Phẩm Mới" : "Chỉnh Sửa Sản Phẩm"}
                  </h5>
                  <button type="button" className="btn-close" onClick={resetForm}></button>
                </div>
                <div className="modal-body px-4 py-3">{renderFormFields()}</div>
                <div className="modal-footer border-top-0 pb-4 px-4 pt-2 justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-3 px-4 py-2 fw-semibold"
                    onClick={resetForm}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-danger rounded-3 px-4 py-2 fw-bold">
                    {formMode === "create" ? "Lưu Sản Phẩm" : "Cập Nhật"}
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
