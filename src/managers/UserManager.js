const UserRepository = require("../repositories/UserRepository")

class UserManager {
  async createUser(userData) {
    return await UserRepository.createUser(userData)
  }

  async getUserById(id) {
    return await UserRepository.getUserById(id)
  }

  async getUserByEmail(email) {
    return await UserRepository.getUserByEmail(email)
  }

  async validatePassword(plainPassword, hashedPassword) {
    return await UserRepository.validatePassword(plainPassword, hashedPassword)
  }

  async updateUser(id, updateData) {
    return await UserRepository.updateUser(id, updateData)
  }

  async deleteUser(id) {
    return await UserRepository.deleteUser(id)
  }

  async getAllUsers() {
    return await UserRepository.getAllUsers()
  }

  async generatePasswordResetToken(email) {
    return await UserRepository.generatePasswordResetToken(email)
  }

  async resetPassword(token, newPassword, currentPassword) {
    return await UserRepository.resetPassword(token, newPassword, currentPassword)
  }
}

module.exports = new UserManager()

