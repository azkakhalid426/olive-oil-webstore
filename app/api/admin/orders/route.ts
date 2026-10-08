import { NextResponse } from 'next/server'
import crypto from 'crypto'
import mongoose from 'mongoose'
import { cookies } from 'next/headers'
import { connectDB } from '../../../../lib/mongodb'
import Order from '../../../../lib/models/Order'
import Product from '../../../../lib/models/Product'

const COOKIE_NAME = 'admin_session'

const ALLOWED_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

async function isAdminAuthenticated() {
  const cookieStore = await cookies()

  const token =
    cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    return false
  }

  const secret = process.env.ADMIN_SECRET

  if (!secret) {
    return false
  }

  const parts = token.split('.')

  if (parts.length !== 2) {
    return false
  }

  const timestamp = parts[0]
  const signature = parts[1]

  const timestampNumber = Number(timestamp)

  if (!Number.isFinite(timestampNumber)) {
    return false
  }

  const sessionAge =
    Date.now() - timestampNumber

  const maxAge =
    8 * 60 * 60 * 1000

  if (sessionAge > maxAge) {
    return false
  }

  if (sessionAge < 0) {
    return false
  }

  const expectedSignature =
    crypto
      .createHmac(
        'sha256',
        secret
      )
      .update(timestamp)
      .digest('hex')

  if (
    signature.length !==
    expectedSignature.length
  ) {
    return false
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

/* =========================
   GET ALL ORDERS
========================= */

export async function GET() {
  try {
    const authenticated =
      await isAdminAuthenticated()

    if (!authenticated) {
      return NextResponse.json(
        {
          error: 'Unauthorized.',
        },
        { status: 401 }
      )
    }

    await connectDB()

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error(
      'Admin orders GET error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Unable to load orders.',
      },
      { status: 500 }
    )
  }
}

/* =========================
   UPDATE ORDER STATUS
========================= */

export async function PATCH(
  request: Request
) {
  const session =
    await mongoose.startSession()

  try {
    const authenticated =
      await isAdminAuthenticated()

    if (!authenticated) {
      return NextResponse.json(
        {
          error: 'Unauthorized.',
        },
        { status: 401 }
      )
    }

    await connectDB()

    const body = await request.json()

    const orderId =
      typeof body?.orderId === 'string'
        ? body.orderId.trim()
        : ''

    const newStatus =
      typeof body?.orderStatus === 'string'
        ? body.orderStatus.trim()
        : ''

    if (!orderId) {
      return NextResponse.json(
        {
          error: 'Order ID is required.',
        },
        { status: 400 }
      )
    }

    if (
      !ALLOWED_STATUSES.includes(
        newStatus
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid order status.',
        },
        { status: 400 }
      )
    }

    session.startTransaction()

    const order =
      await Order.findById(
        orderId
      ).session(session)

    if (!order) {
      await session.abortTransaction()

      return NextResponse.json(
        {
          error: 'Order not found.',
        },
        { status: 404 }
      )
    }

    const oldStatus =
      order.orderStatus

    /* =========================
       NO CHANGE
    ========================= */

    if (oldStatus === newStatus) {
      await session.commitTransaction()

      return NextResponse.json({
        success: true,
        order,
      })
    }

    /* =========================
       CANCEL ORDER
       
       Restore stock.
    ========================= */

    if (
      newStatus === 'cancelled' &&
      oldStatus !== 'cancelled'
    ) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: {
              stock: item.quantity,
            },
          },
          {
            session,
          }
        )
      }
    }

    /* =========================
       REOPEN CANCELLED ORDER
       
       Deduct stock again.
    ========================= */

    if (
      oldStatus === 'cancelled' &&
      newStatus !== 'cancelled'
    ) {
      for (const item of order.items) {
        const product =
          await Product.findOneAndUpdate(
            {
              _id: item.productId,
              active: true,
              stock: {
                $gte: item.quantity,
              },
            },
            {
              $inc: {
                stock: -item.quantity,
              },
            },
            {
              new: true,
              session,
            }
          )

        if (!product) {
          await session.abortTransaction()

          return NextResponse.json(
            {
              error:
                `Not enough stock is available to reactivate "${item.name}".`,
            },
            { status: 400 }
          )
        }
      }
    }

    /* =========================
       UPDATE ORDER STATUS
    ========================= */

    order.orderStatus =
      newStatus

    await order.save({
      session,
    })

    await session.commitTransaction()

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error) {
    try {
      await session.abortTransaction()
    } catch {
      // Transaction may already be closed.
    }

    console.error(
      'Admin order update error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Unable to update order.',
      },
      { status: 500 }
    )
  } finally {
    await session.endSession()
  }
}