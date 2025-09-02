const CartDAO = require("../dao/CartDAO")
const ProductRepository = require("./ProductRepository")

class CartRepository {
  async createCart() {
    try {
      return await CartDAO.create()
    } catch (error) {
      throw error
    }
  }

  async getCartById(id) {
    try {
      return await CartDAO.findById(id)
    } catch (error) {
      throw error
    }
  }

  async addProductToCart(cartId, productId, quantity) {
    try {
      // Verificar que el producto existe y tiene stock
      const hasStock = await ProductRepository.checkProductStock(productId, quantity)
      if (!hasStock) {
        throw new Error("Insufficient stock")
      }

      const cart = await CartDAO.findById(cartId)
      if (!cart) {
        throw new Error("Cart not found")
      }

      // Verificar si el producto ya está en el carrito
      const existingProduct = cart.products.find((item) => item.product.toString() === productId)

      if (existingProduct) {
        // Actualizar cantidad
        const newQuantity = existingProduct.quantity + quantity
        return await CartDAO.updateProductQuantity(cartId, productId, newQuantity)
      } else {
        // Agregar nuevo producto
        return await CartDAO.addProduct(cartId, productId, quantity)
      }
    } catch (error) {
      throw error
    }
  }

  async updateProductQuantity(cartId, productId, quantity) {
    try {
      // Verificar stock disponible
      const hasStock = await ProductRepository.checkProductStock(productId, quantity)
      if (!hasStock) {
        throw new Error("Insufficient stock")
      }

      return await CartDAO.updateProductQuantity(cartId, productId, quantity)
    } catch (error) {
      throw error
    }
  }

  async removeProductFromCart(cartId, productId) {
    try {
      return await CartDAO.removeProduct(cartId, productId)
    } catch (error) {
      throw error
    }
  }

  async clearCart(cartId) {
    try {
      return await CartDAO.clearCart(cartId)
    } catch (error) {
      throw error
    }
  }

  async updateCart(cartId, products) {
    try {
      // Validar stock para todos los productos
      for (const item of products) {
        const hasStock = await ProductRepository.checkProductStock(item.product, item.quantity)
        if (!hasStock) {
          throw new Error(`Insufficient stock for product ${item.product}`)
        }
      }

      return await CartDAO.update(cartId, { products })
    } catch (error) {
      throw error
    }
  }
}

module.exports = new CartRepository()
