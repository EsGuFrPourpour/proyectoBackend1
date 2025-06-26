async function addToCart(productId) {
  try {
    const response = await fetch('/api/carts/1/product/' + productId, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      alert('Producto añadido al carrito');
    } else {
      alert('Error al añadir el producto');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al conectar con el servidor');
  }
}

// Conectar a Socket.IO
const socket = io();

socket.on('connect', () => {
  console.log('Conectado a Socket.IO');
});

socket.on('product_added', (product) => {
  const notificationsDiv = document.getElementById('notifications');
  notificationsDiv.innerHTML = `<p>Nuevo producto añadido: ${product.title}</p>`;
  const productsList = document.getElementById('products-list');
  const newProduct = document.createElement('li');
  newProduct.setAttribute('data-id', product.id);
  newProduct.innerHTML = `
    <h3>${product.title}</h3>
    <p>${product.description}</p>
    <p>Precio: $${product.price}</p>
    <p>Stock: ${product.stock}</p>
    <p>Categoría: ${product.category}</p>
    <button onclick="addToCart(${product.id})">Agregar al Carrito</button>
  `;
  productsList.appendChild(newProduct);
});

socket.on('product_updated', (product) => {
  const notificationsDiv = document.getElementById('notifications');
  notificationsDiv.innerHTML = `<p>Producto actualizado: ${product.title}</p>`;
  const productItem = document.querySelector(`li[data-id="${product.id}"]`);
  if (productItem) {
    productItem.innerHTML = `
      <h3>${product.title}</h3>
      <p>${product.description}</p>
      <p>Precio: $${product.price}</p>
      <p>Stock: ${product.stock}</p>
      <p>Categoría: ${product.category}</p>
      <button onclick="addToCart(${product.id})">Agregar al Carrito</button>
    `;
  }
});

socket.on('product_deleted', (data) => {
  const notificationsDiv = document.getElementById('notifications');
  notificationsDiv.innerHTML = `<p>Producto eliminado (ID: ${data.pid})</p>`;
  const productItem = document.querySelector(`li[data-id="${data.pid}"]`);
  if (productItem) {
    productItem.remove();
  }
});

socket.on('product_added_to_cart', (data) => {
  const notificationsDiv = document.getElementById('notifications');
  notificationsDiv.innerHTML = `<p>Producto ${data.productId} añadido al carrito ${data.cartId}</p>`;
});

socket.on('disconnect', () => {
  console.log('Desconectado de Socket.IO');
});