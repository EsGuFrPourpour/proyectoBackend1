const TicketDAO = require("../dao/TicketDAO")
const CartRepository = require("./CartRepository")
const ProductRepository = require("./ProductRepository")
const crypto = require("crypto")

class TicketRepository {
  async createTicket(ticketData) {
    try {
      return await TicketDAO.create(ticketData)
    } catch (error) {
      throw error
    }
  }

  async getTicketById(id) {
    try {
      return await TicketDAO.findById(id)
    } catch (error) {
      throw error
    }
  }

  async getTicketByCode(code) {
    try {
      return await TicketDAO.findByCode(code)
    } catch (error) {
      throw error
    }
  }

  async getAllTickets(filter = {}, options = {}) {
    try {
      const tickets = await TicketDAO.findAll(filter, options)
      const total = await TicketDAO.countDocuments(filter)

      return {
        tickets,
        total,
        hasNextPage: options.skip + options.limit < total,
        hasPrevPage: options.skip > 0,
      }
    } catch (error) {
      throw error
    }
  }

  async getTicketsByUser(userId) {
    try {
      return await TicketDAO.findByUser(userId)
    } catch (error) {
      throw error
    }
  }

  async updateTicket(id, updateData) {
    try {
      return await TicketDAO.update(id, updateData)
    } catch (error) {
      throw error
    }
  }

  async updateTicketStatus(id, status) {
    try {
      const updateData = {
        status,
        updatedAt: new Date(),
      }
      return await TicketDAO.update(id, updateData)
    } catch (error) {
      throw error
    }
  }

  async deleteTicket(id) {
    try {
      const deletedTicket = await TicketDAO.delete(id)
      return deletedTicket !== null
    } catch (error) {
      throw error
    }
  }

  async processPurchase(userId, userEmail, cartId) {
    try {
      console.log("[v0] processPurchase iniciado:", { userId, userEmail, cartId })

      // Obtener carrito con productos
      const cart = await CartRepository.getCartById(cartId)
      console.log("[v0] Carrito obtenido completo:", JSON.stringify(cart, null, 2))

      if (!cart) {
        throw new Error("Cart not found")
      }

      if (!cart.products) {
        console.log("[v0] cart.products es undefined/null")
        throw new Error("Cart products is undefined")
      }

      if (!Array.isArray(cart.products)) {
        console.log("[v0] cart.products no es un array:", typeof cart.products)
        throw new Error("Cart products is not an array")
      }

      if (cart.products.length === 0) {
        throw new Error("Cart is empty")
      }

      console.log("[v0] Validación exitosa - productos:", cart.products.length)

      const purchasedProducts = []
      const failedProducts = []
      let totalAmount = 0

      // Verificar stock y procesar cada producto
      for (const cartItem of cart.products) {
        console.log("[v0] Procesando cartItem:", JSON.stringify(cartItem, null, 2))

        if (!cartItem.product || !cartItem.product._id) {
          console.log("[v0] cartItem.product inválido:", cartItem)
          failedProducts.push({
            product: cartItem.product || { title: "Unknown Product" },
            quantity: cartItem.quantity || 0,
            reason: "Invalid product data",
          })
          continue
        }

        const product = await ProductRepository.getProductById(cartItem.product._id)

        if (!product) {
          failedProducts.push({
            product: cartItem.product,
            quantity: cartItem.quantity,
            reason: "Product not found",
          })
          continue
        }

        if (product.stock < cartItem.quantity) {
          failedProducts.push({
            product: cartItem.product,
            quantity: cartItem.quantity,
            reason: "Insufficient stock",
            available: product.stock,
          })
          continue
        }

        // Producto puede ser comprado
        purchasedProducts.push({
          product: product._id,
          quantity: cartItem.quantity,
          price: product.price,
        })

        totalAmount += product.price * cartItem.quantity

        // Actualizar stock del producto
        await ProductRepository.updateProduct(product._id, {
          stock: product.stock - cartItem.quantity,
        })
      }

      console.log("[v0] Productos procesados:", { purchased: purchasedProducts.length, failed: failedProducts.length })

      // Verificar si al menos un producto pudo ser comprado
      if (purchasedProducts.length === 0) {
        throw new Error("No products could be purchased due to insufficient stock")
      }

      // Crear ticket
      const ticketData = {
        code: `TICKET-${crypto.randomUUID()}`,
        purchase_datetime: new Date(),
        amount: totalAmount,
        purchaser: userEmail,
        products: purchasedProducts,
        status: "completed",
        user: userId,
      }

      const ticket = await this.createTicket(ticketData)
      console.log("[v0] Ticket creado:", ticket.code)

      if (failedProducts.length === 0) {
        // Si todos los productos se compraron exitosamente, vaciar el carrito completamente
        await CartRepository.updateCart(cartId, [])
        console.log("[v0] Carrito vaciado completamente")
      } else {
        // Si algunos productos fallaron, mantener solo los productos que no se pudieron comprar
        const remainingProducts = cart.products.filter((cartItem) =>
          failedProducts.some((failed) => failed.product._id.toString() === cartItem.product._id.toString()),
        )
        await CartRepository.updateCart(cartId, remainingProducts)
        console.log("[v0] Carrito actualizado con productos restantes:", remainingProducts.length)
      }

      return {
        ticket,
        purchasedProducts,
        failedProducts,
        totalAmount,
      }
    } catch (error) {
      console.error("[v0] Error en processPurchase:", error.message)
      throw error
    }
  }

  async getUserTickets(userId, options = {}) {
    try {
      return await TicketDAO.findByUser(userId, options)
    } catch (error) {
      throw error
    }
  }
}

module.exports = new TicketRepository()
ts = new TicketRepository()
