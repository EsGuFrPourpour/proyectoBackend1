const express = require("express")
const productManager = require("../managers/ProductManager") // Importar instancia singleton (SIN new)
const { emitProductAdded, emitProductUpdated, emitProductDeleted } = require("../socket/socketManager")

const router = express.Router()

// GET con query params para paginación, filtros y ordenamiento
router.get("/", async (req, res) => {
  try {
    console.log("=== OBTENIENDO PRODUCTOS CON QUERY PARAMS ===")
    console.log("Query params:", req.query)

    const options = {
      limit: req.query.limit,
      page: req.query.page,
      sort: req.query.sort,
      query: req.query.query,
      category: req.query.category,
      status: req.query.status,
    }

    const result = await productManager.getProducts(options)
    res.json(result)
  } catch (error) {
    console.error("Error obteniendo productos:", error)
    res.status(500).json({
      status: "error",
      error: "Error al obtener productos",
    })
  }
})

router.get("/:pid", async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid)
    if (!product) return res.status(404).json({ error: "Producto no encontrado" })
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" })
  }
})

router.post("/", async (req, res) => {
  try {
    const { title, description, code, price, stock, category, thumbnails } = req.body
    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ error: "Faltan campos obligatorios" })
    }

    const newProduct = await productManager.addProduct({
      title,
      description,
      code,
      price: Number(price),
      stock: Number(stock),
      category,
      thumbnails: thumbnails || [],
    })

    // Emitir evento Socket.IO
    emitProductAdded(newProduct)

    res.status(201).json(newProduct)
  } catch (error) {
    console.error("Error creating product:", error)
    res.status(500).json({ error: error.message })
  }
})

router.put("/:pid", async (req, res) => {
  try {
    const updatedProduct = await productManager.updateProduct(req.params.pid, req.body)
    if (!updatedProduct) return res.status(404).json({ error: "Producto no encontrado" })

    // Emitir evento Socket.IO
    emitProductUpdated(updatedProduct)

    res.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    res.status(500).json({ error: error.message })
  }
})

router.delete("/:pid", async (req, res) => {
  try {
    const deleted = await productManager.deleteProduct(req.params.pid)
    if (!deleted) return res.status(404).json({ error: "Producto no encontrado" })

    // Emitir evento Socket.IO
    emitProductDeleted(req.params.pid)

    res.json({ message: "Producto eliminado" })
  } catch (error) {
    console.error("Error deleting product:", error)
    res.status(500).json({ error: "Error al eliminar el producto" })
  }
})

module.exports = router
