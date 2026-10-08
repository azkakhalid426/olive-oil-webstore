import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "onboarding@resend.dev"

function formatPKR(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount)
}

function getOrderId(order: any) {
  return order?._id?.toString() || ""
}

function getItemsHtml(order: any) {
  return order.items
    .map(
      (item: any) => `
        <tr>
          <td style="padding: 12px 8px; border-bottom: 1px solid #e5e5e5;">
            ${item.name}
          </td>

          <td style="padding: 12px 8px; border-bottom: 1px solid #e5e5e5; text-align: center;">
            ${item.quantity}
          </td>

          <td style="padding: 12px 8px; border-bottom: 1px solid #e5e5e5; text-align: right;">
            ${formatPKR(item.price * item.quantity)}
          </td>
        </tr>
      `
    )
    .join("")
}

/* =========================================
   ADMIN NEW ORDER EMAIL
========================================= */

export async function sendAdminOrderEmail(order: any) {
  const adminEmail = process.env.ADMIN_ORDER_EMAIL

  if (!adminEmail) {
    throw new Error(
      "ADMIN_ORDER_EMAIL is not defined in .env.local"
    )
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not defined in .env.local"
    )
  }

  const orderId = getOrderId(order)
  const itemsHtml = getItemsHtml(order)

  const { data, error } = await resend.emails.send({
    from: `BİRSEN HANIM <${FROM_EMAIL}>`,
    to: [adminEmail],

    subject: `🛒 New Order #${orderId.slice(-8).toUpperCase()} - BİRSEN HANIM`,

    html: `
      <div style="
        margin: 0;
        padding: 30px 15px;
        background: #eee9dc;
        font-family: Arial, Helvetica, sans-serif;
        color: #243328;
      ">

        <div style="
          max-width: 700px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
        ">

          <div style="
            background: #243328;
            color: #ffffff;
            padding: 25px;
            text-align: center;
          ">
            <h1 style="
              margin: 0;
              font-size: 25px;
              letter-spacing: 1px;
            ">
              BİRSEN HANIM
            </h1>

            <p style="
              margin: 8px 0 0;
              color: #eee9dc;
              font-size: 14px;
            ">
              New Order Received
            </p>
          </div>

          <div style="padding: 30px;">

            <h2 style="
              margin-top: 0;
              color: #243328;
            ">
              New Order 🛒
            </h2>

            <p>
              A new Cash on Delivery order has been placed
              on your website.
            </p>

            <div style="
              background: #f5f2e9;
              padding: 18px;
              border-radius: 8px;
              margin: 20px 0;
            ">

              <p style="margin: 5px 0;">
                <strong>Order ID:</strong>
                #${orderId.toUpperCase()}
              </p>

              <p style="margin: 5px 0;">
                <strong>Order Status:</strong>
                ${order.orderStatus}
              </p>

              <p style="margin: 5px 0;">
                <strong>Payment:</strong>
                Cash on Delivery
              </p>

            </div>

            <h3 style="
              color: #243328;
              border-bottom: 1px solid #ddd;
              padding-bottom: 8px;
            ">
              Customer Details
            </h3>

            <p>
              <strong>Name:</strong>
              ${order.customer.name}
            </p>

            <p>
              <strong>Phone:</strong>
              ${order.customer.phone}
            </p>

            ${
              order.customer.email
                ? `
                  <p>
                    <strong>Email:</strong>
                    ${order.customer.email}
                  </p>
                `
                : ""
            }

            <p>
              <strong>City:</strong>
              ${order.customer.city}
            </p>

            <p>
              <strong>Address:</strong>
              ${order.customer.address}
            </p>

            <h3 style="
              margin-top: 30px;
              color: #243328;
              border-bottom: 1px solid #ddd;
              padding-bottom: 8px;
            ">
              Order Items
            </h3>

            <table style="
              width: 100%;
              border-collapse: collapse;
              font-size: 14px;
            ">

              <thead>
                <tr>
                  <th style="
                    padding: 10px 8px;
                    text-align: left;
                    border-bottom: 2px solid #243328;
                  ">
                    Product
                  </th>

                  <th style="
                    padding: 10px 8px;
                    text-align: center;
                    border-bottom: 2px solid #243328;
                  ">
                    Qty
                  </th>

                  <th style="
                    padding: 10px 8px;
                    text-align: right;
                    border-bottom: 2px solid #243328;
                  ">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                ${itemsHtml}
              </tbody>

            </table>

            <div style="
              margin-top: 25px;
              padding: 20px;
              background: #f5f2e9;
              border-radius: 8px;
            ">

              <p style="
                margin: 5px 0;
                text-align: right;
              ">
                <strong>Subtotal:</strong>
                ${formatPKR(order.subtotal)}
              </p>

              <p style="
                margin: 5px 0;
                text-align: right;
              ">
                <strong>Delivery:</strong>
                ${
                  order.delivery === 0
                    ? "FREE"
                    : formatPKR(order.delivery)
                }
              </p>

              <p style="
                margin: 12px 0 0;
                padding-top: 12px;
                border-top: 1px solid #ddd;
                text-align: right;
                font-size: 20px;
              ">
                <strong>Total:</strong>
                ${formatPKR(order.total)}
              </p>

            </div>

            <div style="
              margin-top: 30px;
              padding: 15px;
              border-left: 4px solid #a26b35;
              background: #faf9f5;
            ">
              <strong>Action Required:</strong>
              Please review the order in the Admin Dashboard
              and contact the customer for confirmation.
            </div>

          </div>

          <div style="
            background: #142018;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            font-size: 13px;
          ">
            VinKimya (Private) Limited<br />
            BİRSEN HANIM Extra Virgin Olive Oil
          </div>

        </div>

      </div>
    `,
  })

  if (error) {
    console.error(
      "Admin order email error:",
      error
    )

    throw new Error(
      error.message ||
        "Unable to send admin order email."
    )
  }

  return data
}

/* =========================================
   CUSTOMER ORDER CONFIRMATION EMAIL
========================================= */

export async function sendCustomerOrderEmail(
  order: any
) {
  const customerEmail =
    order?.customer?.email

  if (!customerEmail) {
    return null
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not defined in .env.local"
    )
  }

  const orderId = getOrderId(order)
  const itemsHtml = getItemsHtml(order)

  const { data, error } = await resend.emails.send({
    from: `BİRSEN HANIM <${FROM_EMAIL}>`,
    to: [customerEmail],

    subject: `Order Confirmed #${orderId
      .slice(-8)
      .toUpperCase()} - BİRSEN HANIM`,

    html: `
      <div style="
        margin: 0;
        padding: 30px 15px;
        background: #eee9dc;
        font-family: Arial, Helvetica, sans-serif;
        color: #243328;
      ">

        <div style="
          max-width: 700px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
        ">

          <div style="
            background: #243328;
            color: #ffffff;
            padding: 30px;
            text-align: center;
          ">

            <h1 style="
              margin: 0;
              font-size: 25px;
              letter-spacing: 1px;
            ">
              BİRSEN HANIM
            </h1>

            <p style="
              margin: 10px 0 0;
              color: #eee9dc;
            ">
              Extra Virgin Olive Oil
            </p>

          </div>

          <div style="padding: 30px;">

            <div style="
              text-align: center;
              padding: 10px 0 25px;
            ">

              <div style="
                font-size: 42px;
                margin-bottom: 10px;
              ">
                ✓
              </div>

              <h2 style="
                margin: 0;
                color: #243328;
              ">
                Order Confirmed
              </h2>

              <p style="
                color: #657064;
                margin-top: 10px;
              ">
                Thank you for your order,
                ${order.customer.name}.
              </p>

            </div>

            <div style="
              background: #f5f2e9;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
            ">

              <p style="
                margin: 5px 0;
                color: #657064;
              ">
                Your Order Number
              </p>

              <p style="
                margin: 8px 0;
                font-size: 22px;
                font-weight: bold;
                color: #243328;
              ">
                #${orderId.toUpperCase()}
              </p>

              <p style="
                margin: 5px 0;
              ">
                <strong>Payment:</strong>
                Cash on Delivery
              </p>

            </div>

            <h3 style="
              margin-top: 30px;
              color: #243328;
              border-bottom: 1px solid #ddd;
              padding-bottom: 8px;
            ">
              Your Order
            </h3>

            <table style="
              width: 100%;
              border-collapse: collapse;
              font-size: 14px;
            ">

              <thead>
                <tr>

                  <th style="
                    padding: 10px 8px;
                    text-align: left;
                    border-bottom: 2px solid #243328;
                  ">
                    Product
                  </th>

                  <th style="
                    padding: 10px 8px;
                    text-align: center;
                    border-bottom: 2px solid #243328;
                  ">
                    Qty
                  </th>

                  <th style="
                    padding: 10px 8px;
                    text-align: right;
                    border-bottom: 2px solid #243328;
                  ">
                    Amount
                  </th>

                </tr>
              </thead>

              <tbody>
                ${itemsHtml}
              </tbody>

            </table>

            <div style="
              margin-top: 25px;
              padding: 20px;
              background: #f5f2e9;
              border-radius: 8px;
            ">

              <p style="
                margin: 5px 0;
                text-align: right;
              ">
                <strong>Subtotal:</strong>
                ${formatPKR(order.subtotal)}
              </p>

              <p style="
                margin: 5px 0;
                text-align: right;
              ">
                <strong>Delivery:</strong>
                ${
                  order.delivery === 0
                    ? "FREE"
                    : formatPKR(order.delivery)
                }
              </p>

              <p style="
                margin: 12px 0 0;
                padding-top: 12px;
                border-top: 1px solid #ddd;
                text-align: right;
                font-size: 20px;
              ">
                <strong>Total:</strong>
                ${formatPKR(order.total)}
              </p>

            </div>

            <div style="
              margin-top: 30px;
              padding: 18px;
              background: #faf9f5;
              border-radius: 8px;
            ">

              <h3 style="
                margin-top: 0;
                color: #243328;
              ">
                Delivery Information
              </h3>

              <p>
                <strong>City:</strong>
                ${order.customer.city}
              </p>

              <p>
                <strong>Address:</strong>
                ${order.customer.address}
              </p>

              <p>
                <strong>Phone:</strong>
                ${order.customer.phone}
              </p>

            </div>

            <div style="
              margin-top: 25px;
              padding: 18px;
              border-left: 4px solid #a26b35;
              background: #faf9f5;
            ">

              <strong>What's next?</strong>

              <p style="
                margin-bottom: 0;
                color: #657064;
              ">
                We will contact you on your provided phone
                number to confirm your Cash on Delivery order.
              </p>

            </div>

          </div>

          <div style="
            background: #142018;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            font-size: 13px;
          ">
            VinKimya (Private) Limited<br />
            BİRSEN HANIM Extra Virgin Olive Oil
          </div>

        </div>

      </div>
    `,
  })

  if (error) {
    console.error(
      "Customer order email error:",
      error
    )

    throw new Error(
      error.message ||
        "Unable to send customer order email."
    )
  }

  return data
}

/* =========================================
   TEST EMAIL
========================================= */

export async function sendTestEmail() {
  const adminEmail =
    process.env.ADMIN_ORDER_EMAIL

  if (!adminEmail) {
    throw new Error(
      "ADMIN_ORDER_EMAIL is not defined in .env.local"
    )
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not defined in .env.local"
    )
  }

  const { data, error } =
    await resend.emails.send({
      from: `BİRSEN HANIM <${FROM_EMAIL}>`,
      to: [adminEmail],

      subject:
        "BİRSEN HANIM - Email System Test",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #243328;
        ">

          <h2>
            BİRSEN HANIM Extra Virgin Olive Oil
          </h2>

          <p>
            This is a test email from your new
            order notification system.
          </p>

          <p>
            <strong>
              Resend email integration is working successfully.
            </strong>
          </p>

          <p>
            The system is now ready to send
            new order notifications.
          </p>

          <hr />

          <p style="color: #657064;">
            VinKimya (Private) Limited
          </p>

        </div>
      `,
    })

  if (error) {
    console.error(
      "Resend email error:",
      error
    )

    throw new Error(
      error.message ||
        "Unable to send email"
    )
  }

  return data
}