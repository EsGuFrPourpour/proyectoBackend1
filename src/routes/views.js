const express = require("express")
const router = express.Router()
const ProductRepository = require("../repositories/ProductRepository")
const CartRepository = require("../repositories/CartRepository")
const TicketDAO = require("../dao/TicketDAO")
const { asyncHandler } = require("../utils/asyncHandler")
const logger = require("../utils/logger")
const mongoose = require("mongoose")
const { authenticateJWT, requireAdmin, authenticateWeb, requireAdminWeb } = require("../middleware/auth")

const productRepository = ProductRepository
const cartRepository = CartRepository

// GET / - Página principal
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const products = await productRepository.getAllProducts({}, { limit: 6 })

    res.render("home", {
      title: "E-commerce - Inicio",
      products: products.products,
      style: "styles.css",
    })
  }),
)

// GET /products - Catálogo de productos
router.get(
  "/products",
  asyncHandler(async (req, res) => {
    console.log("[v0] Starting products route")
    const { limit = 10, page = 1, sort, query, category } = req.query
    console.log("[v0] Query params:", { limit, page, sort, query, category })

    const filter = {}
    if (query) filter.title = new RegExp(query, "i")
    if (category) filter.category = category
    console.log("[v0] Filter applied:", filter)

    const options = {
      limit: Number.parseInt(limit),
      skip: (Number.parseInt(page) - 1) * Number.parseInt(limit),
      sort: sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {},
    }
    console.log("[v0] Options applied:", options)

    try {
      console.log("[v0] Calling productRepository.getAllProducts...")
      const result = await productRepository.getAllProducts(filter, options)
      console.log("[v0] Products result:", {
        productsCount: result.products.length,
        total: result.total,
        hasNextPage: result.hasNextPage,
      })

      console.log("[v0] ==========================================")
      console.log("[v0] ANÁLISIS DETALLADO DEL STOCK")
      console.log("[v0] ==========================================")

      let productsWithStock = 0
      let productsWithoutStock = 0

      result.products.forEach((product, index) => {
        const hasStock = product.stock && product.stock > 0
        if (hasStock) productsWithStock++
        else productsWithoutStock++

        console.log(`[v0] Producto ${index + 1}: ${product.title}`)
        console.log(`[v0]   - ID: ${product._id}`)
        console.log(`[v0]   - Stock RAW: ${JSON.stringify(product.stock)}`)
        console.log(`[v0]   - Stock valor: ${product.stock}`)
        console.log(`[v0]   - Stock tipo: ${typeof product.stock}`)
        console.log(`[v0]   - Stock === 0: ${product.stock === 0}`)
        console.log(`[v0]   - Stock > 0: ${product.stock > 0}`)
        console.log(`[v0]   - Stock truthy: ${!!product.stock}`)
        console.log(`[v0]   - Handlebars evaluará como: ${hasStock ? "CON STOCK" : "SIN STOCK"}`)
        console.log(`[v0]   - Precio: $${product.price}`)
        console.log(`[v0]   - Categoría: ${product.category}`)
        console.log(`[v0]   - Título: "${product.title}"`)
        console.log(`[v0]   - Descripción: "${product.description}"`)
        console.log(`[v0]   - Thumbnails: ${JSON.stringify(product.thumbnails)}`)
        console.log(`[v0]   - Thumbnails length: ${product.thumbnails ? product.thumbnails.length : "undefined"}`)
        console.log(`[v0]   - Todos los campos: ${JSON.stringify(product, null, 2)}`)
        console.log("[v0]   " + "=".repeat(50))
      })

      console.log(`[v0] RESUMEN FINAL:`)
      console.log(`[v0] - Productos CON stock: ${productsWithStock}`)
      console.log(`[v0] - Productos SIN stock: ${productsWithoutStock}`)
      console.log(`[v0] - Total productos: ${result.products.length}`)
      console.log("[v0] ==========================================")

      console.log("[v0] Getting categories...")
      const allProducts = await productRepository.getAllProducts({}, { limit: 1000 })
      const categories = [...new Set(allProducts.products.map((p) => p.category))]
      console.log("[v0] Categories found:", categories)

      logger.info(`Products page viewed: ${result.products.length} products displayed`)

      const currentPage = Number.parseInt(page)
      const totalPages = Math.ceil(result.total / Number.parseInt(limit))
      const hasPrevPage = currentPage > 1
      const hasNextPage = result.hasNextPage

      // Construir URLs de paginación
      const baseUrl = "/products"
      const queryParams = new URLSearchParams()
      if (query) queryParams.set("query", query)
      if (category) queryParams.set("category", category)
      if (sort) queryParams.set("sort", sort)
      queryParams.set("limit", limit)

      let prevLink = null
      let nextLink = null

      if (hasPrevPage) {
        queryParams.set("page", currentPage - 1)
        prevLink = `${baseUrl}?${queryParams.toString()}`
      }

      if (hasNextPage) {
        queryParams.set("page", currentPage + 1)
        nextLink = `${baseUrl}?${queryParams.toString()}`
      }

      console.log("[v0] Rendering products view...")
      res.render("products", {
        title: "Catálogo de Productos",
        status: "success", // Agregar status success para que la vista muestre los productos
        payload: result.products, // Usar 'payload' en lugar de 'products' como espera la vista
        categories,
        page: currentPage,
        totalPages,
        hasPrevPage,
        hasNextPage,
        prevLink,
        nextLink,
        query,
        category,
        sort,
        limit,
        style: "styles.css",
      })
      console.log("[v0] Products view rendered successfully")
    } catch (error) {
      console.log("[v0] Error in products route:", error)
      logger.error("Error loading products:", error)
      res.status(500).render("products", {
        title: "Catálogo de Productos",
        status: "error",
        error: error.message || "Error al cargar los productos",
        style: "styles.css",
      })
    }
  }),
)

// GET /products/:pid - Detalle de producto
router.get(
  "/products/:pid",
  asyncHandler(async (req, res) => {
    const { pid } = req.params
    const product = await productRepository.getProductById(pid)

    if (!product) {
      return res.status(404).render("error", {
        title: "Producto no encontrado",
        message: "El producto que buscas no existe",
        style: "styles.css",
      })
    }

    logger.info(`Product detail viewed: ${product.title}`)

    res.render("product-detail", {
      title: product.title,
      product,
      style: "styles.css",
    })
  }),
)

// GET /cart/my-cart - Vista del carrito del usuario autenticado
router.get(
  "/cart/my-cart",
  asyncHandler(async (req, res) => {
    try {
      console.log("[v0] Accediendo a /cart/my-cart")

      res.render("cart", {
        title: "Mi Carrito",
        cart: null, // Se cargará dinámicamente desde el frontend
        total: "0.00",
        style: "styles.css",
        isMyCart: true,
      })
    } catch (error) {
      console.log("[v0] Error en ruta /cart/my-cart:", error)
      logger.error(`Error loading cart page:`, error)
      return res.redirect("/products?message=cart_error")
    }
  }),
)

// GET /cart/:cid - Vista del carrito
router.get(
  "/cart/:cid",
  asyncHandler(async (req, res) => {
    const { cid } = req.params

    if (cid === "my-cart") {
      return res.redirect("/cart/my-cart")
    }

    if (
      !cid ||
      cid === "undefined" ||
      cid === "null" ||
      cid === "[object Object]" ||
      cid.length < 24 ||
      !mongoose.Types.ObjectId.isValid(cid)
    ) {
      logger.warn(`Invalid cart ID attempted: ${cid}`)

      // En lugar de mostrar error, redirigir a productos con mensaje
      return res.redirect("/products?message=cart_invalid")
    }

    try {
      const cart = await cartRepository.getCartById(cid)

      if (!cart) {
        logger.warn(`Cart not found: ${cid}`)
        return res.redirect("/products?message=cart_not_found")
      }

      const total = cart.products.reduce((sum, item) => {
        return sum + item.product.price * item.quantity
      }, 0)

      logger.info(`Cart viewed: ${cid}`)

      res.render("cart", {
        title: "Mi Carrito",
        cart,
        total: total.toFixed(2),
        style: "styles.css",
      })
    } catch (error) {
      logger.error(`Error loading cart ${cid}:`, error)
      return res.redirect("/products?message=cart_error")
    }
  }),
)

// GET /realtimeproducts - Gestión de productos en tiempo real (solo admin)
router.get(
  "/realtimeproducts",
  asyncHandler(async (req, res) => {
    const products = await productRepository.getAllProducts({}, { limit: 50 })

    logger.info(`Real-time products page accessed`)

    res.render("realTimeProducts", {
      title: "Gestión de Productos",
      products: products.products,
      style: "styles.css",
    })
  }),
)

// GET /login - Página de login
router.get("/login", (req, res) => {
  res.render("login", {
    title: "Iniciar Sesión",
    style: "styles.css",
  })
})

// GET /register - Página de registro
router.get("/register", (req, res) => {
  res.render("register", {
    title: "Registrarse",
    style: "styles.css",
  })
})

// GET /reset-password - Página de restablecimiento de contraseña
router.get("/reset-password", (req, res) => {
  const { token } = req.query

  if (!token) {
    return res.redirect("/login?error=invalid_token")
  }

  res.render("reset-password", {
    title: "Restablecer Contraseña",
    token,
    style: "styles.css",
  })
})

// GET /profile - Perfil de usuario (requiere autenticación)
router.get("/profile", (req, res) => {
  res.render("profile", {
    title: "Mi Perfil",
    style: "styles.css",
  })
})

// GET /admin/dashboard - Panel de administración (solo admin)
router.get(
  "/admin/dashboard",
  asyncHandler(async (req, res) => {
    try {
      // Obtener estadísticas básicas para el dashboard
      const products = await productRepository.getAllProducts({}, { limit: 1000 })

      const UserRepository = require("../repositories/UserRepository")
      const allUsers = await UserRepository.getAllUsers()
      const usersWithCarts = allUsers.filter((user) => user.cart)

      const totalTickets = await TicketDAO.countDocuments({})

      const stats = {
        totalProducts: products.total || products.products.length,
        totalUsers: allUsers.length,
        totalCarts: usersWithCarts.length, // Conteo real de carritos activos
        totalOrders: totalTickets, // Usar conteo directo de TicketDAO
      }

      logger.info(`Admin dashboard accessed`)

      res.render("admin-dashboard", {
        title: "Panel de Administración",
        stats,
        style: "styles.css",
      })
    } catch (error) {
      logger.error("Error loading admin dashboard:", error)
      res.status(500).render("error", {
        title: "Error del servidor",
        message: "Error al cargar el panel de administración",
        style: "styles.css",
      })
    }
  }),
)

// GET /admin/orders - Vista de órdenes para administrador
router.get(
  "/admin/orders",
  asyncHandler(async (req, res) => {
    try {
      logger.info(`Admin orders page accessed`)

      res.render("admin-orders", {
        title: "Gestión de Órdenes",
        style: "styles.css",
      })
    } catch (error) {
      logger.error("Error loading admin orders:", error)
      res.status(500).render("error", {
        title: "Error del servidor",
        message: "Error al cargar la gestión de órdenes",
        style: "styles.css",
      })
    }
  }),
)

module.exports = router
