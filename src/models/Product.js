const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnails: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// Agregar plugin de paginación
productSchema.plugin(mongoosePaginate)

// Índices para mejorar performance
productSchema.index({ category: 1 })
productSchema.index({ price: 1 })
productSchema.index({ title: "text", description: "text" })

module.exports = mongoose.model("Product", productSchema)
