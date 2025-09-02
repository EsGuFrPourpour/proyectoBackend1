const express = require("express")
const router = express.Router()
const CartRepository = require("../repositories/CartRepository")
const ProductRepository = require("../repositories/ProductRepository")
const UserRepository = require("../repositories/UserRepository")
const { authenticateJWT } = require("../middleware/auth")
const { asyncHandler } = require("../utils/asyncHandler")
const logger = require("../utils/logger")

const cartRepository = CartRepository
const productRepository = ProductRepository
const userRepository = UserRepository

const ensureUserHasCart = async (user) => {
  if (!user.cart) {
    const newCart = await cartRepository.createCart()
    await userRepository.updateUser(user._id, { cart: newCart._id })
    user.cart = newCart._id
    return newCart._id
  }
  return user.cart
}

// GET /api/carts/my-cart - Obtener carrito del usuario autenticado
router.get(
  "/my-cart",
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const cartId = await ensureUserHasCart(req.user)
    const cart = await cartRepository.getCartById(cartId)

    logger.info(`User cart retrieved: ${cart._id} for user ${req.user.email}`)
    res.json({
      status: "success",
      payload: cart,
    })
  }),
)

// POST /api/carts/my-cart/products/:pid - Agregar producto al carrito del usuario
router.post(
  "/my-cart/products/:pid",
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const { pid } = req.params
    const { quantity = 1 } = req.body

    const cartId = await ensureUserHasCart(req.user)

    // Verificar que el producto existe y tiene stock
    const product = await productRepository.getProductById(pid)
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      })
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        status: "error",
        message: "Stock insuficiente",
      })
    }

    const updatedCart = await cartRepository.addProductToCart(cartId, pid, quantity)

    logger.info(`Product added to user cart: ${pid} by user ${req.user.email}`)
    res.json({
      status: "success",
      message: "Producto agregado al carrito exitosamente",
      payload: updatedCart,
    })
  }),
)

// PUT /api/carts/my-cart/products/:pid - Actualizar cantidad de producto en carrito del usuario
router.put(
  "/my-cart/products/:pid",
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const { pid } = req.params
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "La cantidad debe ser mayor a 0",
      })
    }

    const cartId = await ensureUserHasCart(req.user)
    const updatedCart = await cartRepository.updateProductQuantity(cartId, pid, quantity)

    logger.info(`Product quantity updated in user cart: ${pid} by user ${req.user.email}`)
    res.json({
      status: "success",
      message: "Cantidad actualizada exitosamente",
      payload: updatedCart,
    })
  }),
)

// DELETE /api/carts/my-cart/products/:pid - Eliminar producto del carrito del usuario
router.delete(
  "/my-cart/products/:pid",
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const { pid } = req.params

    const cartId = await ensureUserHasCart(req.user)
    const updatedCart = await cartRepository.removeProductFromCart(cartId, pid)

    logger.info(`Product removed from user cart: ${pid} by user ${req.user.email}`)
    res.json({
      status: "success",
      message: "Producto eliminado del carrito exitosamente",
      payload: updatedCart,
    })
  }),
)

// DELETE /api/carts/my-cart - Vaciar carrito del usuario
router.delete(
  "/my-cart",
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const cartId = await ensureUserHasCart(req.user)
    const clearedCart = await cartRepository.clearCart(cartId)

    logger.info(`User cart cleared by user ${req.user.email}`)
    res.json({
      status: "success",
      message: "Carrito vaciado exitosamente",
      payload: clearedCart,
    })
  }),
)

// GET /api/carts/:cid - Obtener carrito por ID (legacy)
router.get(
  "/:cid",
  asyncHandler(async (req, res) => {
    const { cid } = req.params
    const cart = await cartRepository.getCartById(cid)

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Carrito no encontrado",
      })
    }

    res.json({
      status: "success",
      payload: cart,
    })
  }),
)

module.exports = router
