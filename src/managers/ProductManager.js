const fs = require('fs').promises;
const path = require('path');

class ProductManager {
  constructor() {
    this.path = path.join(__dirname, '../data/products.json');
    this.products = [];
    this.loadProducts();
  }

  async loadProducts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      this.products = JSON.parse(data);
    } catch (error) {
      this.products = [];
    }
  }

  async saveProducts() {
    await fs.writeFile(this.path, JSON.stringify(this.products, null, 2));
  }

  generateId() {
    return this.products.length ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
  }

  async addProduct(product) {
    const newProduct = {
      id: this.generateId(),
      title: product.title,
      description: product.description,
      code: product.code,
      price: product.price,
      status: product.status ?? true,
      stock: product.stock,
      category: product.category,
      thumbnails: product.thumbnails || []
    };

    this.products.push(newProduct);
    await this.saveProducts();
    return newProduct;
  }

  async getProducts() {
    await this.loadProducts();
    return this.products;
  }

  async getProductById(id) {
    await this.loadProducts();
    return this.products.find(p => p.id === parseInt(id));
  }

  async updateProduct(id, updatedFields) {
    const index = this.products.findIndex(p => p.id === parseInt(id));
    if (index === -1) return null;

    const product = this.products[index];
    this.products[index] = {
      ...product,
      ...updatedFields,
      id: product.id // No se actualiza el ID
    };

    await this.saveProducts();
    return this.products[index];
  }

  async deleteProduct(id) {
    const index = this.products.findIndex(p => p.id === parseInt(id));
    if (index === -1) return false;

    this.products.splice(index, 1);
    await this.saveProducts();
    return true;
  }
}

module.exports = ProductManager;