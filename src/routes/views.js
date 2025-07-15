const express = require("express")
const productManager = require("../managers/ProductManager")
const cartManager = require("../managers/CartManager")

const router = express.Router()

// Ruta principal - redirigir a productos
router.get("/", (req, res) => {
  res.redirect("/products")
})

// 🆕 Ruta para productos con paginación y filtros
router.get("/products", async (req, res) => {
  try {
    console.log("=== CARGANDO VISTA DE PRODUCTOS CON FILTROS ===")
    console.log("Query params:", req.query)

    const options = {
      limit: req.query.limit || 10,
      page: req.query.page || 1,
      sort: req.query.sort,
      query: req.query.query,
      category: req.query.category,
      status: req.query.status !== undefined ? req.query.status === "true" : undefined,
    }

    const result = await productManager.getProducts(options)
    console.log("Resultado de productos:", result.status, result.payload?.length || 0)

    // Pasar todos los datos necesarios a la vista
    res.render("products", {
      ...result,
      query: req.query.query || "",
      category: req.query.category || "",
      sort: req.query.sort || "",
      limit: req.query.limit || "10",
    })
  } catch (error) {
    console.error("Error loading products:", error)
    res.render("products", {
      status: "error",
      error: "Error al cargar los productos",
      payload: [],
      totalPages: 0,
      page: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevLink: null,
      nextLink: null,
    })
  }
})

// 🆕 Ruta para detalle de producto individual
router.get("/products/:pid", async (req, res) => {
  try {
    console.log("=== CARGANDO DETALLE DE PRODUCTO ===")
    console.log("Product ID:", req.params.pid)

    // Validar que el ID sea un ObjectId válido
    const mongoose = require("mongoose")
    if (!mongoose.Types.ObjectId.isValid(req.params.pid)) {
      console.log("ID de producto inválido")
      return res.status(400).send("ID de producto inválido")
    }

    const product = await productManager.getProductById(req.params.pid)

    if (!product) {
      console.log("Producto no encontrado")
      return res.status(404).send("Producto no encontrado")
    }

    console.log("Producto encontrado:", product.title)
    res.render("product-detail", { product })
  } catch (error) {
    console.error("Error loading product detail:", error)
    res.status(500).send("Error al cargar el detalle del producto")
  }
})

// Ruta para productos en tiempo real
router.get("/realtimeproducts", async (req, res) => {
  try {
    console.log("Accediendo a /realtimeproducts")
    const result = await productManager.getProducts({ limit: 50 })
    console.log("Productos cargados:", result.payload?.length || 0)
    res.render("realTimeProducts", { products: result.payload || [] })
  } catch (error) {
    console.error("Error loading real-time products:", error)
    res.status(500).send("Error al cargar los productos en tiempo real")
  }
})

// Ruta para vista del carrito
router.get("/cart/:cid", async (req, res) => {
  try {
    console.log("=== CARGANDO VISTA DEL CARRITO ===")
    console.log("Carrito ID:", req.params.cid)

    // Validar que el ID sea un ObjectId válido
    const mongoose = require("mongoose")
    if (!mongoose.Types.ObjectId.isValid(req.params.cid)) {
      console.log("ID de carrito inválido")
      return res.status(400).send("ID de carrito inválido")
    }

    const cartWithDetails = await cartManager.getCartWithDetails(req.params.cid)

    if (!cartWithDetails) {
      console.log("Carrito no encontrado")
      return res.status(404).send("Carrito no encontrado")
    }

    console.log("Carrito encontrado con detalles:", {
      id: cartWithDetails.id,
      totalItems: cartWithDetails.totalItems,
      totalPrice: cartWithDetails.totalPrice,
      productsCount: cartWithDetails.products.length,
    })

    res.render("cart", {
      products: cartWithDetails.products,
      cartId: req.params.cid,
      total: cartWithDetails.totalPrice,
      totalItems: cartWithDetails.totalItems,
    })
  } catch (error) {
    console.error("Error loading cart:", error)
    res.status(500).send("Error al cargar el carrito")
  }
})

module.exports = router
