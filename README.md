# 🛍️ E-commerce Backend - Proyecto CoderHouse

Proyecto de backend para un sistema de e-commerce desarrollado con Node.js, Express, MongoDB y Socket.IO.

## 📋 Características

- ✅ API REST completa para productos y carritos
- ✅ Base de datos MongoDB con Mongoose
- ✅ Interfaz web con Handlebars
- ✅ Tiempo real con Socket.IO
- ✅ Paginación, filtros y búsqueda
- ✅ Gestión de carritos de compra
- ✅ Arquitectura MVC

## 🛠️ Tecnologías Utilizadas

- **Backend:** Node.js + Express.js
- **Base de Datos:** MongoDB + Mongoose
- **Template Engine:** Handlebars
- **Tiempo Real:** Socket.IO
- **Estilos:** CSS3
- **Arquitectura:** MVC (Model-View-Controller)

## 📦 Dependencias Principales

```json
{
  "express": "^4.18.2",
  "mongoose": "^7.5.0",
  "express-handlebars": "^7.1.2",
  "socket.io": "^4.7.2",
  "dotenv": "^16.3.1",
  "mongoose-paginate-v2": "^1.7.4"
}
```

## 🚀 Instalación y Configuración

### 1. Prerrequisitos
- Node.js (versión 16 o superior)
- MongoDB instalado y ejecutándose localmente
- Git (opcional)

### 2. Clonar/Descargar el proyecto
```bash
# Si tienes el ZIP, descomprímelo
# Si tienes Git:
git clone [URL_DEL_REPOSITORIO]
cd ProyectBackend1
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Configurar variables de entorno
Crear un archivo `.env` en la raíz del proyecto:

```env
# Base de datos MongoDB local
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Puerto del servidor (opcional, usa 8080 por defecto)
PORT=8080

# Entorno de desarrollo (opcional)
NODE_ENV=development
```

### 5. Verificar MongoDB
Asegúrate de que MongoDB esté ejecutándose:
```bash
# En Windows (si MongoDB está en PATH):
mongod

# O verificar si está corriendo:
mongo --eval "db.adminCommand('ismaster')"
```

### 6. Poblar la base de datos (Opcional)
Para cargar datos de ejemplo:
```bash
node src/scripts/seedData.js
```

### 7. Iniciar el servidor
```bash
# Modo desarrollo
npm start

# O directamente:
node src/main.js
```

## 🌐 URLs y Endpoints

### Páginas Web (Frontend)
- **🏠 Inicio:** http://localhost:8080
- **📦 Catálogo:** http://localhost:8080/products
- **⚡ Gestión en Tiempo Real:** http://localhost:8080/realtimeproducts
- **🛒 Carrito:** http://localhost:8080/cart/[ID_CARRITO]
- **📄 Detalle Producto:** http://localhost:8080/products/[ID_PRODUCTO]

### API Endpoints

#### Productos
- **GET** `/api/products` - Listar productos (con paginación y filtros)
- **GET** `/api/products/:pid` - Obtener producto por ID
- **POST** `/api/products` - Crear nuevo producto
- **PUT** `/api/products/:pid` - Actualizar producto
- **DELETE** `/api/products/:pid` - Eliminar producto

#### Carritos
- **POST** `/api/carts` - Crear nuevo carrito
- **GET** `/api/carts/:cid` - Obtener carrito por ID
- **POST** `/api/carts/:cid/products/:pid` - Agregar producto al carrito
- **PUT** `/api/carts/:cid/products/:pid` - Actualizar cantidad de producto
- **DELETE** `/api/carts/:cid/products/:pid` - Eliminar producto del carrito
- **PUT** `/api/carts/:cid` - Actualizar carrito completo
- **DELETE** `/api/carts/:cid` - Vaciar carrito

### Parámetros de Query (Productos)
- `limit`: Productos por página (default: 10)
- `page`: Número de página (default: 1)
- `sort`: Ordenar por precio ("asc" o "desc")
- `query`: Búsqueda en título y descripción
- `category`: Filtrar por categoría
- `status`: Filtrar por estado (true/false)

**Ejemplo:** `/api/products?limit=5&page=2&sort=asc&category=Electrónica`

## 🗂️ Estructura del Proyecto

```
ProyectBackend1/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración MongoDB
│   ├── managers/
│   │   ├── ProductManager.js    # Lógica de productos
│   │   └── CartManager.js       # Lógica de carritos
│   ├── models/
│   │   ├── Product.js           # Modelo de producto
│   │   └── Cart.js              # Modelo de carrito
│   ├── routes/
│   │   ├── products.js          # Rutas API productos
│   │   ├── carts.js             # Rutas API carritos
│   │   └── views.js             # Rutas de vistas
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.handlebars  # Layout principal
│   │   ├── products.handlebars  # Vista catálogo
│   │   ├── cart.handlebars      # Vista carrito
│   │   ├── product-detail.handlebars
│   │   └── realTimeProducts.handlebars
│   ├── public/
│   │   ├── css/
│   │   │   └── styles.css       # Estilos CSS
│   │   ├── js/
│   │   │   ├── script.js        # JavaScript principal
│   │   │   └── cart.js          # JavaScript del carrito
│   │   └── images/
│   │       └── no-image.png     # Imagen placeholder
│   ├── socket/
│   │   └── socketManager.js     # Gestión de Socket.IO
│   ├── scripts/
│   │   └── seedData.js          # Script para poblar BD
│   └── main.js                  # Archivo principal
├── .env.example                 # Ejemplo variables de entorno
├── package.json                 # Dependencias y scripts
└── README.md                    # Este archivo
```

## 🧪 Cómo Probar el Proyecto

### 1. Probar la API con herramientas como Postman o Thunder Client

#### Crear un producto:
```http
POST http://localhost:8080/api/products
Content-Type: application/json

{
  "title": "iPhone 15",
  "description": "Último modelo de iPhone",
  "code": "IPHONE15",
  "price": 999,
  "stock": 50,
  "category": "Electrónica"
}
```

#### Crear un carrito:
```http
POST http://localhost:8080/api/carts
```

#### Agregar producto al carrito:
```http
POST http://localhost:8080/api/carts/[ID_CARRITO]/products/[ID_PRODUCTO]
```

### 2. Probar la interfaz web
1. Ir a http://localhost:8080/products
2. Usar los filtros de búsqueda y categorías
3. Agregar productos al carrito
4. Ver el carrito en tiempo real

### 3. Probar funcionalidad en tiempo real
1. Abrir http://localhost:8080/realtimeproducts
2. Agregar un producto usando el formulario
3. Abrir otra pestaña con la misma URL
4. Ver cómo se actualiza automáticamente

## 🐛 Solución de Problemas

### Error: "Cannot connect to MongoDB"
- Verificar que MongoDB esté ejecutándose
- Comprobar la URL en `.env`
- Instalar MongoDB si no está instalado

### Error: "Port already in use"
- Cambiar el puerto en `.env`: `PORT=3000`
- O cerrar la aplicación que usa el puerto 8080

### Error: "Module not found"
- Ejecutar `npm install` nuevamente
- Verificar que `package.json` esté presente

### La página no carga estilos
- Verificar que la carpeta `public` esté presente
- Comprobar la ruta en el navegador: http://localhost:8080/css/styles.css

## 📝 Funcionalidades Implementadas

### ✅ Productos
- [x] CRUD completo de productos
- [x] Paginación con límite configurable
- [x] Filtros por categoría y búsqueda
- [x] Ordenamiento por precio
- [x] Validaciones de campos obligatorios
- [x] Códigos únicos por producto

### ✅ Carritos
- [x] Crear carritos vacíos
- [x] Agregar productos con control de stock
- [x] Actualizar cantidades
- [x] Eliminar productos específicos
- [x] Vaciar carrito completo
- [x] Persistencia en MongoDB

### ✅ Tiempo Real
- [x] Socket.IO configurado
- [x] Actualización automática de productos
- [x] Notificaciones en tiempo real
- [x] Sincronización entre pestañas

### ✅ Interfaz Web
- [x] Catálogo de productos responsive
- [x] Carrito de compras funcional
- [x] Formularios de gestión
- [x] Navegación intuitiva

## 👨‍💻 Información del Desarrollador

- **Curso:** Backend - CoderHouse
- **Tecnologías:** Node.js, Express, MongoDB, Socket.IO
- **Fecha:** 2024

## 📞 Soporte

Si tienes problemas ejecutando el proyecto:

1. Verificar que todas las dependencias estén instaladas
2. Comprobar que MongoDB esté corriendo
3. Revisar los logs en la consola para errores específicos
4. Verificar que el puerto 8080 esté disponible

