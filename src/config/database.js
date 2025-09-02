const mongoose = require("mongoose")
const config = require("./environment")
const logger = require("../utils/logger")

class Database {
  constructor() {
    this.connection = null
  }

  async connect() {
    try {
      if (this.connection) {
        logger.info("Database already connected")
        return this.connection
      }

      // Configuración de conexión optimizada
      const options = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
      }

      this.connection = await mongoose.connect(config.MONGODB_URI, options)

      logger.info("MongoDB connected successfully", {
        host: this.connection.connection.host,
        port: this.connection.connection.port,
        name: this.connection.connection.name,
      })

      // Event listeners for connection monitoring
      mongoose.connection.on("error", (err) => {
        logger.error("MongoDB connection error", err)
      })

      mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected")
      })

      mongoose.connection.on("reconnected", () => {
        logger.info("MongoDB reconnected")
      })

      return this.connection
    } catch (error) {
      logger.error("Failed to connect to MongoDB", error)
      throw error
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.connection.close()
        this.connection = null
        logger.info("MongoDB disconnected successfully")
      }
    } catch (error) {
      logger.error("Error disconnecting from MongoDB", error)
      throw error
    }
  }

  getConnection() {
    return this.connection
  }

  isConnected() {
    return mongoose.connection.readyState === 1
  }
}

module.exports = new Database()
