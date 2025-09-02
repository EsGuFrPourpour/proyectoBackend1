// Variables globales
let mainSocket = null

window.updateCartCounter = updateCartCounter

// Función para agregar al carrito (HTTP)
async function addToCart(productId) {
  try {
    console.log("Agregando producto al carrito:", productId)

    const authToken = localStorage.getItem("authToken")
    if (!authToken) {
      showNotification("Debes iniciar sesión para agregar productos al carrito", "error")
      window.location.href = "/login"
      return
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    }

    const response = await fetch(`/api/carts/my-cart/products/${productId}`, {
      method: "POST",
      headers: headers,
    })

    console.log("Respuesta del servidor:", response.status)

    if (response.ok) {
      showNotification("Producto añadido al carrito", "success")
      updateCartLink()
      updateCartCounter()
    } else {
      let errorMessage = "Error al añadir el producto"
      try {
        const errorData = await response.json()
        console.error("Error del servidor:", errorData)

        if (errorData && typeof errorData === "object") {
          if (errorData.message) {
            errorMessage = errorData.message
          } else if (errorData.error) {
            errorMessage = errorData.error
          } else if (errorData.status === "error" && errorData.message) {
            errorMessage = errorData.message
          } else {
            errorMessage = `Error del servidor: ${JSON.stringify(errorData)}`
          }
        } else if (typeof errorData === "string") {
          errorMessage = errorData
        } else {
          errorMessage = `Error del servidor (${response.status}): ${response.statusText}`
        }
      } catch (parseError) {
        console.error("Error al parsear respuesta del servidor:", parseError)
        try {
          const errorText = await response.text()
          console.error("Respuesta del servidor (texto):", errorText)
          errorMessage = errorText || `Error del servidor (${response.status}): ${response.statusText}`
        } catch (textError) {
          console.error("Error al obtener texto de respuesta:", textError)
          errorMessage = `Error del servidor (${response.status}): ${response.statusText}`
        }
      }

      showNotification(errorMessage, "error")
    }
  } catch (error) {
    console.error("Error:", error)
    let errorMessage = "Error al conectar con el servidor"
    if (error.message) {
      errorMessage = error.message
    }
    showNotification(errorMessage, "error")
  }
}

function updateCartLink() {
  const cartLinks = document.querySelectorAll('a[href*="/cart/"], a[data-action="go-to-cart"]')
  cartLinks.forEach((link) => {
    if (link.hasAttribute("data-action")) {
      // Para enlaces con data-action, actualizar el onclick
      link.onclick = () => goToCart()
    } else {
      // Para enlaces normales, actualizar href
      link.href = `/cart/my-cart`
    }
  })
  console.log("[v0] Enlaces del carrito actualizados para usar carrito único")
}

function goToCart() {
  const authToken = localStorage.getItem("authToken")
  if (!authToken) {
    showNotification("Debes iniciar sesión para acceder al carrito", "error")
    window.location.href = "/login"
    return
  }

  window.location.href = `/cart/my-cart`
}

// Función para eliminar producto (WebSocket)
function deleteProduct(productId) {
  if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
    console.log("Eliminando producto:", productId)
    if (mainSocket) {
      mainSocket.emit("delete_product", productId)
    }
  }
}

// Función para mostrar notificaciones
function showNotification(message, type = "info") {
  const notificationsDiv = document.getElementById("notifications")
  if (notificationsDiv) {
    notificationsDiv.innerHTML = `<p class="${type}">${message}</p>`

    setTimeout(() => {
      notificationsDiv.innerHTML = ""
    }, 3000)
  }
}

// Función para actualizar contador del carrito
async function updateCartCounter() {
  try {
    const authToken = localStorage.getItem("authToken")
    if (!authToken) {
      const cartCounter = document.getElementById("cart-counter")
      if (cartCounter) {
        cartCounter.style.display = "none"
      }
      return
    }

    const response = await fetch("/api/carts/my-cart", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const cart = data.payload
      const cartCounter = document.getElementById("cart-counter")

      if (cartCounter && cart && cart.products) {
        // Calcular total de productos (sumando cantidades)
        const totalItems = cart.products.reduce((total, item) => total + (item.quantity || 1), 0)
        cartCounter.textContent = totalItems
        cartCounter.style.display = totalItems > 0 ? "inline-flex" : "none"

        // Animar el contador cuando se actualiza
        if (totalItems > 0) {
          cartCounter.style.animation = "none"
          setTimeout(() => {
            cartCounter.style.animation = "pulse 0.3s ease"
          }, 10)
        }

        console.log("[v0] Contador del carrito actualizado:", totalItems)
      }
    }
  } catch (error) {
    console.error("Error al actualizar contador del carrito:", error)
  }
}

// Solo inicializar Socket.IO si NO estamos en la página del carrito
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado")

  // Verificar si estamos en la página del carrito
  const isCartPage = window.location.pathname.includes("/cart/")
  console.log("¿Es página del carrito?", isCartPage)

  updateCartLink()
  updateCartCounter()

  if (!isCartPage && window.io) {
    console.log("Inicializando Socket.IO para páginas principales")

    const authToken = localStorage.getItem("authToken")
    const socketOptions = {}

    if (authToken) {
      socketOptions.auth = {
        token: authToken,
      }
    }

    // Conectar a Socket.IO con autenticación
    mainSocket = window.io(socketOptions)

    mainSocket.on("connect", () => {
      console.log("Conectado a Socket.IO")
      showNotification("Conectado al servidor en tiempo real", "success")
    })

    // Manejar formulario de productos (WebSocket)
    const productForm = document.getElementById("productForm")
    if (productForm) {
      console.log("Formulario encontrado, agregando event listener")

      productForm.addEventListener("submit", (e) => {
        e.preventDefault()
        console.log("Formulario enviado")

        const formData = new FormData(productForm)
        const productData = {
          title: formData.get("title"),
          description: formData.get("description"),
          code: formData.get("code"),
          price: Number.parseFloat(formData.get("price")),
          stock: Number.parseInt(formData.get("stock")),
          category: formData.get("category"),
          thumbnails: [],
        }

        console.log("Datos del producto a enviar:", productData)

        // Validar datos antes de enviar
        if (
          !productData.title ||
          !productData.description ||
          !productData.code ||
          !productData.price ||
          !productData.stock ||
          !productData.category
        ) {
          showNotification("Por favor completa todos los campos", "error")
          return
        }

        console.log("Enviando producto por WebSocket:", productData)
        mainSocket.emit("create_product", productData)
      })
    }

    // Eventos Socket.IO
    mainSocket.on("product_added", (product) => {
      console.log("Producto añadido recibido:", product)
      showNotification(`Nuevo producto añadido: ${product.title}`, "success")
      addProductToList(product)
    })

    mainSocket.on("product_updated", (product) => {
      console.log("Producto actualizado recibido:", product)
      showNotification(`Producto actualizado: ${product.title}`, "info")
      updateProductInList(product)
    })

    mainSocket.on("product_deleted", (data) => {
      console.log("Producto eliminado recibido:", data)
      showNotification(`Producto eliminado (ID: ${data.pid})`, "warning")
      removeProductFromList(data.pid)
    })

    mainSocket.on("product_added_to_cart", (data) => {
      console.log("Producto añadido al carrito:", data)
      showNotification(`Producto ${data.productId} añadido al carrito ${data.cartId}`, "success")
      updateCartCounter()
    })

    // Eventos de confirmación WebSocket
    mainSocket.on("product_created_success", (product) => {
      console.log("Producto creado exitosamente:", product)
      showNotification(`Producto "${product.title}" creado exitosamente`, "success")
      document.getElementById("productForm").reset()
    })

    mainSocket.on("product_created_error", (data) => {
      console.error("Error al crear producto:", data)

      let errorMessage = "Error al crear producto"
      if (data && typeof data === "object") {
        if (data.error) {
          errorMessage = data.error
        } else if (data.message) {
          errorMessage = data.message
        } else {
          errorMessage = `Error al crear producto: ${JSON.stringify(data)}`
        }
      } else if (typeof data === "string") {
        errorMessage = data
      }

      showNotification(errorMessage, "error")
    })

    mainSocket.on("product_deleted_success", (data) => {
      console.log("Producto eliminado exitosamente:", data)
      showNotification(`Producto eliminado exitosamente`, "success")
    })

    mainSocket.on("product_deleted_error", (data) => {
      console.error("Error al eliminar producto:", data)

      let errorMessage = "Error al eliminar producto"
      if (data && typeof data === "object") {
        if (data.error) {
          errorMessage = data.error
        } else if (data.message) {
          errorMessage = data.message
        } else {
          errorMessage = `Error al eliminar producto: ${JSON.stringify(data)}`
        }
      } else if (typeof data === "string") {
        errorMessage = data
      }

      showNotification(errorMessage, "error")
    })

    mainSocket.on("disconnect", () => {
      console.log("Desconectado de Socket.IO")
      showNotification("Desconectado del servidor", "warning")
    })
  }
})

// Funciones para manipular la lista de productos
function addProductToList(product) {
  console.log("Agregando producto a la lista:", product)
  const productsList = document.getElementById("products-list")
  if (productsList) {
    const newProduct = document.createElement("li")
    newProduct.setAttribute("data-id", product._id)
    newProduct.className = "product-item"
    newProduct.innerHTML = `
      <div class="product-info">
        <h4>${product.title}</h4>
        <p>${product.description}</p>
        <p><strong>Precio:</strong> $${product.price}</p>
        <p><strong>Stock:</strong> ${product.stock}</p>
        <p><strong>Categoría:</strong> ${product.category}</p>
        <p><strong>Código:</strong> ${product.code}</p>
      </div>
      <div class="product-actions">
        <button onclick="addToCart('${product._id}')" class="btn-cart">Agregar al Carrito</button>
        <button onclick="deleteProduct('${product._id}')" class="btn-delete">Eliminar</button>
      </div>
    `
    productsList.appendChild(newProduct)
    console.log("Producto agregado a la lista DOM")
  } else {
    console.log("Lista de productos no encontrada en DOM")
  }
}

function updateProductInList(product) {
  const productItem = document.querySelector(`li[data-id="${product._id}"]`)
  if (productItem) {
    productItem.innerHTML = `
      <div class="product-info">
        <h4>${product.title}</h4>
        <p>${product.description}</p>
        <p><strong>Precio:</strong> $${product.price}</p>
        <p><strong>Stock:</strong> ${product.stock}</p>
        <p><strong>Categoría:</strong> ${product.category}</p>
        <p><strong>Código:</strong> ${product.code}</p>
      </div>
      <div class="product-actions">
        <button onclick="addToCart('${product._id}')" class="btn-cart">Agregar al Carrito</button>
        <button onclick="deleteProduct('${product._id}')" class="btn-delete">Eliminar</button>
      </div>
    `
  }
}

function removeProductFromList(productId) {
  const productItem = document.querySelector(`li[data-id="${productId}"]`)
  if (productItem) {
    productItem.remove()
  }
}
