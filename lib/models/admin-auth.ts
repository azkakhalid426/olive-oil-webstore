import crypto from 'crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'admin_session'

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()

  const token =
    cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    return false
  }

  const secret =
    process.env.ADMIN_SECRET

  if (!secret) {
    return false
  }

  const parts = token.split('.')

  if (parts.length !== 2) {
    return false
  }

  const timestamp = parts[0]
  const signature = parts[1]

  const timestampNumber =
    Number(timestamp)

  if (!Number.isFinite(timestampNumber)) {
    return false
  }

  const maxAge =
    8 * 60 * 60 * 1000

  const sessionAge =
    Date.now() - timestampNumber

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
      Buffer.from(
        expectedSignature
      )
    )
  } catch {
    return false
  }
}