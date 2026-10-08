import { NextResponse } from "next/server"
import { connectDB } from "../../../lib/mongodb"
import Product from "../../../lib/models/Product"
import Order from "../../../lib/models/Order"
import OrderCounter from "../../../lib/models/OrderCounter"
import {
  sendAdminOrderEmail,
  sendCustomerOrderEmail,
} from "../../../lib/email"

console.log("🔥 ORDERS ROUTE FILE LOADED 🔥")

const ALLOWED_PAYMENT_METHODS = [
  "cod",
  "bank_transfer",
  "jazzcash",
  "easypaisa",
  "card",
] as const

type PaymentMethod =
  (typeof ALLOWED_PAYMENT_METHODS)[number]

export async function POST(request: Request) {
  try {
    await connectDB()

    const body = await request.json()

    const {
      customer,
      items,
      paymentMethod,
    } = body

    console.log(
      "ORDER DEBUG: Order request received"
    )

    console.log(
      "ORDER DEBUG: Customer email:",
      customer?.email || "(empty)"
    )

    console.log(
      "ORDER DEBUG: Payment method:",
      paymentMethod
    )

    console.log(
      "ORDER DEBUG: Items:",
      items
    )

    // =====================================================
    // VALIDATE CUSTOMER
    // =====================================================

    if (
      !customer?.name ||
      !customer?.phone ||
      !customer?.address ||
      !customer?.city
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide all required customer information.",
        },
        {
          status: 400,
        }
      )
    }

    // =====================================================
    // VALIDATE CART
    // =====================================================

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Your cart is empty.",
        },
        {
          status: 400,
        }
      )
    }

    if (items.length > 20) {
      return NextResponse.json(
        {
          error:
            "Too many different products in the order.",
        },
        {
          status: 400,
        }
      )
    }

    // =====================================================
    // VALIDATE PAYMENT METHOD
    // =====================================================

    if (
      !ALLOWED_PAYMENT_METHODS.includes(
        paymentMethod as PaymentMethod
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Please select a valid payment method.",
        },
        {
          status: 400,
        }
      )
    }

    const selectedPaymentMethod =
      paymentMethod as PaymentMethod

    // =====================================================
    // GET PRODUCTS
    // =====================================================

    const productIds = items.map(
      (item: any) => item.productId
    )

    const products = await Product.find({
      _id: {
        $in: productIds,
      },
      active: true,
    }).lean()

    if (products.length !== items.length) {
      return NextResponse.json(
        {
          error:
            "One or more products are no longer available.",
        },
        {
          status: 400,
        }
      )
    }

    // =====================================================
    // BUILD ORDER ITEMS
    // =====================================================

    const orderItems = []

    for (const item of items) {
      const product = products.find(
        (product) =>
          product._id.toString() ===
          item.productId
      )

      if (!product) {
        return NextResponse.json(
          {
            error:
              "A selected product could not be found.",
          },
          {
            status: 400,
          }
        )
      }

      const quantity = Math.floor(
        Number(item.quantity)
      )

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid product quantity.",
          },
          {
            status: 400,
          }
        )
      }

      if (quantity > product.stock) {
        return NextResponse.json(
          {
            error:
              `${product.name} does not have enough stock.`,
          },
          {
            status: 400,
          }
        )
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
        bundleQuantity:
          product.bundleQuantity,
      })
    }

    // =====================================================
    // CALCULATE TOTALS
    // =====================================================

    const subtotal = orderItems.reduce(
      (sum, item) =>
        sum +
        item.price * item.quantity,
      0
    )

    const delivery =
      subtotal >= 5000 || subtotal === 0
        ? 0
        : 250

    const total = subtotal + delivery

    console.log(
      "ORDER DEBUG: Subtotal:",
      subtotal
    )

    console.log(
      "ORDER DEBUG: Delivery:",
      delivery
    )

    console.log(
      "ORDER DEBUG: Total:",
      total
    )

    // =====================================================
    // GENERATE SEQUENTIAL ORDER NUMBER
    //
    // VK-0001
    // VK-0002
    // VK-0003
    //
    // findOneAndUpdate with $inc is atomic,
    // so simultaneous orders cannot receive
    // the same sequence number.
    // =====================================================

    const counter =
      await OrderCounter.findOneAndUpdate(
        {
          name: "order",
        },
        {
          $inc: {
            sequence: 1,
          },
          $setOnInsert: {
            name: "order",
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      )

    const sequenceNumber = counter.sequence

    const orderNumber =
      `VK-${String(sequenceNumber).padStart(4, "0")}`

    console.log(
      "ORDER DEBUG: Generated order number:",
      orderNumber
    )

    // =====================================================
    // CREATE ORDER
    // =====================================================

    const order = await Order.create({
      orderNumber,

      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email:
          customer.email?.trim() || "",
        address:
          customer.address.trim(),
        city: customer.city.trim(),
      },

      items: orderItems,

      subtotal,
      delivery,
      total,

      currency: "PKR",

      paymentMethod:
        selectedPaymentMethod,

      paymentStatus: "pending",

      orderStatus: "pending",
    })

    console.log(
      "ORDER DEBUG: Order created:",
      order._id.toString()
    )

    console.log(
      "ORDER DEBUG: Order number:",
      order.orderNumber
    )

    console.log(
      "ORDER DEBUG: Stored payment method:",
      order.paymentMethod
    )

    console.log(
      "ORDER DEBUG: Stored customer email:",
      order.customer.email ||
        "(empty)"
    )

    // =====================================================
    // REDUCE STOCK
    // =====================================================

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      )
    }

    console.log(
      "ORDER DEBUG: Stock updated"
    )

    // =====================================================
    // ADMIN EMAIL
    // =====================================================

    try {
      console.log(
        "EMAIL DEBUG: Starting admin email..."
      )

      const adminEmailResult =
        await sendAdminOrderEmail(order)

      console.log(
        "EMAIL DEBUG: Admin email result:",
        adminEmailResult
      )
    } catch (emailError) {
      console.error(
        "EMAIL DEBUG: Admin email failed:",
        emailError
      )
    }

    // =====================================================
    // CUSTOMER EMAIL
    // =====================================================

    if (order.customer.email) {
      try {
        console.log(
          "EMAIL DEBUG: Starting customer email...",
          order.customer.email
        )

        const customerEmailResult =
          await sendCustomerOrderEmail(order)

        console.log(
          "EMAIL DEBUG: Customer email result:",
          customerEmailResult
        )
      } catch (emailError) {
        console.error(
          "EMAIL DEBUG: Customer email failed:",
          emailError
        )
      }
    } else {
      console.log(
        "EMAIL DEBUG: Customer email skipped because no email was provided."
      )
    }

    // =====================================================
    // SUCCESS RESPONSE
    // =====================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Order placed successfully.",

        order: {
          id: order._id,

          orderNumber:
            order.orderNumber,

          total: order.total,

          currency:
            order.currency,

          paymentMethod:
            order.paymentMethod,

          paymentStatus:
            order.paymentStatus,

          orderStatus:
            order.orderStatus,
        },
      },
      {
        status: 201,
      }
    )
  } catch (error) {
    console.error(
      "Create order error:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Unable to place your order right now.",
      },
      {
        status: 500,
      }
    )
  }
}