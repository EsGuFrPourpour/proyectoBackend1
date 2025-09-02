const dotenv = require("dotenv")

// Cargar variables de entorno
dotenv.config()

const config = {
  // Server Configuration
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce",

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",

  // Email Configuration
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || "gmail",

  // Frontend Configuration
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:8080",

  // Security Configuration
  BCRYPT_ROUNDS: Number.parseInt(process.env.BCRYPT_ROUNDS) || 10,
  RESET_TOKEN_EXPIRES: Number.parseInt(process.env.RESET_TOKEN_EXPIRES) || 3600000, // 1 hour

  // Pagination Configuration
  DEFAULT_PAGE_SIZE: Number.parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
  MAX_PAGE_SIZE: Number.parseInt(process.env.MAX_PAGE_SIZE) || 100,

  // Development flags
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
}

// Validate required environment variables
const requiredEnvVars = []

if (config.isProduction) {
  requiredEnvVars.push("JWT_SECRET", "MONGODB_URI", "EMAIL_USER", "EMAIL_PASS")
}

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`)
    process.exit(1)
  }
}

module.exports = config
