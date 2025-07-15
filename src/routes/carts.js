const express = require("express")
const cartManager = require("../managers/CartManager")
const productManager = require("../managers/ProductManager")
const {
  emitProductAddedToCart,
  emitCartUpdated,
  emitProductRemovedFromCart,
  emitProductQuantityUpdated,
} = require("../socket/socketManager")

const router = express.Router()

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
    console.log("=== OBTENIENDO CARRITO PARA API ===")
    const cartWithDetails = await cartManager.getCartWithDetails(req.params.cid)

    if (!cartWithDetails) {
      return res.status(404).json({ error: "Carrito no encontrado" })
    }

    console.log("Respuesta del carrito:", cartWithDetails)
    res.json(cartWithDetails)
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

    // Emitir eventos Socket.IO a TODAS las pestañas conectadas
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

// 🆕 DELETE api/carts/:cid/products/:pid - Eliminar producto específico del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  console.log("=== RUTA: Eliminar producto específico del carrito ===")
  console.log("Cart ID:", req.params.cid)
  console.log("Product ID:", req.params.pid)

  try {
    const cart = await cartManager.removeProductFromCart(req.params.cid, req.params.pid)

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" })
    }

    console.log("Producto eliminado exitosamente, emitiendo eventos Socket.IO")
    // Emitir eventos Socket.IO a TODAS las pestañas conectadas
    emitProductRemovedFromCart(req.params.cid, req.params.pid)
    emitCartUpdated(req.params.cid, cart)

    res.json({
      status: "success",
      message: "Producto eliminado del carrito",
      cart: cart,
    })
  } catch (error) {
    console.error("Error removing product from cart:", error)
    res.status(500).json({
      status: "error",
      error: "Error al eliminar el producto del carrito",
    })
  }
})

// 🆕 PUT api/carts/:cid - Actualizar carrito completo con array de productos
router.put("/:cid", async (req, res) => {
  console.log("=== RUTA: Actualizar carrito completo ===")
  console.log("Cart ID:", req.params.cid)
  console.log("Productos:", req.body.products)

  try {
    const { products } = req.body

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({
        status: "error",
        error: "Se requiere un array de productos en el formato: [{product: 'id', quantity: number}]",
      })
    }

    // Validar formato de productos
    for (const item of products) {
      if (!item.product || !item.quantity || typeof item.quantity !== "number" || item.quantity <= 0) {
        return res.status(400).json({
          status: "error",
          error: "Cada producto debe tener 'product' (ID) y 'quantity' (número mayor a 0)",
        })
      }
    }

    const cart = await cartManager.updateCart(req.params.cid, products)

    if (!cart) {
      return res.status(404).json({
        status: "error",
        error: "Carrito no encontrado",
      })
    }

    // Emitir evento Socket.IO
    emitCartUpdated(req.params.cid, cart)

    res.json({
      status: "success",
      message: "Carrito actualizado exitosamente",
      cart: cart,
    })
  } catch (error) {
    console.error("Error updating cart:", error)
    res.status(500).json({
      status: "error",
      error: error.message,
    })
  }
})

// 🆕 PUT api/carts/:cid/products/:pid - Actualizar SOLO la cantidad de un producto específico
router.put("/:cid/products/:pid", async (req, res) => {
  console.log("=== RUTA: Actualizar cantidad específica en carrito ===")
  console.log("Cart ID:", req.params.cid)
  console.log("Product ID:", req.params.pid)
  console.log("Nueva cantidad:", req.body.quantity)

  try {
    const { quantity } = req.body

    if (!quantity || typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({
        status: "error",
        error: "La cantidad debe ser un número mayor a 0",
      })
    }

    const result = await cartManager.updateProductQuantity(req.params.cid, req.params.pid, quantity)

    if (!result) {
      return res.status(404).json({
        status: "error",
        error: "Carrito o producto no encontrado",
      })
    }

    console.log("Cantidad actualizada exitosamente, emitiendo eventos Socket.IO")

    // Emitir eventos Socket.IO con información detallada
    emitProductQuantityUpdated(req.params.cid, req.params.pid, {
      quantity: result.newQuantity,
      unitPrice: result.unitPrice,
      subtotal: result.newSubtotal,
    })
    emitCartUpdated(req.params.cid, result.cart)

    res.json({
      status: "success",
      message: "Cantidad actualizada exitosamente",
      data: {
        productId: result.productId,
        newQuantity: result.newQuantity,
        unitPrice: result.unitPrice,
        newSubtotal: result.newSubtotal,
      },
    })
  } catch (error) {
    console.error("Error updating product quantity:", error)
    res.status(500).json({
      status: "error",
      error: error.message,
    })
  }
})

// 🆕 DELETE api/carts/:cid - Eliminar todos los productos del carrito
router.delete("/:cid", async (req, res) => {
  console.log("=== RUTA: Vaciar carrito completo ===")
  console.log("Cart ID:", req.params.cid)

  try {
    const cart = await cartManager.clearCart(req.params.cid)

    if (!cart) {
      return res.status(404).json({
        status: "error",
        error: "Carrito no encontrado",
      })
    }

    // Emitir evento Socket.IO
    emitCartUpdated(req.params.cid, cart)

    res.json({
      status: "success",
      message: "Carrito vaciado exitosamente",
      cart: cart,
    })
  } catch (error) {
    console.error("Error clearing cart:", error)
    res.status(500).json({
      status: "error",
      error: "Error al vaciar el carrito",
    })
  }
})

// 🔄 MANTENER COMPATIBILIDAD - Rutas existentes con estructura anterior
router.delete("/:cid/product/:pid", async (req, res) => {
  // Redirigir a la nueva ruta estándar
  req.url = req.url.replace("/product/", "/products/")
  router.handle(req, res)
})

router.put("/:cid/product/:pid", async (req, res) => {
  // Redirigir a la nueva ruta estándar
  req.url = req.url.replace("/product/", "/products/")
  router.handle(req, res)
})

module.exports = router
