// Variables globales
let mainSocket = null

// Función para agregar al carrito (HTTP)
async function addToCart(productId) {
  try {
    console.log("Agregando producto al carrito:", productId)
    const response = await fetch("/api/carts/1/product/" + productId, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    console.log("Respuesta del servidor:", response.status)

    if (response.ok) {
      showNotification("Producto añadido al carrito", "success")
    } else {
      const errorData = await response.json()
      console.error("Error del servidor:", errorData)
      showNotification("Error al añadir el producto", "error")
    }
  } catch (error) {
    console.error("Error:", error)
    showNotification("Error al conectar con el servidor", "error")
  }
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

// Solo inicializar Socket.IO si NO estamos en la página del carrito
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado")

  // Verificar si estamos en la página del carrito
  const isCartPage = window.location.pathname.includes("/cart/")
  console.log("¿Es página del carrito?", isCartPage)

  if (!isCartPage && window.io) {
    console.log("Inicializando Socket.IO para páginas principales")

    // Conectar a Socket.IO
    mainSocket = window.io()

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
      showNotification(`Producto añadido al carrito`, "success")
    })

    // Eventos de confirmación WebSocket
    mainSocket.on("product_created_success", (product) => {
      console.log("Producto creado exitosamente:", product)
      showNotification(`Producto "${product.title}" creado exitosamente`, "success")
      document.getElementById("productForm").reset()
    })

    mainSocket.on("product_created_error", (data) => {
      console.error("Error al crear producto:", data)
      showNotification(`Error al crear producto: ${data.error}`, "error")
    })

    mainSocket.on("product_deleted_success", (data) => {
      console.log("Producto eliminado exitosamente:", data)
      showNotification(`Producto eliminado exitosamente`, "success")
    })

    mainSocket.on("product_deleted_error", (data) => {
      console.error("Error al eliminar producto:", data)
      showNotification(`Error al eliminar producto: ${data.error}`, "error")
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
    newProduct.setAttribute("data-id", product.id)
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
        <button onclick="addToCart(${product.id})" class="btn-cart">Agregar al Carrito</button>
        <button onclick="deleteProduct(${product.id})" class="btn-delete">Eliminar</button>
      </div>
    `
    productsList.appendChild(newProduct)
    console.log("Producto agregado a la lista DOM")
  } else {
    console.log("Lista de productos no encontrada en DOM")
  }
}

function updateProductInList(product) {
  const productItem = document.querySelector(`li[data-id="${product.id}"]`)
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
        <button onclick="addToCart(${product.id})" class="btn-cart">Agregar al Carrito</button>
        <button onclick="deleteProduct(${product.id})" class="btn-delete">Eliminar</button>
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
