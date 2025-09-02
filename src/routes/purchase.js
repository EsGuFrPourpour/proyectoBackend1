const express = require("express")
const {
  processPurchaseController,
  getTicketController,
  getUserTicketsController,
  getAllTicketsController,
} = require("../controllers/purchaseController")
const { authenticateJWT, requireAdmin } = require("../middleware/auth")

const router = express.Router()

router.post("/:cid/purchase", authenticateJWT, processPurchaseController)

router.get("/tickets/:tid", authenticateJWT, getTicketController)

router.get("/tickets", authenticateJWT, getUserTicketsController)

router.get("/admin/tickets", authenticateJWT, requireAdmin, getAllTicketsController)

module.exports = router
