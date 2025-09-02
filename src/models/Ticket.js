const mongoose = require("mongoose")

const ticketSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    purchase_datetime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    purchaser: {
      type: String,
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "completed",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// Índices para optimizar consultas
ticketSchema.index({ code: 1 }, { unique: true })
ticketSchema.index({ purchaser: 1 })
ticketSchema.index({ user: 1 })
ticketSchema.index({ purchase_datetime: -1 })

module.exports = mongoose.model("Ticket", ticketSchema)
