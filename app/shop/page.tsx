'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  ShoppingBag,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'

type Product = {
  _id: string
  name: string
  description: string
  image: string

  // Optional gallery fields.
  image2?: string
  image3?: string
  images?: string[]
  galleryImages?: string[]

  price: number
  compareAtPrice?: number
  currency: string
  size: string
  bundleQuantity: number
  stock: number
  active: boolean
}

type SortOption =
  | 'featured'
  | 'price-low'
  | 'price-high'
  | 'name-a-z'
  | 'name-z-a'

type CategoryOption = 'all' | 'single' | 'bundles'

const money = (value: number) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(value)

/* =========================================================
   PRODUCT IMAGES
========================================================= */

const getProductImages = (product: Product) => {
  const possibleImages = [
    product.image,
    ...(product.images ?? []),
    ...(product.galleryImages ?? []),
    product.image2,
    product.image3,
  ]

  const uniqueImages = possibleImages.filter(
    (image, index, array) =>
      Boolean(image) && array.indexOf(image) === index
  )

  return uniqueImages.slice(0, 3)
}

/* =========================================================
   PRODUCT GALLERY
========================================================= */

function ProductGallery({
  product,
  compact = false,
}: {
  product: Product
  compact?: boolean
}) {
  const images = getProductImages(product)

  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(1)

  const activeImage = images[activeIndex] ?? product.image

  const previousImage = () => {
    if (images.length <= 1) return

    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    )

    setZoom(1)
  }

  const nextImage = () => {
    if (images.length <= 1) return

    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    )

    setZoom(1)
  }

  const openLightbox = () => {
    setZoom(1)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setZoom(1)
    setLightboxOpen(false)
  }

  useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox()
      }

      if (event.key === 'ArrowLeft') {
        previousImage()
      }

      if (event.key === 'ArrowRight') {
        nextImage()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [lightboxOpen, images.length])

  useEffect(() => {
    if (!lightboxOpen) return

    const originalOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [lightboxOpen])

  return (
    <>
      <div className="relative">
        {/* MAIN IMAGE */}
        <button
          type="button"
          onClick={openLightbox}
          aria-label={`View ${product.name} image`}
          className={`group relative block w-full overflow-hidden rounded-[1.35rem] bg-[#f4f1e7] ${
            compact ? 'aspect-square' : 'aspect-[4/3]'
          }`}
        >
          <img
            src={activeImage}
            alt={product.name}
            className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-[1.025] sm:p-6"
          />

          {/* VIEW IMAGE */}
          <span className="absolute bottom-3 right-3 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#243328] opacity-0 shadow-sm backdrop-blur transition duration-300 group-hover:opacity-100">
            Click to view
          </span>

          {/* IMAGE COUNT */}
          {images.length > 1 && (
            <span className="absolute left-3 top-3 rounded-full bg-[#243328]/90 px-2.5 py-1 text-[10px] font-semibold text-white">
              {activeIndex + 1} / {images.length}
            </span>
          )}
        </button>

        {/* PREVIOUS / NEXT */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={previousImage}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#243328] shadow-md transition hover:scale-105 hover:bg-white"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#243328] shadow-md transition hover:scale-105 hover:bg-white"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}

        {/* THUMBNAILS */}
        {images.length > 1 && (
          <div className="mt-3 flex gap-2">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => {
                  setActiveIndex(index)
                  setZoom(1)
                }}
                aria-label={`View image ${index + 1}`}
                className={`relative h-14 w-14 overflow-hidden rounded-lg border bg-[#f4f1e7] transition sm:h-16 sm:w-16 ${
                  index === activeIndex
                    ? 'border-[#a26934] ring-1 ring-[#a26934]'
                    : 'border-[#dfe4d6] opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} image ${index + 1}`}
                  className="h-full w-full object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================
          LIGHTBOX
      ===================================================== */}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101610]/95 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} image viewer`}
          onClick={closeLightbox}
        >
          {/* CLOSE */}
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close image viewer"
            className="absolute right-4 top-4 z-20 flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="size-5" />
          </button>

          {/* PRODUCT NAME */}
          <div className="absolute left-4 right-20 top-5 z-10 truncate text-sm font-medium text-white/80">
            {product.name}
          </div>

          {/* ZOOM CONTROLS */}
          <div
            className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-white/10 p-1 backdrop-blur"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() =>
                setZoom((current) =>
                  Math.max(0.75, current - 0.25)
                )
              }
              aria-label="Zoom out"
              className="flex size-10 items-center justify-center rounded-full text-white transition hover:bg-white/10"
            >
              <ZoomOut className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => setZoom(1)}
              className="min-w-14 px-2 text-xs font-semibold text-white"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              type="button"
              onClick={() =>
                setZoom((current) =>
                  Math.min(2.5, current + 0.25)
                )
              }
              aria-label="Zoom in"
              className="flex size-10 items-center justify-center rounded-full text-white transition hover:bg-white/10"
            >
              <ZoomIn className="size-4" />
            </button>
          </div>

          {/* IMAGE */}
          <div
            className="relative flex max-h-[86vh] max-w-[92vw] items-center justify-center overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={activeImage}
              alt={product.name}
              className="max-h-[82vh] max-w-[88vw] select-none object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom})`,
              }}
            />
          </div>

          {/* LIGHTBOX NAVIGATION */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  previousImage()
                }}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:left-6"
              >
                <ChevronLeft className="size-5" />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  nextImage()
                }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-6"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product
  onAddToCart: (product: Product) => void
}) {
  const isBundle = product.bundleQuantity > 1

  const discount =
    product.compareAtPrice &&
    product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) /
            product.compareAtPrice) *
            100
        )
      : 0

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[#dfe4d6] bg-white p-3 shadow-[0_8px_30px_rgba(36,51,40,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(36,51,40,0.09)] sm:p-4">
      {/* IMAGE */}
      <ProductGallery product={product} compact />

      {/* DETAILS */}
      <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#a26934]">
              {isBundle
                ? product.bundleQuantity === 2
                  ? 'Bundle offer'
                  : 'Best value'
                : `Single bottle · ${product.size}`}
            </p>

            <h2 className="mt-1.5 line-clamp-2 font-serif text-xl leading-tight tracking-tight text-[#243328] sm:text-2xl">
              {isBundle
                ? product.bundleQuantity === 2
                  ? 'The Pair'
                  : 'The Family Set'
                : product.name}
            </h2>

            {isBundle && (
              <p className="mt-1 text-xs text-[#657064]">
                {product.bundleQuantity} bottles · 500ml each
              </p>
            )}
          </div>

          {discount > 0 && (
            <span className="shrink-0 rounded-full bg-[#eee4d3] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#8b5b2d]">
              {discount}% off
            </span>
          )}
        </div>

        <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#657064] sm:text-sm">
          {product.description}
        </p>

        {/* PRICE */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {product.compareAtPrice &&
            product.compareAtPrice > product.price && (
              <span className="text-xs text-[#657064] line-through decoration-[#a26934]">
                {money(product.compareAtPrice)}
              </span>
            )}

          <span className="font-serif text-xl font-semibold text-[#243328] sm:text-2xl">
            {money(product.price)}
          </span>
        </div>

        {/* STOCK */}
        <div className="mt-2 text-[10px] font-medium">
          {product.stock > 0 ? (
            <span className="text-[#657064]">
              {product.stock <= 5
                ? `Only ${product.stock} left`
                : 'In stock'}
            </span>
          ) : (
            <span className="text-[#9a4c3f]">
              Out of stock
            </span>
          )}
        </div>

        {/* ADD TO CART */}
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          disabled={product.stock <= 0}
          className="mt-4 w-full rounded-full bg-[#243328] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#a26934] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
        >
          {product.stock > 0
            ? isBundle
              ? 'Add bundle to cart'
              : 'Add bottle to cart'
            : 'Out of stock'}
        </button>
      </div>
    </article>
  )
}

/* =========================================================
   SHOP PAGE
========================================================= */

export default function ShopPage() {
  const {
    addToCart,
    openCart,
    itemCount,
  } = useCart()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false)

  const [category, setCategory] =
    useState<CategoryOption>('all')

  const [sortBy, setSortBy] =
    useState<SortOption>('featured')

  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/products')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load products')
        }

        return response.json()
      })
      .then((data) => {
        setProducts(data.products ?? [])
      })
      .catch(() => {
        setProducts([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  /* =====================================================
     FILTER + SORT
  ===================================================== */

  const filteredProducts = useMemo(() => {
    let result = [...products]

    /* CATEGORY */
    if (category === 'single') {
      result = result.filter(
        (product) => product.bundleQuantity === 1
      )
    }

    if (category === 'bundles') {
      result = result.filter(
        (product) => product.bundleQuantity > 1
      )
    }

    /* SEARCH */
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()

      result = result.filter((product) => {
        return (
          product.name.toLowerCase().includes(query) ||
          product.description
            .toLowerCase()
            .includes(query)
        )
      })
    }

    /* SORT */
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break

      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break

      case 'name-a-z':
        result.sort((a, b) =>
          a.name.localeCompare(b.name)
        )
        break

      case 'name-z-a':
        result.sort((a, b) =>
          b.name.localeCompare(a.name)
        )
        break

      case 'featured':
      default:
        break
    }

    return result
  }, [
    products,
    category,
    sortBy,
    searchQuery,
  ])

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const handleAddToCart = (product: Product) => {
    if (!product.active || product.stock <= 0) {
      return
    }

    /*
     * IMPORTANT:
     * CartContext expects a CartProduct.
     * Product already matches CartProduct, so pass
     * the product directly.
     */
    addToCart(product)

    openCart()
  }

  return (
    <main className="min-h-screen bg-[#eee9dc] text-[#243328]">
      {/* =====================================================
          ANNOUNCEMENT
      ===================================================== */}

      <div className="bg-[#243328] px-4 py-2.5 text-center text-[9px] font-bold uppercase tracking-[0.18em] text-[#f5f2e8] sm:text-[10px]">
        Premium Turkish Extra Virgin Olive Oil

        <span className="mx-2 text-[#d7a66c]">
          ·
        </span>

        Delivered Across Pakistan
      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="relative z-50 bg-[#eee9dc]">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:h-[82px] sm:px-6 lg:px-10">
          {/* BRAND */}
          <Link
            href="/"
            className="flex shrink-0 flex-col leading-none"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="font-serif text-[26px] font-bold tracking-[-0.04em] text-[#243328] sm:text-[30px]">
              VinKimya
            </span>

            <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.16em] text-[#657064] sm:text-[9px]">
              (Private) Limited
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-[#657064] transition hover:text-[#a26934]"
            >
              Home
            </Link>

            <Link
              href="/shop"
              className="text-sm font-semibold text-[#a26934]"
            >
              Shop
            </Link>

            <Link
              href="/reviews"
              className="text-sm font-medium text-[#657064] transition hover:text-[#a26934]"
            >
              Reviews
            </Link>
          </nav>

          {/* CART + MOBILE MENU */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCart}
              aria-label="Open cart"
              title="Cart"
              className="group relative flex size-11 items-center justify-center rounded-full border border-[#243328]/15 bg-white/20 text-[#243328] shadow-sm transition hover:bg-white/50 hover:shadow-md"
            >
              <ShoppingBag className="size-[18px] transition-transform duration-200 group-hover:-translate-y-0.5" />

              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-[#a26934] px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            <button
              type="button"
              aria-label={
                mobileMenuOpen
                  ? 'Close menu'
                  : 'Open menu'
              }
              aria-expanded={mobileMenuOpen}
              onClick={() =>
                setMobileMenuOpen((open) => !open)
              }
              className="flex size-11 items-center justify-center rounded-full border border-[#243328]/15 text-[#243328] transition hover:bg-white/40 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="size-[19px]" />
              ) : (
                <Menu className="size-[19px]" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE NAV */}
        {mobileMenuOpen && (
          <div className="border-t border-[#243328]/10 bg-[#eee9dc] px-5 py-4 md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col">
              <Link
                href="/"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="border-b border-[#243328]/10 py-3 text-sm font-medium text-[#657064]"
              >
                Home
              </Link>

              <Link
                href="/shop"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="border-b border-[#243328]/10 py-3 text-sm font-semibold text-[#a26934]"
              >
                Shop
              </Link>

              <Link
                href="/reviews"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="py-3 text-sm font-medium text-[#657064]"
              >
                Reviews
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* =====================================================
          SHOP CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12 lg:px-10 lg:pt-14">
        {/* INTRO */}
        <div className="mb-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a26934]">
            The Shop
          </p>

          <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="font-serif text-4xl leading-[0.98] tracking-tight text-[#243328] sm:text-5xl lg:text-6xl">
                Choose your{' '}

                <em className="font-normal text-[#a26934]">
                  golden pour.
                </em>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#657064] sm:text-base">
                BİRSEN HANIM Extra Virgin Olive Oil,
                produced and bottled in Türkiye for your
                everyday table.
              </p>
            </div>

            <div className="shrink-0 text-sm text-[#657064]">
              <span className="font-semibold text-[#243328]">
                {filteredProducts.length}
              </span>{' '}

              {filteredProducts.length === 1
                ? 'product'
                : 'products'}
            </div>
          </div>
        </div>

        {/* =====================================================
            FILTERS + SORT
        ===================================================== */}

        {!loading && products.length > 0 && (
          <div className="mb-8 rounded-[1.25rem] border border-[#dfe4d6] bg-white/60 p-3 shadow-sm backdrop-blur sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* CATEGORY FILTER */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('all')}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    category === 'all'
                      ? 'bg-[#243328] text-white'
                      : 'bg-[#eee9dc] text-[#657064] hover:bg-[#e2e6d9]'
                  }`}
                >
                  All Products
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('single')}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    category === 'single'
                      ? 'bg-[#243328] text-white'
                      : 'bg-[#eee9dc] text-[#657064] hover:bg-[#e2e6d9]'
                  }`}
                >
                  Single Bottle
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('bundles')}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    category === 'bundles'
                      ? 'bg-[#243328] text-white'
                      : 'bg-[#eee9dc] text-[#657064] hover:bg-[#e2e6d9]'
                  }`}
                >
                  Bundles
                </button>
              </div>

              {/* SEARCH + SORT */}
              <div className="flex flex-col gap-2 sm:flex-row">
                {/* SEARCH */}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b968b]" />

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(
                        event.target.value
                      )
                    }
                    placeholder="Search products..."
                    className="h-10 w-full rounded-full border border-[#d8ded0] bg-[#f8f6ef] pl-9 pr-4 text-xs text-[#243328] outline-none transition placeholder:text-[#9aa39a] focus:border-[#a26934] sm:w-48"
                  />
                </div>

                {/* SORT */}
                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value as SortOption
                    )
                  }
                  className="h-10 rounded-full border border-[#d8ded0] bg-[#f8f6ef] px-4 text-xs font-semibold text-[#243328] outline-none transition focus:border-[#a26934]"
                >
                  <option value="featured">
                    Featured
                  </option>

                  <option value="price-low">
                    Price: Low to High
                  </option>

                  <option value="price-high">
                    Price: High to Low
                  </option>

                  <option value="name-a-z">
                    Name: A to Z
                  </option>

                  <option value="name-z-a">
                    Name: Z to A
                  </option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[1.5rem] border border-[#dfe4d6] bg-white p-4"
              >
                <div className="aspect-square rounded-[1.35rem] bg-[#dfe4d6]" />

                <div className="mt-5 h-3 w-24 rounded bg-[#dfe4d6]" />

                <div className="mt-3 h-6 w-40 rounded bg-[#dfe4d6]" />

                <div className="mt-3 h-10 rounded bg-[#dfe4d6]" />

                <div className="mt-5 h-10 rounded-full bg-[#dfe4d6]" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[#aebba5] bg-white/30 p-12 text-center">
            <p className="text-sm text-[#657064]">
              Products will appear here once your
              product catalog is ready.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[#aebba5] bg-white/30 p-12 text-center">
            <p className="font-serif text-2xl text-[#243328]">
              No products found.
            </p>

            <p className="mt-2 text-sm text-[#657064]">
              Try changing your filter or search.
            </p>

            <button
              type="button"
              onClick={() => {
                setCategory('all')
                setSortBy('featured')
                setSearchQuery('')
              }}
              className="mt-5 rounded-full bg-[#243328] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#a26934]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* THREE PRODUCTS IN ONE ROW */
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-[#142018] px-5 py-12 text-[#d9dfd5] lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-3">
            {/* COMPANY */}
            <div>
              <div className="relative h-[75px] w-[260px]">
                <img
                  src="/vinkimya-logo.png"
                  alt="VinKimya (Private) Limited"
                  className="h-full w-full object-contain object-left"
                />
              </div>

              <p className="mt-4 max-w-sm text-sm leading-6 text-[#9da99f]">
                VinKimya (Private) Limited brings
                BİRSEN HANIM Premium Turkish Extra Virgin
                Olive Oil to customers across Pakistan.
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

                <Link
                  href="/reviews"
                  className="transition hover:text-white"
                >
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

          {/* COPYRIGHT */}
          <div className="mt-10 border-t border-white/10 pt-6 text-xs text-[#78847a]">
            © 2026 VinKimya (Private) Limited. All
            rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}