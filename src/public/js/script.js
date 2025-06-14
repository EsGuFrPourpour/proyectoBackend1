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