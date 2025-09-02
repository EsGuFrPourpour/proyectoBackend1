const express = require("express")
const router = express.Router()
const TicketRepository = require("../repositories/TicketRepository")
const { asyncHandler } = require("../utils/asyncHandler")
const { authenticateJWT, requireAdmin } = require("../middleware/auth")
const logger = require("../utils/logger")

const ticketRepository = TicketRepository

// GET /api/orders - Obtener todas las órdenes (solo admin)
router.get(
  "/",
  authenticateJWT,
  requireAdmin,
  asyncHandler(async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query

      // Construir filtro basado en parámetros
      const filter = {}
      if (status && status !== "all") {
        filter.status = status
      }

      const options = {
        limit: Number.parseInt(limit),
        skip: (Number.parseInt(page) - 1) * Number.parseInt(limit),
        sort: { createdAt: -1 }, // Más recientes primero
      }

      const result = await ticketRepository.getAllTickets(filter, options)

      logger.info(`Admin viewed orders: ${result.tickets.length} orders`)

      res.json({
        status: "success",
        payload: result.tickets,
        totalPages: Math.ceil(result.total / Number.parseInt(limit)),
        currentPage: Number.parseInt(page),
        total: result.total,
        hasNextPage: result.total > Number.parseInt(page) * Number.parseInt(limit),
        hasPrevPage: Number.parseInt(page) > 1,
      })
    } catch (error) {
      logger.error("Error fetching orders:", error)
      res.status(500).json({
        status: "error",
        message: "Error al obtener las órdenes",
        error: error.message,
      })
    }
  }),
)

// PUT /api/orders/:id/status - Actualizar estado de una orden (solo admin)
router.put(
  "/:id/status",
  authenticateJWT,
  requireAdmin,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params
      const { status } = req.body

      if (!status) {
        return res.status(400).json({
          status: "error",
          message: "El estado es requerido",
        })
      }

      const validStatuses = ["pending", "processing", "completed", "cancelled"]
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          status: "error",
          message: "Estado inválido. Estados válidos: " + validStatuses.join(", "),
        })
      }

      const updatedTicket = await ticketRepository.updateTicketStatus(id, status)

      if (!updatedTicket) {
        return res.status(404).json({
          status: "error",
          message: "Orden no encontrada",
        })
      }

      logger.info(`Order ${id} status updated to ${status} by admin`)

      res.json({
        status: "success",
        message: "Estado de la orden actualizado correctamente",
        payload: updatedTicket,
      })
    } catch (error) {
      logger.error(`Error updating order ${req.params.id} status:`, error)
      res.status(500).json({
        status: "error",
        message: "Error al actualizar el estado de la orden",
        error: error.message,
      })
    }
  }),
)

// GET /api/orders/:id - Obtener detalles de una orden específica (solo admin)
router.get(
  "/:id",
  authenticateJWT,
  requireAdmin,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params
      const ticket = await ticketRepository.getTicketById(id)

      if (!ticket) {
        return res.status(404).json({
          status: "error",
          message: "Orden no encontrada",
        })
      }

      logger.info(`Admin viewed order details: ${id}`)

      res.json({
        status: "success",
        payload: ticket,
      })
    } catch (error) {
      logger.error(`Error fetching order ${req.params.id}:`, error)
      res.status(500).json({
        status: "error",
        message: "Error al obtener los detalles de la orden",
        error: error.message,
      })
    }
  }),
)

module.exports = router
