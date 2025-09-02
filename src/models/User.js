const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    age: {
      type: Number,
      required: true,
      min: 1,
    },
    password: {
      type: String,
      required: true,
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    resetPasswordToken: {
      type: String,
      default: undefined,
    },
    resetPasswordExpires: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// Índice para email único
userSchema.index({ email: 1 }, { unique: true })

userSchema.index({ resetPasswordToken: 1 })
userSchema.index({ resetPasswordExpires: 1 })

module.exports = mongoose.model("User", userSchema)
