// Simple DTO helpers for Cart
function toPublicDTO(cart) {
  if (!cart) return null;
  const c = (typeof cart.toObject === 'function') ? cart.toObject() : JSON.parse(JSON.stringify(cart));
  return c;
}

function fromRequestBody(body) {
  // expect body.items = [{ product, quantity }]
  const items = Array.isArray(body.items) ? body.items.map(it => ({ product: it.product, quantity: parseInt(it.quantity || 1, 10) })) : [];
  return { user: body.user, items };
}

module.exports = { toPublicDTO, fromRequestBody };
