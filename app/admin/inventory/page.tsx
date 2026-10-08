'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  LogOut,
  Package,
  RefreshCw,
  Save,
} from 'lucide-react'

type Product = {
  _id: string
  name: string
  image: string
  price: number
  currency: string
  size: string
  bundleQuantity: number
  stock: number
  active: boolean
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

export default function AdminInventoryPage() {
  const router = useRouter()

  const [products, setProducts] =
    useState<Product[]>([])

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [savingId, setSavingId] =
    useState('')

  const [stockValues, setStockValues] =
    useState<Record<string, string>>({})

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')

  const loadInventory = async (
    showRefreshing = false
  ) => {
    if (showRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')
    setMessage('')

    try {
      const response = await fetch(
        '/api/admin/inventory',
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
            'Unable to load inventory.'
        )
      }

      const loadedProducts: Product[] =
        data.products ?? []

      setProducts(loadedProducts)

      const values: Record<
        string,
        string
      > = {}

      loadedProducts.forEach(
        (product) => {
          values[product._id] =
            String(product.stock)
        }
      )

      setStockValues(values)
    } catch (loadError) {
      console.error(loadError)

      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load inventory.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  const updateStockValue = (
    productId: string,
    value: string
  ) => {
    setStockValues((current) => ({
      ...current,
      [productId]: value,
    }))
  }

  const saveStock = async (
    productId: string
  ) => {
    setError('')
    setMessage('')
    setSavingId(productId)

    try {
      const value =
        stockValues[productId]

      const stock = Number(value)

      if (
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        throw new Error(
          'Stock must be a whole number greater than or equal to 0.'
        )
      }

      const response = await fetch(
        '/api/admin/inventory',
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            productId,
            stock,
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
            'Unable to update stock.'
        )
      }

      const updatedProduct: Product =
        data.product

      setProducts((current) =>
        current.map((product) =>
          product._id === productId
            ? updatedProduct
            : product
        )
      )

      setStockValues((current) => ({
        ...current,
        [productId]: String(
          updatedProduct.stock
        ),
      }))

      setMessage(
        `${updatedProduct.name} stock updated successfully.`
      )
    } catch (saveError) {
      console.error(saveError)

      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to update stock.'
      )
    } finally {
      setSavingId('')
    }
  }

  const getStockStatus = (
    stock: number
  ) => {
    if (stock === 0) {
      return {
        label: 'Out of Stock',
        className:
          'bg-[#f3dddd] text-[#8d3f37]',
      }
    }

    if (stock <= 20) {
      return {
        label: 'Low Stock',
        className:
          'bg-[#f4e5cc] text-[#8a5b25]',
      }
    }

    return {
      label: 'In Stock',
      className:
        'bg-[#dce9d8] text-[#3d6843]',
    }
  }

  const totalStock = products.reduce(
    (sum, product) =>
      sum + product.stock,
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

            <span className="font-serif text-[30px] font-bold tracking-[-0.04em]">
              VinKimya
            </span>

            <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#657064]">
              Admin Panel
            </span>

          </Link>


          <div className="flex items-center gap-3">

            <Link
              href="/admin/orders"
              className="hidden rounded-full border border-[#243328]/15 px-4 py-2.5 text-sm font-medium transition hover:bg-white/40 sm:block"
            >
              Orders
            </Link>

            <button
              type="button"
              onClick={() =>
                loadInventory(true)
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
              onClick={async () => {
                try {
                  await fetch(
                    '/api/admin/logout',
                    {
                      method: 'POST',
                    }
                  )
                } finally {
                  router.push(
                    '/admin/login'
                  )
                  router.refresh()
                }
              }}
              className="flex items-center gap-2 rounded-full bg-[#243328] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#3b513f]"
            >

              <LogOut className="size-4" />

              <span className="hidden sm:inline">
                Logout
              </span>

            </button>

          </div>

        </div>

      </header>


      {/* CONTENT */}

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-10">

        <div className="mb-8">

          <Link
            href="/admin/orders"
            className="mb-6 inline-flex items-center gap-2 text-sm text-[#657064] transition hover:text-[#a26b35]"
          >
            <ArrowLeft className="size-4" />
            Back to Orders
          </Link>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a26b35]">
            Inventory
          </p>

          <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
            Stock Management
          </h1>

          <p className="mt-3 text-[#657064]">
            View and update the current stock of your products.
          </p>

        </div>


        {/* SUMMARY */}

        <div className="grid gap-4 sm:grid-cols-2">

          <div className="rounded-[1.5rem] bg-[#243328] p-6 text-white">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c4cdbb]">
                  Products
                </p>

                <p className="mt-2 font-serif text-3xl">
                  {products.length}
                </p>

              </div>

              <Package className="size-8 text-[#d6a46d]" />

            </div>

          </div>


          <div className="rounded-[1.5rem] bg-[#e9eee2] p-6">

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#657064]">
              Total Units
            </p>

            <p className="mt-2 font-serif text-3xl">
              {totalStock.toLocaleString(
                'en-PK'
              )}
            </p>

          </div>

        </div>


        {message && (

          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-[#dce9d8] px-5 py-4 text-sm text-[#3d6843]">

            <CheckCircle2 className="size-5" />

            {message}

          </div>

        )}


        {error && (

          <div className="mt-6 rounded-2xl bg-[#8d3f37] px-5 py-4 text-sm text-white">
            {error}
          </div>

        )}


        {/* PRODUCTS */}

        <div className="mt-8">

          {loading ? (

            <div className="rounded-[2rem] bg-[#e9eee2] p-12 text-center">

              <p className="text-[#657064]">
                Loading inventory...
              </p>

            </div>

          ) : products.length === 0 ? (

            <div className="rounded-[2rem] border border-dashed border-[#aebba5] bg-white/20 p-12 text-center">

              <Package className="mx-auto size-9 text-[#a26b35]" />

              <h2 className="mt-4 font-serif text-2xl">
                No products found.
              </h2>

            </div>

          ) : (

            <div className="grid gap-5">

              {products.map(
                (product) => {

                  const status =
                    getStockStatus(
                      product.stock
                    )

                  return (

                    <article
                      key={product._id}
                      className="rounded-[2rem] bg-[#e9eee2] p-6"
                    >

                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        {/* PRODUCT */}

                        <div className="flex items-center gap-5">

                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.name
                            }
                            className="size-24 shrink-0 rounded-2xl object-cover"
                          />

                          <div>

                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#a26b35]">
                              {product.bundleQuantity ===
                              1
                                ? 'Single Bottle'
                                : `Bundle of ${product.bundleQuantity}`}
                            </p>

                            <h2 className="mt-1 text-lg font-semibold">
                              {product.name}
                            </h2>

                            <p className="mt-1 text-sm text-[#657064]">
                              {product.size}
                              {' · '}
                              {formatPrice(
                                product.price,
                                product.currency
                              )}
                            </p>

                            <span
                              className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                            >
                              {status.label}
                            </span>

                          </div>

                        </div>


                        {/* STOCK */}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">

                          <div>

                            <label
                              htmlFor={`stock-${product._id}`}
                              className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-[#657064]"
                            >
                              Current Stock
                            </label>

                            <input
                              id={`stock-${product._id}`}
                              type="number"
                              min="0"
                              step="1"
                              value={
                                stockValues[
                                  product._id
                                ] ?? ''
                              }
                              onChange={(
                                event
                              ) =>
                                updateStockValue(
                                  product._id,
                                  event.target
                                    .value
                                )
                              }
                              className="w-full rounded-2xl border border-[#cbd4c3] bg-white/70 px-4 py-3 text-lg font-semibold outline-none transition focus:border-[#a26b35] focus:bg-white sm:w-40"
                            />

                          </div>


                          <button
                            type="button"
                            onClick={() =>
                              saveStock(
                                product._id
                              )
                            }
                            disabled={
                              savingId ===
                              product._id
                            }
                            className="flex items-center justify-center gap-2 rounded-full bg-[#243328] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3b513f] disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <Save className="size-4" />

                            {savingId ===
                            product._id
                              ? 'Saving...'
                              : 'Save Stock'}

                          </button>

                        </div>

                      </div>

                    </article>

                  )
                }
              )}

            </div>

          )}

        </div>

      </section>

    </main>
  )
}