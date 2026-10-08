import { NextResponse } from 'next/server'
import crypto from 'crypto'

const COOKIE_NAME = 'admin_session'

function createSessionToken() {
  const timestamp = Date.now().toString()

  const secret = process.env.ADMIN_SECRET

  if (!secret) {
    throw new Error(
      'ADMIN_SECRET is not configured.'
    )
  }

  const signature = crypto
    .createHmac('sha256', secret)
    .update(timestamp)
    .digest('hex')

  return `${timestamp}.${signature}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const password =
      typeof body?.password === 'string'
        ? body.password
        : ''

    const adminPassword =
      process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json(
        {
          error:
            'Admin authentication is not configured.',
        },
        { status: 500 }
      )
    }

    if (!password) {
      return NextResponse.json(
        {
          error: 'Please enter your password.',
        },
        { status: 400 }
      )
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        {
          error: 'Incorrect password.',
        },
        { status: 401 }
      )
    }

    const token = createSessionToken()

    const response = NextResponse.json({
      success: true,
      message: 'Admin login successful.',
    })

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8,
    })

    return response
  } catch (error) {
    console.error(
      'Admin login error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Unable to process admin login.',
      },
      { status: 500 }
    )
  }
}