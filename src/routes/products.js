const express = require("express")
const router = express.Router()
const productRepository = require("../repositories/ProductRepository")
const { authenticateJWT, requireAdmin } = require("../middleware/auth")
const { asyncHandler } = require("../utils/asyncHandler")
const logger = require("../utils/logger")

// GET /api/products - Obtener productos con paginación y filtros
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { limit = 10, page = 1, sort, query, category, status } = req.query

    const options = {
      limit: Number.parseInt(limit),
      page: Number.parseInt(page),
      sort: sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {},
      query: query || "",
      category: category || "",
      status: status !== undefined ? status === "true" : undefined,
    }

    const result = await productRepository.getAllProducts({}, options)

    logger.info(`Products retrieved: ${result.products.length} products`)
    res.json({
      status: "success",
      payload: result.products,
      total: result.total,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    })
  }),
)

// GET /api/products/:pid - Obtener producto por ID
router.get(
  "/:pid",
  asyncHandler(async (req, res) => {
    const { pid } = req.params
    const product = await productRepository.getProductById(pid)

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      })
    }

    logger.info(`Product retrieved: ${product.title}`)
    res.json({
      status: "success",
      payload: product,
    })
  }),
)

// POST /api/products - Crear producto (solo admin)
router.post(
  "/",
  authenticateJWT,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const productData = req.body
    const newProduct = await productRepository.createProduct(productData)

    logger.info(`Product created: ${newProduct.title} by admin ${req.user.email}`)
    res.status(201).json({
      status: "success",
      message: "Producto creado exitosamente",
      payload: newProduct,
    })
  }),
)

// PUT /api/products/:pid - Actualizar producto (solo admin)
router.put(
  "/:pid",
  authenticateJWT,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { pid } = req.params
    const updateData = req.body

    const updatedProduct = await productRepository.updateProduct(pid, updateData)

    if (!updatedProduct) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      })
    }

    logger.info(`Product updated: ${updatedProduct.title} by admin ${req.user.email}`)
    res.json({
      status: "success",
      message: "Producto actualizado exitosamente",
      payload: updatedProduct,
    })
  }),
)

// DELETE /api/products/:pid - Eliminar producto (solo admin)
router.delete(
  "/:pid",
  authenticateJWT,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { pid } = req.params
    const deletedProduct = await productRepository.deleteProduct(pid)

    if (!deletedProduct) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      })
    }

    logger.info(`Product deleted: ${deletedProduct.title} by admin ${req.user.email}`)
    res.json({
      status: "success",
      message: "Producto eliminado exitosamente",
    })
  }),
)

module.exports = router
