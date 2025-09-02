class ProductDTO {
  constructor(product) {
    this.id = product._id
    this.title = product.title
    this.description = product.description
    this.code = product.code
    this.price = product.price
    this.status = product.status
    this.stock = product.stock
    this.category = product.category
    this.thumbnails = product.thumbnails
    this.createdAt = product.createdAt
    this.updatedAt = product.updatedAt
  }

  static fromProduct(product) {
    return new ProductDTO(product)
  }

  static fromProducts(products) {
    return products.map((product) => new ProductDTO(product))
  }
}

class ProductListDTO {
  constructor(product) {
    this.id = product._id
    this.title = product.title
    this.price = product.price
    this.stock = product.stock
    this.category = product.category
    this.status = product.status
    this.thumbnails = product.thumbnails?.[0] || null
    // Información mínima para listados
  }

  static fromProducts(products) {
    return products.map((product) => new ProductListDTO(product))
  }
}

class ProductCartDTO {
  constructor(product) {
    this.id = product._id
    this.title = product.title
    this.price = product.price
    this.stock = product.stock
    this.thumbnails = product.thumbnails?.[0] || null
    // Información necesaria para el carrito
  }

  static fromProduct(product) {
    return new ProductCartDTO(product)
  }
}

module.exports = {
  ProductDTO,
  ProductListDTO,
  ProductCartDTO,
}
