const Cart = require("../models/Cart")
const Product = require("../models/Product")

class CartManager {
  constructor() {
    if (CartManager.instance) {
      return CartManager.instance
    }
    console.log("CartManager MongoDB creado")
    CartManager.instance = this
    return this
  }

  async createCart() {
    console.log("=== CREANDO NUEVO CARRITO ===")
    try {
      const newCart = new Cart({ products: [] })
      const savedCart = await newCart.save()
      console.log("Carrito creado:", savedCart._id)
      return savedCart
    } catch (error) {
      console.error("Error creando carrito:", error)
      throw error
    }
  }

  async getCartById(id) {
    console.log("=== OBTENIENDO CARRITO POR ID ===")
    console.log("ID:", id)

    try {
      const cart = await Cart.findById(id).populate("products.product")
      console.log("Carrito encontrado:", cart ? "Sí" : "No")

      if (cart) {
        console.log("Productos en carrito:", cart.products.length)
      }

      return cart
    } catch (error) {
      console.error("Error obteniendo carrito:", error)
      return null
    }
  }

  async addProductToCart(cartId, productId) {
    console.log("=== AGREGANDO PRODUCTO AL CARRITO ===")
    console.log("Cart ID:", cartId)
    console.log("Product ID:", productId)

    try {
      // Verificar que el producto existe
      const product = await Product.findById(productId)
      if (!product) {
        throw new Error("Producto no encontrado")
      }

      // Verificar stock
      if (product.stock <= 0) {
        throw new Error("Producto sin stock")
      }

      const cart = await Cart.findById(cartId)
      if (!cart) {
        throw new Error("Carrito no encontrado")
      }

      // Buscar si el producto ya está en el carrito
      const existingProductIndex = cart.products.findIndex((item) => item.product.toString() === productId)

      if (existingProductIndex !== -1) {
        // Verificar stock antes de incrementar
        if (cart.products[existingProductIndex].quantity >= product.stock) {
          throw new Error("No hay suficiente stock")
        }
        cart.products[existingProductIndex].quantity += 1
        console.log("Cantidad incrementada")
      } else {
        cart.products.push({ product: productId, quantity: 1 })
        console.log("Producto agregado al carrito")
      }

      const updatedCart = await cart.save()
      console.log("Carrito actualizado")

      return updatedCart
    } catch (error) {
      console.error("Error agregando producto al carrito:", error)
      throw error
    }
  }

  async removeProductFromCart(cartId, productId) {
    console.log("=== ELIMINANDO PRODUCTO DEL CARRITO ===")
    console.log("Cart ID:", cartId)
    console.log("Product ID:", productId)

    try {
      const cart = await Cart.findById(cartId)
      if (!cart) {
        throw new Error("Carrito no encontrado")
      }

      cart.products = cart.products.filter((item) => item.product.toString() !== productId)

      const updatedCart = await cart.save()
      console.log("Producto eliminado del carrito")

      return updatedCart
    } catch (error) {
      console.error("Error eliminando producto del carrito:", error)
      throw error
    }
  }

  async updateProductQuantity(cartId, productId, quantity) {
    console.log("=== ACTUALIZANDO CANTIDAD EN CARRITO ===")
    console.log("Cart ID:", cartId)
    console.log("Product ID:", productId)
    console.log("Nueva cantidad:", quantity)

    try {
      if (quantity <= 0) {
        return await this.removeProductFromCart(cartId, productId)
      }

      // Verificar stock
      const product = await Product.findById(productId)
      if (!product) {
        throw new Error("Producto no encontrado")
      }

      if (quantity > product.stock) {
        throw new Error("No hay suficiente stock")
      }

      const cart = await Cart.findById(cartId)
      if (!cart) {
        throw new Error("Carrito no encontrado")
      }

      const productIndex = cart.products.findIndex((item) => item.product.toString() === productId)

      if (productIndex !== -1) {
        cart.products[productIndex].quantity = quantity
        const updatedCart = await cart.save()
        console.log("Cantidad actualizada")

        // Retornar información adicional para el frontend
        return {
          cart: updatedCart,
          productId: productId,
          newQuantity: quantity,
          unitPrice: product.price,
          newSubtotal: product.price * quantity,
        }
      } else {
        throw new Error("Producto no encontrado en el carrito")
      }
    } catch (error) {
      console.error("Error actualizando cantidad:", error)
      throw error
    }
  }

  // Método para obtener carrito con detalles de productos para vistas
  async getCartWithDetails(cartId) {
    try {
      const cart = await Cart.findById(cartId).populate("products.product")
      if (!cart) return null

      const cartWithDetails = {
        id: cart._id,
        products: cart.products.map((item) => ({
          ...item.product.toObject(),
          quantity: item.quantity,
          total: item.product.price * item.quantity,
        })),
        totalItems: cart.products.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: cart.products.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      }

      return cartWithDetails
    } catch (error) {
      console.error("Error obteniendo carrito con detalles:", error)
      return null
    }
  }
}

// Crear instancia singleton
const cartManagerInstance = new CartManager()

module.exports = cartManagerInstance
