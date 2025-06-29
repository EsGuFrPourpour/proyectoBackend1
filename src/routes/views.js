const express = require("express")
const ProductManager = require("../managers/ProductManager")
const CartManager = require("../managers/CartManager")

const router = express.Router()
const productManager = new ProductManager()
const cartManager = new CartManager()

router.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts()
    res.render("products", { products })
  } catch (error) {
    console.error("Error loading products:", error)
    res.status(500).send("Error al cargar los productos")
  }
})

// Ruta para productos en tiempo real
router.get("/realtimeproducts", async (req, res) => {
  try {
    console.log("Accediendo a /realtimeproducts")
    const products = await productManager.getProducts()
    console.log("Productos cargados:", products.length)
    res.render("realTimeProducts", { products })
  } catch (error) {
    console.error("Error loading real-time products:", error)
    res.status(500).send("Error al cargar los productos en tiempo real")
  }
})

router.get("/cart/:cid", async (req, res) => {
  try {
    console.log("Cargando carrito:", req.params.cid)
    const cart = await cartManager.getCartById(req.params.cid)

    if (!cart) {
      console.log("Carrito no encontrado")
      return res.status(404).send("Carrito no encontrado")
    }

    console.log("Carrito encontrado:", cart)

    // Obtener información detallada de los productos
    const cartWithProductDetails = []

    for (const item of cart.products) {
      const product = await productManager.getProductById(item.product)
      if (product) {
        cartWithProductDetails.push({
          ...product,
          quantity: item.quantity,
          total: product.price * item.quantity,
        })
      }
    }

    console.log("Productos del carrito con detalles:", cartWithProductDetails)

    const totalCart = cartWithProductDetails.reduce((sum, item) => sum + item.total, 0)

    res.render("cart", {
      products: cartWithProductDetails,
      cartId: req.params.cid,
      total: totalCart,
    })
  } catch (error) {
    console.error("Error loading cart:", error)
    res.status(500).send("Error al cargar el carrito")
  }
})

module.exports = router
