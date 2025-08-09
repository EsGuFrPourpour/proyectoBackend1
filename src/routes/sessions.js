const express = require("express")
const jwt = require("jsonwebtoken")
const { passport, JWT_SECRET } = require("../config/passport")

const router = express.Router()

// POST /api/sessions/register - Registro de usuario
router.post("/register", (req, res, next) => {
  console.log("=== RUTA: Registro de usuario ===")
  console.log("Datos recibidos:", { ...req.body, password: "[HIDDEN]" })

  passport.authenticate("register", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Error en registro:", err)
      return res.status(500).json({
        status: "error",
        error: "Error interno del servidor",
      })
    }

    if (!user) {
      console.log("Registro fallido:", info?.message)
      return res.status(400).json({
        status: "error",
        error: info?.message || "Error en el registro",
      })
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    console.log("Registro exitoso, token generado")
    res.status(201).json({
      status: "success",
      message: "Usuario registrado exitosamente",
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
        cart: user.cart,
      },
    })
  })(req, res, next)
})

// POST /api/sessions/login - Login de usuario
router.post("/login", (req, res, next) => {
  console.log("=== RUTA: Login de usuario ===")
  console.log("Email:", req.body.email)

  passport.authenticate("login", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Error en login:", err)
      return res.status(500).json({
        status: "error",
        error: "Error interno del servidor",
      })
    }

    if (!user) {
      console.log("Login fallido:", info?.message)
      return res.status(401).json({
        status: "error",
        error: info?.message || "Credenciales inválidas",
      })
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    console.log("Login exitoso, token generado")
    res.json({
      status: "success",
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
        cart: user.cart,
      },
    })
  })(req, res, next)
})

// GET /api/sessions/current - Obtener usuario actual
router.get("/current", (req, res, next) => {
  console.log("=== RUTA: Usuario actual ===")
  console.log("Authorization header:", req.headers.authorization)

  passport.authenticate("current", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Error validando usuario actual:", err)
      return res.status(500).json({
        status: "error",
        error: "Error interno del servidor",
      })
    }

    if (!user) {
      console.log("Token inválido o usuario no encontrado:", info?.message)
      return res.status(401).json({
        status: "error",
        error: info?.message || "Token inválido o expirado",
      })
    }

    console.log("Usuario actual válido:", user.email)
    res.json({
      status: "success",
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
        cart: user.cart,
      },
    })
  })(req, res, next)
})

// POST /api/sessions/logout - Logout (invalidar token del lado cliente)
router.post("/logout", (req, res) => {
  console.log("=== RUTA: Logout ===")
  // Con JWT, el logout se maneja del lado del cliente eliminando el token
  res.json({
    status: "success",
    message: "Logout exitoso. Elimina el token del lado del cliente.",
  })
})

module.exports = router
