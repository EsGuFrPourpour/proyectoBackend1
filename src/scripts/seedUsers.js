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
