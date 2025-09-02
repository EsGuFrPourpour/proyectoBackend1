const UserRepository = require("../repositories/UserRepository")
const EmailService = require("../service/emailService")

/**
 * Controller para solicitar recuperación de contraseña
 */
const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        status: "error",
        error: "Email is required",
      })
    }

    console.log("=== FORGOT PASSWORD REQUEST ===")
    console.log("Email:", email)

    // Generar token de recuperación
    const { user, resetToken } = await UserRepository.generatePasswordResetToken(email)

    // Enviar email de recuperación
    await EmailService.sendPasswordResetEmail(email, resetToken, user.first_name)

    console.log("Recovery email sent successfully")

    res.json({
      status: "success",
      message: "Recovery email sent successfully. Check your inbox.",
    })
  } catch (error) {
    console.error("Error in forgot password:", error.message)

    if (error.message === "User not found") {
      // Por seguridad, no revelar si el email existe o no
      return res.json({
        status: "success",
        message: "If the email exists, a recovery link has been sent.",
      })
    }

    if (error.code === "EAUTH" || error.message.includes("Username and Password not accepted")) {
      console.error("Gmail authentication failed. Please check EMAIL_USER and EMAIL_PASS environment variables.")
      return res.status(500).json({
        status: "error",
        error: "Email service configuration error. Please contact administrator.",
        details:
          "Gmail authentication failed. Check if EMAIL_USER and EMAIL_PASS are configured with a valid App Password.",
      })
    }

    if (error.message.includes("Invalid login") || error.message.includes("BadCredentials")) {
      console.error("Gmail credentials invalid. Please configure App Password.")
      return res.status(500).json({
        status: "error",
        error: "Email service authentication failed. Please contact administrator.",
        details: "Gmail requires an App Password instead of regular password. Check EMAIL_SETUP.md for instructions.",
      })
    }

    res.status(500).json({
      status: "error",
      error: "Error sending recovery email",
      details: error.message,
    })
  }
}

/**
 * Controller para restablecer contraseña
 */
const resetPasswordController = async (req, res) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({
        status: "error",
        error: "Token and new password are required",
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: "error",
        error: "Password must be at least 6 characters long",
      })
    }

    console.log("=== RESET PASSWORD REQUEST ===")
    console.log("Token received:", token.substring(0, 10) + "...")

    // Restablecer contraseña
    const user = await UserRepository.resetPassword(token, newPassword)

    // Enviar email de confirmación
    await EmailService.sendPasswordChangeConfirmation(user.email, user.first_name)

    console.log("Password reset successfully for user:", user.email)

    res.json({
      status: "success",
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Error in reset password:", error.message)

    if (error.message === "Invalid or expired reset token") {
      return res.status(400).json({
        status: "error",
        error: "Invalid or expired reset token",
      })
    }

    if (error.message === "New password cannot be the same as current password") {
      return res.status(400).json({
        status: "error",
        error: "New password cannot be the same as current password",
      })
    }

    res.status(500).json({
      status: "error",
      error: "Internal server error",
    })
  }
}

/**
 * Controller para validar token de recuperación
 */
const validateResetTokenController = async (req, res) => {
  try {
    const { token } = req.params

    if (!token) {
      return res.status(400).json({
        status: "error",
        error: "Token is required",
      })
    }

    // Buscar usuario con token válido
    const UserDAO = require("../dao/UserDAO")
    const user = await UserDAO.findByResetToken(token)

    if (!user) {
      return res.status(400).json({
        status: "error",
        error: "Invalid or expired reset token",
      })
    }

    res.json({
      status: "success",
      message: "Token is valid",
      user: {
        email: user.email,
        first_name: user.first_name,
      },
    })
  } catch (error) {
    console.error("Error validating reset token:", error.message)
    res.status(500).json({
      status: "error",
      error: "Internal server error",
    })
  }
}

module.exports = {
  forgotPasswordController,
  resetPasswordController,
  validateResetTokenController,
}
