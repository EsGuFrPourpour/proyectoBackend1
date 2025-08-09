const User = require("../models/User")
const Cart = require("../models/Cart")
const bcrypt = require("bcrypt")

class UserManager {
  constructor() {
    if (UserManager.instance) {
      return UserManager.instance
    }
    console.log("UserManager MongoDB creado")
    UserManager.instance = this
    return this
  }

  async createUser(userData) {
    console.log("=== CREANDO NUEVO USUARIO ===")
    console.log("Datos del usuario:", { ...userData, password: "[HIDDEN]" })

    try {
      // Verificar si el email ya existe
      const existingUser = await User.findOne({ email: userData.email })
      if (existingUser) {
        throw new Error(`Ya existe un usuario con el email: ${userData.email}`)
      }

      // Encriptar la contraseña
      const hashedPassword = bcrypt.hashSync(userData.password, 10)

      // Crear carrito para el usuario
      const newCart = new Cart({ products: [] })
      const savedCart = await newCart.save()

      // Crear usuario con contraseña encriptada y carrito asignado
      const newUser = new User({
        ...userData,
        password: hashedPassword,
        cart: savedCart._id,
      })

      const savedUser = await newUser.save()
      console.log("Usuario creado exitosamente:", savedUser.email)

      // Retornar usuario sin contraseña
      const userResponse = savedUser.toObject()
      delete userResponse.password
      return userResponse
    } catch (error) {
      console.error("Error creando usuario:", error.message)
      throw error
    }
  }

  async getUserById(id) {
    try {
      const user = await User.findById(id).populate("cart").select("-password")
      return user
    } catch (error) {
      console.error("Error obteniendo usuario por ID:", error)
      return null
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await User.findOne({ email }).populate("cart")
      return user
    } catch (error) {
      console.error("Error obteniendo usuario por email:", error)
      return null
    }
  }

  async validatePassword(plainPassword, hashedPassword) {
    try {
      return bcrypt.compareSync(plainPassword, hashedPassword)
    } catch (error) {
      console.error("Error validando contraseña:", error)
      return false
    }
  }

  async updateUser(id, updateData) {
    try {
      // Si se actualiza la contraseña, encriptarla
      if (updateData.password) {
        updateData.password = bcrypt.hashSync(updateData.password, 10)
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).select("-password")

      return updatedUser
    } catch (error) {
      console.error("Error actualizando usuario:", error)
      throw error
    }
  }

  async deleteUser(id) {
    try {
      const deletedUser = await User.findByIdAndDelete(id)
      return deletedUser !== null
    } catch (error) {
      console.error("Error eliminando usuario:", error)
      throw error
    }
  }

  async getAllUsers() {
    try {
      const users = await User.find().populate("cart").select("-password")
      return users
    } catch (error) {
      console.error("Error obteniendo todos los usuarios:", error)
      return []
    }
  }
}

// Crear instancia singleton
const userManagerInstance = new UserManager()

module.exports = userManagerInstance
