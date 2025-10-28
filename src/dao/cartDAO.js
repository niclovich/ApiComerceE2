const BaseDAO = require('./baseDAO');
const Cart = require('../models/Cart');

const dao = new BaseDAO(Cart);

// addProduct convenience method
dao.addProduct = async function (cartId, productId, quantity = 1) {
	const cart = await this.getById(cartId);
	if (!cart) return null;
	const item = cart.products.find(p => String(p.productId) === String(productId));
	if (item) {
		item.quantity += quantity;
	} else {
		cart.products.push({ productId, quantity });
	}
	return cart.save();
};

module.exports = dao;
