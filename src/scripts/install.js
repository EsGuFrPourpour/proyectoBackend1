const logger = require("../utils/logger")
const database = require("../config/database")

async function installProject() {
  try {
    logger.info("🚀 Starting project installation...")

    // Conectar a la base de datos
    logger.info("📡 Connecting to database...")
    await database.connect()
    logger.info("✅ Database connected successfully")

    // Ejecutar seed de usuarios
    logger.info("👥 Creating default users...")
    const seedUsers = require("./seedUsers")
    await seedUsers()
    logger.info("✅ Default users created")

    // Ejecutar seed de productos (opcional)
    try {
      logger.info("📦 Creating sample products...")
      const seedData = require("./seedData")
      await seedData()
      logger.info("✅ Sample products created")
    } catch (error) {
      logger.warn("⚠️  Sample products already exist or error occurred")
    }

    logger.info("🎉 Project installation completed successfully!")
    logger.info("\n📋 Default Users Created:")
    logger.info("   👑 Admin: admin@ecommerce.com / admin123")
    logger.info("   👤 User: juan@email.com / user123")
    logger.info("   👤 User: maria@email.com / user123")

    logger.info("\n🌐 Available URLs:")
    logger.info("   🏠 Home: http://localhost:8080")
    logger.info("   📦 Products: http://localhost:8080/products")
    logger.info("   ⚡ Management: http://localhost:8080/realtimeproducts")
    logger.info("   🔐 Login: http://localhost:8080/login")

    logger.info("\n📡 API Endpoints:")
    logger.info("   📦 Products: http://localhost:8080/api/products")
    logger.info("   🛒 Carts: http://localhost:8080/api/carts")
    logger.info("   🔐 Sessions: http://localhost:8080/api/sessions")
    logger.info("   👥 Users: http://localhost:8080/api/users")
    logger.info("   🎫 Purchase: http://localhost:8080/api/purchase")
    logger.info("   🔑 Password: http://localhost:8080/api/password")

    await database.disconnect()
    process.exit(0)
  } catch (error) {
    logger.error("❌ Installation failed:", error)
    process.exit(1)
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  installProject()
}

module.exports = installProject
