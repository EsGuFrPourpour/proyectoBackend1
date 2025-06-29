const fs = require("fs").promises
const path = require("path")

class ProductManager {
  constructor() {
    this.path = path.join(__dirname, "../data/products.json")
    this.products = []
    this.initialized = false
  }

  async init() {
    if (!this.initialized) {
      await this.loadProducts()
      this.initialized = true
    }
  }

  async loadProducts() {
    try {
      console.log("Cargando productos desde:", this.path)
      const data = await fs.readFile(this.path, "utf-8")
      this.products = JSON.parse(data)
      console.log("Productos cargados:", this.products.length)
    } catch (error) {
      console.error("Error loading products:", error.message)
      this.products = []
    }
  }

  async saveProducts() {
    try {
      console.log("Guardando productos...")
      await fs.writeFile(this.path, JSON.stringify(this.products, null, 2))
      console.log("Productos guardados exitosamente")
    } catch (error) {
      console.error("Error saving products:", error)
      throw error
    }
  }

  generateId() {
    const id = this.products.length ? Math.max(...this.products.map((p) => p.id)) + 1 : 1
    console.log("ID generado para producto:", id)
    return id
  }

  async addProduct(product) {
    console.log("=== INICIO addProduct ===")
    console.log("Datos del producto:", product)

    try {
      await this.init()
      console.log("ProductManager inicializado")

      const newProduct = {
        id: this.generateId(),
        title: product.title,
        description: product.description,
        code: product.code,
        price: product.price,
        status: product.status ?? true,
        stock: product.stock,
        category: product.category,
        thumbnails: product.thumbnails || [],
      }

      console.log("Nuevo producto creado:", newProduct)

      this.products.push(newProduct)
      console.log("Producto agregado al array, total productos:", this.products.length)

      await this.saveProducts()
      console.log("Producto guardado en archivo")

      console.log("=== FIN addProduct EXITOSO ===")
      return newProduct
    } catch (error) {
      console.error("=== ERROR EN addProduct ===")
      console.error("Error:", error)
      console.error("Stack:", error.stack)
      throw error
    }
  }

  async getProducts() {
    await this.init()
    return this.products
  }

  async getProductById(id) {
    await this.init()
    return this.products.find((p) => p.id === Number.parseInt(id))
  }

  async updateProduct(id, updatedFields) {
    await this.init()
    const index = this.products.findIndex((p) => p.id === Number.parseInt(id))
    if (index === -1) return null

    const product = this.products[index]
    this.products[index] = {
      ...product,
      ...updatedFields,
      id: product.id, // No se actualiza el ID
    }

    await this.saveProducts()
    return this.products[index]
  }

  async deleteProduct(id) {
    console.log("=== INICIO deleteProduct ===")
    console.log("ID a eliminar:", id)

    try {
      await this.init()
      const index = this.products.findIndex((p) => p.id === Number.parseInt(id))
      console.log("Índice encontrado:", index)

      if (index === -1) {
        console.log("Producto no encontrado")
        return false
      }

      this.products.splice(index, 1)
      console.log("Producto eliminado del array, total productos:", this.products.length)

      await this.saveProducts()
      console.log("Cambios guardados en archivo")

      console.log("=== FIN deleteProduct EXITOSO ===")
      return true
    } catch (error) {
      console.error("=== ERROR EN deleteProduct ===")
      console.error("Error:", error)
      throw error
    }
  }
}

module.exports = ProductManager
