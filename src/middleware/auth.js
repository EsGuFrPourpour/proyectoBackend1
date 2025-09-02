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

// Middleware para autenticación web que funciona con navegación del navegador
const authenticateWeb = (req, res, next) => {
  // Primero intentar autenticación JWT desde header
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) {
        return res.status(500).render("error", {
          title: "Error del servidor",
          message: "Error interno del servidor",
          style: "styles.css",
        })
      }

      if (!user) {
        return res.status(401).render("login", {
          title: "Acceso Denegado",
          error: "Debes iniciar sesión para acceder a esta página",
          style: "styles.css",
        })
      }

      req.user = user
      next()
    })(req, res, next)
  }

  // Si no hay header, redirigir a login
  return res.status(401).render("login", {
    title: "Iniciar Sesión",
    error: "Debes iniciar sesión para acceder a esta página",
    style: "styles.css",
  })
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

const requireAdminWeb = (req, res, next) => {
  if (!req.user) {
    return res.status(401).render("login", {
      title: "Acceso Denegado",
      error: "Debes iniciar sesión como administrador",
      style: "styles.css",
    })
  }

  if (req.user.role !== "admin") {
    return res.status(403).render("error", {
      title: "Acceso Denegado",
      message: "No tienes permisos de administrador para acceder a esta página",
      style: "styles.css",
    })
  }

  next()
}

// Middleware para operaciones de productos (solo admin)
const requireAdminForProducts = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      error: "Usuario no autenticado",
    })
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      error: "Solo los administradores pueden crear, actualizar o eliminar productos",
    })
  }

  next()
}

// Middleware para operaciones de carrito (solo el usuario propietario)
const requireCartOwnership = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        error: "Usuario no autenticado",
      })
    }

    const cartId = req.params.cid
    const UserRepository = require("../repositories/UserRepository")
    const CartRepository = require("../repositories/CartRepository")

    console.log(`[v0] DEBUG - requireCartOwnership iniciado`)
    console.log(`[v0] DEBUG - Usuario ID: ${req.user.id}`)
    console.log(`[v0] DEBUG - Carrito ID solicitado: ${cartId}`)

    const cart = await CartRepository.getCartById(cartId)
    if (!cart) {
      console.log(`[v0] DEBUG - Carrito no encontrado: ${cartId}`)
      return res.status(404).json({
        status: "error",
        error: "Carrito no encontrado",
      })
    }

    console.log(`[v0] DEBUG - Carrito encontrado:`, {
      id: cart._id,
      owner: cart.owner,
      hasOwner: !!cart.owner,
    })

    // Obtener usuario completo
    const user = await UserRepository.getUserById(req.user.id)
    if (!user) {
      console.log(`[v0] DEBUG - Usuario no encontrado: ${req.user.id}`)
      return res.status(404).json({
        status: "error",
        error: "Usuario no encontrado",
      })
    }

    console.log(`[v0] DEBUG - Usuario encontrado:`, {
      id: user._id,
      email: user.email,
      cart: user.cart,
    })

    if (!cart.owner) {
      console.log(`[v0] DEBUG - Carrito sin owner, asignando al usuario: ${user._id}`)
      await CartRepository.updateCart(cartId, { owner: user._id })
      // También actualizar el usuario para que tenga este carrito asignado
      await UserRepository.updateUser(user._id, { cart: cartId })
      req.userCart = cart
      console.log(`[v0] DEBUG - Carrito asignado exitosamente`)
      return next()
    }

    console.log(`[v0] DEBUG - Verificando ownership:`)
    console.log(`[v0] DEBUG - cart.owner: ${cart.owner}`)
    console.log(`[v0] DEBUG - user._id: ${user._id}`)
    console.log(`[v0] DEBUG - Coinciden: ${cart.owner.toString() === user._id.toString()}`)

    if (cart.owner.toString() !== user._id.toString()) {
      console.log(`[v0] DEBUG - ACCESO DENEGADO - El carrito pertenece a otro usuario`)
      return res.status(403).json({
        status: "error",
        error: "No tienes permisos para modificar este carrito",
      })
    }

    console.log(`[v0] DEBUG - Acceso permitido - Usuario es owner del carrito`)
    req.userCart = cart
    next()
  } catch (error) {
    console.error("Error en middleware de carrito:", error)
    res.status(500).json({
      status: "error",
      error: "Error interno del servidor",
    })
  }
}

// Middleware para verificar propiedad de recursos del usuario
const requireResourceOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: "error",
          error: "Usuario no autenticado",
        })
      }

      const resourceId = req.params.id || req.params.uid

      // Admin puede acceder a cualquier recurso
      if (req.user.role === "admin") {
        return next()
      }

      // Usuario solo puede acceder a sus propios recursos
      if (req.user.id !== resourceId) {
        return res.status(403).json({
          status: "error",
          error: `Solo puedes acceder a tu propio ${resourceType}`,
        })
      }

      next()
    } catch (error) {
      console.error(`Error en middleware de ${resourceType}:`, error)
      res.status(500).json({
        status: "error",
        error: "Error interno del servidor",
      })
    }
  }
}

// Middleware para operaciones de compra (solo usuarios autenticados)
const requireUserForPurchase = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      error: "Debes estar autenticado para realizar compras",
    })
  }

  if (req.user.role !== "user" && req.user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      error: "Solo los usuarios pueden realizar compras",
    })
  }

  next()
}

// Middleware para verificar múltiples roles
const requireAnyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        error: "Usuario no autenticado",
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        error: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(", ")}`,
      })
    }

    next()
  }
}

// Middleware para logging de acciones sensibles
const logSensitiveAction = (action) => {
  return (req, res, next) => {
    console.log(
      `[SECURITY LOG] ${new Date().toISOString()} - User ${req.user?.email || "anonymous"} (${req.user?.role || "no-role"}) attempting: ${action}`,
    )
    console.log(`[SECURITY LOG] IP: ${req.ip}, User-Agent: ${req.get("User-Agent")}`)
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
  authenticateWeb,
  requireRole,
  requireAdmin,
  requireAdminWeb,
  requireAdminForProducts,
  requireCartOwnership,
  requireResourceOwnership,
  requireUserForPurchase,
  requireAnyRole,
  logSensitiveAction,
  optionalAuth,
}
