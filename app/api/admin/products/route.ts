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

  if (
    sessionAge > maxAge ||
    sessionAge < 0
  ) {
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
   GET PRODUCTS
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

    const products = await Product.find({})
      .sort({ bundleQuantity: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      products,
    })
  } catch (error) {
    console.error(
      'Admin products GET error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Unable to load products.',
      },
      { status: 500 }
    )
  }
}

/* =========================
   UPDATE PRODUCT
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

    if (!productId) {
      return NextResponse.json(
        {
          error:
            'Product ID is required.',
        },
        { status: 400 }
      )
    }

    const price = Number(body?.price)

    const compareAtPrice =
      body?.compareAtPrice === '' ||
      body?.compareAtPrice === null ||
      body?.compareAtPrice === undefined
        ? undefined
        : Number(body.compareAtPrice)

    const active =
      body?.active === true

    const image =
      typeof body?.image === 'string'
        ? body.image.trim()
        : undefined

    const image2 =
      typeof body?.image2 === 'string'
        ? body.image2.trim()
        : undefined

    const image3 =
      typeof body?.image3 === 'string'
        ? body.image3.trim()
        : undefined

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return NextResponse.json(
        {
          error:
            'Price must be a valid number greater than or equal to 0.',
        },
        { status: 400 }
      )
    }

    if (
      compareAtPrice !== undefined &&
      (!Number.isFinite(
        compareAtPrice
      ) ||
        compareAtPrice < 0)
    ) {
      return NextResponse.json(
        {
          error:
            'Compare-at price must be a valid number greater than or equal to 0.',
        },
        { status: 400 }
      )
    }

    if (
      compareAtPrice !== undefined &&
      compareAtPrice < price
    ) {
      return NextResponse.json(
        {
          error:
            'Compare-at price should be greater than or equal to the selling price.',
        },
        { status: 400 }
      )
    }

    if (
      image !== undefined &&
      image.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            'Main product image cannot be empty.',
        },
        { status: 400 }
      )
    }

    const updateData: {
      price: number
      active: boolean
      compareAtPrice?: number
      image?: string
      image2?: string
      image3?: string
    } = {
      price,
      active,
    }

    if (
      compareAtPrice !== undefined
    ) {
      updateData.compareAtPrice =
        compareAtPrice
    } else {
      updateData.compareAtPrice = 0
    }

    if (image !== undefined) {
      updateData.image = image
    }

    if (image2 !== undefined) {
      updateData.image2 = image2
    }

    if (image3 !== undefined) {
      updateData.image3 = image3
    }

    const product =
      await Product.findByIdAndUpdate(
        productId,
        {
          $set: updateData,
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
      'Admin products PATCH error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Unable to update product.',
      },
      { status: 500 }
    )
  }
}