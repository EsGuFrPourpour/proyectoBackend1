let io

const setSocketIO = (socketInstance) => {
  io = socketInstance
  console.log("Socket.IO configurado correctamente")
}

const getSocketIO = () => {
  if (!io) {
    console.error("Socket.IO no ha sido inicializado")
    return null
  }
  return io
}

const emitProductAdded = (product) => {
  if (io) {
    io.emit("product_added", product)
    console.log("Evento product_added emitido:", product.title)
  }
}

const emitProductUpdated = (product) => {
  if (io) {
    io.emit("product_updated", product)
    console.log("Evento product_updated emitido:", product.title)
  }
}

const emitProductDeleted = (productId) => {
  if (io) {
    io.emit("product_deleted", { pid: productId })
    console.log("Evento product_deleted emitido:", productId)
  }
}

const emitProductAddedToCart = (cartId, productId) => {
  if (io) {
    const eventData = { cartId, productId, timestamp: new Date() }
    io.emit("product_added_to_cart", eventData)
    console.log("Evento product_added_to_cart emitido:", eventData)
  }
}

const emitCartUpdated = (cartId, cart) => {
  if (io) {
    const eventData = { cartId, cart, timestamp: new Date() }
    io.emit("cart_updated", eventData)
    console.log("Evento cart_updated emitido para carrito:", cartId)
  }
}

const emitProductRemovedFromCart = (cartId, productId) => {
  if (io) {
    const eventData = { cartId, productId, timestamp: new Date() }
    io.emit("product_removed_from_cart", eventData)
    console.log("Evento product_removed_from_cart emitido:", eventData)
  }
}

const emitProductQuantityUpdated = (cartId, productId, quantityData) => {
  if (io) {
    const eventData = {
      cartId,
      productId,
      ...quantityData,
      timestamp: new Date(),
    }
    io.emit("product_quantity_updated", eventData)
    console.log("Evento product_quantity_updated emitido:", eventData)
  }
}

module.exports = {
  setSocketIO,
  getSocketIO,
  emitProductAdded,
  emitProductUpdated,
  emitProductDeleted,
  emitProductAddedToCart,
  emitCartUpdated,
  emitProductRemovedFromCart,
  emitProductQuantityUpdated,
}
