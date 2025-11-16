const productRepo = require("../repositories/product.repository");
const { toPublicDTO, fromRequestBody } = require("../dtos/product.dto");

class ProductService {
  async createProduct(payload) {
    const data = fromRequestBody(payload);
    // if owner is provided (from controller via req.user), preserve it
    if (payload.owner) data.owner = payload.owner;
    if (data.code) {
      const existing = await productRepo.findByCode(data.code);
      if (existing) throw new Error("Code already in use");
    }
    const prod = await productRepo.create(data);
    return toPublicDTO(prod);
  }

async listProducts(filter = {}, options = {}) {
  const repoFilter = { ...filter };

  // --- FILTRADO POR ROL ---
  if (options?.user) {
    const u = options.user;

    if (u.role === 'vendor') {
      // El vendor solo ve sus productos
      repoFilter.owner = u.id || u._id;
    } else {
      // Cualquier otro usuario solo ve los activos
      repoFilter.status = true;
    }
  }

  // Obtener productos desde el repo
  const products = await productRepo.findAll(repoFilter);

  return products.map(p => toPublicDTO(p));
}

  async getProductById(id) {
    const prod = await productRepo.findById(id);
    return toPublicDTO(prod);
  }

  async updateProduct(id, updates) {
    const updated = await productRepo.updateById(id, updates);
    if (!updated) throw new Error("Product not found");
    return toPublicDTO(updated);
  }

  async deleteProduct(id) {
    const deleted = await productRepo.deleteById(id);
    return !!deleted;
  }
}

module.exports = new ProductService();
