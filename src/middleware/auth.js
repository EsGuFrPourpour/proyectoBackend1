const { passport } = require("../config/passport")

// Middleware para autenticación JWT
const authenticateJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        error: "Error interno del servidor",
      })
    }

    if (!user) {
      return res.status(401).json({
        status: "error",
        error: "Token requerido o inválido",
      })
    }

    req.user = user
    next()
  })(req, res, next)
}

// Middleware para requerir rol específico
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        error: "Usuario no autenticado",
      })
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        status: "error",
        error: `Acceso denegado. Se requiere rol: ${role}`,
      })
    }

    next()
  }
}

// Middleware para requerir admin
const requireAdmin = requireRole("admin")

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return next()
  }

  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Error en autenticación opcional:", err)
    }

    if (user) {
      req.user = user
    }

    next()
  })(req, res, next)
}

module.exports = {
  authenticateJWT,
  requireRole,
  requireAdmin,
  optionalAuth,
}
