const SIZE_KEY = "highlands_product_sizes";
const cartMetaKey = () => `highlands_cart_meta_${sessionStorage.getItem("userId") || "guest"}`;
const SHIPPING_KEY = "highlands_shipping_config";
const VOUCHER_KEY = "highlands_vouchers";
const BANNER_KEY = "highlands_campaign_banners";
const savedVoucherKey = () => `highlands_saved_vouchers_${sessionStorage.getItem("userId") || "guest"}`;

const read = (key, fallback) => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const getProductSizes = (productId) => read(SIZE_KEY, {})[productId] || [];
export const saveProductSizes = (productId, sizes) => {
  const all = read(SIZE_KEY, {}); all[productId] = sizes; write(SIZE_KEY, all);
};

export const getCartMeta = () => read(cartMetaKey(), {});
export const setCartItemMeta = (productId, meta) => {
  const key = cartMetaKey(); const all = read(key, {}); all[productId] = meta; write(key, all);
};
export const removeCartItemMeta = (productId) => {
  const key = cartMetaKey(); const all = read(key, {}); delete all[productId]; write(key, all);
};
export const clearCartMeta = () => localStorage.removeItem(cartMetaKey());

const defaultShipping = {
  stores: ["Highlands Nguyễn Huệ - Quận 1", "Highlands Landmark 81 - Bình Thạnh", "Highlands Phan Xích Long - Phú Nhuận"],
  methods: [
    { id: "express", name: "Giao hỏa tốc", fee: 30000, eta: "30 - 45 phút" },
    { id: "standard", name: "Giao thường", fee: 15000, eta: "60 - 90 phút" },
  ],
};
export const getShippingConfig = () => read(SHIPPING_KEY, defaultShipping);
export const saveShippingConfig = (config) => { write(SHIPPING_KEY, config); window.dispatchEvent(new Event("shipping-config-updated")); };

export const getVouchers = () => read(VOUCHER_KEY, []);
export const saveVoucher = (voucher) => {
  const vouchers = getVouchers();
  const saved = { ...voucher, code: voucher.code.trim().toUpperCase(), id: voucher.id || Date.now(), active: voucher.active !== false };
  write(VOUCHER_KEY, voucher.id ? vouchers.map((item) => item.id === voucher.id ? saved : item) : [saved, ...vouchers]);
  return saved;
};
export const deleteVoucher = (id) => write(VOUCHER_KEY, getVouchers().filter((item) => item.id !== id));
export const getSavedVoucherCodes = () => read(savedVoucherKey(), []);
export const saveVoucherToWallet = (code) => {
  const codes = getSavedVoucherCodes();
  if (!codes.includes(code)) write(savedVoucherKey(), [...codes, code]);
};

const defaultBanners = [
  { id: 1, label: "ƯU ĐÃI HOT", title: "Hè Rực Rỡ, Deal Hết Cỡ", description: "Lưu voucher và tận hưởng thức uống yêu thích với mức giá đặc biệt.", imageUrl: "https://www.highlandscoffee.com.vn/vnt_upload/weblink/HCO_7801_MISMATCHES_DISCOUNT_FA_MWB_1920x926_1.png", link: "/vouchers", position: "PROMOTION", featured: true, active: true, sortOrder: 1 },
  { id: 2, label: "MÓN MỚI", title: "Matcha Mát Lành", description: "Hương vị xanh tươi, thanh mát cho ngày hè.", imageUrl: "https://www.highlandscoffee.com.vn/vnt_upload/weblink/HCO_7820_MATCHA_LAUNCH_DC_MWB_1920X926.jpg", link: "/products", position: "NEW_PRODUCT", featured: false, active: true, sortOrder: 2 },
  { id: 3, label: "PHIÊN BẢN MÙA HÈ", title: "Chạm Vị Nhiệt Đới", description: "Bộ sưu tập giới hạn dành riêng cho mùa nắng.", imageUrl: "https://www.highlandscoffee.com.vn/vnt_upload/weblink/2025/HCO_7825_SUMMERDI_DC_BANNER_1920x926.jpg", link: "/products?sale=true", position: "CONTENT", featured: false, active: true, sortOrder: 3 },
];
export const getCampaignBanners = () => read(BANNER_KEY, defaultBanners).map((item, index) => ({
  active: true,
  sortOrder: index + 1,
  position: index === 0 ? "PROMOTION" : index === 1 ? "NEW_PRODUCT" : "CONTENT",
  ...item,
}));
export const getBannersByPosition = (position) => getCampaignBanners()
  .filter(item => item.active !== false && item.position === position)
  .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
export const saveCampaignBanner = (banner) => {
  const banners = getCampaignBanners();
  const saved = { ...banner, id: banner.id || Date.now() };
  write(BANNER_KEY, banner.id ? banners.map(item => item.id === banner.id ? saved : item) : [...banners, saved]);
  return saved;
};
export const deleteCampaignBanner = (id) => write(BANNER_KEY, getCampaignBanners().filter(item => item.id !== id));

export const notifyCartChanged = () => window.dispatchEvent(new Event("cart-updated"));
export const showToast = (message, type = "success") => window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type } }));
