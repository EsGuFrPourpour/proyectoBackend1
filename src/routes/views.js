const express = require("express")
const productManager = require("../managers/ProductManager")
const cartManager = require("../managers/CartManager")

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const result = await productManager.getProducts()
    // Usar result.payload en lugar de result directamente
    res.render("products", { products: result.payload || [] })
  } catch (error) {
    console.error("Error loading products:", error)
    res.status(500).send("Error al cargar los productos")
  }
})

// Ruta para productos en tiempo real
router.get("/realtimeproducts", async (req, res) => {
  try {
    console.log("Accediendo a /realtimeproducts")
    const result = await productManager.getProducts()
    console.log("Productos cargados:", result.payload?.length || 0)
    res.render("realTimeProducts", { products: result.payload || [] })
  } catch (error) {
    console.error("Error loading real-time products:", error)
    res.status(500).send("Error al cargar los productos en tiempo real")
  }
})

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

    console.log("Carrito encontrado con detalles:", cartWithDetails)

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
