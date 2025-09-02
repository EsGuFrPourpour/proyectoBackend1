const { passport } = require("../config/passport")

/**
 * Función utilitaria para manejar autenticación con Passport
 * Evita repetir código en las rutas
 * @param {string} strategy - Nombre de la estrategia de Passport
 * @returns {Function} Middleware de Express
 */
const passportCall = (strategy) => {
  return (req, res, next) => {
    console.log(`=== PASSPORT CALL: ${strategy.toUpperCase()} ===`)

    passport.authenticate(strategy, { session: false }, (err, user, info) => {
      // Manejo de errores del servidor
      if (err) {
        console.error(`Error en estrategia ${strategy}:`, err)
        req.passportError = {
          status: 500,
          message: "Error interno del servidor",
        }
        return next()
      }

      // Manejo de autenticación fallida
      if (!user) {
        console.log(`${strategy} fallido:`, info?.message)
        req.passportError = {
          status: strategy === "current" ? 401 : strategy === "login" ? 401 : 400,
          message: info?.message || `Error en ${strategy}`,
        }
        return next()
      }

      // Autenticación exitosa
      console.log(`${strategy} exitoso para:`, user.email || user._id)
      req.user = user
      next()
    })(req, res, next)
  }
}

module.exports = {
  passportCall,
}
