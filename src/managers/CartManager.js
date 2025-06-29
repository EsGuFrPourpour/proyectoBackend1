const fs = require("fs").promises
const path = require("path")

class CartManager {
  constructor() {
    this.path = path.join(__dirname, "../data/carts.json")
    this.carts = []
    this.initialized = false
    console.log("CartManager creado, path:", this.path)
  }

  async init() {
    if (!this.initialized) {
      console.log("Inicializando CartManager...")
      await this.loadCarts()
      this.initialized = true
      console.log("CartManager inicializado")
    }
  }

  async loadCarts() {
    try {
      console.log("Cargando carritos desde:", this.path)
      const data = await fs.readFile(this.path, "utf-8")
      this.carts = JSON.parse(data)
      console.log("Carritos cargados exitosamente:", this.carts.length)
      console.log("Carritos:", this.carts)
    } catch (error) {
      console.error("Error loading carts:", error.message)
      // Si el archivo no existe, crear uno con un carrito por defecto
      this.carts = [
        {
          id: 1,
          products: [],
        },
      ]
      await this.saveCarts()
      console.log("Archivo de carritos creado con carrito por defecto")
    }
  }

  async saveCarts() {
    try {
      console.log("Guardando carritos...")
      await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2))
      console.log("Carritos guardados exitosamente")
    } catch (error) {
      console.error("Error saving carts:", error)
      throw error
    }
  }

  generateId() {
    const id = this.carts.length ? Math.max(...this.carts.map((c) => c.id)) + 1 : 1
    console.log("ID generado para carrito:", id)
    return id
  }

  async createCart() {
    console.log("Creando nuevo carrito...")
    await this.init()
    const newCart = {
      id: this.generateId(),
      products: [],
    }
    this.carts.push(newCart)
    await this.saveCarts()
    console.log("Carrito creado:", newCart)
    return newCart
  }

  async getCartById(id) {
    console.log("Buscando carrito con ID:", id)
    await this.init()
    const cart = this.carts.find((c) => c.id === Number.parseInt(id))
    console.log("Carrito encontrado:", cart)
    return cart
  }

  async addProductToCart(cartId, productId) {
    console.log("=== INICIO addProductToCart ===")
    console.log("cartId:", cartId, "productId:", productId)

    try {
      await this.init()
      console.log("CartManager inicializado")

      const cart = await this.getCartById(cartId)
      console.log("Cart obtenido:", cart)

      if (!cart) {
        console.error(`Carrito con ID ${cartId} no encontrado`)
        return null
      }

      console.log("Productos actuales en el carrito:", cart.products)

      const productIndex = cart.products.findIndex((p) => p.product === Number.parseInt(productId))
      console.log("Índice del producto:", productIndex)

      if (productIndex !== -1) {
        console.log("Producto existe, incrementando cantidad")
        cart.products[productIndex].quantity += 1
      } else {
        console.log("Producto nuevo, agregando al carrito")
        cart.products.push({ product: Number.parseInt(productId), quantity: 1 })
      }

      console.log("Productos después de modificar:", cart.products)

      console.log("Guardando carritos...")
      await this.saveCarts()
      console.log("Carritos guardados")

      console.log(`Producto ${productId} añadido al carrito ${cartId}`)
      console.log("=== FIN addProductToCart EXITOSO ===")
      return cart
    } catch (error) {
      console.error("=== ERROR EN addProductToCart ===")
      console.error("Error:", error)
      console.error("Stack:", error.stack)
      throw error
    }
  }

  async removeProductFromCart(cartId, productId) {
    console.log("=== INICIO removeProductFromCart ===")
    console.log("cartId:", cartId, "productId:", productId)

    try {
      await this.init()
      const cart = await this.getCartById(cartId)

      if (!cart) {
        console.error(`Carrito con ID ${cartId} no encontrado`)
        return null
      }

      const productIndex = cart.products.findIndex((p) => p.product === Number.parseInt(productId))

      if (productIndex !== -1) {
        cart.products.splice(productIndex, 1)
        await this.saveCarts()
        console.log(`Producto ${productId} eliminado del carrito ${cartId}`)
        return cart
      } else {
        console.log("Producto no encontrado en el carrito")
        return cart
      }
    } catch (error) {
      console.error("Error en removeProductFromCart:", error)
      throw error
    }
  }

  async updateProductQuantity(cartId, productId, quantity) {
    console.log("=== INICIO updateProductQuantity ===")
    console.log("cartId:", cartId, "productId:", productId, "quantity:", quantity)

    try {
      await this.init()
      const cart = await this.getCartById(cartId)

      if (!cart) {
        console.error(`Carrito con ID ${cartId} no encontrado`)
        return null
      }

      const productIndex = cart.products.findIndex((p) => p.product === Number.parseInt(productId))

      if (productIndex !== -1) {
        if (quantity <= 0) {
          cart.products.splice(productIndex, 1)
        } else {
          cart.products[productIndex].quantity = quantity
        }
        await this.saveCarts()
        console.log(`Cantidad del producto ${productId} actualizada a ${quantity}`)
        return cart
      } else {
        console.log("Producto no encontrado en el carrito")
        return cart
      }
    } catch (error) {
      console.error("Error en updateProductQuantity:", error)
      throw error
    }
  }
}

module.exports = CartManager
