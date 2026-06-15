import { useEffect, useState } from "react";
import { getCart, removeCartItem, updateCartQuantity } from "../../services/cartService";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { getCartMeta, notifyCartChanged, removeCartItemMeta, setCartItemMeta, showToast } from "../../services/shopConfigService";
import { getProductById, getProductVariants } from "../../services/productService";

function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(getCartMeta());

  const loadCart = async () => {
    try {
      const res = await getCart();
      const currentMeta = getCartMeta();
      await Promise.all((res.data || []).map(async (item) => {
        const productId = item.product?.id;
        if (!productId || Number.isFinite(Number(currentMeta[productId]?.stock))) return;
        const productResponse = await getProductById(productId);
        const variantsResponse = await getProductVariants(productId).catch(() => ({ data: [] }));
        const selected = (variantsResponse.data || []).find(v => v.sku === currentMeta[productId]?.sku || v.name === currentMeta[productId]?.size);
        const stock = Number(selected?.stock ?? productResponse.data.quantity ?? productResponse.data.availability ?? 0);
        currentMeta[productId] = { ...currentMeta[productId], stock, sku: selected?.sku || currentMeta[productId]?.sku || "" };
        setCartItemMeta(productId, currentMeta[productId]);
      }));
      const corrected = await Promise.all((res.data || []).map(async (item) => {
        const max = Number(currentMeta[item.product?.id]?.stock ?? item.product?.quantity ?? item.product?.availability ?? Infinity);
        if (Number.isFinite(max) && item.quantity > max) {
          await updateCartQuantity(item.product.id, Math.max(1, max), max);
          return { ...item, quantity: Math.max(1, max) };
        }
        return item;
      }));
      setMeta(currentMeta);
      setCart(corrected);
    } catch (error) {
      console.error("Lỗi tải giỏ hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    if (!productId) return;
    try {
      await removeCartItem(productId);
      removeCartItemMeta(productId);
      notifyCartChanged();
      loadCart();
    } catch (error) {
      console.error(error);
      showToast("Xóa sản phẩm thất bại!", "error");
    }
  };

  const handleQuantity = async (productId, quantity) => {
    const maxStock = Number(meta[productId]?.stock ?? Infinity);
    const requested = Math.max(1, Number(quantity) || 1);
    const value = Math.min(requested, maxStock);
    try { await updateCartQuantity(productId, value, maxStock); await loadCart(); notifyCartChanged(); showToast(requested > maxStock ? `Chỉ còn ${maxStock} sản phẩm trong kho` : "Đã cập nhật số lượng", requested > maxStock ? "error" : "success"); }
    catch { showToast("Không thể cập nhật số lượng", "error"); }
  };

  const calculateTotal = () => {
    if (!cart || !Array.isArray(cart)) return 0;
    return cart.reduce((total, item) => total + ((meta[item.product?.id]?.price || item.product?.price || 0) * item.quantity), 0);
  };

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <UserLayout>
      <div className="container mt-4">
        <h3 className="fw-extrabold text-danger mb-4"><i className="fa-solid fa-basket-shopping me-2"></i>GIỎ HÀNG CỦA BẠN</h3>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : !cart || !Array.isArray(cart) || cart.length === 0 ? (
          <div className="card shadow-sm border-0 rounded-5 p-5 text-center bg-white">
            <div className="mb-4">
              <i className="fa-solid fa-face-sad-tear text-warning" style={{ fontSize: "5rem" }}></i>
            </div>
            <h4 className="fw-bold">Giỏ hàng của bạn đang trống!</h4>
            <p className="text-muted">Hãy chọn thức uống Highlands yêu thích của bạn.</p>
            <button className="btn btn-toy-primary px-5 py-3 mt-3 rounded-pill text-white fw-bold" onClick={() => navigate("/products")}>
              QUAY LẠI MUA SẮM NGAY
            </button>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card shadow-sm border-0 rounded-5 overflow-hidden mb-4 bg-white">
                <table className="table mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3">Sản phẩm</th>
                      <th className="py-3">Số lượng</th>
                      <th className="py-3">Giá tiền</th>
                      <th className="py-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.id || (item.product ? item.product.id : Math.random())}>
                        <td className="px-4 py-4">
                          <span className="fw-bold text-dark fs-6">{item.product ? item.product.productName : "Sản phẩm"}</span>
                          <small className="d-block text-muted">Size: {meta[item.product?.id]?.size || "Tiêu chuẩn"}</small>
                        </td>
                        <td className="py-4">
                          <input type="number" min="1" max={meta[item.product?.id]?.stock} className="form-control text-center" style={{width:85}} value={item.quantity} onChange={(e)=>setCart(cart.map(row=>row.product?.id===item.product?.id?{...row,quantity:e.target.value}:row))} onBlur={(e)=>handleQuantity(item.product?.id,e.target.value)} />
                          {Number.isFinite(Number(meta[item.product?.id]?.stock)) && <small className="d-block text-muted mt-1">Còn {meta[item.product?.id].stock}</small>}
                        </td>
                        <td className="py-4 fw-extrabold text-danger fs-6">
                          {Number((meta[item.product?.id]?.price || item.product?.price || 0) * item.quantity).toLocaleString("vi-VN")} VNĐ
                        </td>
                        <td className="py-4 text-center">
                          <button
                            className="btn btn-outline-danger btn-sm rounded-pill px-3 py-1.5 fw-bold"
                            onClick={() => handleRemove(item.product ? item.product.id : null)}
                          >
                            <i className="fa-solid fa-trash-can me-1"></i> Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm border-0 rounded-5 p-4 bg-white">
                <h5 className="fw-extrabold text-dark mb-3">TÓM TẮT ĐƠN HÀNG</h5>
                <hr />
                <div className="d-flex justify-content-between mb-4 fs-5 fw-extrabold">
                  <span className="text-dark">Tổng cộng:</span>
                  <span className="text-danger">{calculateTotal().toLocaleString("vi-VN")} VNĐ</span>
                </div>
                <button
                  className="btn btn-toy-primary w-100 py-3 rounded-pill fw-bold fs-6 text-white"
                  onClick={() => navigate("/checkout")}
                >
                  TIẾN HÀNH THANH TOÁN <i className="fa-solid fa-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}

export default CartPage;
