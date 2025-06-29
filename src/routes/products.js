const express = require("express")
const ProductManager = require("../managers/ProductManager")
const { emitProductAdded, emitProductUpdated, emitProductDeleted } = require("../socket/socketManager")

const router = express.Router()
const productManager = new ProductManager()

router.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts()
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" })
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
      thumbnails,
    })

    // Emitir evento Socket.IO
    emitProductAdded(newProduct)

    res.status(201).json(newProduct)
  } catch (error) {
    console.error("Error creating product:", error)
    res.status(500).json({ error: "Error al crear el producto" })
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
    res.status(500).json({ error: "Error al actualizar el producto" })
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
    res.status(500).json({ error: "Error al eliminar el producto" })
  }
})

module.exports = router
