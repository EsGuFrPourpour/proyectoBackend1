/**
 * Data Transfer Objects para Usuario
 * Filtran información sensible y estructuran las respuestas
 */

class UserDTO {
  constructor(user) {
    this.id = user._id
    this.first_name = user.first_name
    this.last_name = user.last_name
    this.email = user.email
    this.age = user.age
    this.role = user.role
    this.createdAt = user.createdAt
    this.updatedAt = user.updatedAt
  }

  static fromUser(user) {
    return new UserDTO(user)
  }
}

class UserCurrentDTO {
  constructor(user) {
    this.id = user._id
    this.first_name = user.first_name
    this.last_name = user.last_name
    this.email = user.email
    this.role = user.role
    this.full_name = `${user.first_name} ${user.last_name}`
  }

  static fromUser(user) {
    return new UserCurrentDTO(user)
  }
}

module.exports = {
  UserDTO,
  UserCurrentDTO,
}

