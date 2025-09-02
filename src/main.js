// Load environment variables first
require("./config/environment")

const express = require("express")
const exphbs = require("express-handlebars")
const path = require("path")
const { Server } = require("socket.io")
const { setSocketIO } = require("./socket/socketManager")
const database = require("./config/database")
const config = require("./config/environment")
const logger = require("./utils/logger")
const { globalErrorHandler } = require("./utils/errorHandler")
const { setupSecurity } = require("./middleware/security")

// Importar configuración de Passport
const { passport } = require("./config/passport")

// Importar rutas
const productRouter = require("./routes/products")
const cartRouter = require("./routes/carts")
const viewsRouter = require("./routes/views")
const sessionsRouter = require("./routes/sessions")
const usersRouter = require("./routes/users")
const passwordRouter = require("./routes/password")
const purchaseRouter = require("./routes/purchase")
const ordersRouter = require("./routes/orders")

const app = express()

// Configurar Handlebars con helpers
const hbs = exphbs.create({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
  helpers: {
    eq: (a, b) => a === b,
    ne: (a, b) => a !== b,
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
    and: (a, b) => a && b,
    or: (a, b) => a || b,
    formatDate: (date) => {
      if (!date) return "N/A"
      const d = new Date(date)
      return d.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    },
    substring: (str, start, length) => {
      if (!str) return ""
      return str.toString().substring(start, start + length)
    },
    multiply: (a, b) => {
      const numA = Number.parseFloat(a) || 0
      const numB = Number.parseFloat(b) || 0
      return (numA * numB).toFixed(2)
    },
  },
})

app.engine("handlebars", hbs.engine)
app.set("view engine", "handlebars")
app.set("views", path.join(__dirname, "views"))

setupSecurity(app)

// Middlewares básicos
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(express.static(path.join(__dirname, "public")))

// Inicializar Passport
app.use(passport.initialize())

app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  })
  next()
})

// Conectar a MongoDB y iniciar servidor
async function startServer() {
  try {
    logger.info("Starting server initialization...")

    // Conectar a la base de datos
    await database.connect()
    logger.info("Database connected successfully")

    if (config.isDevelopment) {
      try {
        const seedUsers = require("./scripts/seedUsers")
        await seedUsers()
        logger.info("User seed completed")
      } catch (error) {
        logger.warn("User seed already executed or error occurred", error)
      }
    }

    app.use("/api/products", productRouter)
    app.use("/api/carts", cartRouter)
    app.use("/api/sessions", sessionsRouter)
    app.use("/api/users", usersRouter)
    app.use("/api/password", passwordRouter)
    app.use("/api/purchase", purchaseRouter)
    app.use("/api/orders", ordersRouter)
    app.use("/", viewsRouter)

    app.all("*", (req, res, next) => {
      const { AppError } = require("./utils/errorHandler")
      next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
    })

    app.use(globalErrorHandler)

    // Crear servidor HTTP
    const server = app.listen(config.PORT, () => {
      logger.info(`Server running on http://localhost:${config.PORT}`)
      logger.info(`Database: MongoDB`)
      logger.info(`Environment: ${config.NODE_ENV}`)
      logger.info("\nAvailable URLs:")
      logger.info(`   🏠 Products: http://localhost:${config.PORT}/products`)
      logger.info(`   ⚡ Management: http://localhost:${config.PORT}/realtimeproducts`)
      logger.info(`   📡 API Products: http://localhost:${config.PORT}/api/products`)
      logger.info(`   🔐 API Sessions: http://localhost:${config.PORT}/api/sessions`)
      logger.info(`   👥 API Users: http://localhost:${config.PORT}/api/users`)
      logger.info(`   🛒 API Purchase: http://localhost:${config.PORT}/api/purchase`)
      logger.info(`   🔑 API Password: http://localhost:${config.PORT}/api/password`)
      logger.info(`   📦 API Orders: http://localhost:${config.PORT}/api/orders`)
    })

    // Configurar Socket.IO
    const io = new Server(server, {
      cors: {
        origin: config.FRONTEND_URL,
        methods: ["GET", "POST"],
      },
    })

    // Configurar el socket manager
    setSocketIO(io)

    io.on("connection", (socket) => {
      logger.info("Socket.IO client connected", { socketId: socket.id })

      // Manejar creación de productos por WebSocket (solo admin)
      socket.on("create_product", async (productData) => {
        try {
          // Verificar autenticación del socket
          const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "")

          if (!token) {
            socket.emit("product_created_error", { error: "Autenticación requerida" })
            return
          }

          // Verificar token y rol de admin
          const jwt = require("jsonwebtoken")
          const decoded = jwt.verify(token, process.env.JWT_SECRET)

          if (!decoded || decoded.role !== "admin") {
            socket.emit("product_created_error", { error: "Solo los administradores pueden crear productos" })
            return
          }

          const ProductRepository = require("./repositories/ProductRepository")
          const productRepository = ProductRepository

          console.log(`Creando producto por WebSocket por admin: ${decoded.email}`)
          const newProduct = await productRepository.createProduct(productData)

          // Emitir a todos los clientes
          io.emit("product_added", newProduct)

          // Confirmar al cliente que envió
          socket.emit("product_created_success", newProduct)
        } catch (error) {
          console.error("Error creando producto por WebSocket:", error)
          socket.emit("product_created_error", { error: error.message })
        }
      })

      // Manejar eliminación de productos por WebSocket (solo admin)
      socket.on("delete_product", async (productId) => {
        try {
          // Verificar autenticación del socket
          const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "")

          if (!token) {
            socket.emit("product_deleted_error", { error: "Autenticación requerida" })
            return
          }

          // Verificar token y rol de admin
          const jwt = require("jsonwebtoken")
          const decoded = jwt.verify(token, process.env.JWT_SECRET)

          if (!decoded || decoded.role !== "admin") {
            socket.emit("product_deleted_error", { error: "Solo los administradores pueden eliminar productos" })
            return
          }

          if (!productId || typeof productId !== "string" || productId.trim() === "") {
            console.error("ID de producto inválido recibido:", productId)
            socket.emit("product_deleted_error", { error: "ID de producto inválido" })
            return
          }

          // Validar que sea un ObjectId válido de MongoDB
          const mongoose = require("mongoose")
          if (!mongoose.Types.ObjectId.isValid(productId)) {
            console.error("ID de producto no es un ObjectId válido:", productId)
            socket.emit("product_deleted_error", { error: "ID de producto no válido" })
            return
          }

          const ProductRepository = require("./repositories/ProductRepository")
          const productRepository = ProductRepository

          console.log(`Eliminando producto por WebSocket por admin: ${decoded.email}`)
          const deleted = await productRepository.deleteProduct(productId)

          if (deleted) {
            // Emitir a todos los clientes
            io.emit("product_deleted", { pid: productId })

            // Confirmar al cliente que envió
            socket.emit("product_deleted_success", { pid: productId })
          } else {
            socket.emit("product_deleted_error", { error: "Producto no encontrado" })
          }
        } catch (error) {
          console.error("Error eliminando producto por WebSocket:", error)
          socket.emit("product_deleted_error", { error: error.message })
        }
      })

      socket.on("disconnect", () => {
        logger.info("Socket.IO client disconnected", { socketId: socket.id })
      })
    })

    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`)

      server.close(async () => {
        logger.info("HTTP server closed")

        try {
          await database.disconnect()
          logger.info("Database connection closed")
          process.exit(0)
        } catch (error) {
          logger.error("Error during graceful shutdown", error)
          process.exit(1)
        }
      })
    }

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
    process.on("SIGINT", () => gracefulShutdown("SIGINT"))
  } catch (error) {
    logger.error("Failed to start server", error)
    process.exit(1)
  }
}

process.on("unhandledRejection", (err, promise) => {
  logger.error("Unhandled Promise Rejection", err)
  process.exit(1)
})

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", err)
  process.exit(1)
})

startServer()
