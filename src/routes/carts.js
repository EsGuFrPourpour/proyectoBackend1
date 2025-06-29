const express = require("express")
const CartManager = require("../managers/CartManager")
const ProductManager = require("../managers/ProductManager")
const {
  emitProductAddedToCart,
  emitCartUpdated,
  emitProductRemovedFromCart,
  emitProductQuantityUpdated,
} = require("../socket/socketManager")

const router = express.Router()
const cartManager = new CartManager()
const productManager = new ProductManager()

// Crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.createCart()
    res.status(201).json(newCart)
  } catch (error) {
    console.error("Error creating cart:", error)
    res.status(500).json({ error: "Error al crear el carrito" })
  }
})

// Obtener un carrito por ID con información detallada de productos
router.get("/:cid", async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid)
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" })

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

    const response = {
      id: cart.id,
      products: cartWithProductDetails,
      totalItems: cartWithProductDetails.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: cartWithProductDetails.reduce((sum, item) => sum + item.total, 0),
    }

    res.json(response)
  } catch (error) {
    console.error("Error getting cart:", error)
    res.status(500).json({ error: "Error al obtener el carrito" })
  }
})

// Agregar producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  console.log("=== RUTA: Agregar producto al carrito ===")
  console.log("Cart ID:", req.params.cid)
  console.log("Product ID:", req.params.pid)

  try {
    const cart = await cartManager.addProductToCart(req.params.cid, req.params.pid)

    if (!cart) {
      console.log("Carrito no encontrado, enviando 404")
      return res.status(404).json({ error: "Carrito no encontrado" })
    }

    console.log("Producto agregado exitosamente, emitiendo eventos Socket.IO")

    // Obtener información del producto para el evento
    const product = await productManager.getProductById(req.params.pid)

    // Emitir eventos Socket.IO
    emitProductAddedToCart(req.params.cid, req.params.pid)
    emitCartUpdated(req.params.cid, cart)

    console.log("Enviando respuesta exitosa")
    res.json(cart)
  } catch (error) {
    console.error("Error en ruta add to cart:", error)
    res.status(500).json({
      error: "Error al agregar el producto al carrito",
      details: error.message,
    })
  }
})

// Eliminar producto del carrito
router.delete("/:cid/product/:pid", async (req, res) => {
  console.log("=== RUTA: Eliminar producto del carrito ===")
  console.log("Cart ID:", req.params.cid)
  console.log("Product ID:", req.params.pid)

  try {
    const cart = await cartManager.removeProductFromCart(req.params.cid, req.params.pid)

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" })
    }

    console.log("Producto eliminado exitosamente, emitiendo eventos Socket.IO")
    // Emitir eventos Socket.IO
    emitProductRemovedFromCart(req.params.cid, req.params.pid)
    emitCartUpdated(req.params.cid, cart)

    res.json(cart)
  } catch (error) {
    console.error("Error removing product from cart:", error)
    res.status(500).json({ error: "Error al eliminar el producto del carrito" })
  }
})

// Actualizar cantidad de producto en carrito
router.put("/:cid/product/:pid", async (req, res) => {
  console.log("=== RUTA: Actualizar cantidad en carrito ===")
  console.log("Cart ID:", req.params.cid)
  console.log("Product ID:", req.params.pid)
  console.log("Nueva cantidad:", req.body.quantity)

  try {
    const { quantity } = req.body

    if (!quantity || quantity < 0) {
      return res.status(400).json({ error: "La cantidad debe ser un número mayor a 0" })
    }

    const cart = await cartManager.updateProductQuantity(req.params.cid, req.params.pid, quantity)

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" })
    }

    console.log("Cantidad actualizada exitosamente, emitiendo eventos Socket.IO")
    // Emitir eventos Socket.IO
    emitProductQuantityUpdated(req.params.cid, req.params.pid, quantity)
    emitCartUpdated(req.params.cid, cart)

    res.json(cart)
  } catch (error) {
    console.error("Error updating product quantity:", error)
    res.status(500).json({ error: "Error al actualizar la cantidad del producto" })
  }
})

module.exports = router
