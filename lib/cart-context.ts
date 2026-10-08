'use client'

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const CART_STORAGE_KEY = 'birsen-hanim-cart'
const MAX_QUANTITY = 20

export type CartProduct = {
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

export type CartItem = CartProduct & {
  quantity: number
}

type CartContextValue = {
  cart: CartItem[]
  itemCount: number
  subtotal: number
  delivery: number
  total: number

  isCartOpen: boolean
  cartReady: boolean

  openCart: () => void
  closeCart: () => void
  toggleCart: () => void

  addToCart: (product: CartProduct, quantity?: number) => void
  removeFromCart: (productId: string) => void
  increaseQuantity: (productId: string) => void
  decreaseQuantity: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext =
  createContext<CartContextValue | null>(null)

export function CartProvider({
  children,
}: {
  children: ReactNode
}) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartReady, setCartReady] = useState(false)

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem(
        CART_STORAGE_KEY
      )

      if (savedCart) {
        const parsed: unknown = JSON.parse(savedCart)

        if (Array.isArray(parsed)) {
          const restoredCart: CartItem[] = parsed
            .filter((item): item is CartItem => {
              return Boolean(
                item &&
                  typeof item === 'object' &&
                  '_id' in item &&
                  'name' in item
              )
            })
            .map((item) => {
              const quantity = Math.max(
                1,
                Math.min(
                  MAX_QUANTITY,
                  Math.floor(Number(item.quantity) || 1)
                )
              )

              return {
                ...item,
                quantity,
              }
            })

          setCart(restoredCart)
        }
      }
    } catch {
      setCart([])
    } finally {
      setCartReady(true)
    }
  }, [])

  useEffect(() => {
    if (!cartReady) {
      return
    }

    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
      )
    } catch {
      // Ignore localStorage errors.
    }
  }, [cart, cartReady])

  const openCart = useCallback(() => {
    setIsCartOpen(true)
  }, [])

  const closeCart = useCallback(() => {
    setIsCartOpen(false)
  }, [])

  const toggleCart = useCallback(() => {
    setIsCartOpen((current) => !current)
  }, [])

  const addToCart = useCallback(
    (product: CartProduct, quantity = 1) => {
      if (!product.active || product.stock <= 0) {
        return
      }

      const safeQuantity = Math.max(
        1,
        Math.min(
          MAX_QUANTITY,
          product.stock,
          Math.floor(Number(quantity) || 1)
        )
      )

      setCart((current) => {
        const existingItem = current.find(
          (item) => item._id === product._id
        )

        if (existingItem) {
          const newQuantity = Math.min(
            existingItem.quantity + safeQuantity,
            product.stock,
            MAX_QUANTITY
          )

          return current.map((item) => {
            if (item._id !== product._id) {
              return item
            }

            return {
              ...item,
              ...product,
              quantity: newQuantity,
            }
          })
        }

        return [
          ...current,
          {
            ...product,
            quantity: safeQuantity,
          },
        ]
      })

      setIsCartOpen(true)
    },
    []
  )

  const removeFromCart = useCallback(
    (productId: string) => {
      setCart((current) =>
        current.filter(
          (item) => item._id !== productId
        )
      )
    },
    []
  )

  const increaseQuantity = useCallback(
    (productId: string) => {
      setCart((current) =>
        current.map((item) => {
          if (item._id !== productId) {
            return item
          }

          if (item.quantity >= item.stock) {
            return item
          }

          return {
            ...item,
            quantity: Math.min(
              item.quantity + 1,
              item.stock,
              MAX_QUANTITY
            ),
          }
        })
      )
    },
    []
  )

  const decreaseQuantity = useCallback(
    (productId: string) => {
      setCart((current) =>
        current.flatMap((item) => {
          if (item._id !== productId) {
            return [item]
          }

          if (item.quantity <= 1) {
            return []
          }

          return [
            {
              ...item,
              quantity: item.quantity - 1,
            },
          ]
        })
      )
    },
    []
  )

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      const safeQuantity = Math.max(
        0,
        Math.min(
          MAX_QUANTITY,
          Math.floor(Number(quantity) || 0)
        )
      )

      setCart((current) =>
        current.flatMap((item) => {
          if (item._id !== productId) {
            return [item]
          }

          if (safeQuantity <= 0) {
            return []
          }

          return [
            {
              ...item,
              quantity: Math.min(
                safeQuantity,
                item.stock
              ),
            },
          ]
        })
      )
    },
    []
  )

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const itemCount = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    )
  }, [cart])

  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum + item.price * item.quantity,
      0
    )
  }, [cart])

  const delivery = useMemo(() => {
    if (subtotal === 0) {
      return 0
    }

    return subtotal >= 5000 ? 0 : 250
  }, [subtotal])

  const total = useMemo(() => {
    return subtotal + delivery
  }, [subtotal, delivery])

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount,
      subtotal,
      delivery,
      total,

      isCartOpen,
      cartReady,

      openCart,
      closeCart,
      toggleCart,

      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      setQuantity,
      clearCart,
    }),
    [
      cart,
      itemCount,
      subtotal,
      delivery,
      total,
      isCartOpen,
      cartReady,
      openCart,
      closeCart,
      toggleCart,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      setQuantity,
      clearCart,
    ]
  )

  return createElement(
    CartContext.Provider,
    { value },
    children
  )
}

export function useCart() {
  const context = useContext(CartContext)

  if (context === null) {
    throw new Error(
      'useCart must be used inside CartProvider'
    )
  }

  return context
}