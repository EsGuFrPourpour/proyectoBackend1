# E-commerce Backend - Proyecto Final

## Descripción
Sistema de e-commerce completo desarrollado con Node.js, Express, MongoDB y Socket.IO. Incluye autenticación JWT, gestión de productos, carritos de compra, sistema de tickets y recuperación de contraseñas.

## Características Principales
- ✅ **Patrón Repository**: Arquitectura limpia con separación de responsabilidades
- ✅ **Autenticación JWT**: Sistema seguro de login/registro con roles (user/admin)
- ✅ **Sistema de Carritos**: Carrito único por usuario con gestión automática
- ✅ **Gestión de Productos**: CRUD completo con tiempo real via Socket.IO
- ✅ **Sistema de Tickets**: Procesamiento de compras con manejo de stock
- ✅ **Recuperación de Contraseñas**: Sistema completo de reset via email
- ✅ **Middleware de Autorización**: Protección de rutas según roles
- ✅ **Arquitectura Profesional**: DTOs, manejo de errores, logging

## Tecnologías Utilizadas
- **Backend**: Node.js, Express.js
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: Passport.js, JWT
- **Tiempo Real**: Socket.IO
- **Vistas**: Handlebars
- **Email**: Nodemailer
- **Seguridad**: Helmet, CORS, bcrypt

## Instalación y Configuración

### 1. Clonar el Repositorio
\`\`\`bash
git clone <repository-url>
cd ProyectBackend1
npm install
\`\`\`

### 2. Variables de Entorno
Configura las siguientes variables de entorno:

\`\`\`env
# Servidor
PORT=8080

# Base de Datos
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=tu-jwt-secret-muy-seguro
JWT_EXPIRES_IN=24h

# Email (Gmail)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password-de-16-caracteres
EMAIL_SERVICE=gmail

# Frontend
FRONTEND_URL=http://localhost:8080

# Configuración
BCRYPT_ROUNDS=10
RESET_TOKEN_EXPIRES=3600000
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=50
\`\`\`

### 3. Configuración de Email (Gmail)

#### Problema Común
Si recibes el error `535-5.7.8 Username and Password not accepted`, necesitas configurar una App Password.

#### Solución: Configurar App Password de Gmail

**Paso 1: Habilitar Autenticación de Dos Factores**
1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Selecciona "Seguridad" en el panel izquierdo
3. En "Iniciar sesión en Google", habilita la "Verificación en 2 pasos"

**Paso 2: Generar App Password**
1. En la misma sección de "Seguridad"
2. Busca "Contraseñas de aplicaciones" (App passwords)
3. Selecciona "Correo" y "Otro (nombre personalizado)"
4. Escribe "E-commerce Backend" como nombre
5. Google generará una contraseña de 16 caracteres

**Paso 3: Configurar Variables**
\`\`\`env
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=la-app-password-de-16-caracteres  # NO tu contraseña normal
EMAIL_SERVICE=gmail
\`\`\`

#### Alternativas de Email
- **Outlook/Hotmail**: `EMAIL_SERVICE=outlook`
- **Yahoo**: `EMAIL_SERVICE=yahoo`
- **SMTP personalizado**: Configurar host, port, etc.

### 4. Iniciar el Servidor
\`\`\`bash
npm start
# o para desarrollo
npm run dev
\`\`\`

## Estructura del Proyecto
\`\`\`
ProyectBackend1/
├── src/
│   ├── config/          # Configuraciones (DB, Passport)
│   ├── controllers/     # Controladores de rutas
│   ├── dao/            # Data Access Objects
│   ├── dto/            # Data Transfer Objects
│   ├── managers/       # Managers de negocio
│   ├── middleware/     # Middlewares personalizados
│   ├── models/         # Modelos de MongoDB
│   ├── public/         # Archivos estáticos
│   ├── repositories/   # Patrón Repository
│   ├── routes/         # Definición de rutas
│   ├── service/        # Servicios (email, etc.)
│   ├── utils/          # Utilidades
│   ├── views/          # Plantillas Handlebars
│   └── main.js         # Punto de entrada
├── scripts/            # Scripts de base de datos
└── package.json
\`\`\`

## Funcionalidades por Rol

### Usuario Regular
- ✅ Registro y login
- ✅ Navegación de productos con filtros
- ✅ Carrito único automático
- ✅ Agregar/eliminar productos del carrito
- ✅ Proceso de compra con tickets
- ✅ Recuperación de contraseña

### Administrador
- ✅ Todas las funciones de usuario
- ✅ Panel de administración con estadísticas
- ✅ Gestión de productos en tiempo real
- ✅ Crear, editar y eliminar productos
- ✅ Ver todos los tickets de compra

## API Endpoints

### Autenticación
- `POST /api/sessions/register` - Registro de usuario
- `POST /api/sessions/login` - Login
- `GET /api/sessions/current` - Usuario actual
- `POST /api/sessions/logout` - Logout

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:pid` - Obtener producto
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:pid` - Actualizar producto (admin)
- `DELETE /api/products/:pid` - Eliminar producto (admin)

### Carritos
- `GET /api/carts/my-cart` - Obtener carrito del usuario
- `POST /api/carts/my-cart/products/:pid` - Agregar producto
- `PUT /api/carts/my-cart/products/:pid` - Actualizar cantidad
- `DELETE /api/carts/my-cart/products/:pid` - Eliminar producto

### Recuperación de Contraseña
- `POST /api/password/forgot` - Solicitar reset
- `POST /api/password/reset` - Restablecer contraseña

### Compras
- `POST /api/purchase` - Procesar compra

## Características Técnicas

### Patrón Repository
Implementación completa del patrón Repository para separar la lógica de negocio del acceso a datos.

### Sistema de Carritos Únicos
Cada usuario tiene un carrito único asignado automáticamente al registrarse, eliminando problemas de ownership.

### DTOs (Data Transfer Objects)
- `UserDTO`: Información segura del usuario
- `TicketDTO`: Datos del ticket de compra
- `TicketSummaryDTO`: Resumen de tickets

### Middleware de Autorización
- `authenticateJWT`: Verificación de token JWT
- `requireAdmin`: Acceso solo para administradores
- Manejo de errores personalizado

### Sistema de Tickets
Procesamiento robusto de compras con:
- Verificación de stock
- Manejo de compras parciales
- Generación de códigos únicos
- Actualización automática de inventario

## Desarrollo y Testing

### Scripts Disponibles
\`\`\`bash
npm start          # Iniciar servidor
npm run dev        # Desarrollo con nodemon
npm run seed       # Poblar base de datos
\`\`\`

### Logging
Sistema de logging integrado con diferentes niveles (info, warn, error, debug).

### Manejo de Errores
Middleware global de manejo de errores con respuestas consistentes.

## Seguridad
- Helmet para headers de seguridad
- CORS configurado
- Validación de entrada
- Sanitización de datos
- Rate limiting
- Contraseñas hasheadas con bcrypt

## Contribución
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT.
