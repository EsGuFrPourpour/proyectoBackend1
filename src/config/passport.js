const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const JwtStrategy = require("passport-jwt").Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt
const userManager = require("../managers/UserManager")

// Clave secreta para JWT (en producción debe estar en .env)
const JWT_SECRET = process.env.JWT_SECRET || "mi_clave_secreta_jwt_2024"

// Estrategia Local para Login
passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        console.log("=== ESTRATEGIA LOGIN ===")
        console.log("Email:", email)

        // Buscar usuario por email
        const user = await userManager.getUserByEmail(email)
        if (!user) {
          console.log("Usuario no encontrado")
          return done(null, false, { message: "Usuario no encontrado" })
        }

        // Validar contraseña
        const isValidPassword = await userManager.validatePassword(password, user.password)
        if (!isValidPassword) {
          console.log("Contraseña incorrecta")
          return done(null, false, { message: "Contraseña incorrecta" })
        }

        console.log("Login exitoso para:", user.email)
        // Retornar usuario sin contraseña
        const userResponse = user.toObject()
        delete userResponse.password
        return done(null, userResponse)
      } catch (error) {
        console.error("Error en estrategia login:", error)
        return done(error)
      }
    },
  ),
)

// Estrategia Local para Registro
passport.use(
  "register",
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        console.log("=== ESTRATEGIA REGISTER ===")
        console.log("Datos de registro:", { ...req.body, password: "[HIDDEN]" })

        const { first_name, last_name, age, role } = req.body

        // Validar campos requeridos
        if (!first_name || !last_name || !age) {
          return done(null, false, { message: "Faltan campos obligatorios" })
        }

        // Crear usuario
        const newUser = await userManager.createUser({
          first_name,
          last_name,
          email,
          age: Number.parseInt(age),
          password,
          role: role || "user",
        })

        console.log("Registro exitoso para:", newUser.email)
        return done(null, newUser)
      } catch (error) {
        console.error("Error en estrategia register:", error)
        if (error.message.includes("Ya existe un usuario")) {
          return done(null, false, { message: error.message })
        }
        return done(error)
      }
    },
  ),
)

// Estrategia JWT para validar tokens
passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (jwt_payload, done) => {
      try {
        console.log("=== ESTRATEGIA JWT ===")
        console.log("JWT Payload:", jwt_payload)

        const user = await userManager.getUserById(jwt_payload.id)
        if (user) {
          console.log("Usuario válido desde JWT:", user.email)
          return done(null, user)
        } else {
          console.log("Usuario no encontrado en JWT")
          return done(null, false)
        }
      } catch (error) {
        console.error("Error en estrategia JWT:", error)
        return done(error, false)
      }
    },
  ),
)

// Estrategia "current" para extraer usuario del token
passport.use(
  "current",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (jwt_payload, done) => {
      try {
        console.log("=== ESTRATEGIA CURRENT ===")
        console.log("Validando usuario actual con JWT")

        const user = await userManager.getUserById(jwt_payload.id)
        if (user) {
          console.log("Usuario actual válido:", user.email)
          return done(null, user)
        } else {
          console.log("Token válido pero usuario no existe")
          return done(null, false, { message: "Usuario no encontrado" })
        }
      } catch (error) {
        console.error("Error en estrategia current:", error)
        return done(error, false)
      }
    },
  ),
)

// Serialización (no necesaria para JWT, pero requerida por Passport)
passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userManager.getUserById(id)
    done(null, user)
  } catch (error) {
    done(error)
  }
})

module.exports = { passport, JWT_SECRET }
