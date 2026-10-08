'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'

const formatPrice = (
  price: number,
  currency = 'PKR'
) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

type Customer = {
  name: string
  phone: string
  email: string
  city: string
  address: string
}

type CompletedOrder = {
  total: number
  currency: string
}

export default function CheckoutPage() {
  const {
    cart,
    subtotal,
    delivery,
    total,
    cartReady,
    clearCart,
    openCart,
    itemCount,
  } = useCart()

  const [customer, setCustomer] =
    useState<Customer>({
      name: '',
      phone: '',
      email: '',
      city: '',
      address: '',
    })

  const [placingOrder, setPlacingOrder] =
    useState(false)

  const [error, setError] = useState('')

  const [orderSuccess, setOrderSuccess] =
    useState(false)

  const [orderId, setOrderId] = useState('')

  /*
   * This state is completely independent from the
   * shared cart. It survives clearCart().
   */
  const [completedOrder, setCompletedOrder] =
    useState<CompletedOrder>({
      total: 0,
      currency: 'PKR',
    })

  const currency =
    cart[0]?.currency ?? 'PKR'

  /*
   * Restore completed order amount from sessionStorage
   * if the confirmation screen is being rendered after
   * the cart was cleared.
   */
  useEffect(() => {
    if (!orderSuccess) return

    const saved =
      sessionStorage.getItem(
        'completed-order-total'
      )

    if (!saved) return

    try {
      const parsed = JSON.parse(saved)

      if (
        typeof parsed?.total === 'number' &&
        parsed.total > 0
      ) {
        setCompletedOrder({
          total: parsed.total,
          currency:
            typeof parsed.currency === 'string'
              ? parsed.currency
              : 'PKR',
        })
      }
    } catch {
      // Ignore invalid session storage data.
    }
  }, [orderSuccess])

  const updateCustomer = (
    field: keyof Customer,
    value: string
  ) => {
    setCustomer((current) => ({
      ...current,
      [field]: value,
    }))

    if (error) {
      setError('')
    }
  }

  const placeOrder = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError('')

    if (cart.length === 0) {
      setError('Your basket is empty.')
      return
    }

    if (!customer.name.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!customer.phone.trim()) {
      setError('Please enter your phone number.')
      return
    }

    if (!customer.city.trim()) {
      setError('Please enter your city.')
      return
    }

    if (!customer.address.trim()) {
      setError(
        'Please enter your complete delivery address.'
      )
      return
    }

    /*
     * =====================================================
     * CALCULATE FINAL ORDER TOTAL BEFORE CLEARING CART
     * =====================================================
     */

    const finalSubtotal = cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          Number(item.quantity),
      0
    )

    const finalDelivery =
      finalSubtotal >= 5000 ||
      finalSubtotal === 0
        ? 0
        : 250

    const finalOrderTotal =
      finalSubtotal + finalDelivery

    const finalOrderCurrency =
      cart[0]?.currency ?? 'PKR'

    setPlacingOrder(true)

    try {
      const response = await fetch(
        '/api/orders',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer: {
              name: customer.name.trim(),
              phone: customer.phone.trim(),
              email: customer.email.trim(),
              address:
                customer.address.trim(),
              city: customer.city.trim(),
            },

            items: cart.map((item) => ({
              productId: item._id,
              quantity: item.quantity,
            })),

            paymentMethod: 'cod',
          }),
        }
      )

      const data = await response.json()
      console.log('🔥 COMPLETE ORDER API RESPONSE:', data)

      if (!response.ok) {
        throw new Error(
          data.error ||
            'We could not place your order.'
        )
      }

      /*
       * ===================================================
       * SAVE THE COMPLETED ORDER TOTAL
       * ===================================================
       */

      const completedOrderData = {
        total: finalOrderTotal,
        currency: finalOrderCurrency,
      }

      /*
       * Save in React state.
       */
      setCompletedOrder(
        completedOrderData
      )

      /*
       * Also save in sessionStorage.
       */
      sessionStorage.setItem(
        'completed-order-total',
        JSON.stringify(
          completedOrderData
        )
      )

      /*
       * ===================================================
       * SAVE CUSTOMER-FACING ORDER NUMBER
       * ===================================================
       *
       * Backend returns:
       *
       * VK-0001
       * VK-0002
       * VK-0003
       *
       * We intentionally do NOT use MongoDB _id here.
       */

      setOrderId(
        data.order?.orderNumber
          ? String(data.order.orderNumber)
          : ''
      )

      /*
       * Only clear the cart after the order has
       * successfully been created by the backend.
       */
      clearCart()

      /*
       * Now show confirmation screen.
       */
      setOrderSuccess(true)

      /*
       * Remove any checkout query parameters.
       */
      window.history.replaceState(
        {},
        '',
        '/checkout'
      )
    } catch (orderError) {
      console.error(orderError)

      setError(
        orderError instanceof Error
          ? orderError.message
          : 'We could not place your order.'
      )
    } finally {
      setPlacingOrder(false)
    }
  }

  /*
   * =========================================================
   * ORDER SUCCESS
   * =========================================================
   */

  if (orderSuccess) {
    return (
      <main className="min-h-screen bg-[#eee9dc] text-[#243328]">

        {/* ANNOUNCEMENT */}
        <div className="bg-[#243328] px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5f2e8]">
          Premium Turkish Extra Virgin Olive Oil

          <span className="mx-2 text-[#d7a66c]">
            ·
          </span>

          Delivered Across Pakistan
        </div>

        {/* HEADER */}
        <header className="border-b border-[#243328]/5 bg-[#eee9dc]">
          <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-10">

            {/* LOGO */}
            <Link
              href="/"
              className="flex flex-col leading-none"
            >
              <span className="font-serif text-[26px] font-bold tracking-[-0.04em] text-[#243328] sm:text-[30px]">
                VinKimya
              </span>

              <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-[#657064] sm:text-[9px]">
                (Private) Limited
              </span>
            </Link>

            {/* SHOP */}
            <Link
              href="/shop"
              className="group flex items-center gap-2 rounded-full border border-[#243328]/15 px-4 py-2.5 text-sm font-medium text-[#243328] transition hover:bg-white/40 sm:px-5"
            >
              <ShoppingBag className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
              Shop
            </Link>

          </div>
        </header>

        {/* SUCCESS */}
        <section className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center px-5 py-16 sm:py-20">

          <div className="w-full rounded-[2rem] bg-[#e9eee2] p-7 text-center sm:p-12">

            <CheckCircle2 className="mx-auto size-16 text-[#a26b35]" />

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#a26b35]">
              Order Confirmed
            </p>

            <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#243328] sm:text-5xl">
              Thank you for your order.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#657064] sm:text-base">
              Your order has been received
              successfully. We will contact you on
              your phone number to confirm the
              delivery.
            </p>

            {/* ORDER NUMBER */}
            {orderId && (
              <div className="mx-auto mt-7 max-w-md rounded-2xl bg-white/60 px-5 py-4">

                <p className="text-xs uppercase tracking-[0.15em] text-[#657064]">
                  Order Number
                </p>

                <p className="mt-2 break-all font-mono text-lg font-bold tracking-wide text-[#243328]">
                  {orderId}
                </p>

              </div>
            )}

            {/* ORDER TOTAL */}
            <div className="mx-auto mt-8 max-w-md rounded-2xl bg-[#243328] p-5 text-left text-white">

              <div className="flex justify-between">

                <span className="text-[#c4cdbb]">
                  Total
                </span>

                <span className="font-semibold">
                  {formatPrice(
                    completedOrder.total,
                    completedOrder.currency
                  )}
                </span>

              </div>

              <div className="mt-3 flex justify-between">

                <span className="text-[#c4cdbb]">
                  Payment
                </span>

                <span className="font-semibold">
                  Cash on Delivery
                </span>

              </div>

            </div>

            <Link
              href="/shop"
              className="mt-8 inline-flex rounded-full bg-[#243328] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3b513f]"
            >
              Continue shopping
            </Link>

          </div>

        </section>

        <Footer />

      </main>
    )
  }

  /*
   * =========================================================
   * WAIT FOR CART HYDRATION
   * =========================================================
   */

  if (!cartReady) {
    return (
      <main className="min-h-screen bg-[#eee9dc] text-[#243328]">

        <div className="bg-[#243328] px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5f2e8]">
          Premium Turkish Extra Virgin Olive Oil

          <span className="mx-2 text-[#d7a66c]">
            ·
          </span>

          Delivered Across Pakistan
        </div>

        <div className="flex min-h-[70vh] items-center justify-center px-5">

          <div className="text-center">

            <ShoppingBag className="mx-auto mb-4 size-8 text-[#a26b35]" />

            <p className="text-sm text-[#657064]">
              Preparing your checkout...
            </p>

          </div>

        </div>

      </main>
    )
  }

  /*
   * =========================================================
   * CHECKOUT
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-[#eee9dc] text-[#243328]">

      {/* ANNOUNCEMENT */}
      <div className="bg-[#243328] px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5f2e8]">
        Premium Turkish Extra Virgin Olive Oil

        <span className="mx-2 text-[#d7a66c]">
          ·
        </span>

        Delivered Across Pakistan
      </div>

      {/* NAVBAR */}
      <header className="border-b border-[#243328]/5 bg-[#eee9dc]">
        <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-10">

          {/* LOGO */}
          <Link
            href="/"
            className="flex flex-col leading-none"
          >
            <span className="font-serif text-[26px] font-bold tracking-[-0.04em] text-[#243328] sm:text-[30px]">
              VinKimya
            </span>

            <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-[#657064] sm:text-[9px]">
              (Private) Limited
            </span>
          </Link>

          {/* NAVIGATION */}
          <nav className="flex items-center gap-5 sm:gap-8">

            <Link
              href="/"
              className="text-sm font-medium text-[#657064] transition hover:text-[#a26b35]"
            >
              Home
            </Link>

            <Link
              href="/shop"
              className="text-sm font-medium text-[#657064] transition hover:text-[#a26b35]"
            >
              Shop
            </Link>

          </nav>

          {/* CART DRAWER */}
          <button
            type="button"
            onClick={openCart}
            aria-label="Shopping cart"
            title="Shopping cart"
            className="relative flex size-11 items-center justify-center rounded-full border border-[#243328]/15 bg-white/30 text-[#243328] transition hover:border-[#a26934] hover:bg-[#a26934] hover:text-white sm:size-12"
          >

            <ShoppingBag className="size-5" />

            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-[#a26934] px-1.5 py-0.5 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}

          </button>

        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:pt-14 lg:px-10 lg:pt-16">

        <div className="mb-9">

          <Link
            href="/cart"
            className="mb-7 inline-flex items-center gap-2 text-sm text-[#657064] transition hover:text-[#a26b35]"
          >
            <ArrowLeft className="size-4" />
            Back to basket
          </Link>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#a26b35]">
            Checkout
          </p>

          <h1 className="font-serif text-4xl tracking-tight text-[#243328] sm:text-5xl">
            Almost yours.
          </h1>

          <p className="mt-3 text-sm text-[#657064] sm:text-base">
            Enter your delivery details and place
            your order.
          </p>

        </div>

        {/* EMPTY CART */}
        {cart.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-[#aebba5] bg-white/20 p-10 text-center sm:p-12">

            <ShoppingBag className="mx-auto mb-4 size-8 text-[#a26b35]" />

            <p className="font-serif text-2xl text-[#243328]">
              Your basket is empty.
            </p>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#657064]">
              Add an olive oil product before
              continuing to checkout.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-full bg-[#243328] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3b513f]"
            >
              Browse the collection
            </Link>

          </div>
        ) : (

          <form
            onSubmit={placeOrder}
            className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-10"
          >

            {/* DELIVERY DETAILS */}
            <div className="rounded-[2rem] bg-[#e9eee2] p-6 sm:p-8">

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a26b35]">
                Delivery details
              </p>

              <h2 className="mt-3 font-serif text-3xl text-[#243328]">
                Where should we deliver?
              </h2>

              <div className="mt-8 grid gap-5">

                {/* NAME */}
                <div>

                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-[#243328]"
                  >
                    Full Name *
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={customer.name}
                    onChange={(event) =>
                      updateCustomer(
                        'name',
                        event.target.value
                      )
                    }
                    placeholder="Your full name"
                    required
                    autoComplete="name"
                    className="w-full rounded-2xl border border-[#cbd4c3] bg-white/70 px-4 py-3.5 text-sm outline-none transition placeholder:text-[#8b9589] focus:border-[#a26b35] focus:bg-white"
                  />

                </div>

                {/* PHONE */}
                <div>

                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-[#243328]"
                  >
                    Phone Number *
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={customer.phone}
                    onChange={(event) =>
                      updateCustomer(
                        'phone',
                        event.target.value
                      )
                    }
                    placeholder="03XX XXXXXXX"
                    required
                    autoComplete="tel"
                    className="w-full rounded-2xl border border-[#cbd4c3] bg-white/70 px-4 py-3.5 text-sm outline-none transition placeholder:text-[#8b9589] focus:border-[#a26b35] focus:bg-white"
                  />

                </div>

                {/* EMAIL */}
                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#243328]"
                  >
                    Email

                    <span className="ml-2 font-normal text-[#657064]">
                      (optional)
                    </span>
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={customer.email}
                    onChange={(event) =>
                      updateCustomer(
                        'email',
                        event.target.value
                      )
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-2xl border border-[#cbd4c3] bg-white/70 px-4 py-3.5 text-sm outline-none transition placeholder:text-[#8b9589] focus:border-[#a26b35] focus:bg-white"
                  />

                </div>

                {/* CITY */}
                <div>

                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-semibold text-[#243328]"
                  >
                    City *
                  </label>

                  <input
                    id="city"
                    type="text"
                    value={customer.city}
                    onChange={(event) =>
                      updateCustomer(
                        'city',
                        event.target.value
                      )
                    }
                    placeholder="Lahore"
                    required
                    autoComplete="address-level2"
                    className="w-full rounded-2xl border border-[#cbd4c3] bg-white/70 px-4 py-3.5 text-sm outline-none transition placeholder:text-[#8b9589] focus:border-[#a26b35] focus:bg-white"
                  />

                </div>

                {/* ADDRESS */}
                <div>

                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-semibold text-[#243328]"
                  >
                    Complete Delivery Address *
                  </label>

                  <textarea
                    id="address"
                    value={customer.address}
                    onChange={(event) =>
                      updateCustomer(
                        'address',
                        event.target.value
                      )
                    }
                    placeholder="House number, street, area, landmark..."
                    required
                    rows={4}
                    autoComplete="street-address"
                    className="w-full resize-none rounded-2xl border border-[#cbd4c3] bg-white/70 px-4 py-3.5 text-sm outline-none transition placeholder:text-[#8b9589] focus:border-[#a26b35] focus:bg-white"
                  />

                </div>

              </div>

              {/* PAYMENT */}
              <div className="mt-10 border-t border-[#cbd4c3] pt-8">

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a26b35]">
                  Payment method
                </p>

                <div className="mt-4 rounded-2xl border-2 border-[#a26b35] bg-white/60 p-5">

                  <div className="flex items-center gap-3">

                    <div className="flex size-5 items-center justify-center rounded-full border-2 border-[#a26b35]">
                      <div className="size-2.5 rounded-full bg-[#a26b35]" />
                    </div>

                    <div>

                      <p className="font-semibold text-[#243328]">
                        Cash on Delivery
                      </p>

                      <p className="mt-1 text-sm text-[#657064]">
                        Pay when your order arrives.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* ORDER SUMMARY */}
            <aside className="h-fit rounded-[2rem] bg-[#243328] p-6 text-[#f7f5ee] sm:p-7 lg:sticky lg:top-6">

              <h2 className="font-serif text-3xl">
                Your order
              </h2>

              {/* ITEMS */}
              <div className="mt-7 flex flex-col gap-5 border-b border-[#50604f] pb-6">

                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-4"
                  >

                    <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-[#344438]">

                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />

                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-semibold">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-[#aeb9aa]">
                        Qty: {item.quantity}
                      </p>

                    </div>

                    <p className="whitespace-nowrap text-sm font-semibold">
                      {formatPrice(
                        Number(item.price) *
                          Number(item.quantity),
                        item.currency
                      )}
                    </p>

                  </div>
                ))}

              </div>

              {/* TOTALS */}
              <div className="flex flex-col gap-4 border-b border-[#50604f] py-6 text-sm">

                <div className="flex justify-between">

                  <span className="text-[#c4cdbb]">
                    Subtotal
                  </span>

                  <span>
                    {formatPrice(
                      subtotal,
                      currency
                    )}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-[#c4cdbb]">
                    Delivery
                  </span>

                  <span>
                    {delivery === 0
                      ? 'Free'
                      : formatPrice(
                          delivery,
                          currency
                        )}
                  </span>

                </div>

              </div>

              {/* GRAND TOTAL */}
              <div className="flex justify-between pt-5 text-lg font-semibold">

                <span>
                  Total
                </span>

                <span>
                  {formatPrice(
                    total,
                    currency
                  )}
                </span>

              </div>

              {/* ERROR */}
              {error && (
                <p className="mt-5 rounded-xl bg-[#8d3f37] px-4 py-3 text-sm text-white">
                  {error}
                </p>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={placingOrder}
                className="mt-7 w-full rounded-full bg-[#d6a46d] px-5 py-4 text-sm font-bold text-[#243328] transition hover:bg-[#f0c18b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placingOrder
                  ? 'Placing your order...'
                  : 'Place order'}
              </button>

              <p className="mt-5 flex items-center gap-2 text-xs text-[#c4cdbb]">

                <Truck className="size-4 shrink-0" />

                Nationwide delivery in Pakistan

              </p>

              <p className="mt-3 text-xs leading-5 text-[#aeb9aa]">
                Payment will be collected when your
                order is delivered.
              </p>

            </aside>

          </form>

        )}

      </section>

      <Footer />

    </main>
  )
}

/*
 * =========================================================
 * FOOTER
 * =========================================================
 */

function Footer() {
  return (
    <footer className="bg-[#142018] px-5 py-12 text-[#d9dfd5] lg:px-10">

      <div className="mx-auto max-w-7xl">

        <div className="grid gap-10 md:grid-cols-3">

          {/* COMPANY */}
          <div>

            <div className="relative h-[75px] w-[260px] max-w-full">

              <img
                src="/vinkimya-logo.png"
                alt="VinKimya (Private) Limited"
                className="h-full w-full object-contain object-left"
              />

            </div>

            <p className="mt-4 max-w-sm text-sm leading-6 text-[#9da99f]">
              VinKimya (Private) Limited brings
              BİRSEN HANIM Premium Turkish Extra
              Virgin Olive Oil to customers across
              Pakistan.
            </p>

          </div>

          {/* EXPLORE */}
          <div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9dfd5]">
              Explore
            </p>

            <div className="mt-5 flex flex-col gap-3 text-sm text-[#9da99f]">

              <Link
                href="/"
                className="transition hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/shop"
                className="transition hover:text-white"
              >
                Shop
              </Link>

            </div>

          </div>

          {/* CONTACT */}
          <div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9dfd5]">
              Contact
            </p>

            <div className="mt-5 space-y-3 text-sm leading-6 text-[#9da99f]">

              <a
                href="mailto:info@vinkimya.com"
                className="block transition hover:text-white"
              >
                info@vinkimya.com
              </a>

              <a
                href="tel:+9242111111411"
                className="block transition hover:text-white"
              >
                UAN: +92 (42) 111 111 411
              </a>

            </div>

          </div>

        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-[#78847a]">
          © 2026 VinKimya (Private) Limited.
          All rights reserved.
        </div>

      </div>

    </footer>
  )
}