const Product = require("../models/Product")

class ProductDAO {
  async create(productData) {
    try {
      const newProduct = new Product(productData)
      return await newProduct.save()
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`)
    }
  }

  async findById(id) {
    try {
      return await Product.findById(id)
    } catch (error) {
      throw new Error(`Error finding product by ID: ${error.message}`)
    }
  }

  async findAll(filter = {}, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = {} } = options
      return await Product.find(filter).limit(limit).skip(skip).sort(sort)
    } catch (error) {
      throw new Error(`Error finding products: ${error.message}`)
    }
  }

  async update(id, updateData) {
    try {
      return await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`)
    }
  }

  async delete(id) {
    try {
      return await Product.findByIdAndDelete(id)
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`)
    }
  }

  async countDocuments(filter = {}) {
    try {
      return await Product.countDocuments(filter)
    } catch (error) {
      throw new Error(`Error counting products: ${error.message}`)
    }
  }

  async updateStock(id, quantity) {
    try {
      return await Product.findByIdAndUpdate(id, { $inc: { stock: -quantity } }, { new: true })
    } catch (error) {
      throw new Error(`Error updating product stock: ${error.message}`)
    }
  }
}

module.exports = new ProductDAO()
