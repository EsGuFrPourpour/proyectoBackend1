const ProductDAO = require("../dao/ProductDAO")

class ProductRepository {
  async createProduct(productData) {
    try {
      return await ProductDAO.create(productData)
    } catch (error) {
      throw error
    }
  }

  async getProductById(id) {
    try {
      return await ProductDAO.findById(id)
    } catch (error) {
      throw error
    }
  }

  async getAllProducts(filter = {}, options = {}) {
    try {
      const products = await ProductDAO.findAll(filter, options)
      const total = await ProductDAO.countDocuments(filter)

      return {
        products,
        total,
        hasNextPage: options.skip + options.limit < total,
        hasPrevPage: options.skip > 0,
      }
    } catch (error) {
      throw error
    }
  }

  async updateProduct(id, updateData) {
    try {
      return await ProductDAO.update(id, updateData)
    } catch (error) {
      throw error
    }
  }

  async deleteProduct(id) {
    try {
      const deletedProduct = await ProductDAO.delete(id)
      return deletedProduct !== null
    } catch (error) {
      throw error
    }
  }

  async updateProductStock(id, quantity) {
    try {
      return await ProductDAO.updateStock(id, quantity)
    } catch (error) {
      throw error
    }
  }

  async checkProductStock(id, requiredQuantity) {
    try {
      const product = await ProductDAO.findById(id)
      if (!product) {
        throw new Error("Product not found")
      }

      return product.stock >= requiredQuantity
    } catch (error) {
      throw error
    }
  }
}

module.exports = new ProductRepository()
