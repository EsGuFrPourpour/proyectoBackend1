const jwt = require("jsonwebtoken")
const { JWT_SECRET } = require("../config/passport")
const { UserDTO, UserCurrentDTO } = require("../dto/UserDTO")

/**
 * Controller para registro de usuarios
 */
const registerController = (req, res) => {
  console.log("=== CONTROLLER: Registro ===")

  // Si hay error de Passport, devolverlo
  if (req.passportError) {
    return res.status(req.passportError.status).json({
      status: "error",
      error: req.passportError.message,
    })
  }

  const user = req.user

  // Generar JWT
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  )

  console.log("Registro exitoso, token generado")
  res.status(201).json({
    status: "success",
    message: "Usuario registrado exitosamente",
    token,
    user: UserDTO.fromUser(user),
  })
}

/**
 * Controller para login de usuarios
 */
const loginController = (req, res) => {
  console.log("=== CONTROLLER: Login ===")

  // Si hay error de Passport, devolverlo
  if (req.passportError) {
    return res.status(req.passportError.status).json({
      status: "error",
      error: req.passportError.message,
    })
  }

  const user = req.user

  // Generar JWT
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  )

  console.log("Login exitoso, token generado")
  res.json({
    status: "success",
    message: "Login exitoso",
    token,
    user: UserDTO.fromUser(user),
  })
}

/**
 * Controller para obtener usuario actual
 */
const currentController = (req, res) => {
  console.log("=== CONTROLLER: Usuario Actual ===")

  // Si hay error de Passport, devolverlo
  if (req.passportError) {
    return res.status(req.passportError.status).json({
      status: "error",
      error: req.passportError.message,
    })
  }

  const user = req.user

  console.log("Usuario actual válido:", user.email)
  res.json({
    status: "success",
    user: UserCurrentDTO.fromUser(user),
  })
}

/**
 * Controller para logout
 */
const logoutController = (req, res) => {
  console.log("=== CONTROLLER: Logout ===")
  // Con JWT, el logout se maneja del lado del cliente eliminando el token
  res.json({
    status: "success",
    message: "Logout exitoso. Elimina el token del lado del cliente.",
  })
}

module.exports = {
  registerController,
  loginController,
  currentController,
  logoutController,
}
