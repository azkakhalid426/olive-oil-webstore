'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LogOut,
  Package,
  RefreshCw,
  Save,
} from 'lucide-react'

type Product = {
  _id: string
  name: string
  description: string
  image: string
  image2?: string
  image3?: string
  price: number
  compareAtPrice?: number
  currency: string
  origin: string
  size: string
  stock: number
  bundleQuantity: number
  active: boolean
}

type ProductForm = {
  price: string
  compareAtPrice: string
  image: string
  image2: string
  image3: string
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

export default function AdminProductsPage() {
  const router = useRouter()

  const [products, setProducts] =
    useState<Product[]>([])

  const [forms, setForms] =
    useState<Record<string, ProductForm>>({})

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [savingId, setSavingId] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')

  const loadProducts = async (
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
        '/api/admin/products',
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
            'Unable to load products.'
        )
      }

      const loadedProducts: Product[] =
        data.products ?? []

      setProducts(loadedProducts)

      const nextForms: Record<
        string,
        ProductForm
      > = {}

      loadedProducts.forEach(
        (product) => {
          nextForms[product._id] = {
            price: String(
              product.price
            ),

            compareAtPrice:
              product.compareAtPrice
                ? String(
                    product.compareAtPrice
                  )
                : '',

            image: product.image || '',
            image2: product.image2 || '',
            image3: product.image3 || '',

            active: product.active,
          }
        }
      )

      setForms(nextForms)
    } catch (loadError) {
      console.error(loadError)

      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load products.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const updateForm = (
    productId: string,
    field: keyof ProductForm,
    value: string | boolean
  ) => {
    setForms((current) => ({
      ...current,

      [productId]: {
        ...current[productId],
        [field]: value,
      },
    }))
  }

  const saveProduct = async (
    productId: string
  ) => {
    setSavingId(productId)
    setError('')
    setMessage('')

    try {
      const form =
        forms[productId]

      if (!form) {
        throw new Error(
          'Product information is unavailable.'
        )
      }

      const price = Number(
        form.price
      )

      const compareAtPrice =
        form.compareAtPrice.trim() === ''
          ? undefined
          : Number(
              form.compareAtPrice
            )

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        throw new Error(
          'Selling price must be a valid number.'
        )
      }

      if (
        compareAtPrice !== undefined &&
        (!Number.isFinite(
          compareAtPrice
        ) ||
          compareAtPrice < 0)
      ) {
        throw new Error(
          'Compare-at price must be a valid number.'
        )
      }

      if (
        compareAtPrice !== undefined &&
        compareAtPrice < price
      ) {
        throw new Error(
          'Compare-at price must be greater than or equal to the selling price.'
        )
      }

      if (
        !form.image.trim()
      ) {
        throw new Error(
          'Main product image is required.'
        )
      }

      const response = await fetch(
        '/api/admin/products',
        {
          method: 'PATCH',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            productId,
            price,
            compareAtPrice,

            image:
              form.image.trim(),

            image2:
              form.image2.trim(),

            image3:
              form.image3.trim(),

            active: form.active,
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
            'Unable to update product.'
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

      setForms((current) => ({
        ...current,

        [productId]: {
          price: String(
            updatedProduct.price
          ),

          compareAtPrice:
            updatedProduct.compareAtPrice
              ? String(
                  updatedProduct.compareAtPrice
                )
              : '',

          image:
            updatedProduct.image || '',

          image2:
            updatedProduct.image2 || '',

          image3:
            updatedProduct.image3 || '',

          active:
            updatedProduct.active,
        },
      }))

      setMessage(
        `${updatedProduct.name} updated successfully.`
      )
    } catch (saveError) {
      console.error(saveError)

      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to update product.'
      )
    } finally {
      setSavingId('')
    }
  }

  const totalStock = products.reduce(
    (sum, product) =>
      sum + product.stock,
    0
  )

  const activeProducts =
    products.filter(
      (product) => product.active
    ).length

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

            <Link
              href="/admin/inventory"
              className="hidden rounded-full border border-[#243328]/15 px-4 py-2.5 text-sm font-medium transition hover:bg-white/40 sm:block"
            >
              Inventory
            </Link>

            <button
              type="button"
              onClick={() =>
                loadProducts(true)
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
            Products
          </p>

          <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
            Product Management
          </h1>

          <p className="mt-3 text-[#657064]">
            Manage pricing, product images,
            and product availability.
          </p>

        </div>

        {/* SUMMARY */}

        <div className="grid gap-4 sm:grid-cols-3">

          <div className="rounded-[1.5rem] bg-[#e9eee2] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#657064]">
              Products
            </p>

            <p className="mt-2 font-serif text-3xl">
              {products.length}
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-[#e9eee2] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#657064]">
              Active Products
            </p>

            <p className="mt-2 font-serif text-3xl">
              {activeProducts}
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-[#243328] p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c4cdbb]">
              Total Stock
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
                Loading products...
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
                  const form =
                    forms[
                      product._id
                    ]

                  return (
                    <article
                      key={product._id}
                      className="rounded-[2rem] bg-[#e9eee2] p-6"
                    >

                      <div className="flex flex-col gap-7">

                        {/* PRODUCT INFO */}

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                          <div className="flex shrink-0 items-center gap-2">

                            <div className="overflow-hidden rounded-2xl border border-[#cbd4c3] bg-white/60">
                              <img
                                src={
                                  product.image
                                }
                                alt={
                                  product.name
                                }
                                className="size-24 object-cover"
                              />
                            </div>

                            {product.image2 && (
                              <div className="hidden overflow-hidden rounded-2xl border border-[#cbd4c3] bg-white/60 sm:block">
                                <img
                                  src={
                                    product.image2
                                  }
                                  alt={`${product.name} second image`}
                                  className="size-24 object-cover"
                                />
                              </div>
                            )}

                            {product.image3 && (
                              <div className="hidden overflow-hidden rounded-2xl border border-[#cbd4c3] bg-white/60 lg:block">
                                <img
                                  src={
                                    product.image3
                                  }
                                  alt={`${product.name} third image`}
                                  className="size-24 object-cover"
                                />
                              </div>
                            )}

                          </div>

                          <div className="min-w-0 flex-1">

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
                              {product.origin}
                            </p>

                            <p className="mt-1 text-sm text-[#657064]">
                              Current stock:{' '}
                              <span className="font-semibold text-[#243328]">
                                {product.stock}
                              </span>
                            </p>

                          </div>

                          {/* ACTIVE STATUS */}

                          <div
                            className={`flex items-center gap-2 self-start rounded-full px-4 py-2 text-xs font-semibold ${
                              product.active
                                ? 'bg-[#dce9d8] text-[#3d6843]'
                                : 'bg-[#f3dddd] text-[#8d3f37]'
                            }`}
                          >
                            {product.active ? (
                              <Eye className="size-4" />
                            ) : (
                              <EyeOff className="size-4" />
                            )}

                            {product.active
                              ? 'Visible in Shop'
                              : 'Hidden from Shop'}
                          </div>

                        </div>

                        {/* EDIT FIELDS */}

                        {form && (
                          <div className="border-t border-[#cbd4c3] pt-6">

                            {/* IMAGES */}

                            <div className="mb-7">

                              <div className="mb-4">
                                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#657064]">
                                  Product Gallery
                                </p>

                                <p className="mt-1 text-sm text-[#657064]">
                                  Add up to 3 product
                                  images. The first
                                  image is the main
                                  product image.
                                </p>
                              </div>

                              <div className="grid gap-5 md:grid-cols-3">

                                {/* MAIN IMAGE */}

                                <div>
                                  <label
                                    htmlFor={`image-${product._id}`}
                                    className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-[#657064]"
                                  >
                                    Main Image
                                  </label>

                                  <input
                                    id={`image-${product._id}`}
                                    type="text"
                                    value={
                                      form.image
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateForm(
                                        product._id,
                                        'image',
                                        event.target
                                          .value
                                      )
                                    }
                                    placeholder="https://..."
                                    className="w-full rounded-2xl border border-[#cbd4c3] bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-[#a26b35] focus:bg-white"
                                  />

                                  {form.image && (
                                    <div className="mt-3 overflow-hidden rounded-2xl border border-[#cbd4c3] bg-white/60">
                                      <img
                                        src={
                                          form.image
                                        }
                                        alt={`${product.name} main preview`}
                                        className="h-40 w-full object-contain"
                                        onError={(
                                          event
                                        ) => {
                                          event.currentTarget.style.display =
                                            'none'
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* SECOND IMAGE */}

                                <div>
                                  <label
                                    htmlFor={`image2-${product._id}`}
                                    className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-[#657064]"
                                  >
                                    Second Image
                                    <span className="ml-1 font-normal normal-case tracking-normal text-[#8a9387]">
                                      Optional
                                    </span>
                                  </label>

                                  <input
                                    id={`image2-${product._id}`}
                                    type="text"
                                    value={
                                      form.image2
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateForm(
                                        product._id,
                                        'image2',
                                        event.target
                                          .value
                                      )
                                    }
                                    placeholder="https://..."
                                    className="w-full rounded-2xl border border-[#cbd4c3] bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-[#a26b35] focus:bg-white"
                                  />

                                  {form.image2 && (
                                    <div className="mt-3 overflow-hidden rounded-2xl border border-[#cbd4c3] bg-white/60">
                                      <img
                                        src={
                                          form.image2
                                        }
                                        alt={`${product.name} second preview`}
                                        className="h-40 w-full object-contain"
                                        onError={(
                                          event
                                        ) => {
                                          event.currentTarget.style.display =
                                            'none'
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* THIRD IMAGE */}

                                <div>
                                  <label
                                    htmlFor={`image3-${product._id}`}
                                    className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-[#657064]"
                                  >
                                    Third Image
                                    <span className="ml-1 font-normal normal-case tracking-normal text-[#8a9387]">
                                      Optional
                                    </span>
                                  </label>

                                  <input
                                    id={`image3-${product._id}`}
                                    type="text"
                                    value={
                                      form.image3
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateForm(
                                        product._id,
                                        'image3',
                                        event.target
                                          .value
                                      )
                                    }
                                    placeholder="https://..."
                                    className="w-full rounded-2xl border border-[#cbd4c3] bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-[#a26b35] focus:bg-white"
                                  />

                                  {form.image3 && (
                                    <div className="mt-3 overflow-hidden rounded-2xl border border-[#cbd4c3] bg-white/60">
                                      <img
                                        src={
                                          form.image3
                                        }
                                        alt={`${product.name} third preview`}
                                        className="h-40 w-full object-contain"
                                        onError={(
                                          event
                                        ) => {
                                          event.currentTarget.style.display =
                                            'none'
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>

                              </div>

                            </div>

                            {/* PRICE / VISIBILITY */}

                            <div className="grid gap-5 md:grid-cols-3">

                              <div>
                                <label
                                  htmlFor={`price-${product._id}`}
                                  className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-[#657064]"
                                >
                                  Selling Price
                                </label>

                                <input
                                  id={`price-${product._id}`}
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={
                                    form.price
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateForm(
                                      product._id,
                                      'price',
                                      event.target
                                        .value
                                    )
                                  }
                                  className="w-full rounded-2xl border border-[#cbd4c3] bg-white/70 px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#a26b35] focus:bg-white"
                                />

                                <p className="mt-2 text-xs text-[#657064]">
                                  Current:{' '}
                                  {formatPrice(
                                    product.price,
                                    product.currency
                                  )}
                                </p>
                              </div>

                              <div>
                                <label
                                  htmlFor={`compare-${product._id}`}
                                  className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-[#657064]"
                                >
                                  Original Price
                                </label>

                                <input
                                  id={`compare-${product._id}`}
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={
                                    form.compareAtPrice
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateForm(
                                      product._id,
                                      'compareAtPrice',
                                      event.target
                                        .value
                                    )
                                  }
                                  placeholder="Optional"
                                  className="w-full rounded-2xl border border-[#cbd4c3] bg-white/70 px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#a26b35] focus:bg-white"
                                />

                                {product.compareAtPrice &&
                                  product.compareAtPrice >
                                    product.price && (
                                    <p className="mt-2 text-xs text-[#657064]">
                                      Current:{' '}
                                      {formatPrice(
                                        product.compareAtPrice,
                                        product.currency
                                      )}
                                    </p>
                                  )}
                              </div>

                              <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-[#657064]">
                                  Shop Visibility
                                </label>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateForm(
                                      product._id,
                                      'active',
                                      !form.active
                                    )
                                  }
                                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                    form.active
                                      ? 'border-[#aebba5] bg-white/70'
                                      : 'border-[#d7b0aa] bg-[#f3dddd]'
                                  }`}
                                >
                                  <span>
                                    {form.active
                                      ? 'Visible in Shop'
                                      : 'Hidden from Shop'}
                                  </span>

                                  <span
                                    className={`h-5 w-10 rounded-full p-1 transition ${
                                      form.active
                                        ? 'bg-[#243328]'
                                        : 'bg-[#9b706b]'
                                    }`}
                                  >
                                    <span
                                      className={`block size-3 rounded-full bg-white transition ${
                                        form.active
                                          ? 'translate-x-5'
                                          : 'translate-x-0'
                                      }`}
                                    />
                                  </span>
                                </button>
                              </div>

                            </div>

                          </div>
                        )}

                        {/* SAVE */}

                        <div className="flex justify-end border-t border-[#cbd4c3] pt-5">

                          <button
                            type="button"
                            onClick={() =>
                              saveProduct(
                                product._id
                              )
                            }
                            disabled={
                              savingId ===
                              product._id
                            }
                            className="flex items-center gap-2 rounded-full bg-[#243328] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3b513f] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Save className="size-4" />

                            {savingId ===
                            product._id
                              ? 'Saving...'
                              : 'Save Changes'}
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