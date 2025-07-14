console.log("Cargando cart.js")

// Variables globales para el carrito
let cartSocket = null
let currentCartId = null

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM del carrito cargado")

  // Obtener el ID del carrito desde la URL
  const pathParts = window.location.pathname.split("/")
  if (pathParts[1] === "cart" && pathParts[2]) {
    currentCartId = pathParts[2]
    console.log("Cart ID detectado:", currentCartId)
  }

  // Inicializar Socket.IO solo si estamos en la página del carrito
  if (window.io && currentCartId) {
    cartSocket = window.io()
    setupCartSocketEvents()
  }

  // Configurar event listeners
  setupEventListeners()
})

// Configurar todos los event listeners
function setupEventListeners() {
  // Event listener para botones de incrementar cantidad
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-increase")) {
      e.preventDefault()
      const cartId = e.target.dataset.cartId
      const productId = e.target.dataset.productId
      const currentQuantity = Number.parseInt(e.target.dataset.currentQuantity)
      updateQuantity(cartId, productId, currentQuantity, 1)
    }
  })

  // Event listener para botones de decrementar cantidad
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-decrease")) {
      e.preventDefault()
      const cartId = e.target.dataset.cartId
      const productId = e.target.dataset.productId
      const currentQuantity = Number.parseInt(e.target.dataset.currentQuantity)
      updateQuantity(cartId, productId, currentQuantity, -1)
    }
  })

  // Event listener para botones de eliminar
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-remove")) {
      e.preventDefault()
      const cartId = e.target.dataset.cartId
      const productId = e.target.dataset.productId
      removeFromCart(cartId, productId)
    }
  })

  // Event listener para botón de checkout
  document.addEventListener("click", (e) => {
    if (e.target.id === "checkout-btn") {
      e.preventDefault()
      checkout()
    }
  })
}

// Configurar eventos Socket.IO para el carrito
function setupCartSocketEvents() {
  if (!cartSocket) return

  cartSocket.on("connect", () => {
    console.log("Conectado a Socket.IO desde el carrito")
  })

  cartSocket.on("product_added_to_cart", (data) => {
    console.log("Evento product_added_to_cart recibido:", data)
    if (data.cartId == currentCartId) {
      showCartNotification(`Producto añadido al carrito`, "success")
      // Recargar la página para mostrar el nuevo producto
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  })

  cartSocket.on("product_removed_from_cart", (data) => {
    console.log("Evento product_removed_from_cart recibido:", data)
    if (data.cartId == currentCartId) {
      const productElement = document.querySelector(`[data-product-id="${data.productId}"]`)
      if (productElement) {
        productElement.style.transition = "opacity 0.3s ease"
        productElement.style.opacity = "0"
        setTimeout(() => {
          productElement.remove()
          updateCartTotal()
          checkIfCartEmpty()
          showCartNotification("Producto eliminado", "success")
        }, 300)
      }
    }
  })

  cartSocket.on("product_quantity_updated", (data) => {
    console.log("Evento product_quantity_updated recibido:", data)
    if (data.cartId == currentCartId) {
      updateQuantityInDOM(data.productId, data.quantity, data.unitPrice, data.subtotal)
      showCartNotification("Cantidad actualizada", "success")
    }
  })

  cartSocket.on("disconnect", () => {
    console.log("Desconectado de Socket.IO desde el carrito")
  })
}

// Función para actualizar cantidad en el DOM
function updateQuantityInDOM(productId, newQuantity, unitPrice, newSubtotal) {
  console.log("Actualizando DOM:", { productId, newQuantity, unitPrice, newSubtotal })

  // Actualizar el span de cantidad
  const quantityElement = document.querySelector(`.quantity[data-product-id="${productId}"]`)
  if (quantityElement) {
    quantityElement.textContent = newQuantity
    console.log("Cantidad actualizada en DOM")
  }

  // Actualizar los data attributes de los botones
  const buttons = document.querySelectorAll(`[data-product-id="${productId}"].btn-quantity`)
  buttons.forEach((button) => {
    button.dataset.currentQuantity = newQuantity
    console.log("Data attribute actualizado:", button.dataset.currentQuantity)
  })

  // Actualizar el subtotal
  const subtotalElement = document.querySelector(`.subtotal[data-product-id="${productId}"]`)
  if (subtotalElement && newSubtotal !== undefined) {
    subtotalElement.textContent = newSubtotal.toFixed(2)
    console.log("Subtotal actualizado en DOM")
  }

  // Actualizar el total general
  updateCartTotal()
}

// Funciones para manejar el carrito
async function removeFromCart(cartId, productId) {
  if (confirm("¿Estás seguro de que quieres eliminar este producto del carrito?")) {
    try {
      console.log(`Eliminando producto ${productId} del carrito ${cartId}`)
      showCartNotification("Eliminando producto...", "info")

      const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        console.log("Producto eliminado exitosamente")
        // El evento Socket.IO se encargará de actualizar la UI
      } else {
        const errorData = await response.json()
        showCartNotification(`Error: ${errorData.error}`, "error")
      }
    } catch (error) {
      console.error("Error:", error)
      showCartNotification("Error al conectar con el servidor", "error")
    }
  }
}

async function updateQuantity(cartId, productId, currentQuantity, change) {
  const newQuantity = currentQuantity + change

  console.log(`Actualizando cantidad: ${currentQuantity} + ${change} = ${newQuantity}`)

  if (newQuantity <= 0) {
    removeFromCart(cartId, productId)
    return
  }

  try {
    showCartNotification("Actualizando cantidad...", "info")

    const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity: newQuantity }),
    })

    if (response.ok) {
      const result = await response.json()
      console.log("Petición de actualización enviada correctamente:", result)
      // El evento Socket.IO se encargará de actualizar la UI
    } else {
      const errorData = await response.json()
      showCartNotification(`Error: ${errorData.error}`, "error")
    }
  } catch (error) {
    console.error("Error:", error)
    showCartNotification("Error al conectar con el servidor", "error")
  }
}

function checkout() {
  alert("Funcionalidad de checkout no implementada aún")
}

function showCartNotification(message, type = "info") {
  const notificationsDiv = document.getElementById("notifications")
  if (notificationsDiv) {
    notificationsDiv.innerHTML = `<p class="${type}">${message}</p>`

    setTimeout(() => {
      notificationsDiv.innerHTML = ""
    }, 3000)
  }
}

function updateCartTotal() {
  let total = 0
  const subtotalElements = document.querySelectorAll(".subtotal")

  subtotalElements.forEach((element) => {
    const subtotal = Number.parseFloat(element.textContent)
    if (!isNaN(subtotal)) {
      total += subtotal
    }
  })

  const totalElement = document.getElementById("cart-total")
  if (totalElement) {
    totalElement.textContent = total.toFixed(2)
  }

  console.log("Total actualizado:", total)
}

function checkIfCartEmpty() {
  const cartItems = document.getElementById("cart-items")
  if (cartItems && cartItems.children.length === 0) {
    const cartContainer = document.querySelector(".cart-container")
    if (cartContainer) {
      cartContainer.innerHTML = `
        <div class="empty-cart">
          <p>El carrito está vacío.</p>
          <a href="/" class="btn-shop">Ver Productos</a>
        </div>
      `
    }
  }
}
