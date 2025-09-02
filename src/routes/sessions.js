const express = require("express")
const passport = require("passport")
const {
  registerController,
  loginController,
  currentController,
  logoutController,
} = require("../controllers/sessionController")
const { authenticateJWT } = require("../middleware/auth")

const router = express.Router()

const handlePassportError = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (err, user, info) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Error interno del servidor",
        })
      }

      if (!user) {
        return res.status(401).json({
          status: "error",
          message: info?.message || "Credenciales inválidas",
        })
      }

      req.user = user
      next()
    })(req, res, next)
  }
}

router.post("/register", handlePassportError("register"), registerController)

router.post("/login", handlePassportError("login"), loginController)

router.get("/current", authenticateJWT, currentController)

router.post("/logout", logoutController)

module.exports = router
