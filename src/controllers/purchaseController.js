const TicketRepository = require("../repositories/TicketRepository")
const UserRepository = require("../repositories/UserRepository")
const { TicketDTO, TicketSummaryDTO } = require("../dto/TicketDTO")

/**
 * Controller para procesar compra del carrito
 */
const processPurchaseController = async (req, res) => {
  try {
    const userId = req.user.id
    const userEmail = req.user.email
    const cartId = req.params.cid

    console.log("=== PURCHASE REQUEST ===")
    console.log("User:", userEmail)
    console.log("Cart ID:", cartId)

    const user = await UserRepository.getUserById(userId)
    if (!user) {
      return res.status(404).json({
        status: "error",
        error: "User not found",
      })
    }

    const purchaseResult = await TicketRepository.processPurchase(userId, userEmail, cartId)

    // Respuesta exitosa
    res.status(201).json({
      status: "success",
      message: "Purchase processed successfully",
      ticket: TicketDTO.fromTicket(purchaseResult.ticket),
      summary: {
        totalAmount: purchaseResult.totalAmount,
        purchasedProducts: purchaseResult.purchasedProducts.length,
        failedProducts: purchaseResult.failedProducts.length,
      },
      failedProducts: purchaseResult.failedProducts,
    })
  } catch (error) {
    console.error("Error in purchase controller:", error.message)
    console.error("Error stack:", error.stack)

    if (error.message === "Cart is empty or not found") {
      return res.status(400).json({
        status: "error",
        error: "Cart is empty or not found",
      })
    }

    if (error.message === "No products could be purchased due to insufficient stock") {
      return res.status(400).json({
        status: "error",
        error: "No products could be purchased due to insufficient stock",
      })
    }

    res.status(500).json({
      status: "error",
      error: "Internal server error",
      message: error.message,
    })
  }
}

/**
 * Controller para obtener ticket por ID
 */
const getTicketController = async (req, res) => {
  try {
    const { tid } = req.params

    const ticket = await TicketRepository.getTicketById(tid)
    if (!ticket) {
      return res.status(404).json({
        status: "error",
        error: "Ticket not found",
      })
    }

    // Verificar que el usuario puede ver este ticket
    if (req.user.role !== "admin" && ticket.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        status: "error",
        error: "Access denied",
      })
    }

    res.json({
      status: "success",
      ticket: TicketDTO.fromTicket(ticket),
    })
  } catch (error) {
    console.error("Error getting ticket:", error.message)
    res.status(500).json({
      status: "error",
      error: "Internal server error",
    })
  }
}

/**
 * Controller para obtener tickets del usuario
 */
const getUserTicketsController = async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 10, page = 1 } = req.query

    const options = {
      limit: Number.parseInt(limit),
      skip: (Number.parseInt(page) - 1) * Number.parseInt(limit),
    }

    const tickets = await TicketRepository.getUserTickets(userId, options)

    res.json({
      status: "success",
      tickets: TicketSummaryDTO.fromTickets(tickets),
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: tickets.length,
      },
    })
  } catch (error) {
    console.error("Error getting user tickets:", error.message)
    res.status(500).json({
      status: "error",
      error: "Internal server error",
    })
  }
}

/**
 * Controller para obtener todos los tickets (solo admin)
 */
const getAllTicketsController = async (req, res) => {
  try {
    const { limit = 10, page = 1, status } = req.query

    const filter = {}
    if (status) {
      filter.status = status
    }

    const options = {
      limit: Number.parseInt(limit),
      skip: (Number.parseInt(page) - 1) * Number.parseInt(limit),
    }

    const result = await TicketRepository.getAllTickets(filter, options)

    res.json({
      status: "success",
      tickets: TicketSummaryDTO.fromTickets(result.tickets),
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: result.total,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    })
  } catch (error) {
    console.error("Error getting all tickets:", error.message)
    res.status(500).json({
      status: "error",
      error: "Internal server error",
    })
  }
}

module.exports = {
  processPurchaseController,
  getTicketController,
  getUserTicketsController,
  getAllTicketsController,
}
