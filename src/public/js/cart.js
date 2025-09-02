console.log("Cargando cart.js")

// Variables globales para el carrito
let cartSocket = null
let currentCartId = null
let realCartId = null // Agregado para almacenar el ID real del carrito

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM del carrito cargado")

  const pathParts = window.location.pathname.split("/")
  if (pathParts[1] === "cart" && pathParts[2] === "my-cart") {
    currentCartId = "my-cart"
    console.log("Cart ID detectado:", currentCartId)

    await loadUserCart()
  }

  // Inicializar Socket.IO solo si estamos en la página del carrito
  if (window.io && currentCartId) {
    cartSocket = window.io()
    setupCartSocketEvents()
  }

  // Configurar event listeners
  setupEventListeners()
})

async function loadUserCart() {
  try {
    const authToken = localStorage.getItem("authToken")
    if (!authToken) {
      console.log("No hay token de autenticación")
      return
    }

    const response = await fetch("/api/carts/my-cart", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const cartData = await response.json()
      if (cartData.status === "success" && cartData.payload) {
        realCartId = cartData.payload._id
        console.log("Carrito real cargado:", realCartId)
        updateCartView(cartData.payload)
      } else {
        console.error("Estructura de respuesta inesperada:", cartData)
      }
    } else {
      console.error("Error al cargar el carrito:", response.status)
    }
  } catch (error) {
    console.error("Error al cargar el carrito:", error)
  }
}

function updateCartView(cart) {
  console.log("[v0] updateCartView llamada con:", cart)
  console.log("[v0] cart.products:", cart.products)
  console.log("[v0] cart.products.length:", cart.products ? cart.products.length : "undefined")

  const cartItemsContainer = document.querySelector(".cart-items")
  if (!cartItemsContainer) {
    console.log("[v0] No se encontró .cart-items container")
    return
  }

  if (!cart.products || cart.products.length === 0) {
    console.log("[v0] Carrito vacío, mostrando mensaje")
    checkIfCartEmpty()
    return
  }

  console.log("[v0] Renderizando", cart.products.length, "productos")

  const groupedProducts = groupProductsById(cart.products)
  console.log("[v0] Productos agrupados:", groupedProducts)

  // Limpiar contenedor actual
  cartItemsContainer.innerHTML = ""

  // Agregar cada producto agrupado
  Object.values(groupedProducts).forEach((groupedItem, index) => {
    console.log("[v0] Procesando producto agrupado", index, ":", groupedItem)
    const productElement = createProductElement(groupedItem)
    cartItemsContainer.appendChild(productElement)
  })

  // Actualizar total
  console.log("[v0] Actualizando total del carrito")
  updateCartTotal()
}

function groupProductsById(products) {
  const grouped = {}

  products.forEach((item) => {
    const productId = item.product._id

    if (grouped[productId]) {
      // Si el producto ya existe, sumar la cantidad
      grouped[productId].quantity += item.quantity
    } else {
      // Si es la primera vez que vemos este producto, agregarlo
      grouped[productId] = {
        product: item.product,
        quantity: item.quantity,
        _id: item._id, // Mantener el ID del item original para operaciones
      }
    }
  })

  return grouped
}

function createProductElement(item) {
  console.log("[v0] Creando elemento para producto:", item.product)

  const div = document.createElement("div")
  div.className = "cart-item"
  div.setAttribute("data-product-id", item.product._id)

  const subtotal = item.product.price * item.quantity
  console.log("[v0] Subtotal calculado:", subtotal)

  const quantityDisplay =
    item.quantity > 1
      ? `<span class="quantity-display">${item.quantity}</span> <span class="quantity-label">unidades</span>`
      : `<span class="quantity-display">${item.quantity}</span> <span class="quantity-label">unidad</span>`

  div.innerHTML = `
    <div class="product-info">
      <img src="${item.product.thumbnails?.[0] || "/images/no-image.png"}" alt="${item.product.title}" class="product-image">
      <div class="product-details">
        <h3>${item.product.title}</h3>
        <p class="product-price">$${item.product.price.toFixed(2)} c/u</p>
        <p class="product-quantity">${quantityDisplay}</p>
      </div>
    </div>
    <div class="quantity-controls">
      <button data-action="decrease-quantity" data-product-id="${item.product._id}" class="btn-quantity">-</button>
      <span class="quantity-number">${item.quantity}</span>
      <button data-action="increase-quantity" data-product-id="${item.product._id}" class="btn-quantity">+</button>
    </div>
    <div class="item-subtotal">$${subtotal.toFixed(2)}</div>
    <button data-action="remove-from-cart" data-product-id="${item.product._id}" class="btn-remove">Eliminar</button>
  `

  console.log("[v0] Elemento HTML creado:", div.outerHTML.substring(0, 100) + "...")
  return div
}

// Configurar todos los event listeners
function setupEventListeners() {
  const checkoutButton = document.querySelector(".btn-checkout")
  if (checkoutButton) {
    checkoutButton.addEventListener("click", (e) => {
      e.preventDefault()
      checkout()
    })
  }

  document.addEventListener("click", (e) => {
    const action = e.target.dataset.action
    const productId = e.target.dataset.productId

    if (!action || !productId) return

    e.preventDefault()

    switch (action) {
      case "increase-quantity":
        const currentQtyInc = getCurrentQuantity(productId)
        updateQuantity(currentCartId, productId, currentQtyInc, 1)
        break

      case "decrease-quantity":
        const currentQtyDec = getCurrentQuantity(productId)
        updateQuantity(currentCartId, productId, currentQtyDec, -1)
        break

      case "remove-from-cart":
        removeFromCart(currentCartId, productId)
        break
    }
  })
}

function getCurrentQuantity(productId) {
  const quantityElement = document.querySelector(`[data-product-id="${productId}"] .quantity-number`)
  return quantityElement ? Number.parseInt(quantityElement.textContent) : 1
}

// Configurar eventos Socket.IO para el carrito
function setupCartSocketEvents() {
  if (!cartSocket) return

  cartSocket.on("connect", () => {
    console.log("Conectado a Socket.IO desde el carrito")
  })

  cartSocket.on("product_added_to_cart", (data) => {
    console.log("Evento product_added_to_cart recibido:", data)
    if (data.cartId == realCartId) {
      showCartNotification(`Producto añadido al carrito`, "success")
      setTimeout(() => {
        loadUserCart()
      }, 1000)
    }
  })

  cartSocket.on("product_removed_from_cart", (data) => {
    console.log("Evento product_removed_from_cart recibido:", data)
    if (data.cartId == realCartId) {
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
    if (data.cartId == realCartId) {
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

  const quantityElement = document.querySelector(`[data-product-id="${productId}"] .quantity-number`)
  const quantityDisplay = document.querySelector(`[data-product-id="${productId}"] .quantity-display`)

  if (quantityElement) {
    quantityElement.textContent = newQuantity
    console.log("Cantidad actualizada en DOM")
  }

  if (quantityDisplay) {
    quantityDisplay.textContent = newQuantity
    // Actualizar etiqueta singular/plural
    const quantityLabel = document.querySelector(`[data-product-id="${productId}"] .quantity-label`)
    if (quantityLabel) {
      quantityLabel.textContent = newQuantity > 1 ? "unidades" : "unidad"
    }
  }

  // Actualizar el subtotal
  const subtotalElement = document.querySelector(`[data-product-id="${productId}"] .item-subtotal`)
  if (subtotalElement && newSubtotal !== undefined) {
    subtotalElement.textContent = `$${newSubtotal.toFixed(2)}`
    console.log("Subtotal actualizado en DOM")
  }

  // Actualizar el total general
  updateCartTotal()
}

async function removeFromCart(cartId, productId) {
  if (confirm("¿Estás seguro de que quieres eliminar este producto del carrito?")) {
    try {
      console.log(`Eliminando producto ${productId} del carrito ${cartId}`)
      showCartNotification("Eliminando producto...", "info")

      const authToken = localStorage.getItem("authToken")
      const headers = {
        "Content-Type": "application/json",
      }

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`
      }

      const response = await fetch(`/api/carts/my-cart/products/${productId}`, {
        method: "DELETE",
        headers: headers,
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

    const authToken = localStorage.getItem("authToken")
    const headers = {
      "Content-Type": "application/json",
    }

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`
    }

    const response = await fetch(`/api/carts/my-cart/products/${productId}`, {
      method: "PUT",
      headers: headers,
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
  const authToken = localStorage.getItem("authToken")

  if (!authToken) {
    showCartNotification("Debes iniciar sesión para proceder con el pago", "error")
    setTimeout(() => {
      window.location.href = "/login"
    }, 2000)
    return
  }

  if (!realCartId) {
    showCartNotification("Error: No se pudo identificar el carrito", "error")
    return
  }

  // Verificar que el carrito tenga productos
  const cartItems = document.querySelectorAll(".cart-item")
  if (cartItems.length === 0) {
    showCartNotification("Tu carrito está vacío", "error")
    return
  }

  // Obtener el total del carrito
  const totalElement = document.querySelector(".cart-total")
  const total = totalElement ? totalElement.textContent.replace("$", "") : "0"

  // Mostrar confirmación de compra
  const confirmed = confirm(`¿Confirmas tu compra por un total de $${total}?`)

  if (confirmed) {
    processPurchase()
  }
}

async function processPurchase() {
  try {
    showCartNotification("Procesando compra...", "info")

    const authToken = localStorage.getItem("authToken")
    const response = await fetch(`/api/purchase/${realCartId}/purchase`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    })

    const result = await response.json()
    console.log("[v0] Respuesta de purchase:", result)

    if (response.ok && result.status === "success") {
      showCartNotification("¡Compra realizada exitosamente!", "success")

      // Mostrar información del ticket
      displayPurchaseSuccess(result)

      if (!result.failedProducts || result.failedProducts.length === 0) {
        // Carrito completamente vacío después de compra exitosa
        setTimeout(() => {
          checkIfCartEmpty()
          // Actualizar contador global del carrito
          if (window.updateCartCounter) {
            window.updateCartCounter()
          }
        }, 2000)
      } else {
        // Algunos productos fallaron, recargar para mostrar productos restantes
        setTimeout(() => {
          loadUserCart()
          // Actualizar contador global del carrito
          if (window.updateCartCounter) {
            window.updateCartCounter()
          }
        }, 2000)
      }
    } else {
      // Error en la compra
      const errorMessage = result.error || result.message || "Error al procesar la compra"
      showCartNotification(`Error: ${errorMessage}`, "error")
      console.error("[v0] Error en purchase:", result)

      // Si hay productos que no se pudieron comprar, mostrar información
      if (result.failedProducts && result.failedProducts.length > 0) {
        displayFailedProducts(result.failedProducts)
      }
    }
  } catch (error) {
    console.error("[v0] Error al procesar la compra:", error)
    showCartNotification("Error al conectar con el servidor", "error")
  }
}

function displayPurchaseSuccess(result) {
  const { ticket, summary, failedProducts } = result

  let message = `
    <div class="purchase-success">
      <h3>🎉 ¡Compra Exitosa!</h3>
      <p><strong>Ticket:</strong> ${ticket.code}</p>
      <p><strong>Total:</strong> $${ticket.amount}</p>
      <p><strong>Productos comprados:</strong> ${summary.purchasedProducts}</p>
      <p><strong>Fecha:</strong> ${new Date(ticket.purchase_datetime).toLocaleString()}</p>
    </div>
  `

  if (failedProducts && failedProducts.length > 0) {
    message += `
      <div class="purchase-warning">
        <h4>⚠️ Algunos productos no pudieron ser comprados:</h4>
        <ul>
          ${failedProducts
            .map(
              (item) => `
            <li>${item.product.title} - ${item.reason} ${item.available ? `(Disponible: ${item.available})` : ""}</li>
          `,
            )
            .join("")}
        </ul>
        <p class="success-note">✅ Todos los productos fueron comprados exitosamente. Tu carrito ha sido vaciado.</p>
      </div>
    `
  }

  const existingResult = document.querySelector(".purchase-result-notification")
  if (existingResult) {
    existingResult.remove()
  }

  const notification = document.createElement("div")
  notification.className = "purchase-result-notification"
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border: 2px solid #28a745;
    border-radius: 8px;
    padding: 20px;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
  `
  notification.innerHTML = `
    ${message}
    <div class="purchase-actions" style="margin-top: 15px;">
      <button onclick="this.parentElement.parentElement.remove()" class="btn-close" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">Cerrar</button>
      <a href="/products" class="btn-continue-shopping" style="background: #007bff; color: white; text-decoration: none; padding: 8px 16px; border-radius: 4px;">🛍️ Seguir Comprando</a>
    </div>
  `

  document.body.appendChild(notification)

  // Auto-cerrar después de 10 segundos
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove()
    }
  }, 10000)
}

function displayFailedProducts(failedProducts) {
  console.log("Productos que no se pudieron comprar:", failedProducts)

  const failedMessage = failedProducts
    .map(
      (item) =>
        `${item.product.title}: ${item.reason} ${item.available ? `(Stock disponible: ${item.available})` : ""}`,
    )
    .join("\n")

  setTimeout(() => {
    alert(`Algunos productos no pudieron ser comprados:\n\n${failedMessage}`)
  }, 1000)
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
  const subtotalElements = document.querySelectorAll(".item-subtotal")

  subtotalElements.forEach((element) => {
    const subtotalText = element.textContent.replace("$", "")
    const subtotal = Number.parseFloat(subtotalText)
    if (!isNaN(subtotal)) {
      total += subtotal
    }
  })

  const totalElements = document.querySelectorAll(".cart-total")
  totalElements.forEach((element) => {
    element.textContent = `$${total.toFixed(2)}`
  })

  console.log("Total actualizado:", total)
}

function checkIfCartEmpty() {
  const cartItems = document.querySelector(".cart-items")
  if (cartItems && cartItems.children.length === 0) {
    const cartContainer = document.querySelector(".cart-container")
    if (cartContainer) {
      cartContainer.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon">🛒</div>
          <h2>Tu carrito está vacío</h2>
          <p>¡Agrega algunos productos para comenzar!</p>
          <a href="/products" class="btn-start-shopping">
            🛍️ Comenzar a Comprar
          </a>
        </div>
      `
    }
  }
}
