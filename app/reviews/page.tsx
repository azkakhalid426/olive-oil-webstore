"use client"

import Link from "next/link"
import {
  ArrowRight,
  ShoppingBag,
  Star,
  Quote,
  CheckCircle2,
} from "lucide-react"
import { useCart } from "@/lib/cart-context"

type Review = {
  id: number
  name: string
  city: string
  rating: number
  text: string
  date: string
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Ayesha Khan",
    city: "Lahore",
    rating: 5,
    text: "Taste bohat acha hai. Salad ke sath use kiya aur flavour kaafi rich laga. Packaging bhi premium hai.",
    date: "2 days ago",
  },
  {
    id: 2,
    name: "Hamza Ahmed",
    city: "Islamabad",
    rating: 4.5,
    text: "Really nice olive oil. Taste smooth hai aur bottle bhi achi packed thi. Definitely better than most oils I have tried locally.",
    date: "4 days ago",
  },
  {
    id: 3,
    name: "Sana Malik",
    city: "Karachi",
    rating: 5,
    text: "I loved it! Breakfast mein bread ke sath try kiya, bohat acha laga. Will order again.",
    date: "1 week ago",
  },
  {
    id: 4,
    name: "Bilal Raza",
    city: "Lahore",
    rating: 4,
    text: "Quality achi hai aur taste authentic feel hota hai. Delivery thori late hui thi lekin overall experience good raha.",
    date: "1 week ago",
  },
  {
    id: 5,
    name: "Maham Ali",
    city: "Rawalpindi",
    rating: 5,
    text: "Bohat zabardast flavour hai. Main usually olive oil salads mein use karti hoon aur is ka taste mujhe kaafi pasand aya.",
    date: "8 days ago",
  },
  {
    id: 6,
    name: "Usman Tariq",
    city: "Faisalabad",
    rating: 4.5,
    text: "Good quality and elegant packaging. Price thora premium hai but quality ke hisaab se worth it lagta hai.",
    date: "10 days ago",
  },
  {
    id: 7,
    name: "Hira Sheikh",
    city: "Islamabad",
    rating: 5,
    text: "The bottle looks beautiful on the kitchen counter and the oil tastes even better. Very pleasant and fresh flavour.",
    date: "2 weeks ago",
  },
  {
    id: 8,
    name: "Saad Hassan",
    city: "Lahore",
    rating: 4,
    text: "Overall acha experience raha. Olive oil ka flavour balanced hai aur cooking ke liye bhi use kar raha hoon.",
    date: "2 weeks ago",
  },
  {
    id: 9,
    name: "Rabia Noor",
    city: "Multan",
    rating: 5,
    text: "Honestly bohat acha laga. Simple si salad bhi is ke sath zyada tasty lagti hai. Family ko bhi pasand aya.",
    date: "3 weeks ago",
  },
  {
    id: 10,
    name: "Danish Iqbal",
    city: "Karachi",
    rating: 4.5,
    text: "Nice Turkish olive oil with a rich taste. Packaging was secure and delivery arrived in good condition.",
    date: "3 weeks ago",
  },
  {
    id: 11,
    name: "Zainab Fatima",
    city: "Lahore",
    rating: 5,
    text: "Mujhe iska taste bohat pasand aya. Especially fresh salad aur grilled vegetables par drizzle karne ke liye perfect hai.",
    date: "1 month ago",
  },
  {
    id: 12,
    name: "Omar Farooq",
    city: "Peshawar",
    rating: 4,
    text: "Good product overall. Flavour strong hai compared to regular cooking oils, so a little goes a long way.",
    date: "1 month ago",
  },
]

const topRow = reviews.slice(0, 6)
const bottomRow = reviews.slice(6, 12)

function Stars({
  rating,
  size = "sm",
}: {
  rating: number
  size?: "sm" | "md"
}) {
  const starSize = size === "md" ? "size-5" : "size-4"

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star
        const half = !filled && rating >= star - 0.5

        return (
          <span key={star} className="relative">
            <Star
              className={`${starSize} ${
                filled
                  ? "fill-[#d7a66c] text-[#d7a66c]"
                  : half
                    ? "fill-[#d7a66c]/50 text-[#d7a66c]"
                    : "text-[#c7c5b8]"
              }`}
            />
          </span>
        )
      })}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="group w-[310px] shrink-0 rounded-[24px] border border-[#243328]/8 bg-white/75 p-5 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-[360px] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Stars rating={review.rating} />

          <p className="mt-2 text-xs font-medium text-[#8a9189]">
            {review.rating.toFixed(review.rating % 1 ? 1 : 0)} / 5
          </p>
        </div>

        <Quote className="size-7 text-[#d7a66c]/50 transition duration-300 group-hover:text-[#a26934]/60" />
      </div>

      <p className="mt-5 min-h-[96px] text-sm leading-7 text-[#4f5a52]">
        “{review.text}”
      </p>

      <div className="mt-5 border-t border-[#243328]/8 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#243328]">
              {review.name}
            </p>

            <p className="mt-0.5 text-xs text-[#7b857d]">
              {review.city}, Pakistan
            </p>
          </div>

          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#9aa198]">
            {review.date}
          </p>
        </div>
      </div>
    </article>
  )
}

export default function ReviewsPage() {
  const { itemCount, openCart } = useCart()

  const totalReviews = reviews.length

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews

  const fiveStarCount = reviews.filter(
    (review) => review.rating === 5
  ).length

  const fourStarCount = reviews.filter(
    (review) => review.rating >= 4 && review.rating < 5
  ).length

  const threeStarCount = reviews.filter(
    (review) => review.rating >= 3 && review.rating < 4
  ).length

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eee9dc] text-[#243328]">
      {/* =========================================================
          ANNOUNCEMENT BAR
      ========================================================= */}

      <div className="bg-[#243328] px-4 py-2.5 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-[#f4eee1] sm:text-[10px] sm:tracking-[0.22em]">
        Premium Turkish Extra Virgin Olive Oil
        <span className="mx-2 text-[#d7a66c]">·</span>
        Delivered Across Pakistan
      </div>

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header className="sticky top-0 z-50 border-b border-[#243328]/5 bg-[#eee9dc]/90 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:h-[84px] lg:px-10">
          {/* BRAND */}

          <Link href="/" className="group flex flex-col leading-none">
            <span className="font-serif text-[24px] font-bold tracking-[-0.03em] text-[#243328] transition duration-300 group-hover:text-[#a26934] sm:text-[28px]">
              VinKimya
            </span>

            <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.16em] text-[#657064] sm:text-[9px]">
              (Private) Limited
            </span>
          </Link>

          {/* NAVIGATION */}

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-[#657064] transition hover:text-[#a26934]"
            >
              Home
            </Link>

            <Link
              href="/shop"
              className="text-sm font-medium text-[#657064] transition hover:text-[#a26934]"
            >
              Shop
            </Link>

            <Link
              href="/reviews"
              className="text-sm font-semibold text-[#a26934]"
            >
              Reviews
            </Link>
          </nav>

          {/* CART */}

          <button
            type="button"
            onClick={openCart}
            aria-label="Open shopping cart"
            title="Shopping Cart"
            className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-[#243328]/20 bg-white/30 text-[#243328] shadow-sm transition-all duration-300 hover:border-[#a26934] hover:bg-[#a26934] hover:text-white hover:shadow-md sm:size-12"
          >
            <ShoppingBag className="size-5" />

            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#a26934] text-[9px] font-bold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative overflow-hidden bg-[#eee9dc] px-5 py-16 sm:py-20 lg:px-10 lg:py-24">
        <div className="pointer-events-none absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-[#d5dfc5] opacity-60 blur-[110px]" />

        <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-[#d9c29c] opacity-25 blur-[110px]" />

        <div className="relative mx-auto max-w-[1000px] text-center">
          <p className="mb-5 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#a26934] sm:text-[11px]">
            <span className="h-px w-8 bg-[#a26934]" />
            Customer thoughts
            <span className="h-px w-8 bg-[#a26934]" />
          </p>

          <h1 className="font-serif text-[46px] leading-[0.96] tracking-[-0.04em] sm:text-[64px] lg:text-[76px]">
            Loved at the
            <br />
            <span className="font-normal italic text-[#a26934]">
              table.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#5c665e] sm:text-base">
            From everyday salads to family meals, discover what customers
            are saying about BİRSEN HANIM Extra Virgin Olive Oil.
          </p>

          {/* RATING SUMMARY */}

          <div className="mx-auto mt-10 grid max-w-3xl overflow-hidden rounded-[28px] border border-[#243328]/8 bg-white/55 shadow-sm backdrop-blur-sm sm:grid-cols-[1fr_1.5fr]">
            <div className="flex flex-col items-center justify-center border-b border-[#243328]/8 px-7 py-7 sm:border-b-0 sm:border-r">
              <div className="font-serif text-5xl font-semibold text-[#243328]">
                {averageRating.toFixed(1)}
              </div>

              <Stars rating={averageRating} size="md" />

              <p className="mt-3 text-xs text-[#727c74]">
                Based on {totalReviews} sample reviews
              </p>
            </div>

            <div className="space-y-3 px-7 py-7 text-left">
              <RatingBar
                label="5"
                count={fiveStarCount}
                total={totalReviews}
              />

              <RatingBar
                label="4"
                count={fourStarCount}
                total={totalReviews}
              />

              <RatingBar
                label="3"
                count={threeStarCount}
                total={totalReviews}
              />

              <RatingBar label="2" count={0} total={totalReviews} />

              <RatingBar label="1" count={0} total={totalReviews} />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MARQUEE INTRO
      ========================================================= */}

      <section className="overflow-hidden bg-[#f5f1e7] py-12 sm:py-16">
        <div className="mx-auto mb-9 max-w-[1440px] px-5 text-center lg:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a26934]">
            Realistic customer voices
          </p>

          <h2 className="mt-3 font-serif text-[32px] sm:text-[42px]">
            A little love from Pakistan.
          </h2>
        </div>

        {/* TOP ROW */}

        <div className="reviews-marquee-wrapper overflow-hidden">
          <div className="reviews-marquee-left flex w-max gap-5 px-5">
            {[...topRow, ...topRow].map((review, index) => (
              <ReviewCard
                key={`top-${review.id}-${index}`}
                review={review}
              />
            ))}
          </div>
        </div>

        {/* BOTTOM ROW */}

        <div className="reviews-marquee-wrapper mt-5 overflow-hidden">
          <div className="reviews-marquee-right flex w-max gap-5 px-5">
            {[...bottomRow, ...bottomRow].map((review, index) => (
              <ReviewCard
                key={`bottom-${review.id}-${index}`}
                review={review}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          LANGUAGE / TRUST SECTION
      ========================================================= */}

      <section className="bg-[#243328] px-5 py-16 text-[#f4eee1] sm:py-20 lg:px-10">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d7a66c]">
              From our customers
            </p>

            <h2 className="mt-4 max-w-xl font-serif text-[38px] leading-tight sm:text-[52px]">
              Good olive oil doesn't need
              <span className="italic text-[#d7a66c]">
                {" "}
                complicated words.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[#c4cdc3] sm:text-base">
              Whether someone says “bohat acha hai” or “beautifully balanced
              flavour”, what matters is the experience at the table.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-7 backdrop-blur-sm sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#d7a66c] text-[#243328]">
                <CheckCircle2 className="size-5" />
              </div>

              <div>
                <p className="font-serif text-2xl">
                  Turkish origin
                </p>

                <p className="mt-2 text-sm leading-6 text-[#b7c1b8]">
                  Premium Extra Virgin Olive Oil produced and bottled in
                  Türkiye for customers across Pakistan.
                </p>
              </div>
            </div>

            <div className="mt-7 h-px bg-white/10" />

            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#d7a66c]">
                  Customer rating
                </p>

                <div className="mt-2 flex items-center gap-3">
                  <Stars rating={averageRating} />

                  <span className="text-sm font-semibold">
                    {averageRating.toFixed(1)} / 5
                  </span>
                </div>
              </div>

              <Quote className="size-10 text-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}

      <section className="px-5 py-16 sm:py-20 lg:px-10">
        <div className="relative mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-7 overflow-hidden rounded-[28px] bg-[#dedfcf] px-7 py-12 text-center sm:px-12 lg:flex-row lg:text-left">
          <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#c6cdae] opacity-40" />

          <span className="absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-[#d0b68a] opacity-20" />

          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9d6532]">
              Ready to taste it?
            </p>

            <h2 className="mt-2 font-serif text-[34px] leading-tight sm:text-[46px]">
              Bring home the golden pour.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#5d675f]">
              Explore BİRSEN HANIM Extra Virgin Olive Oil and choose the
              perfect option for your home.
            </p>
          </div>

          <Link
            href="/shop"
            className="group relative z-10 inline-flex shrink-0 items-center gap-3 rounded-full bg-[#243328] px-7 py-4 text-sm font-semibold text-white shadow-lg transition duration-300 hover:bg-[#a26934]"
          >
            Shop olive oil

            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* =========================================================
          SAMPLE REVIEW NOTICE
      ========================================================= */}

      <div className="px-5 pb-10 text-center lg:px-10">
        <p className="mx-auto max-w-2xl text-[11px] leading-5 text-[#858d85]">
          Demo content: the reviews shown on this page are sample reviews
          for design and development purposes and are not presented as
          verified customer testimonials.
        </p>
      </div>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="bg-[#142018] px-5 py-12 text-[#d9dfd5] lg:px-10">
        <div className="mx-auto max-w-[1440px]">
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

          <div className="mt-10 border-t border-white/10 pt-6 text-xs text-[#78847a]">
            © 2026 VinKimya (Private) Limited. All rights reserved.
          </div>
        </div>
      </footer>

      {/* =========================================================
          ANIMATIONS
      ========================================================= */}

      <style jsx global>{`
        .reviews-marquee-left {
          animation: reviews-left 48s linear infinite;
        }

        .reviews-marquee-right {
          animation: reviews-right 52s linear infinite;
        }

        .reviews-marquee-wrapper:hover .reviews-marquee-left,
        .reviews-marquee-wrapper:hover .reviews-marquee-right {
          animation-play-state: paused;
        }

        @keyframes reviews-left {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @keyframes reviews-right {
          from {
            transform: translateX(-50%);
          }

          to {
            transform: translateX(0);
          }
        }

        @media (max-width: 640px) {
          .reviews-marquee-left {
            animation-duration: 38s;
          }

          .reviews-marquee-right {
            animation-duration: 42s;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .reviews-marquee-left,
          .reviews-marquee-right {
            animation-play-state: paused;
          }
        }
      `}</style>
    </main>
  )
}

function RatingBar({
  label,
  count,
  total,
}: {
  label: string
  count: number
  total: number
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div className="flex items-center gap-3">
      <span className="w-3 text-xs font-semibold text-[#657064]">
        {label}
      </span>

      <Star className="size-3 fill-[#d7a66c] text-[#d7a66c]" />

      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#deddd2]">
        <div
          className="h-full rounded-full bg-[#d7a66c] transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span className="w-5 text-right text-[10px] text-[#899188]">
        {count}
      </span>
    </div>
  )
}