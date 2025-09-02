const mongoose = require("mongoose")
const Product = require("../models/Product")
const Cart = require("../models/Cart")
const database = require("../config/database")

async function seedData() {
  try {
    console.log("🌱 Iniciando seed de datos...")

    // Conectar a la base de datos
    await database.connect()

    // Limpiar datos existentes
    await Product.deleteMany({})
    await Cart.deleteMany({})
    console.log("🧹 Datos anteriores eliminados")

    // Crear productos de ejemplo
    const products = [
      {
        title: "iPhone 15 Pro",
        description: "El último iPhone con chip A17 Pro",
        code: "IPHONE15PRO",
        price: 999,
        stock: 50,
        category: "Electrónica",
        thumbnails: ["/images/no-image.png"],
      },
      {
        title: "Samsung Galaxy S24",
        description: "Smartphone Android de última generación",
        code: "GALAXYS24",
        price: 899,
        stock: 30,
        category: "Electrónica",
        thumbnails: ["/images/no-image.png"],
      },
      {
        title: "MacBook Air M3",
        description: "Laptop ultradelgada con chip M3",
        code: "MACBOOKAIRM3",
        price: 1299,
        stock: 25,
        category: "Computadoras",
        thumbnails: ["/images/no-image.png"],
      },
      {
        title: "AirPods Pro",
        description: "Auriculares inalámbricos con cancelación de ruido",
        code: "AIRPODSPRO",
        price: 249,
        stock: 100,
        category: "Accesorios",
        thumbnails: ["/images/no-image.png"],
      },
      {
        title: "iPad Pro 12.9",
        description: "Tablet profesional con pantalla Liquid Retina",
        code: "IPADPRO129",
        price: 1099,
        stock: 40,
        category: "Tablets",
        thumbnails: ["/images/no-image.png"],
      },
    ]

    const createdProducts = await Product.insertMany(products)
    console.log(`✅ ${createdProducts.length} productos creados`)

    // Crear un carrito de ejemplo
    const cart = new Cart({
      products: [
        {
          product: createdProducts[0]._id, // iPhone
          quantity: 2,
        },
        {
          product: createdProducts[3]._id, // AirPods
          quantity: 1,
        },
      ],
    })

    const savedCart = await cart.save()
    console.log(`✅ Carrito creado con ID: ${savedCart._id}`)

    // Mostrar información útil
    console.log("\n📊 DATOS CREADOS:")
    console.log("==================")
    console.log("🛍️ PRODUCTOS:")
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} (ID: ${product._id})`)
    })

    console.log(`\n🛒 CARRITO:`)
    console.log(`ID: ${savedCart._id}`)
    console.log(`URL: http://localhost:8080/cart/${savedCart._id}`)

    console.log("\n🔗 URLS ÚTILES:")
    console.log("==================")
    console.log("🏠 Inicio: http://localhost:8080")
    console.log("⚡ Tiempo real: http://localhost:8080/realtimeproducts")
    console.log(`🛒 Carrito: http://localhost:8080/cart/${savedCart._id}`)
    console.log("📡 API Productos: http://localhost:8080/api/products")
    console.log(`📡 API Carrito: http://localhost:8080/api/carts/${savedCart._id}`)

    await database.disconnect()
    console.log("\n🎉 Seed completado exitosamente!")
  } catch (error) {
    console.error("❌ Error en seed:", error)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedData()
}

module.exports = seedData
