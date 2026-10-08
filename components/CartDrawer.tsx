'use client'

import Link from 'next/link'
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
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

export default function CartDrawer() {
  const {
    cart,
    itemCount,
    subtotal,
    delivery,
    total,
    isCartOpen,
    closeCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart()

  // Prevent background page scrolling while drawer is open.
  useEffect(() => {
    if (!isCartOpen) {
      return
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isCartOpen])

  // Close drawer with Escape key.
  useEffect(() => {
    if (!isCartOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeCart()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [isCartOpen, closeCart])

  if (!isCartOpen) {
    return null
  }

  const currency = cart[0]?.currency ?? 'PKR'

  return (
    <div className="fixed inset-0 z-[100]">
      {/* BACKDROP */}
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className="absolute inset-0 h-full w-full cursor-default bg-black/35 backdrop-blur-[2px]"
      />

      {/* DRAWER */}
      <aside
        aria-label="Shopping cart"
        className="absolute right-0 top-0 flex h-dvh w-full max-w-[460px] flex-col bg-[#f8f6ef] text-[#243328] shadow-2xl"
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#243328]/12 px-5 py-5 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">
                Your cart
              </h2>

              <span className="flex min-w-6 items-center justify-center rounded-full bg-[#243328] px-1.5 py-1 text-[11px] font-bold text-white">
                {itemCount}
              </span>
            </div>

            <p className="mt-1 text-xs text-[#657064]">
              {itemCount === 0
                ? 'Your basket is currently empty.'
                : `${itemCount} ${
                    itemCount === 1 ? 'item' : 'items'
                  } in your basket`}
            </p>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="flex size-10 items-center justify-center rounded-full border border-[#243328]/15 bg-white/50 text-[#243328] transition hover:bg-[#243328] hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center px-8 py-16 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#e9eee2]">
                <ShoppingBag className="size-7 text-[#a26934]" />
              </div>

              <h3 className="mt-5 font-serif text-2xl">
                Your basket is waiting.
              </h3>

              <p className="mt-2 max-w-xs text-sm leading-6 text-[#657064]">
                Explore our Turkish Extra Virgin Olive
                Oil and add something to your basket.
              </p>

              <button
                type="button"
                onClick={closeCart}
                className="mt-6 rounded-full bg-[#243328] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a26934]"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="px-5 py-5 sm:px-6">
              {/* FREE DELIVERY MESSAGE */}
              <div className="mb-5 rounded-2xl bg-[#e9eee2] px-4 py-3.5">
                <p className="text-xs font-medium leading-5 text-[#657064]">
                  {delivery === 0
                    ? 'You qualify for free delivery across Pakistan.'
                    : `Add ${formatPrice(
                        Math.max(0, 5000 - subtotal),
                        currency
                      )} more for free delivery.`}
                </p>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#cdd6c7]">
                  <div
                    className="h-full rounded-full bg-[#a26934] transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        (subtotal / 5000) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* CART ITEMS */}
              <div className="divide-y divide-[#243328]/10">
                {cart.map((item) => (
                  <article
                    key={item._id}
                    className="py-5 first:pt-1"
                  >
                    <div className="flex gap-4">
                      {/* IMAGE */}
                      <div className="size-[92px] shrink-0 overflow-hidden rounded-2xl bg-[#e9eee2]">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* PRODUCT INFO */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-serif text-[19px] leading-tight text-[#243328]">
                              {item.name}
                            </h3>

                            <p className="mt-1 text-xs text-[#657064]">
                              {item.size}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-semibold text-[#243328]">
                            {formatPrice(
                              item.price * item.quantity,
                              item.currency
                            )}
                          </p>
                        </div>

                        {/* QUANTITY + REMOVE */}
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="flex items-center rounded-full border border-[#cbd4c3] bg-white/60">
                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuantity(item._id)
                              }
                              aria-label={`Decrease ${item.name} quantity`}
                              className="flex size-8 items-center justify-center rounded-full text-[#243328] transition hover:bg-[#e9eee2]"
                            >
                              <Minus className="size-3.5" />
                            </button>

                            <span className="w-7 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseQuantity(item._id)
                              }
                              disabled={
                                item.quantity >= item.stock
                              }
                              aria-label={`Increase ${item.name} quantity`}
                              className="flex size-8 items-center justify-center rounded-full text-[#243328] transition hover:bg-[#e9eee2] disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(item._id)
                            }
                            className="inline-flex items-center gap-1.5 text-xs text-[#657064] underline underline-offset-4 transition hover:text-[#a26934]"
                          >
                            <Trash2 className="size-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <div className="shrink-0 border-t border-[#243328]/12 bg-[#f8f6ef] px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
            {/* SUMMARY */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#657064]">
                  Subtotal
                </span>

                <span className="font-medium text-[#243328]">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#657064]">
                  Delivery
                </span>

                <span className="font-medium text-[#243328]">
                  {delivery === 0
                    ? 'Free'
                    : formatPrice(delivery, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-[#243328]/10 pt-4">
                <span className="font-semibold text-[#243328]">
                  Total
                </span>

                <span className="font-serif text-2xl font-semibold text-[#243328]">
                  {formatPrice(total, currency)}
                </span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={closeCart}
                className="flex items-center justify-center rounded-full border border-[#243328]/20 bg-white/50 px-4 py-3.5 text-sm font-semibold text-[#243328] transition hover:bg-white"
              >
                View cart
              </Link>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex items-center justify-center rounded-full bg-[#243328] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#a26934]"
              >
                Checkout
              </Link>
            </div>

            <p className="mt-4 text-center text-[11px] leading-5 text-[#657064]">
              Secure checkout · Nationwide delivery
              across Pakistan
            </p>
          </div>
        )}
      </aside>
    </div>
  )
}