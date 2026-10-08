'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  LogOut,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
} from 'lucide-react'

type OrderItem = {
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  bundleQuantity: number
}

type Order = {
  _id: string
  customer: {
    name: string
    phone: string
    email?: string
    address: string
    city: string
  }
  items: OrderItem[]
  subtotal: number
  delivery: number
  total: number
  currency: string
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  createdAt: string
}

const STATUS_LABELS: Record<
  string,
  string
> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const formatPrice = (
  price: number,
  currency = 'PKR'
) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))

export default function AdminOrdersPage() {
  const router = useRouter()

  const [orders, setOrders] =
    useState<Order[]>([])

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [error, setError] =
    useState('')

  const [updatingId, setUpdatingId] =
    useState('')

  const loadOrders = async (
    showRefreshing = false
  ) => {
    if (showRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')

    try {
      const response = await fetch(
        '/api/admin/orders',
        {
          method: 'GET',
          cache: 'no-store',
        }
      )

      const data =
        await response.json()

      if (response.status === 401) {
        router.push('/admin/login')
        return
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to load orders.'
        )
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      )
    } catch (loadError) {
      console.error(loadError)

      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load orders.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const updateStatus = async (
    orderId: string,
    orderStatus: string
  ) => {
    setUpdatingId(orderId)
    setError('')

    try {
      const response = await fetch(
        '/api/admin/orders',
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            orderId,
            orderStatus,
          }),
        }
      )

      const data =
        await response.json()

      if (response.status === 401) {
        router.push('/admin/login')
        return
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to update order.'
        )
      }

      setOrders((current) =>
        current.map((order) =>
          order._id === orderId
            ? {
                ...order,
                orderStatus,
              }
            : order
        )
      )
    } catch (updateError) {
      console.error(updateError)

      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Unable to update order.'
      )
    } finally {
      setUpdatingId('')
    }
  }

  const logout = async () => {
    try {
      await fetch(
        '/api/admin/logout',
        {
          method: 'POST',
        }
      )
    } catch (error) {
      console.error(error)
    } finally {
      router.push('/admin/login')
      router.refresh()
    }
  }

  const totalOrders = orders.length

  const pendingOrders =
    orders.filter(
      (order) =>
        order.orderStatus ===
        'pending'
    ).length

  const confirmedOrders =
    orders.filter(
      (order) =>
        order.orderStatus ===
        'confirmed'
    ).length

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.orderStatus ===
        'delivered'
    ).length

  const revenue = orders
    .filter(
      (order) =>
        order.orderStatus !==
        'cancelled'
    )
    .reduce(
      (sum, order) =>
        sum + order.total,
      0
    )

  return (
    <main className="min-h-screen bg-[#eee9dc] text-[#243328]">

      {/* TOP BAR */}

      <div className="bg-[#243328] px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5f2e8]">
        VinKimya · Administration
      </div>


      {/* HEADER */}

      <header className="border-b border-[#d9dfd1] bg-[#eee9dc]">

        <div className="mx-auto flex min-h-[82px] max-w-7xl items-center justify-between gap-5 px-5 lg:px-10">

          <Link
            href="/"
            className="flex flex-col leading-none"
          >

            <span className="font-serif text-[30px] font-bold tracking-[-0.04em] text-[#243328]">
              VinKimya
            </span>

            <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#657064]">
              Admin Panel
            </span>

          </Link>


          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                loadOrders(true)
              }
              disabled={refreshing}
              className="flex items-center gap-2 rounded-full border border-[#243328]/15 px-4 py-2.5 text-sm font-medium transition hover:bg-white/40 disabled:opacity-50"
            >

              <RefreshCw
                className={`size-4 ${
                  refreshing
                    ? 'animate-spin'
                    : ''
                }`}
              />

              Refresh

            </button>


            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-full bg-[#243328] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#3b513f]"
            >

              <LogOut className="size-4" />

              Logout

            </button>

          </div>

        </div>

      </header>


      {/* MAIN CONTENT */}

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-10">

        <div className="mb-8">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a26b35]">
            Dashboard
          </p>

          <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
            Orders
          </h1>

          <p className="mt-3 text-[#657064]">
            Manage your customer orders and delivery status.
          </p>

        </div>


        {/* STAT CARDS */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={
              <ShoppingBag className="size-5" />
            }
            label="Total Orders"
            value={String(totalOrders)}
          />

          <StatCard
            icon={
              <Clock3 className="size-5" />
            }
            label="Pending"
            value={String(pendingOrders)}
          />

          <StatCard
            icon={
              <Package className="size-5" />
            }
            label="Confirmed"
            value={String(confirmedOrders)}
          />

          <StatCard
            icon={
              <CheckCircle2 className="size-5" />
            }
            label="Delivered"
            value={String(deliveredOrders)}
          />

        </div>


        {/* ORDER VALUE */}

        <div className="mt-5 rounded-[1.5rem] bg-[#243328] px-6 py-5 text-white">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c4cdbb]">
                Order Value
              </p>

              <p className="mt-2 font-serif text-3xl">
                {formatPrice(revenue)}
              </p>

            </div>

            <Truck className="size-8 text-[#d6a46d]" />

          </div>

        </div>


        {/* ERROR */}

        {error && (

          <div className="mt-6 rounded-2xl bg-[#8d3f37] px-5 py-4 text-sm text-white">
            {error}
          </div>

        )}


        {/* ORDERS */}

        <div className="mt-8">

          {loading ? (

            <div className="rounded-[2rem] bg-[#e9eee2] p-12 text-center">

              <p className="text-[#657064]">
                Loading orders...
              </p>

            </div>

          ) : orders.length === 0 ? (

            <div className="rounded-[2rem] border border-dashed border-[#aebba5] bg-white/20 p-12 text-center">

              <ShoppingBag className="mx-auto size-9 text-[#a26b35]" />

              <h2 className="mt-4 font-serif text-2xl">
                No orders yet.
              </h2>

              <p className="mt-2 text-sm text-[#657064]">
                New customer orders will appear here.
              </p>

            </div>

          ) : (

            <div className="flex flex-col gap-5">

              {orders.map((order) => (

                <article
                  key={order._id}
                  className="rounded-[2rem] bg-[#e9eee2] p-6"
                >

                  {/* ORDER HEADER */}

                  <div className="flex flex-col gap-4 border-b border-[#cbd4c3] pb-5 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#a26b35]">
                        Order
                      </p>

                      <p className="mt-1 break-all font-mono text-sm font-semibold">
                        {order._id}
                      </p>

                      <p className="mt-2 text-xs text-[#657064]">
                        {formatDate(
                          order.createdAt
                        )}
                      </p>

                    </div>


                    <div className="flex flex-wrap items-center gap-3">

                      <span className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold">
                        {formatPrice(
                          order.total,
                          order.currency
                        )}
                      </span>


                      <div className="relative">

                        <select
                          value={
                            order.orderStatus
                          }
                          disabled={
                            updatingId ===
                            order._id
                          }
                          onChange={(event) =>
                            updateStatus(
                              order._id,
                              event.target.value
                            )
                          }
                          className="appearance-none rounded-full border border-[#aebba5] bg-white/70 py-2 pl-4 pr-10 text-sm font-semibold outline-none focus:border-[#a26b35] disabled:opacity-50"
                        >

                          {Object.entries(
                            STATUS_LABELS
                          ).map(
                            ([
                              value,
                              label,
                            ]) => (

                              <option
                                key={value}
                                value={value}
                              >
                                {label}
                              </option>

                            )
                          )}

                        </select>

                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#657064]" />

                      </div>

                    </div>

                  </div>


                  {/* CUSTOMER + PRODUCTS */}

                  <div className="grid gap-7 pt-6 lg:grid-cols-[1fr_1fr]">

                    {/* CUSTOMER */}

                    <div>

                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#a26b35]">
                        Customer
                      </p>

                      <div className="mt-4 space-y-2 text-sm">

                        <p className="font-semibold">
                          {order.customer.name}
                        </p>

                        <p>
                          {order.customer.phone}
                        </p>

                        {order.customer.email && (
                          <p className="break-all text-[#657064]">
                            {order.customer.email}
                          </p>
                        )}

                        <p className="pt-2 leading-6 text-[#657064]">
                          {order.customer.address}
                          <br />
                          {order.customer.city}
                        </p>

                      </div>

                    </div>


                    {/* PRODUCTS */}

                    <div>

                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#a26b35]">
                        Products
                      </p>

                      <div className="mt-4 space-y-4">

                        {order.items.map(
                          (item, index) => (

                            <div
                              key={`${order._id}-${index}`}
                              className="flex gap-3"
                            >

                              <img
                                src={
                                  item.image
                                }
                                alt={
                                  item.name
                                }
                                className="size-14 shrink-0 rounded-xl object-cover"
                              />

                              <div className="min-w-0 flex-1">

                                <p className="text-sm font-semibold">
                                  {item.name}
                                </p>

                                <p className="mt-1 text-xs text-[#657064]">
                                  Qty:{' '}
                                  {
                                    item.quantity
                                  }
                                  {' · '}
                                  {formatPrice(
                                    item.price,
                                    order.currency
                                  )}
                                </p>

                              </div>

                              <p className="whitespace-nowrap text-sm font-semibold">
                                {formatPrice(
                                  item.price *
                                    item.quantity,
                                  order.currency
                                )}
                              </p>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  </div>


                  {/* TOTALS */}

                  <div className="mt-6 flex flex-col gap-2 border-t border-[#cbd4c3] pt-5 text-sm">

                    <div className="flex justify-between">

                      <span className="text-[#657064]">
                        Subtotal
                      </span>

                      <span>
                        {formatPrice(
                          order.subtotal,
                          order.currency
                        )}
                      </span>

                    </div>


                    <div className="flex justify-between">

                      <span className="text-[#657064]">
                        Delivery
                      </span>

                      <span>
                        {order.delivery
                          ? formatPrice(
                              order.delivery,
                              order.currency
                            )
                          : 'Free'}
                      </span>

                    </div>


                    <div className="flex justify-between pt-2 text-base font-bold">

                      <span>
                        Total
                      </span>

                      <span>
                        {formatPrice(
                          order.total,
                          order.currency
                        )}
                      </span>

                    </div>


                    <div className="mt-2 flex justify-between text-xs text-[#657064]">

                      <span>
                        Payment
                      </span>

                      <span className="font-semibold uppercase">
                        {order.paymentMethod}
                      </span>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </div>

      </section>

    </main>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.5rem] bg-[#e9eee2] p-5">

      <div className="flex items-center justify-between">

        <div className="flex size-10 items-center justify-center rounded-full bg-[#243328] text-white">
          {icon}
        </div>

        <p className="font-serif text-3xl">
          {value}
        </p>

      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-[0.15em] text-[#657064]">
        {label}
      </p>

    </div>
  )
}