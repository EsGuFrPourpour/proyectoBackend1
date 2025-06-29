// JavaScript específico para la página del carrito
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
    currentCartId = Number.parseInt(pathParts[2])
    console.log("Cart ID detectado:", currentCartId)
  }

  // Inicializar Socket.IO solo si estamos en la página del carrito
  if (window.io && currentCartId) {
    cartSocket = window.io()
    setupCartSocketEvents()
  }
})

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
    }
  })

  cartSocket.on("product_removed_from_cart", (data) => {
    console.log("Evento product_removed_from_cart recibido:", data)
    if (data.cartId == currentCartId) {
      console.log("Eliminando producto del DOM:", data.productId)
      // Eliminar el elemento del DOM
      const productElement = document.querySelector(`[data-product-id="${data.productId}"]`)
      if (productElement) {
        productElement.remove()
        updateCartTotal()
        checkIfCartEmpty()
        showCartNotification("Producto eliminado", "success")
      }
    }
  })

  cartSocket.on("product_quantity_updated", (data) => {
    console.log("Evento product_quantity_updated recibido:", data)
    if (data.cartId == currentCartId) {
      console.log("Actualizando cantidad en DOM:", data)
      // Actualizar la cantidad en el DOM
      const quantityElement = document.querySelector(`.quantity[data-product-id="${data.productId}"]`)
      if (quantityElement) {
        quantityElement.textContent = data.quantity

        // Actualizar el subtotal
        const unitPriceElement = document.querySelector(`[data-product-id="${data.productId}"] .unit-price`)
        const subtotalElement = document.querySelector(`.subtotal[data-product-id="${data.productId}"]`)

        if (unitPriceElement && subtotalElement) {
          const unitPrice = Number.parseFloat(unitPriceElement.textContent)
          const newSubtotal = unitPrice * data.quantity
          subtotalElement.textContent = newSubtotal.toFixed(2)
        }

        // Actualizar los botones de cantidad
        const cartItem = document.querySelector(`[data-product-id="${data.productId}"]`)
        if (cartItem) {
          const minusButton = cartItem.querySelector(".btn-quantity:first-of-type")
          const plusButton = cartItem.querySelector(".btn-quantity:last-of-type")

          if (minusButton) {
            minusButton.setAttribute(
              "onclick",
              `updateQuantity(${currentCartId}, ${data.productId}, ${data.quantity}, -1)`,
            )
          }
          if (plusButton) {
            plusButton.setAttribute(
              "onclick",
              `updateQuantity(${currentCartId}, ${data.productId}, ${data.quantity}, 1)`,
            )
          }
        }

        updateCartTotal()
        showCartNotification("Cantidad actualizada", "success")
      }
    }
  })

  cartSocket.on("cart_updated", (data) => {
    console.log("Evento cart_updated recibido:", data)
    if (data.cartId == currentCartId) {
      console.log("Carrito actualizado:", data.cart)
    }
  })

  cartSocket.on("disconnect", () => {
    console.log("Desconectado de Socket.IO desde el carrito")
  })
}

// Funciones para manejar el carrito
async function removeFromCart(cartId, productId) {
  if (confirm("¿Estás seguro de que quieres eliminar este producto del carrito?")) {
    try {
      console.log(`Eliminando producto ${productId} del carrito ${cartId}`)
      const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        showCartNotification("Eliminando producto...", "info")
        // No recargamos la página, Socket.IO se encargará de actualizar
      } else {
        showCartNotification("Error al eliminar el producto", "error")
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
      console.log("Petición de actualización enviada correctamente")
      // No recargamos la página, Socket.IO se encargará de actualizar
    } else {
      showCartNotification("Error al actualizar la cantidad", "error")
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

// Función para actualizar el total del carrito
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

// Función para verificar si el carrito está vacío
function checkIfCartEmpty() {
  const cartItems = document.getElementById("cart-items")
  if (cartItems && cartItems.children.length === 0) {
    // El carrito está vacío, mostrar mensaje
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
