/**
 * Wrapper para manejar errores async en controladores
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Wrapper para validar parámetros requeridos
 */
const validateRequired = (fields) => {
  return (req, res, next) => {
    const missingFields = []

    for (const field of fields) {
      if (!req.body[field]) {
        missingFields.push(field)
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `Missing required fields: ${missingFields.join(", ")}`,
      })
    }

    next()
  }
}

/**
 * Wrapper para validar ObjectId de MongoDB
 */
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const mongoose = require("mongoose")
    const id = req.params[paramName]

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid ${paramName} format`,
      })
    }

    next()
  }
}

module.exports = {
  asyncHandler,
  validateRequired,
  validateObjectId,
}
