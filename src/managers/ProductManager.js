const Product = require("../models/Product")

class ProductManager {
  constructor() {
    if (ProductManager.instance) {
      return ProductManager.instance
    }
    console.log("ProductManager MongoDB creado")
    ProductManager.instance = this
    return this
  }

  async addProduct(productData) {
    console.log("=== INICIO addProduct MongoDB ===")
    console.log("Datos del producto:", productData)

    try {
      // Verificar si el código ya existe
      const existingProduct = await Product.findOne({ code: productData.code })
      if (existingProduct) {
        throw new Error(`Ya existe un producto con el código: ${productData.code}`)
      }

      const newProduct = new Product(productData)
      const savedProduct = await newProduct.save()

      console.log("Producto guardado en MongoDB:", savedProduct)
      console.log("=== FIN addProduct EXITOSO ===")

      return savedProduct
    } catch (error) {
      console.error("=== ERROR EN addProduct ===")
      console.error("Error:", error.message)
      throw error
    }
  }

  async getProducts(options = {}) {
    console.log("=== OBTENIENDO PRODUCTOS CON OPCIONES ===")
    console.log("Opciones recibidas:", options)

    try {
      const { limit = 10, page = 1, sort, query, category, status } = options

      // Construir filtro
      const filter = {}

      if (query) {
        filter.$or = [{ title: { $regex: query, $options: "i" } }, { description: { $regex: query, $options: "i" } }]
      }

      if (category) {
        filter.category = { $regex: category, $options: "i" }
      }

      if (status !== undefined) {
        filter.status = status
      }

      console.log("Filtro aplicado:", filter)

      // Construir opciones de ordenamiento
      const sortOptions = {}
      if (sort) {
        if (sort === "asc") {
          sortOptions.price = 1
        } else if (sort === "desc") {
          sortOptions.price = -1
        }
      }

      console.log("Ordenamiento aplicado:", sortOptions)

      // Configurar paginación
      const options_pagination = {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        sort: sortOptions,
        lean: true,
      }

      console.log("Opciones de paginación:", options_pagination)

      const result = await Product.paginate(filter, options_pagination)

      console.log("Resultado de paginación:", {
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        page: result.page,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      })

      // Formatear respuesta según requerimientos
      const response = {
        status: "success",
        payload: result.docs,
        totalPages: result.totalPages,
        prevPage: result.hasPrevPage ? result.page - 1 : null,
        nextPage: result.hasNextPage ? result.page + 1 : null,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.hasPrevPage ? this.buildLink(options, result.page - 1) : null,
        nextLink: result.hasNextPage ? this.buildLink(options, result.page + 1) : null,
      }

      console.log("=== RESPUESTA FORMATEADA ===")
      return response
    } catch (error) {
      console.error("Error obteniendo productos:", error)
      return {
        status: "error",
        payload: [],
        totalPages: 0,
        prevPage: null,
        nextPage: null,
        page: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevLink: null,
        nextLink: null,
        error: error.message,
      }
    }
  }

  buildLink(options, page) {
    const params = new URLSearchParams()
    params.append("page", page)

    if (options.limit && options.limit !== 10) params.append("limit", options.limit)
    if (options.sort) params.append("sort", options.sort)
    if (options.query) params.append("query", options.query)
    if (options.category) params.append("category", options.category)
    if (options.status !== undefined) params.append("status", options.status)

    return `/api/products?${params.toString()}`
  }

  async getProductById(id) {
    console.log("Buscando producto por ID:", id)
    try {
      const product = await Product.findById(id)
      console.log("Producto encontrado:", product ? "Sí" : "No")
      return product
    } catch (error) {
      console.error("Error buscando producto por ID:", error)
      return null
    }
  }

  async updateProduct(id, updatedFields) {
    console.log("=== ACTUALIZANDO PRODUCTO ===")
    console.log("ID:", id)
    console.log("Campos a actualizar:", updatedFields)

    try {
      // No permitir actualizar el código si ya existe en otro producto
      if (updatedFields.code) {
        const existingProduct = await Product.findOne({
          code: updatedFields.code,
          _id: { $ne: id },
        })
        if (existingProduct) {
          throw new Error(`Ya existe un producto con el código: ${updatedFields.code}`)
        }
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, updatedFields, { new: true, runValidators: true })

      console.log("Producto actualizado:", updatedProduct ? "Sí" : "No")
      return updatedProduct
    } catch (error) {
      console.error("Error actualizando producto:", error)
      throw error
    }
  }

  async deleteProduct(id) {
    console.log("=== ELIMINANDO PRODUCTO ===")
    console.log("ID:", id)

    try {
      const deletedProduct = await Product.findByIdAndDelete(id)
      console.log("Producto eliminado:", deletedProduct ? "Sí" : "No")
      return deletedProduct !== null
    } catch (error) {
      console.error("Error eliminando producto:", error)
      throw error
    }
  }

  // Método para obtener productos simples (sin paginación) para vistas
  async getProductsSimple() {
    try {
      const products = await Product.find({ status: true }).lean()
      return products
    } catch (error) {
      console.error("Error obteniendo productos simples:", error)
      return []
    }
  }
}

// Crear instancia singleton
const productManagerInstance = new ProductManager()

module.exports = productManagerInstance
