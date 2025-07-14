const mongoose = require("mongoose")

class Database {
  constructor() {
    this.connection = null
  }

  async connect() {
    try {
      if (this.connection) {
        return this.connection
      }

      // URL de conexión a MongoDB
      const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce"

      // ✅ Conexión sin opciones deprecadas
      this.connection = await mongoose.connect(MONGODB_URI)

      console.log("✅ Conectado a MongoDB exitosamente")
      console.log(`📍 Base de datos: ${this.connection.connection.name}`)

      return this.connection
    } catch (error) {
      console.error("❌ Error conectando a MongoDB:", error.message)
      console.log("\n🔍 Posibles soluciones:")
      console.log("1. Verifica que MongoDB esté ejecutándose")
      console.log("2. Instala MongoDB si no lo tienes")
      console.log("3. O usa MongoDB Atlas (cloud)")
      process.exit(1)
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect()
        this.connection = null
        console.log("🔌 Desconectado de MongoDB")
      }
    } catch (error) {
      console.error("❌ Error desconectando de MongoDB:", error)
    }
  }
}

module.exports = new Database()
