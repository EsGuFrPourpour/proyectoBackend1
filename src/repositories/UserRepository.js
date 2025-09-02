const UserDAO = require("../dao/UserDAO")
const CartDAO = require("../dao/CartDAO")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

class UserRepository {
  async createUser(userData) {
    try {
      // Verificar si el email ya existe
      const existingUser = await UserDAO.findByEmail(userData.email)
      if (existingUser) {
        throw new Error(`User with email ${userData.email} already exists`)
      }

      // Encriptar contraseña
      const hashedPassword = bcrypt.hashSync(userData.password, 10)

      // Crear carrito para el usuario
      const newCart = await CartDAO.create()

      // Crear usuario con contraseña encriptada y carrito asignado
      const newUser = await UserDAO.create({
        ...userData,
        password: hashedPassword,
        cart: newCart._id,
      })

      return newUser
    } catch (error) {
      throw error
    }
  }

  async getUserById(id) {
    try {
      return await UserDAO.findById(id)
    } catch (error) {
      throw error
    }
  }

  async getUserByEmail(email) {
    try {
      return await UserDAO.findByEmail(email)
    } catch (error) {
      throw error
    }
  }

  async validatePassword(plainPassword, hashedPassword) {
    try {
      return bcrypt.compareSync(plainPassword, hashedPassword)
    } catch (error) {
      return false
    }
  }

  async updateUser(id, updateData) {
    try {
      // Si se actualiza la contraseña, encriptarla
      if (updateData.password) {
        updateData.password = bcrypt.hashSync(updateData.password, 10)
      }

      return await UserDAO.update(id, updateData)
    } catch (error) {
      throw error
    }
  }

  async deleteUser(id) {
    try {
      const deletedUser = await UserDAO.delete(id)
      return deletedUser !== null
    } catch (error) {
      throw error
    }
  }

  async getAllUsers() {
    try {
      return await UserDAO.findAll()
    } catch (error) {
      throw error
    }
  }

  async generatePasswordResetToken(email) {
    try {
      const user = await UserDAO.findByEmail(email)
      if (!user) {
        throw new Error("User not found")
      }

      // Generar token único
      const resetToken = crypto.randomBytes(32).toString("hex")
      const resetTokenExpiry = Date.now() + 3600000 // 1 hora

      // Actualizar usuario con token
      await UserDAO.update(user._id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      })

      return { user, resetToken }
    } catch (error) {
      throw error
    }
  }

  async resetPassword(token, newPassword, currentPassword) {
    try {
      const user = await UserDAO.findByResetToken(token)
      if (!user) {
        throw new Error("Invalid or expired reset token")
      }

      // Verificar que la nueva contraseña no sea igual a la actual
      const isSamePassword = bcrypt.compareSync(newPassword, user.password)
      if (isSamePassword) {
        throw new Error("New password cannot be the same as current password")
      }

      // Encriptar nueva contraseña
      const hashedPassword = bcrypt.hashSync(newPassword, 10)

      // Actualizar contraseña y limpiar tokens
      await UserDAO.update(user._id, {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      })

      return user
    } catch (error) {
      throw error
    }
  }
}

module.exports = new UserRepository()
