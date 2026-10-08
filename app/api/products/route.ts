import { NextResponse } from "next/server"
import { connectDB } from "../../../lib/mongodb"
import Product from "../../../lib/models/Product"

export async function GET() {
  try {
    await connectDB()

    const products = await Product.find({ active: true })
      .sort({ createdAt: 1 })
      .lean()

    const formattedProducts = products.map((product) => ({
      ...product,
      image2: product.image2 || "",
      image3: product.image3 || "",
    }))

    return NextResponse.json({
      products: formattedProducts,
    })
  } catch (error) {
    console.error("Products API error:", error)

    return NextResponse.json(
      {
        products: [],
        error: "Unable to load products.",
      },
      { status: 500 }
    )
  }
}