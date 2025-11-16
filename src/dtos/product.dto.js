// DTO helpers for Product

function toPublicDTO(product) {
  if (!product) return null;
  const p = (typeof product.toObject === 'function') ? product.toObject() : JSON.parse(JSON.stringify(product));
  // remove mongoose internals
  delete p.__v;
  return p;
}

function fromRequestBody(body) {
  if (!body) return {};
  return {
    title: body.title,
    description: body.description ?? '',
    price: body.price != null ? Number(body.price) : undefined,
    stock: body.stock != null ? Number(body.stock) : 0,
    code: body.code,
    status: body.status != null ? Boolean(body.status) : true,
    category: body.category ?? '',
    thumbnails: Array.isArray(body.thumbnails) ? body.thumbnails : (body.thumbnails ? [body.thumbnails] : [])
  };
}

module.exports = { toPublicDTO, fromRequestBody };
