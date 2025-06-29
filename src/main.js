const express = require("express")
const exphbs = require("express-handlebars")
const path = require("path")
const { Server } = require("socket.io")
const { setSocketIO } = require("./socket/socketManager")
const productRouter = require("./routes/products")
const cartRouter = require("./routes/carts")
const viewsRouter = require("./routes/views")

const app = express()
const PORT = 8080

// Configurar Handlebars
app.engine("handlebars", exphbs.engine())
app.set("view engine", "handlebars")
app.set("views", path.join(__dirname, "views"))

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

// Rutas
app.use("/api/products", productRouter)
app.use("/api/carts", cartRouter)
app.use("/", viewsRouter)

// Crear servidor HTTP
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
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
      const ProductManager = require("./managers/ProductManager")
      const productManager = new ProductManager()

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
      const ProductManager = require("./managers/ProductManager")
      const productManager = new ProductManager()

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
