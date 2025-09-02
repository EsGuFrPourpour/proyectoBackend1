const express = require("express")
const router = express.Router()
const {
  forgotPasswordController,
  resetPasswordController,
  validateResetTokenController,
} = require("../controllers/passwordController")
const { asyncHandler } = require("../utils/asyncHandler")

// POST /api/password/forgot - Solicitar recuperación de contraseña
router.post("/forgot", asyncHandler(forgotPasswordController))

// POST /api/password/reset - Restablecer contraseña
router.post("/reset", asyncHandler(resetPasswordController))

// GET /api/password/validate/:token - Validar token de recuperación
router.get("/validate/:token", asyncHandler(validateResetTokenController))

// GET /reset-password - Vista para restablecer contraseña
router.get("/reset-password", (req, res) => {
  res.render("reset-password", {
    title: "Restablecer Contraseña",
    style: "styles.css",
  })
})

module.exports = router
