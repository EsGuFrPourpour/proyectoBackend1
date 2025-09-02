const mongoose = require("mongoose")
const Product = require("../models/Product")
const database = require("../config/database")
const logger = require("../utils/logger")

async function fixProductStock() {
  try {
    console.log("[v0] Conectando a la base de datos...")
    await database.connect()

    console.log("[v0] Verificando productos con stock...")

    // Obtener todos los productos
    const products = await Product.find({})
    console.log(`[v0] Total de productos encontrados: ${products.length}`)

    // Mostrar el stock actual de cada producto
    console.log("\n[v0] ESTADO ACTUAL DEL STOCK:")
    console.log("================================")
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`)
      console.log(`   - ID: ${product._id}`)
      console.log(`   - Stock actual: ${product.stock} (tipo: ${typeof product.stock})`)
      console.log(`   - Stock > 0: ${product.stock > 0}`)
      console.log(`   - Stock truthy: ${!!product.stock}`)
      console.log("   ---")
    })

    // Contar productos sin stock
    const productsWithoutStock = products.filter((p) => !p.stock || p.stock <= 0)
    const productsWithStock = products.filter((p) => p.stock && p.stock > 0)

    console.log(`\n[v0] RESUMEN:`)
    console.log(`- Productos con stock: ${productsWithStock.length}`)
    console.log(`- Productos sin stock: ${productsWithoutStock.length}`)

    if (productsWithoutStock.length > 0) {
      console.log("\n[v0] PRODUCTOS SIN STOCK:")
      productsWithoutStock.forEach((product) => {
        console.log(`- ${product.title}: stock = ${product.stock}`)
      })

      // Preguntar si queremos corregir el stock
      console.log("\n[v0] Corrigiendo stock de productos...")

      // Actualizar productos sin stock con valores por defecto
      const updates = [
        { title: "iPhone 13 Pro", stock: 50 },
        { title: "MacBook Pro M2", stock: 30 },
        { title: "AirPods Pro", stock: 100 },
        { title: "iPad Air", stock: 25 },
        { title: "Apple Watch Series 8", stock: 40 },
      ]

      for (const update of updates) {
        const result = await Product.updateOne({ title: update.title }, { $set: { stock: update.stock } })

        if (result.modifiedCount > 0) {
          console.log(`[v0] ✅ Actualizado ${update.title}: stock = ${update.stock}`)
        } else {
          console.log(`[v0] ⚠️  No se encontró producto: ${update.title}`)
        }
      }

      // Verificar productos después de la actualización
      console.log("\n[v0] VERIFICANDO DESPUÉS DE LA ACTUALIZACIÓN:")
      const updatedProducts = await Product.find({})
      updatedProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title}: stock = ${product.stock}`)
      })
    } else {
      console.log("\n[v0] ✅ Todos los productos tienen stock correcto")
    }

    console.log("\n[v0] Script completado exitosamente")
  } catch (error) {
    console.error("[v0] Error en el script:", error)
    logger.error("Error fixing product stock:", error)
  }
}

// Ejecutar el script
fixProductStock()
