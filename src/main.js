// Cargar variables de entorno al inicio
require("dotenv").config()

const express = require("express")
const exphbs = require("express-handlebars")
const path = require("path")
const { Server } = require("socket.io")
const { setSocketIO } = require("./socket/socketManager")
const database = require("./config/database")
const productRouter = require("./routes/products")
const cartRouter = require("./routes/carts")
const viewsRouter = require("./routes/views")

const app = express()
const PORT = process.env.PORT || 8080

// Configurar Handlebars con helpers
const hbs = exphbs.create({
  helpers: {
    eq: (a, b) => a === b,
    ne: (a, b) => a !== b,
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
    and: (a, b) => a && b,
    or: (a, b) => a || b,
  },
})

app.engine("handlebars", hbs.engine)
app.set("view engine", "handlebars")
app.set("views", path.join(__dirname, "views"))

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

// Conectar a MongoDB
async function startServer() {
  try {
    // Conectar a la base de datos
    await database.connect()

    // Rutas
    app.use("/api/products", productRouter)
    app.use("/api/carts", cartRouter)
    app.use("/", viewsRouter)

    // Crear servidor HTTP
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
      console.log(`📊 Base de datos: MongoDB`)
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`)
      console.log(`\n📋 URLs disponibles:`)
      console.log(`   🏠 Productos: http://localhost:${PORT}/products`)
      console.log(`   ⚡ Gestión: http://localhost:${PORT}/realtimeproducts`)
      console.log(`   📡 API: http://localhost:${PORT}/api/products`)
    })

    // Configurar Socket.IO
    const io = new Server(server)

    // Configurar el socket manager
    setSocketIO(io)

    io.on("connection", (socket) => {
      console.log("Cliente Socket.IO conectado:", socket.id)

      // Manejar creación de productos por WebSocket
      socket.on("create_product", async (productData) => {
        try {
          const productManager = require("./managers/ProductManager")

          console.log("Creando producto por WebSocket:", productData)
          const newProduct = await productManager.addProduct(productData)

          // Emitir a todos los clientes
          io.emit("product_added", newProduct)

          // Confirmar al cliente que envió
          socket.emit("product_created_success", newProduct)
        } catch (error) {
          console.error("Error creando producto por WebSocket:", error)
          socket.emit("product_created_error", { error: error.message })
        }
      })

      // Manejar eliminación de productos por WebSocket
      socket.on("delete_product", async (productId) => {
        try {
          const productManager = require("./managers/ProductManager")

          console.log("Eliminando producto por WebSocket:", productId)
          const deleted = await productManager.deleteProduct(productId)

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
        console.log("Cliente Socket.IO desconectado:", socket.id)
      })
    })

    // Manejar cierre graceful
    process.on("SIGINT", async () => {
      console.log("\n🔄 Cerrando servidor...")
      await database.disconnect()
      process.exit(0)
    })
  } catch (error) {
    console.error("❌ Error iniciando servidor:", error)
    process.exit(1)
  }
}

startServer()
