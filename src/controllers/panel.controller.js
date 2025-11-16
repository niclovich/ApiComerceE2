const productService = require("../services/product.service");
const userService = require("../services/user.service");

async function renderPanel(req, res, next) {
  try {
    const user = req.user || res.locals.user || null;
    if (!user) return res.redirect("/login");
    // delegate panel-specific listing rules to productListService

    const products = await productService.listProducts({}, { user });
    return res.render("panel", { user, products });
  } catch (err) {
    return next(err);
  }
}

module.exports = { renderPanel };
