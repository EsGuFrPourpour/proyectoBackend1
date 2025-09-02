const nodemailer = require("nodemailer")

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  async sendPasswordResetEmail(email, resetToken, userName) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:8080"}/reset-password?token=${resetToken}`

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Recuperación de Contraseña - E-commerce",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Recuperación de Contraseña</h2>
            <p>Hola ${userName},</p>
            <p>Recibimos una solicitud para restablecer tu contraseña. Si no fuiste tú, puedes ignorar este correo.</p>
            <p>Para restablecer tu contraseña, haz clic en el siguiente botón:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Restablecer Contraseña
              </a>
            </div>
            <p><strong>Este enlace expirará en 1 hora.</strong></p>
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        `,
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log("Email de recuperación enviado:", result.messageId)
      return true
    } catch (error) {
      console.error("Error enviando email de recuperación:", error)
      throw new Error("Error sending recovery email")
    }
  }

  async sendPasswordChangeConfirmation(email, userName) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Contraseña Cambiada - E-commerce",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Contraseña Cambiada Exitosamente</h2>
            <p>Hola ${userName},</p>
            <p>Tu contraseña ha sido cambiada exitosamente.</p>
            <p>Si no fuiste tú quien realizó este cambio, contacta inmediatamente a nuestro soporte.</p>
            <p>Fecha y hora: ${new Date().toLocaleString()}</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        `,
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log("Email de confirmación enviado:", result.messageId)
      return true
    } catch (error) {
      console.error("Error enviando email de confirmación:", error)
      return false
    }
  }
}

module.exports = new EmailService()
