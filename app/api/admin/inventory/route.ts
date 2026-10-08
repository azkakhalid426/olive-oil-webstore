import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { connectDB } from '../../../../lib/mongodb'
import Product from '../../../../lib/models/Product'

const COOKIE_NAME = 'admin_session'

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

  if (sessionAge > maxAge || sessionAge < 0) {
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
   GET INVENTORY
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

    const products = await Product.find({
      active: true,
    })
      .sort({ bundleQuantity: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      products,
    })
  } catch (error) {
    console.error(
      'Admin inventory GET error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Unable to load inventory.',
      },
      { status: 500 }
    )
  }
}

/* =========================
   UPDATE STOCK
========================= */

export async function PATCH(
  request: Request
) {
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

    const productId =
      typeof body?.productId === 'string'
        ? body.productId.trim()
        : ''

    const stock = Number(body?.stock)

    if (!productId) {
      return NextResponse.json(
        {
          error:
            'Product ID is required.',
        },
        { status: 400 }
      )
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return NextResponse.json(
        {
          error:
            'Stock must be a whole number greater than or equal to 0.',
        },
        { status: 400 }
      )
    }

    const product =
      await Product.findByIdAndUpdate(
        productId,
        {
          $set: {
            stock,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      ).lean()

    if (!product) {
      return NextResponse.json(
        {
          error: 'Product not found.',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error(
      'Admin inventory PATCH error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Unable to update stock.',
      },
      { status: 500 }
    )
  }
}