const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
const mongoSanitize = require("express-mongo-sanitize")
const xss = require("xss-clean")
const hpp = require("hpp")
const cors = require("cors")
const config = require("../config/environment")

// Rate limiting
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: "error",
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
}

// General rate limiter
const generalLimiter = createRateLimiter(15 * 60 * 1000, 100, "Too many requests, please try again later")

// Auth rate limiter (more restrictive)
const authLimiter = createRateLimiter(15 * 60 * 1000, 5, "Too many authentication attempts, please try again later")

// Password reset limiter
const passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000,
  3,
  "Too many password reset attempts, please try again later",
)

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true)

    const allowedOrigins = [config.FRONTEND_URL, "http://localhost:3000", "http://localhost:8080"]

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
}

// Security middleware setup
const setupSecurity = (app) => {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.socket.io"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "https:", "http:"],
          connectSrc: ["'self'", "ws:", "wss:"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    }),
  )

  // Set security HTTP headers
  // app.use(helmet())

  // Enable CORS
  app.use(cors(corsOptions))

  // Rate limiting
  app.use("/api/", generalLimiter)
  app.use("/api/sessions/login", authLimiter)
  app.use("/api/sessions/register", authLimiter)
  app.use("/api/password/", passwordResetLimiter)

  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize())

  // Data sanitization against XSS
  app.use(xss())

  // Prevent parameter pollution
  app.use(hpp())
}

module.exports = {
  setupSecurity,
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
}
