'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  ShoppingBag,
  HeartPulse,
  Dumbbell,
  Salad,
  Utensils,
  Apple,
} from 'lucide-react'

const benefits = [
  {
    icon: HeartPulse,
    title: 'Heart-friendly choice',
    text: 'Extra virgin olive oil is naturally rich in monounsaturated fats. As part of a balanced diet, it can replace foods higher in saturated fats.',
  },
  {
    icon: Apple,
    title: 'For a balanced diet',
    text: 'A simple way to add healthy unsaturated fats and flavour to everyday meals with vegetables, salads, grains and bread.',
  },
  {
    icon: Dumbbell,
    title: 'For gym & active living',
    text: 'Healthy fats are part of a balanced diet for active people. Add olive oil to meals, salads or vegetables to make them more satisfying.',
  },
  {
    icon: Utensils,
    title: 'Everyday cooking',
    text: 'Use it for dressings, marinades, roasting, sautéing and finishing. Its rich flavour lifts even the simplest dishes.',
  },
]

const orderSteps = [
  {
    title: 'Pick your size',
    text: 'Choose a single bottle, The Pair or The Family Set from the shop.',
  },
  {
    title: 'Add to cart',
    text: 'Your cart opens straight away, where you can review your order.',
  },
  {
    title: 'Checkout from the cart',
    text: 'Enter your delivery details and place your order. We deliver across Pakistan.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eee9dc] text-[#243328]">
      {/* ANNOUNCEMENT BAR */}

      <div className="bg-[#243328] px-4 py-2.5 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-[#f4eee1] sm:text-[10px] sm:tracking-[0.22em]">
        Premium Turkish Extra Virgin Olive Oil
        <span className="mx-2 text-[#d7a66c]">·</span>
        Delivered Across Pakistan
      </div>

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-[#243328]/5 bg-[#eee9dc]/90 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:h-[84px] lg:px-10">
          {/* COMPANY NAME */}

          <Link href="/" className="group flex flex-col leading-none">
            <span className="font-serif text-[24px] font-bold tracking-[-0.03em] text-[#243328] transition duration-300 group-hover:text-[#a26934] sm:text-[28px]">
              VinKimya
            </span>

            <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.16em] text-[#657064] sm:text-[9px]">
              (Private) Limited
            </span>
          </Link>

          {/* NAVIGATION (visible on all screens) */}

          <nav className="flex items-center gap-5 sm:gap-10">
            <Link
              href="/"
              className="text-[15px] font-semibold text-[#a26934] transition hover:text-[#243328] sm:text-[16px]"
            >
              Home
            </Link>

            <Link
              href="/shop"
              className="text-[15px] font-semibold text-[#243328] transition hover:text-[#a26934] sm:text-[16px]"
            >
              Shop
            </Link>
            <Link
               href="/reviews"
               className="text-[15px] font-semibold text-[#243328] transition hover:text-[#a26934] sm:text-[16px]"
            >
              Reviews
            </Link>
          </nav>

          {/* CART ICON */}

          <Link
            href="/cart"
            aria-label="Shopping Cart"
            title="Shopping Cart"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#243328]/20 bg-white/30 text-[#243328] shadow-sm transition-all duration-300 hover:border-[#a26934] hover:bg-[#a26934] hover:text-white hover:shadow-md sm:size-12"
          >
            <ShoppingBag className="size-5" />
          </Link>
        </div>
      </header>

      {/* HERO */}

      <section className="relative overflow-hidden">
        {/* Soft background glow */}

        <div className="pointer-events-none absolute -left-40 top-10 h-[380px] w-[380px] rounded-full bg-[#d5dfc5] opacity-60 blur-[100px]" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[380px] w-[380px] rounded-full bg-[#d9c29c] opacity-25 blur-[100px]" />

        <div className="relative mx-auto grid max-w-[1440px] items-center gap-6 px-5 py-10 sm:py-14 lg:grid-cols-[1fr_0.9fr] lg:gap-10 lg:px-10 lg:py-16">
          {/* HERO CONTENT */}

          <div className="hero-copy relative z-10 max-w-xl">
            <p className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#a26934]">
              <span className="h-px w-9 bg-[#a26934]" />
              BİRSEN HANIM
            </p>

            <h1 className="font-serif text-[44px] leading-[0.95] tracking-[-0.04em] sm:text-[60px] lg:text-[72px]">
              The golden taste
              <br />
              <span className="font-normal italic text-[#a26934]">
                of Türkiye.
              </span>
            </h1>

            <p className="mt-6 max-w-[510px] text-[15px] leading-7 text-[#556057] sm:text-[17px]">
              Premium Extra Virgin Olive Oil, produced and bottled in
              Türkiye, brought to your table in Pakistan.
            </p>

            {/* HERO BUTTONS */}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#243328] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#243328]/15 transition duration-300 hover:bg-[#a26934]"
              >
                Shop olive oil
                <ArrowRight className="size-4 transition duration-300 group-hover:translate-x-1" />
              </Link>

              <a
                href="#benefits"
                className="inline-flex items-center justify-center rounded-full border border-[#243328]/20 px-7 py-3.5 text-sm font-semibold text-[#243328] transition duration-300 hover:bg-white/60"
              >
                Why olive oil?
              </a>
            </div>

            {/* PRODUCT FEATURES */}

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {['Extra Virgin', 'Turkish Origin', 'Cold Extraction'].map(
                (item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-xs text-[#556057]"
                  >
                    <Check className="size-4 text-[#a26934]" />
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* HERO BOTTLE */}

          <div className="hero-bottle relative mx-auto w-full max-w-[340px] sm:max-w-[390px]">
            <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d7dfc8] blur-[70px] sm:h-[330px] sm:w-[330px]" />

            <div className="relative z-10 mx-auto h-[400px] w-full sm:h-[500px] lg:h-[540px]">
              <Image
                src="/bottle.png"
                alt="BİRSEN HANIM Extra Virgin Olive Oil, 500ml bottle"
                fill
                priority
                sizes="(max-width: 768px) 80vw, 390px"
                className="bottle-image object-contain drop-shadow-[0_30px_30px_rgba(30,42,33,0.27)]"
              />
            </div>

            <div className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#243328] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f4eee1] shadow-xl">
              🇹🇷 Made in Türkiye
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT INFORMATION STRIP */}

      <section className="bg-[#243328]">
        <dl className="mx-auto grid max-w-[1440px] grid-cols-2 sm:grid-cols-4">
          {[
            ['Origin', 'Türkiye'],
            ['Type', 'Extra Virgin'],
            ['Extraction', 'Cold Extraction'],
            ['Delivery', 'Across Pakistan'],
          ].map(([title, value]) => (
            <div key={title} className="px-4 py-5 text-center">
              <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#d7a66c]">
                {title}
              </dt>

              <dd className="mt-1 text-sm font-medium text-[#f4eee1]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* BENEFITS */}

      <section
        id="benefits"
        className="relative scroll-mt-24 overflow-hidden bg-[#f5f1e7] px-5 py-16 sm:py-20 lg:px-10"
      >
        <div className="relative mx-auto max-w-[1440px]">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-[34px] leading-tight tracking-tight sm:text-[48px]">
              Good food starts with good choices.
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#556057] sm:text-base">
              Extra virgin olive oil is a versatile part of a balanced
              lifestyle, from everyday cooking to active routines and mindful
              eating.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="group rounded-[24px] bg-[#ebe9dd] p-6 transition duration-500 hover:bg-[#243328] hover:text-white"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#243328] text-[#d7a66c] transition duration-500 group-hover:bg-[#d7a66c] group-hover:text-[#243328]">
                  <Icon className="size-6" />
                </div>

                <h3 className="mt-6 font-serif text-[22px] sm:text-[24px]">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#556057] transition duration-500 group-hover:text-[#c8d0c6]">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SALAD / LIFESTYLE */}

      <section className="mx-auto max-w-[1440px] px-5 py-16 sm:py-20 lg:px-10">
        <div className="lifestyle-section grid overflow-hidden rounded-[24px] bg-[#dce3cf] sm:rounded-[28px] md:grid-cols-2">
          <div className="relative min-h-[260px] overflow-hidden sm:min-h-[380px] md:min-h-[420px]">
            <Image
              src="/salad.png"
              alt="BİRSEN HANIM olive oil over fresh salad"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="lifestyle-image object-cover"
            />
          </div>

          <div className="flex items-center p-7 sm:p-12">
            <div className="max-w-md">
              <div className="flex items-center gap-2 text-xs font-bold text-[#a26934]">
                <Salad className="size-4" />
                Everyday flavour
              </div>

              <h2 className="mt-4 font-serif text-[34px] leading-tight sm:text-[46px]">
                A golden touch for every meal.
              </h2>

              <p className="mt-5 text-sm leading-7 text-[#556057] sm:text-base">
                Drizzle over fresh salads, vegetables, bread and your
                favourite everyday dishes. A little olive oil adds rich
                flavour and healthy unsaturated fats to your daily meals.
              </p>

              <Link
                href="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#243328] px-6 py-3.5 text-sm font-semibold text-white transition duration-300 hover:bg-[#a26934]"
              >
                Shop olive oil
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TURKISH ORIGIN */}

      <section className="relative overflow-hidden bg-[#243328] px-5 py-16 text-[#f4eee1] sm:py-20 lg:px-10">
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="origin-visual relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[#1a271e] shadow-2xl sm:rounded-[30px]">
              <Image
                src="/olive-grove.png"
                alt="Olive grove in Türkiye"
                fill
                sizes="(max-width: 1024px) 90vw, 560px"
                className="origin-image object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#142018]/35 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-5 right-3 rounded-2xl bg-[#f1ebdd] px-5 py-4 text-[#243328] shadow-xl sm:-right-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a26934]">
                Authentic
              </p>

              <p className="mt-1 font-serif text-lg">Turkish origin</p>
            </div>
          </div>

          <div className="max-w-xl">
            <h2 className="font-serif text-[36px] leading-[1.05] sm:text-[50px]">
              From Türkiye
              <br />
              to your table.
            </h2>

            <p className="mt-6 text-[15px] leading-7 text-[#c4cdc3]">
              BİRSEN HANIM Extra Virgin Olive Oil is produced and bottled in
              Türkiye before being brought to Pakistan. The oil stays true to
              its Turkish origin from production to packaging.
            </p>

            <ul className="mt-7 flex flex-wrap gap-3">
              {['Produced in Türkiye', 'Bottled in Türkiye', '500ml'].map(
                (item) => (
                  <li
                    key={item}
                    className="rounded-full bg-white/5 px-4 py-2 text-xs text-[#dce3da]"
                  >
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </section>


      {/* FINAL CTA */}

      <section className="px-5 pb-16 sm:pb-20 lg:px-10">
        <div className="relative mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-7 overflow-hidden rounded-[24px] bg-[#dedfcf] px-7 py-12 text-center sm:rounded-[28px] sm:px-12 lg:flex-row lg:text-left">
          <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#c6cdae] opacity-40" />
          <span className="absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-[#d0b68a] opacity-20" />

          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9d6532]">
              BİRSEN HANIM
            </p>

            <h2 className="mt-2 font-serif text-[34px] leading-tight sm:text-[46px]">
              Bring home the golden pour.
            </h2>
          </div>

          <Link
            href="/shop"
            className="group relative z-10 inline-flex items-center gap-3 rounded-full bg-[#243328] px-7 py-4 text-sm font-semibold text-white shadow-lg transition duration-300 hover:bg-[#a26934]"
          >
            Shop now
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="bg-[#142018] px-5 py-12 text-[#d9dfd5] lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-10 md:grid-cols-3">
            {/* COMPANY / LOGO */}

            <div>
              <div className="relative h-[75px] w-[260px] max-w-full">
                <img
                  src="/vinkimya-logo.png"
                  alt="VinKimya (Private) Limited"
                  className="h-full w-full object-contain object-left"
                />
              </div>

              <p className="mt-4 max-w-sm text-sm leading-6 text-[#9da99f]">
                VinKimya (Private) Limited brings BİRSEN HANIM Premium
                Turkish Extra Virgin Olive Oil to customers across Pakistan.
              </p>
            </div>

            {/* EXPLORE */}

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9dfd5]">
                Explore
              </p>

              <div className="mt-5 flex flex-col gap-3 text-sm text-[#9da99f]">
                <Link href="/" className="transition hover:text-white">
                  Home
                </Link>

                <Link href="/shop" className="transition hover:text-white">
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

      {/* STYLES */}

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        a:focus-visible,
        button:focus-visible {
          outline: 2px solid #a26934;
          outline-offset: 3px;
        }

        /* One entrance sequence for the hero */

        .hero-copy {
          animation: heroText 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .hero-bottle {
          animation: heroBottle 1100ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes heroText {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroBottle {
          from {
            opacity: 0;
            transform: translateY(36px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Gentle bottle float */

        .bottle-image {
          animation: bottleFloat 5s ease-in-out infinite;
        }

        @keyframes bottleFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        /* Image zoom on hover */

        .lifestyle-image,
        .origin-image {
          transform: scale(1.02);
          transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .lifestyle-section:hover .lifestyle-image,
        .origin-visual:hover .origin-image {
          transform: scale(1.07);
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  )
}