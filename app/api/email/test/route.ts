import { NextResponse } from "next/server"
import { sendTestEmail } from "../../../../lib/email"

export async function GET() {
  try {
    const result = await sendTestEmail()

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully.",
      data: result,
    })
  } catch (error) {
    console.error("Test email API error:", error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to send test email.",
      },
      { status: 500 }
    )
  }
}