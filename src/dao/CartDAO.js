const Cart = require("../models/Cart")
const mongoose = require("mongoose")

class CartDAO {
  async create(cartData = { products: [] }) {
    try {
      const newCart = new Cart(cartData)
      return await newCart.save()
    } catch (error) {
      throw new Error(`Error creating cart: ${error.message}`)
    }
  }

  async findById(id) {
    try {
      if (!id || id === "[object Object]" || !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ObjectId: ${id}`)
      }

      return await Cart.findById(id).populate("products.product")
    } catch (error) {
      throw new Error(`Error finding cart by ID: ${error.message}`)
    }
  }

  async update(id, updateData) {
    try {
      if (!id || id === "[object Object]" || !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ObjectId: ${id}`)
      }

      return await Cart.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("products.product")
    } catch (error) {
      throw new Error(`Error updating cart: ${error.message}`)
    }
  }

  async delete(id) {
    try {
      return await Cart.findByIdAndDelete(id)
    } catch (error) {
      throw new Error(`Error deleting cart: ${error.message}`)
    }
  }

  async addProduct(cartId, productId, quantity) {
    try {
      return await Cart.findByIdAndUpdate(
        cartId,
        {
          $push: {
            products: { product: productId, quantity },
          },
        },
        { new: true },
      ).populate("products.product")
    } catch (error) {
      throw new Error(`Error adding product to cart: ${error.message}`)
    }
  }

  async updateProductQuantity(cartId, productId, quantity) {
    try {
      return await Cart.findOneAndUpdate(
        { _id: cartId, "products.product": productId },
        { $set: { "products.$.quantity": quantity } },
        { new: true },
      ).populate("products.product")
    } catch (error) {
      throw new Error(`Error updating product quantity in cart: ${error.message}`)
    }
  }

  async removeProduct(cartId, productId) {
    try {
      return await Cart.findByIdAndUpdate(
        cartId,
        { $pull: { products: { product: productId } } },
        { new: true },
      ).populate("products.product")
    } catch (error) {
      throw new Error(`Error removing product from cart: ${error.message}`)
    }
  }

  async clearCart(cartId) {
    try {
      return await Cart.findByIdAndUpdate(cartId, { products: [] }, { new: true })
    } catch (error) {
      throw new Error(`Error clearing cart: ${error.message}`)
    }
  }
}

module.exports = new CartDAO()
