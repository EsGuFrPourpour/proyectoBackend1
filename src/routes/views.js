const express = require('express');
const ProductManager = require('../managers/ProductManager');
const CartManager = require('../managers/CartManager');

const router = express.Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('products', { products });
  } catch (error) {
    res.status(500).send('Error al cargar los productos');
  }
});

router.get('/cart/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');
    res.render('cart', { products: cart.products });
  } catch (error) {
    res.status(500).send('Error al cargar el carrito');
  }
});

module.exports = router;