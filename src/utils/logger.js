const config = require("../config/environment")

class Logger {
  constructor() {
    this.isDevelopment = config.isDevelopment
  }

  info(message, meta = {}) {
    const timestamp = new Date().toISOString()
    console.log(`[INFO] ${timestamp} - ${message}`, meta)
  }

  error(message, error = null, meta = {}) {
    const timestamp = new Date().toISOString()
    console.error(`[ERROR] ${timestamp} - ${message}`, { error: error?.message, stack: error?.stack, ...meta })
  }

  warn(message, meta = {}) {
    const timestamp = new Date().toISOString()
    console.warn(`[WARN] ${timestamp} - ${message}`, meta)
  }

  debug(message, meta = {}) {
    if (this.isDevelopment) {
      const timestamp = new Date().toISOString()
      console.log(`[DEBUG] ${timestamp} - ${message}`, meta)
    }
  }

  security(action, user, meta = {}) {
    const timestamp = new Date().toISOString()
    console.log(`[SECURITY] ${timestamp} - ${action}`, {
      user: user?.email || "anonymous",
      role: user?.role || "no-role",
      userId: user?.id || null,
      ...meta,
    })
  }
}

module.exports = new Logger()
