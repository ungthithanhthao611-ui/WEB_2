import { getProductById } from "./productService";

const currentUserKey = () => sessionStorage.getItem("userId") || "guest";
const cartKey = () => `highlands_local_cart_${currentUserKey()}`;
const readCart = () => JSON.parse(localStorage.getItem(cartKey()) || "[]");
const writeCart = (cart) => localStorage.setItem(cartKey(), JSON.stringify(cart));

export const getCart = async () => ({ data: readCart() });

export const addToCart = async (productId, quantity = 1, maxStock = Infinity) => {
  const productResponse = await getProductById(productId);
  const cart = readCart();
  const existing = cart.find((item) => item.product?.id === productId);
  if (existing) existing.quantity = Math.min(Number(maxStock), existing.quantity + Number(quantity));
  else cart.push({
    product: {
      id: productId,
      productName: productResponse.data.name || productResponse.data.productName,
      price: productResponse.data.price,
      availability: productResponse.data.quantity ?? productResponse.data.availability,
    },
    quantity: Number(quantity),
  });
  writeCart(cart);
  return { data: cart };
};

export const updateCartQuantity = async (productId, quantity, maxStock = Infinity) => {
  const cart = readCart();
  const item = cart.find((row) => row.product?.id === productId);
  if (item) item.quantity = Math.max(1, Math.min(Number(maxStock), Number(quantity)));
  writeCart(cart);
  return { data: cart };
};

export const removeCartItem = async (productId) => {
  const cart = readCart().filter((item) => item.product?.id !== productId);
  writeCart(cart);
  return { data: cart };
};

export const clearCart = async () => {
  localStorage.removeItem(cartKey());
  return { data: [] };
};
