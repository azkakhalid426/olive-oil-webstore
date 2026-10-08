'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LockKeyhole } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError('')

    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        '/api/admin/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Login failed.'
        )
      }

      router.push('/admin/orders')
      router.refresh()
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Login failed.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eee9dc] px-5 text-[#243328]">

      <div className="w-full max-w-md">

        <Link
          href="/"
          className="mx-auto flex w-fit flex-col items-center leading-none"
        >
          <span className="font-serif text-[34px] font-bold tracking-[-0.04em]">
            VinKimya
          </span>

          <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#657064]">
            (Private) Limited
          </span>
        </Link>

        <div className="mt-10 rounded-[2rem] bg-[#e9eee2] p-7 sm:p-9">

          <div className="flex size-12 items-center justify-center rounded-full bg-[#243328] text-white">
            <LockKeyhole className="size-5" />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#a26b35]">
            Administration
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#243328]">
            Admin Login
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#657064]">
            Sign in to manage customer orders.
          </p>

          <form
            onSubmit={handleLogin}
            className="mt-8"
          >

            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold"
            >
              Admin Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter admin password"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-[#cbd4c3] bg-white/70 px-4 py-3.5 text-sm outline-none transition placeholder:text-[#8b9589] focus:border-[#a26b35] focus:bg-white"
            />

            {error && (
              <p className="mt-4 rounded-xl bg-[#8d3f37] px-4 py-3 text-sm text-white">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-[#243328] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#3b513f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'Signing in...'
                : 'Sign in'}
            </button>

          </form>

        </div>

        <p className="mt-6 text-center text-xs text-[#657064]">
          Admin access only
        </p>

      </div>

    </main>
  )
}