'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'

type Product = {
  _id: string
  name: string
  description: string
  image: string
  price: number
  compareAtPrice?: number
  currency: string
  size: string
  bundleQuantity: number
  stock: number
  active: boolean
}

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

export default function CartPage() {
  const {
    cart,
    itemCount,
    subtotal,
    delivery,
    total,
    cartReady,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    addToCart,
  } = useCart()

  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] =
    useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadProducts = async () => {
      try {
        setProductsLoading(true)
        setError('')

        const response = await fetch('/api/products')

        if (!response.ok) {
          throw new Error('Failed to load products.')
        }

        const data = await response.json()

        if (!cancelled) {
          setProducts(data.products ?? [])
        }
      } catch {
        if (!cancelled) {
          setError(
            'We could not load the available bundles right now.'
          )
        }
      } finally {
        if (!cancelled) {
          setProductsLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      cancelled = true
    }
  }, [])

  const currency = cart[0]?.currency ?? 'PKR'

  const addBundle = (bundleQuantity: number) => {
    const bundle = products.find(
      (product) =>
        product.bundleQuantity === bundleQuantity &&
        product.active
    )

    if (!bundle) {
      setError(
        bundleQuantity === 2
          ? 'The 2-bottle bundle is currently unavailable.'
          : 'The 3-bottle bundle is currently unavailable.'
      )
      return
    }

    if (bundle.stock <= 0) {
      setError(
        `${bundle.name} is currently out of stock.`
      )
      return
    }

    setError('')

    addToCart(bundle, 1)
  }

  return (
    <main className="min-h-screen bg-[#eee9dc] text-[#243328]">
      {/* =========================================================
          TOP ANNOUNCEMENT BAR
      ========================================================= */}

      <div className="bg-[#243328] px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5f2e8]">
        Premium Turkish Extra Virgin Olive Oil
        <span className="mx-2 text-[#d7a66c]">
          ·
        </span>
        Delivered Across Pakistan
      </div>

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header className="relative z-50 border-b border-[#243328]/5 bg-[#eee9dc]">
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
            <Link
              href="/reviews"
              className="text-sm text-[#556057] transition hover:text-[#a26934]"
            >
              Reviews
            </Link>
          </nav>

          {/* CART */}

          <div className="flex items-center">
            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="relative flex size-11 items-center justify-center rounded-full border border-[#243328]/15 bg-white/30 text-[#243328] transition hover:border-[#a26934] hover:bg-[#a26934] hover:text-white sm:size-12"
            >
              <ShoppingBag className="size-5" />

              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-[#a26934] px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================
          CART CONTENT
      ========================================================= */}

      <section className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:pt-14 lg:px-10 lg:pt-16">
        {/* HEADER */}

        <div className="mb-9">
          <Link
            href="/shop"
            className="mb-7 inline-flex items-center gap-2 text-sm text-[#657064] transition hover:text-[#a26b35]"
          >
            <ArrowLeft className="size-4" />
            Continue shopping
          </Link>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#a26b35]">
            Your Basket
          </p>

          <h1 className="font-serif text-4xl tracking-tight text-[#243328] sm:text-5xl">
            Ready for a little gold?
          </h1>

          <p className="mt-3 text-sm text-[#657064] sm:text-base">
            {itemCount}{' '}
            {itemCount === 1 ? 'item' : 'items'} selected
            for delivery across Pakistan.
          </p>
        </div>

        {/* =======================================================
            LOADING
        ======================================================= */}

        {!cartReady ? (
          <div className="rounded-[2rem] border border-[#dfe4d6] bg-white/40 px-6 py-20 text-center">
            <ShoppingBag className="mx-auto mb-4 size-8 text-[#a26b35]" />

            <p className="font-serif text-2xl text-[#243328]">
              Loading your basket...
            </p>

            <p className="mt-2 text-sm text-[#657064]">
              Please wait a moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
            {/* =====================================================
                LEFT — CART ITEMS
            ===================================================== */}

            <div className="flex flex-col gap-5">
              {cart.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-[#aebba5] bg-white/20 p-10 text-center sm:p-12">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#e9eee2]">
                    <ShoppingBag className="size-7 text-[#a26b35]" />
                  </div>

                  <p className="mt-5 font-serif text-2xl text-[#243328]">
                    Your basket is waiting.
                  </p>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#657064]">
                    Browse our Turkish Extra Virgin Olive
                    Oil and add something to your basket.
                  </p>

                  <Link
                    href="/shop"
                    className="mt-6 inline-flex rounded-full bg-[#243328] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3b513f]"
                  >
                    Browse the collection
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <article
                    key={item._id}
                    className="rounded-[2rem] border border-[#dfe4d6] bg-white/55 p-4 sm:p-5"
                  >
                    <div className="flex gap-4 sm:gap-5">
                      {/* PRODUCT IMAGE */}

                      <div className="size-24 shrink-0 overflow-hidden rounded-2xl bg-[#e9eee2] sm:size-32">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* PRODUCT DETAILS */}

                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                        <div className="flex justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="font-serif text-xl text-[#243328] sm:text-2xl">
                              {item.name}
                            </h2>

                            <p className="mt-1 text-sm text-[#657064]">
                              {item.size}
                            </p>
                          </div>

                          <p className="whitespace-nowrap text-sm font-semibold text-[#243328] sm:text-base">
                            {formatPrice(
                              item.price *
                                item.quantity,
                              item.currency
                            )}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          {/* QUANTITY */}

                          <div className="flex items-center rounded-full border border-[#cbd4c3] bg-white/60">
                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuantity(
                                  item._id
                                )
                              }
                              aria-label={`Decrease ${item.name} quantity`}
                              className="flex size-9 items-center justify-center rounded-full text-[#243328] transition hover:bg-[#e9eee2]"
                            >
                              <Minus className="size-4" />
                            </button>

                            <span className="min-w-8 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseQuantity(
                                  item._id
                                )
                              }
                              disabled={
                                item.quantity >=
                                item.stock
                              }
                              aria-label={`Increase ${item.name} quantity`}
                              className="flex size-9 items-center justify-center rounded-full text-[#243328] transition hover:bg-[#e9eee2] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus className="size-4" />
                            </button>
                          </div>

                          {/* REMOVE */}

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(
                                item._id
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-xs text-[#657064] underline underline-offset-4 transition hover:text-[#a26b35]"
                          >
                            <Trash2 className="size-3.5" />
                            Remove
                          </button>

                          <span className="text-xs text-[#657064]">
                            {formatPrice(
                              item.price,
                              item.currency
                            )}{' '}
                            each
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}

              {/* ===================================================
                  BUNDLE QUANTITIES
              =================================================== */}

              {cart.length > 0 && (
                <div className="rounded-[2rem] bg-[#e9eee2] p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a26b35]">
                    Bundle quantities
                  </p>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#657064]">
                    Save more when you add a pair or
                    family-sized bundle to your order.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => addBundle(2)}
                      disabled={productsLoading}
                      className="rounded-full border border-[#aebba5] px-5 py-2.5 text-sm font-semibold text-[#243328] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add pair · 2 bottles
                    </button>

                    <button
                      type="button"
                      onClick={() => addBundle(3)}
                      disabled={productsLoading}
                      className="rounded-full bg-[#243328] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3b513f] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add trio · 3 bottles
                    </button>
                  </div>
                </div>
              )}

              {/* ERROR */}

              {error && (
                <p className="rounded-2xl bg-[#8d3f37] px-4 py-3 text-sm text-white">
                  {error}
                </p>
              )}
            </div>

            {/* =====================================================
                RIGHT — ORDER SUMMARY
            ===================================================== */}

            <aside className="h-fit rounded-[2rem] bg-[#243328] p-6 text-[#f7f5ee] sm:p-7 lg:sticky lg:top-6">
              <h2 className="font-serif text-3xl">
                Order summary
              </h2>

              <div className="mt-7 flex flex-col gap-4 border-b border-[#50604f] pb-6 text-sm">
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

              <div className="flex justify-between pt-5 text-lg font-semibold">
                <span>Total</span>

                <span>
                  {formatPrice(
                    total,
                    currency
                  )}
                </span>
              </div>

              {cart.length > 0 && (
                <div className="mt-5 rounded-2xl bg-white/5 px-4 py-3 text-xs leading-5 text-[#c4cdbb]">
                  {delivery === 0
                    ? 'You qualify for free delivery across Pakistan.'
                    : `Add ${formatPrice(
                        Math.max(
                          0,
                          5000 - subtotal
                        ),
                        currency
                      )} more for free delivery.`}
                </div>
              )}

              <Link
                href="/checkout"
                className={`mt-7 flex w-full items-center justify-center rounded-full bg-[#d6a46d] px-5 py-4 text-sm font-bold text-[#243328] transition hover:bg-[#f0c18b] ${
                  !cart.length
                    ? 'pointer-events-none opacity-50'
                    : ''
                }`}
              >
                Proceed to checkout
              </Link>

              <p className="mt-5 flex items-center gap-2 text-xs text-[#c4cdbb]">
                <Truck className="size-4 shrink-0" />
                Nationwide delivery in Pakistan
              </p>
            </aside>
          </div>
        )}
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

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
                 <Link href="/reviews" className="transition hover:text-white">
                  Reviews
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
            © 2026 VinKimya (Private) Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}