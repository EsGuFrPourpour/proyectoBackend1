const { ProductCartDTO } = require("./ProductDTO")

class CartDTO {
  constructor(cart) {
    this.id = cart._id
    this.products = cart.products.map((item) => ({
      product: ProductCartDTO.fromProduct(item.product),
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }))
    this.total = this.calculateTotal()
    this.totalItems = this.calculateTotalItems()
    this.createdAt = cart.createdAt
    this.updatedAt = cart.updatedAt
  }

  calculateTotal() {
    return this.products.reduce((total, item) => total + item.subtotal, 0)
  }

  calculateTotalItems() {
    return this.products.reduce((total, item) => total + item.quantity, 0)
  }

  static fromCart(cart) {
    return new CartDTO(cart)
  }
}

class CartSummaryDTO {
  constructor(cart) {
    this.id = cart._id
    this.totalItems = cart.products.reduce((total, item) => total + item.quantity, 0)
    this.total = cart.products.reduce((total, item) => total + item.product.price * item.quantity, 0)
    // Solo información de resumen
  }

  static fromCart(cart) {
    return new CartSummaryDTO(cart)
  }
}

module.exports = {
  CartDTO,
  CartSummaryDTO,
}
