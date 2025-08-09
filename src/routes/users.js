const express = require("express")
const userManager = require("../managers/UserManager")
const { passport } = require("../config/passport")

const router = express.Router()

// Middleware para proteger rutas (requiere autenticación)
const requireAuth = (req, res, next) => {
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

// Middleware para requerir rol admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      error: "Acceso denegado. Se requiere rol de administrador",
    })
  }
  next()
}

// GET /api/users - Obtener todos los usuarios (solo admin)
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log("=== OBTENIENDO TODOS LOS USUARIOS ===")
    const users = await userManager.getAllUsers()
    res.json({
      status: "success",
      users,
    })
  } catch (error) {
    console.error("Error obteniendo usuarios:", error)
    res.status(500).json({
      status: "error",
      error: "Error al obtener usuarios",
    })
  }
})

// GET /api/users/:uid - Obtener usuario por ID
router.get("/:uid", requireAuth, async (req, res) => {
  try {
    console.log("=== OBTENIENDO USUARIO POR ID ===")
    console.log("User ID:", req.params.uid)

    // Solo admin puede ver cualquier usuario, users solo pueden verse a sí mismos
    if (req.user.role !== "admin" && req.user._id.toString() !== req.params.uid) {
      return res.status(403).json({
        status: "error",
        error: "No tienes permisos para ver este usuario",
      })
    }

    const user = await userManager.getUserById(req.params.uid)
    if (!user) {
      return res.status(404).json({
        status: "error",
        error: "Usuario no encontrado",
      })
    }

    res.json({
      status: "success",
      user,
    })
  } catch (error) {
    console.error("Error obteniendo usuario:", error)
    res.status(500).json({
      status: "error",
      error: "Error al obtener usuario",
    })
  }
})

// PUT /api/users/:uid - Actualizar usuario
router.put("/:uid", requireAuth, async (req, res) => {
  try {
    console.log("=== ACTUALIZANDO USUARIO ===")
    console.log("User ID:", req.params.uid)

    // Solo admin puede actualizar cualquier usuario, users solo pueden actualizarse a sí mismos
    if (req.user.role !== "admin" && req.user._id.toString() !== req.params.uid) {
      return res.status(403).json({
        status: "error",
        error: "No tienes permisos para actualizar este usuario",
      })
    }

    // Los usuarios normales no pueden cambiar su rol
    if (req.user.role !== "admin" && req.body.role) {
      delete req.body.role
    }

    const updatedUser = await userManager.updateUser(req.params.uid, req.body)
    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        error: "Usuario no encontrado",
      })
    }

    res.json({
      status: "success",
      message: "Usuario actualizado exitosamente",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error actualizando usuario:", error)
    res.status(500).json({
      status: "error",
      error: error.message,
    })
  }
})

// DELETE /api/users/:uid - Eliminar usuario (solo admin)
router.delete("/:uid", requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log("=== ELIMINANDO USUARIO ===")
    console.log("User ID:", req.params.uid)

    const deleted = await userManager.deleteUser(req.params.uid)
    if (!deleted) {
      return res.status(404).json({
        status: "error",
        error: "Usuario no encontrado",
      })
    }

    res.json({
      status: "success",
      message: "Usuario eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error eliminando usuario:", error)
    res.status(500).json({
      status: "error",
      error: "Error al eliminar usuario",
    })
  }
})

module.exports = router
