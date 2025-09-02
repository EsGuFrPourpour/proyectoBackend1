const User = require("../models/User")

class UserDAO {
  async create(userData) {
    try {
      const newUser = new User(userData)
      return await newUser.save()
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`)
    }
  }

  async findById(id) {
    try {
      return await User.findById(id).populate("cart")
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`)
    }
  }

  async findByEmail(email) {
    try {
      return await User.findOne({ email }).populate("cart")
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`)
    }
  }

  async update(id, updateData) {
    try {
      return await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("cart")
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`)
    }
  }

  async delete(id) {
    try {
      return await User.findByIdAndDelete(id)
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`)
    }
  }

  async findAll() {
    try {
      return await User.find().populate("cart")
    } catch (error) {
      throw new Error(`Error finding all users: ${error.message}`)
    }
  }

  async findByResetToken(token) {
    try {
      return await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      })
    } catch (error) {
      throw new Error(`Error finding user by reset token: ${error.message}`)
    }
  }
}

module.exports = new UserDAO()
