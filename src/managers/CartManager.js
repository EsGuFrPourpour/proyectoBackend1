const fs = require('fs').promises;
const path = require('path');

class CartManager {
  constructor() {
    this.path = path.join(__dirname, '../data/carts.json');
    this.carts = [];
    this.loadCarts();
  }

  async loadCarts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      this.carts = JSON.parse(data);
    } catch (error) {
      this.carts = [];
    }
  }

  async saveCarts() {
    await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2));
  }

  generateId() {
    return this.carts.length ? Math.max(...this.carts.map(c => c.id)) + 1 : 1;
  }

  async createCart() {
    const newCart = {
      id: this.generateId(),
      products: []
    };
    this.carts.push(newCart);
    await this.saveCarts();
    return newCart;
  }

  async getCartById(id) {
    await this.loadCarts();
    return this.carts.find(c => c.id === parseInt(id));
  }

  async addProductToCart(cartId, productId) {
    const cart = await this.getCartById(cartId);
    if (!cart) return null;

    const productIndex = cart.products.findIndex(p => p.product === parseInt(productId));
    if (productIndex !== -1) {
      cart.products[productIndex].quantity += 1;
    } else {
      cart.products.push({ product: parseInt(productId), quantity: 1 });
    }

    await this.saveCarts();
    return cart;
  }
}

module.exports = CartManager;