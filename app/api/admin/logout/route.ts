import { NextResponse } from 'next/server'

const COOKIE_NAME = 'admin_session'

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    })

    response.cookies.set({
      name: COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error(
      'Admin logout error:',
      error
    )

    return NextResponse.json(
      {
        error: 'Unable to logout.',
      },
      { status: 500 }
    )
  }
}