[V0_FILE]markdown:file="README.md" type="markdown" project="ProyectBackend1" isMerged="true"
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
[V0_FILE]javascript:file="src/models/User.js" isMerged="true"
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    age: {
      type: Number,
      required: true,
      min: 1,
    },
    password: {
      type: String,
      required: true,
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Índice para email único
userSchema.index({ email: 1 }, { unique: true })

module.exports = mongoose.model("User", userSchema)
[V0_FILE]javascript:file="src/managers/UserManager.js" isMerged="true"
const User = require("../models/User")
const Cart = require("../models/Cart")
const bcrypt = require("bcrypt")

class UserManager {
  constructor() {
    if (UserManager.instance) {
      return UserManager.instance
    }
    console.log("UserManager MongoDB creado")
    UserManager.instance = this
    return this
  }

  async createUser(userData) {
    console.log("=== CREANDO NUEVO USUARIO ===")
    console.log("Datos del usuario:", { ...userData, password: "[HIDDEN]" })

    try {
      // Verificar si el email ya existe
      const existingUser = await User.findOne({ email: userData.email })
      if (existingUser) {
        throw new Error(`Ya existe un usuario con el email: ${userData.email}`)
      }

      // Encriptar la contraseña
      const hashedPassword = bcrypt.hashSync(userData.password, 10)

      // Crear carrito para el usuario
      const newCart = new Cart({ products: [] })
      const savedCart = await newCart.save()

      // Crear usuario con contraseña encriptada y carrito asignado
      const newUser = new User({
        ...userData,
        password: hashedPassword,
        cart: savedCart._id,
      })

      const savedUser = await newUser.save()
      console.log("Usuario creado exitosamente:", savedUser.email)

      // Retornar usuario sin contraseña
      const userResponse = savedUser.toObject()
      delete userResponse.password
      return userResponse
    } catch (error) {
      console.error("Error creando usuario:", error.message)
      throw error
    }
  }

  async getUserById(id) {
    try {
      const user = await User.findById(id).populate("cart").select("-password")
      return user
    } catch (error) {
      console.error("Error obteniendo usuario por ID:", error)
      return null
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await User.findOne({ email }).populate("cart")
      return user
    } catch (error) {
      console.error("Error obteniendo usuario por email:", error)
      return null
    }
  }

  async validatePassword(plainPassword, hashedPassword) {
    try {
      return bcrypt.compareSync(plainPassword, hashedPassword)
    } catch (error) {
      console.error("Error validando contraseña:", error)
      return false
    }
  }

  async updateUser(id, updateData) {
    try {
      // Si se actualiza la contraseña, encriptarla
      if (updateData.password) {
        updateData.password = bcrypt.hashSync(updateData.password, 10)
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).select("-password")

      return updatedUser
    } catch (error) {
      console.error("Error actualizando usuario:", error)
      throw error
    }
  }

  async deleteUser(id) {
    try {
      const deletedUser = await User.findByIdAndDelete(id)
      return deletedUser !== null
    } catch (error) {
      console.error("Error eliminando usuario:", error)
      throw error
    }
  }

  async getAllUsers() {
    try {
      const users = await User.find().populate("cart").select("-password")
      return users
    } catch (error) {
      console.error("Error obteniendo todos los usuarios:", error)
      return []
    }
  }
}

// Crear instancia singleton
const userManagerInstance = new UserManager()

module.exports = userManagerInstance
[V0_FILE]javascript:file="src/config/passport.js" isMerged="true"
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const JwtStrategy = require("passport-jwt").Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt
const userManager = require("../managers/UserManager")

// Clave secreta para JWT (en producción debe estar en .env)
const JWT_SECRET = process.env.JWT_SECRET || "mi_clave_secreta_jwt_2024"

// Estrategia Local para Login
passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        console.log("=== ESTRATEGIA LOGIN ===")
        console.log("Email:", email)

        // Buscar usuario por email
        const user = await userManager.getUserByEmail(email)
        if (!user) {
          console.log("Usuario no encontrado")
          return done(null, false, { message: "Usuario no encontrado" })
        }

        // Validar contraseña
        const isValidPassword = await userManager.validatePassword(password, user.password)
        if (!isValidPassword) {
          console.log("Contraseña incorrecta")
          return done(null, false, { message: "Contraseña incorrecta" })
        }

        console.log("Login exitoso para:", user.email)
        // Retornar usuario sin contraseña
        const userResponse = user.toObject()
        delete userResponse.password
        return done(null, userResponse)
      } catch (error) {
        console.error("Error en estrategia login:", error)
        return done(error)
      }
    }
  )
)

// Estrategia Local para Registro
passport.use(
  "register",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        console.log("=== ESTRATEGIA REGISTER ===")
        console.log("Datos de registro:", { ...req.body, password: "[HIDDEN]" })

        const { first_name, last_name, age, role } = req.body

        // Validar campos requeridos
        if (!first_name || !last_name || !age) {
          return done(null, false, { message: "Faltan campos obligatorios" })
        }

        // Crear usuario
        const newUser = await userManager.createUser({
          first_name,
          last_name,
          email,
          age: parseInt(age),
          password,
          role: role || "user",
        })

        console.log("Registro exitoso para:", newUser.email)
        return done(null, newUser)
      } catch (error) {
        console.error("Error en estrategia register:", error)
        if (error.message.includes("Ya existe un usuario")) {
          return done(null, false, { message: error.message })
        }
        return done(error)
      }
    }
  )
)

// Estrategia JWT para validar tokens
passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (jwt_payload, done) => {
      try {
        console.log("=== ESTRATEGIA JWT ===")
        console.log("JWT Payload:", jwt_payload)

        const user = await userManager.getUserById(jwt_payload.id)
        if (user) {
          console.log("Usuario válido desde JWT:", user.email)
          return done(null, user)
        } else {
          console.log("Usuario no encontrado en JWT")
          return done(null, false)
        }
      } catch (error) {
        console.error("Error en estrategia JWT:", error)
        return done(error, false)
      }
    }
  )
)

// Estrategia "current" para extraer usuario del token
passport.use(
  "current",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (jwt_payload, done) => {
      try {
        console.log("=== ESTRATEGIA CURRENT ===")
        console.log("Validando usuario actual con JWT")

        const user = await userManager.getUserById(jwt_payload.id)
        if (user) {
          console.log("Usuario actual válido:", user.email)
          return done(null, user)
        } else {
          console.log("Token válido pero usuario no existe")
          return done(null, false, { message: "Usuario no encontrado" })
        }
      } catch (error) {
        console.error("Error en estrategia current:", error)
        return done(error, false)
      }
    }
  )
)

// Serialización (no necesaria para JWT, pero requerida por Passport)
passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userManager.getUserById(id)
    done(null, user)
  } catch (error) {
    done(error)
  }
})

module.exports = { passport, JWT_SECRET }
[V0_FILE]javascript:file="src/routes/sessions.js" isMerged="true"
const express = require("express")
const jwt = require("jsonwebtoken")
const { passport, JWT_SECRET } = require("../config/passport")

const router = express.Router()

// POST /api/sessions/register - Registro de usuario
router.post("/register", (req, res, next) => {
  console.log("=== RUTA: Registro de usuario ===")
  console.log("Datos recibidos:", { ...req.body, password: "[HIDDEN]" })

  passport.authenticate("register", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Error en registro:", err)
      return res.status(500).json({
        status: "error",
        error: "Error interno del servidor",
      })
    }

    if (!user) {
      console.log("Registro fallido:", info?.message)
      return res.status(400).json({
        status: "error",
        error: info?.message || "Error en el registro",
      })
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    console.log("Registro exitoso, token generado")
    res.status(201).json({
      status: "success",
      message: "Usuario registrado exitosamente",
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
        cart: user.cart,
      },
    })
  })(req, res, next)
})

// POST /api/sessions/login - Login de usuario
router.post("/login", (req, res, next) => {
  console.log("=== RUTA: Login de usuario ===")
  console.log("Email:", req.body.email)

  passport.authenticate("login", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Error en login:", err)
      return res.status(500).json({
        status: "error",
        error: "Error interno del servidor",
      })
    }

    if (!user) {
      console.log("Login fallido:", info?.message)
      return res.status(401).json({
        status: "error",
        error: info?.message || "Credenciales inválidas",
      })
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    console.log("Login exitoso, token generado")
    res.json({
      status: "success",
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
        cart: user.cart,
      },
    })
  })(req, res, next)
})

// GET /api/sessions/current - Obtener usuario actual
router.get("/current", (req, res, next) => {
  console.log("=== RUTA: Usuario actual ===")
  console.log("Authorization header:", req.headers.authorization)

  passport.authenticate("current", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Error validando usuario actual:", err)
      return res.status(500).json({
        status: "error",
        error: "Error interno del servidor",
      })
    }

    if (!user) {
      console.log("Token inválido o usuario no encontrado:", info?.message)
      return res.status(401).json({
        status: "error",
        error: info?.message || "Token inválido o expirado",
      })
    }

    console.log("Usuario actual válido:", user.email)
    res.json({
      status: "success",
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
        cart: user.cart,
      },
    })
  })(req, res, next)
})

// POST /api/sessions/logout - Logout (invalidar token del lado cliente)
router.post("/logout", (req, res) => {
  console.log("=== RUTA: Logout ===")
  // Con JWT, el logout se maneja del lado del cliente eliminando el token
  res.json({
    status: "success",
    message: "Logout exitoso. Elimina el token del lado del cliente.",
  })
})

module.exports = router
[V0_FILE]javascript:file="src/routes/users.js" isMerged="true"
const express = require("express")
const userManager = require("../managers/UserManager")
const { passport } = require("../config/passport")

const router = express.Router()

// Middleware para proteger rutas (requiere autenticación)
const requireAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        error: "Error interno del servidor",
      })
    }

    if (!user) {
      return res.status(401).json({
        status: "error",
        error: "Token requerido o inválido",
      })
    }

    req.user = user
    next()
  })(req, res, next)
}

// Middleware para requerir rol admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      error: "Acceso denegado. Se requiere rol de administrador",
    })
  }
  next()
}

// GET /api/users - Obtener todos los usuarios (solo admin)
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log("=== OBTENIENDO TODOS LOS USUARIOS ===")
    const users = await userManager.getAllUsers()
    res.json({
      status: "success",
      users,
    })
  } catch (error) {
    console.error("Error obteniendo usuarios:", error)
    res.status(500).json({
      status: "error",
      error: "Error al obtener usuarios",
    })
  }
})

// GET /api/users/:uid - Obtener usuario por ID
router.get("/:uid", requireAuth, async (req, res) => {
  try {
    console.log("=== OBTENIENDO USUARIO POR ID ===")
    console.log("User ID:", req.params.uid)

    // Solo admin puede ver cualquier usuario, users solo pueden verse a sí mismos
    if (req.user.role !== "admin" && req.user._id.toString() !== req.params.uid) {
      return res.status(403).json({
        status: "error",
        error: "No tienes permisos para ver este usuario",
      })
    }

    const user = await userManager.getUserById(req.params.uid)
    if (!user) {
      return res.status(404).json({
        status: "error",
        error: "Usuario no encontrado",
      })
    }

    res.json({
      status: "success",
      user,
    })
  } catch (error) {
    console.error("Error obteniendo usuario:", error)
    res.status(500).json({
      status: "error",
      error: "Error al obtener usuario",
    })
  }
})

// PUT /api/users/:uid - Actualizar usuario
router.put("/:uid", requireAuth, async (req, res) => {
  try {
    console.log("=== ACTUALIZANDO USUARIO ===")
    console.log("User ID:", req.params.uid)

    // Solo admin puede actualizar cualquier usuario, users solo pueden actualizarse a sí mismos
    if (req.user.role !== "admin" && req.user._id.toString() !== req.params.uid) {
      return res.status(403).json({
        status: "error",
        error: "No tienes permisos para actualizar este usuario",
      })
    }

    // Los usuarios normales no pueden cambiar su rol
    if (req.user.role !== "admin" && req.body.role) {
      delete req.body.role
    }

    const updatedUser = await userManager.updateUser(req.params.uid, req.body)
    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        error: "Usuario no encontrado",
      })
    }

    res.json({
      status: "success",
      message: "Usuario actualizado exitosamente",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error actualizando usuario:", error)
    res.status(500).json({
      status: "error",
      error: error.message,
    })
  }
})

// DELETE /api/users/:uid - Eliminar usuario (solo admin)
router.delete("/:uid", requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log("=== ELIMINANDO USUARIO ===")
    console.log("User ID:", req.params.uid)

    const deleted = await userManager.deleteUser(req.params.uid)
    if (!deleted) {
      return res.status(404).json({
        status: "error",
        error: "Usuario no encontrado",
      })
    }

    res.json({
      status: "success",
      message: "Usuario eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error eliminando usuario:", error)
    res.status(500).json({
      status: "error",
      error: "Error al eliminar usuario",
    })
  }
})

module.exports = router
[V0_FILE]javascript:file="src/middleware/auth.js" isMerged="true"
const { passport } = require("../config/passport")

// Middleware para autenticación JWT
const authenticateJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        error: "Error interno del servidor",
      })
    }

    if (!user) {
      return res.status(401).json({
        status: "error",
        error: "Token requerido o inválido",
      })
    }

    req.user = user
    next()
  })(req, res, next)
}

// Middleware para requerir rol específico
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        error: "Usuario no autenticado",
      })
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        status: "error",
        error: `Acceso denegado. Se requiere rol: ${role}`,
      })
    }

    next()
  }
}

// Middleware para requerir admin
const requireAdmin = requireRole("admin")

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return next()
  }

  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Error en autenticación opcional:", err)
    }

    if (user) {
      req.user = user
    }

    next()
  })(req, res, next)
}

module.exports = {
  authenticateJWT,
  requireRole,
  requireAdmin,
  optionalAuth,
}
[V0_FILE]typescriptreact:file="package.json" isEdit="true" isQuickEdit="true" isMerged="true"
{
  "name": "proyecto-backend-ecommerce",
  "version": "1.0.0",
  "description": "Proyecto de backend para e-commerce con autenticación JWT",
  "main": "src/main.js",
  "private": true,
  "scripts": {
    "dev": "nodemon src/main.js",
    "build": "next build",
    "start": "node src/main.js",
    "lint": "next lint",
    "seed": "node src/scripts/seedData.js",
    "seed:users": "node src/scripts/seedUsers.js"
  },
  "keywords": ["nodejs", "express", "mongodb", "jwt", "passport", "ecommerce"],
  "author": "Tu Nombre",
  "license": "ISC",
  "dependencies": {
    "@hookform/resolvers": "^3.9.1",
    "@radix-ui/react-accordion": "1.2.2",
    "@radix-ui/react-alert-dialog": "1.1.4",
    "@radix-ui/react-aspect-ratio": "1.1.1",
    "@radix-ui/react-avatar": "1.1.2",
    "@radix-ui/react-checkbox": "1.1.3",
    "@radix-ui/react-collapsible": "1.1.2",
    "@radix-ui/react-context-menu": "2.2.4",
    "@radix-ui/react-dialog": "1.1.4",
    "@radix-ui/react-dropdown-menu": "2.1.4",
    "@radix-ui/react-hover-card": "1.1.4",
    "@radix-ui/react-label": "2.1.1",
    "@radix-ui/react-menubar": "1.1.4",
    "@radix-ui/react-navigation-menu": "1.2.3",
    "@radix-ui/react-popover": "1.1.4",
    "@radix-ui/react-progress": "1.1.1",
    "@radix-ui/react-radio-group": "1.2.2",
    "@radix-ui/react-scroll-area": "1.2.2",
    "@radix-ui/react-select": "2.1.4",
    "@radix-ui/react-separator": "1.1.1",
    "@radix-ui/react-slider": "1.2.2",
    "@radix-ui/react-slot": "1.1.1",
    "@radix-ui/react-switch": "1.1.2",
    "@radix-ui/react-tabs": "1.1.2",
    "@radix-ui/react-toast": "1.2.4",
    "@radix-ui/react-toggle": "1.1.1",
    "@radix-ui/react-toggle-group": "1.1.1",
    "@radix-ui/react-tooltip": "1.1.6",
    "autoprefixer": "^10.4.20",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "1.0.4",
    "date-fns": "4.1.0",
    "embla-carousel-react": "8.5.1",
    "express": "^4.18.2",
    "geist": "^1.3.1",
    "input-otp": "1.4.1",
    "lucide-react": "^0.454.0",
    "mongoose": "^7.5.0",
    "mongoose-paginate-v2": "^1.7.4",
    "next": "14.2.25",
    "next-themes": "^0.4.4",
    "react": "^19",
    "react-day-picker": "9.8.0",
    "react-dom": "^19",
    "react-hook-form": "^7.54.1",
    "react-resizable-panels": "^2.1.7",
    "recharts": "2.15.0",
    "sonner": "^1.7.1",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.6",
    "zod": "^3.24.1",
    "bcrypt": "^5.1.1",
    "passport": "^0.6.0",
    "passport-local": "^1.0.0",
    "passport-jwt": "^4.0.1",
    "jsonwebtoken": "^9.0.2",
    "express-handlebars": "^7.1.2",
    "socket.io": "^4.7.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8.5",
    "tailwindcss": "^3.4.17",
    "typescript": "5.7.3",
    "nodemon": "^3.0.1"
  }
}
[V0_FILE]javascript:file="src/scripts/seedUsers.js" isMerged="true"
const mongoose = require("mongoose")
const database = require("../config/database")
const userManager = require("../managers/UserManager")

async function seedUsers() {
  try {
    console.log("🌱 Iniciando seed de usuarios...")

    // Conectar a la base de datos
    await database.connect()

    // Crear usuarios de ejemplo
    const users = [
      {
        first_name: "Admin",
        last_name: "Sistema",
        email: "admin@ecommerce.com",
        age: 30,
        password: "admin123",
        role: "admin",
      },
      {
        first_name: "Juan",
        last_name: "Pérez",
        email: "juan@email.com",
        age: 25,
        password: "user123",
        role: "user",
      },
      {
        first_name: "María",
        last_name: "García",
        email: "maria@email.com",
        age: 28,
        password: "user123",
        role: "user",
      },
    ]

    console.log("Creando usuarios...")
    for (const userData of users) {
      try {
        const user = await userManager.createUser(userData)
        console.log(`✅ Usuario creado: ${user.email} (${user.role})`)
      } catch (error) {
        if (error.message.includes("Ya existe un usuario")) {
          console.log(`⚠️ Usuario ya existe: ${userData.email}`)
        } else {
          console.error(`❌ Error creando ${userData.email}:`, error.message)
        }
      }
    }

    console.log("\n📊 USUARIOS CREADOS:")
    console.log("==================")
    console.log("👑 ADMIN:")
    console.log("   Email: admin@ecommerce.com")
    console.log("   Password: admin123")
    console.log("\n👤 USUARIOS:")
    console.log("   Email: juan@email.com | Password: user123")
    console.log("   Email: maria@email.com | Password: user123")

    console.log("\n🔗 ENDPOINTS PARA PROBAR:")
    console.log("==================")
    console.log("📝 Registro: POST http://localhost:8080/api/sessions/register")
    console.log("🔐 Login: POST http://localhost:8080/api/sessions/login")
    console.log("👤 Usuario actual: GET http://localhost:8080/api/sessions/current")
    console.log("👥 Listar usuarios: GET http://localhost:8080/api/users")

    await database.disconnect()
    console.log("\n🎉 Seed de usuarios completado!")
  } catch (error) {
    console.error("❌ Error en seed de usuarios:", error)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedUsers()
}

module.exports = seedUsers
[V0_FILE]plaintext:file=".env.example" isMerged="true"
# Base de datos MongoDB local
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Puerto del servidor
PORT=8080

# Entorno de desarrollo
NODE_ENV=development

# Clave secreta para JWT (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=mi_clave_secreta_jwt_2024_super_segura
[V0_FILE]typescriptreact:file="src/main.js" isEdit="true" isQuickEdit="true" isMerged="true"
// Cargar variables de entorno al inicio
require("dotenv").config()

const express = require("express")
const exphbs = require("express-handlebars")
const path = require("path")
const { Server } = require("socket.io")
const { setSocketIO } = require("./socket/socketManager")
const database = require("./config/database")

// Importar configuración de Passport
const { passport } = require("./config/passport")

// Importar rutas
const productRouter = require("./routes/products")
const cartRouter = require("./routes/carts")
const viewsRouter = require("./routes/views")
const sessionsRouter = require("./routes/sessions")
const usersRouter = require("./routes/users")

const app = express()
const PORT = process.env.PORT || 8080

// Configurar Handlebars con helpers
const hbs = exphbs.create({
  helpers: {
    eq: (a, b) => a === b,
    ne: (a, b) => a !== b,
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
    and: (a, b) => a && b,
    or: (a, b) => a || b,
  },
})

app.engine("handlebars", hbs.engine)
app.set("view engine", "handlebars")
app.set("views", path.join(__dirname, "views"))

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

// Inicializar Passport
app.use(passport.initialize())

// Conectar a MongoDB
async function startServer() {
  try {
    // Conectar a la base de datos
    await database.connect()

    // Ejecutar seed de usuarios automáticamente en desarrollo
    if (process.env.NODE_ENV === "development") {
      try {
        const seedUsers = require("./scripts/seedUsers")
        await seedUsers()
      } catch (error) {
        console.log("⚠️ Seed de usuarios ya ejecutado o error:", error.message)
      }
    }

    // Rutas
    app.use("/api/products", productRouter)
    app.use("/api/carts", cartRouter)
    app.use("/api/sessions", sessionsRouter) // 🆕 Rutas de autenticación
    app.use("/api/users", usersRouter) // 🆕 Rutas de usuarios
    app.use("/", viewsRouter)

    // Crear servidor HTTP
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
      console.log(`📊 Base de datos: MongoDB`)
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`)
      console.log(`\n📋 URLs disponibles:`)
      console.log(`   🏠 Productos: http://localhost:${PORT}/products`)
      console.log(`   ⚡ Gestión: http://localhost:${PORT}/realtimeproducts`)
      console.log(`   📡 API Productos: http://localhost:${PORT}/api/products`)
      console.log(`   🔐 API Sesiones: http://localhost:${PORT}/api/sessions`)
      console.log(`   👥 API Usuarios: http://localhost:${PORT}/api/users`)
    })

    // Configurar Socket.IO
    const io = new Server(server)

    // Configurar el socket manager
    setSocketIO(io)

    io.on("connection", (socket) => {
      console.log("Cliente Socket.IO conectado:", socket.id)

      // Manejar creación de productos por WebSocket
      socket.on("create_product", async (productData) => {
        try {
          const productManager = require("./managers/ProductManager")

          console.log("Creando producto por WebSocket:", productData)
          const newProduct = await productManager.addProduct(productData)

          // Emitir a todos los clientes
          io.emit("product_added", newProduct)

          // Confirmar al cliente que envió
          socket.emit("product_created_success", newProduct)
        } catch (error) {
          console.error("Error creando producto por WebSocket:", error)
          socket.emit("product_created_error", { error: error.message })
        }
      })

      // Manejar eliminación de productos por WebSocket
      socket.on("delete_product", async (productId) => {
        try {
          const productManager = require("./managers/ProductManager")

          console.log("Eliminando producto por WebSocket:", productId)
          const deleted = await productManager.deleteProduct(productId)

          if (deleted) {
            // Emitir a todos los clientes
            io.emit("product_deleted", { pid: productId })

            // Confirmar al cliente que envió
            socket.emit("product_deleted_success", { pid: productId })
          } else {
            socket.emit("product_deleted_error", { error: "Producto no encontrado" })
          }
        } catch (error) {
          console.error("Error eliminando producto por WebSocket:", error)
          socket.emit("product_deleted_error", { error: error.message })
        }
      })

      socket.on("disconnect", () => {
        console.log("Cliente Socket.IO desconectado:", socket.id)
      })
    })

    // Manejar cierre graceful
    process.on("SIGINT", async () => {
      console.log("\n🔄 Cerrando servidor...")
      await database.disconnect()
      process.exit(0)
    })
  } catch (error) {
    console.error("❌ Error iniciando servidor:", error)
    process.exit(1)
  }
}

startServer()