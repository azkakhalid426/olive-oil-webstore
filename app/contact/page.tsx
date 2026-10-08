'use client'

import { Mail, MapPin, Phone } from 'lucide-react'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f7f5ee] text-[#243328]">
      <div className="border-b border-[#dfe4d6] bg-[#243328] px-4 py-2 text-center text-xs font-medium tracking-[0.18em] text-[#f5f2e8]">PURE PAKISTANI OLIVE OIL · DELIVERED NATIONWIDE</div>
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-10">
        <a href="/" className="font-serif text-2xl font-semibold tracking-tight">NOURISH<span className="text-[#a26b35]">.</span></a>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a href="/" className="hover:text-[#a26b35]">Home</a>
          <a href="/shop" className="hover:text-[#a26b35]">Shop</a>
          <a href="/cart" className="hover:text-[#a26b35]">Cart</a>
          <a href="/contact" className="text-[#a26b35]">Contact</a>
        </nav>
        <a href="/shop" className="rounded-full bg-[#243328] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a26b35]">Shop olive oil</a>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-24 pt-12 lg:grid-cols-[0.8fr_1fr] lg:px-10 lg:pb-32 lg:pt-20">
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#a26b35]">We&apos;d love to hear from you</p>
          <h1 className="font-serif text-6xl leading-[0.94] tracking-[-0.04em] sm:text-7xl">Let&apos;s talk<br /><em className="font-normal text-[#a26b35]">olive oil.</em></h1>
          <p className="mt-8 max-w-md text-lg leading-8 text-[#657064]">Questions about our oil, delivery across Pakistan, or choosing the right bundle? Send us a note and our team will get back to you.</p>
          <div className="mt-10 flex flex-col gap-5 text-sm">
            <div className="flex items-center gap-4"><Mail className="size-5 text-[#a26b35]" /><span>hello@nourish.pk</span></div>
            <div className="flex items-center gap-4"><Phone className="size-5 text-[#a26b35]" /><span>+92 300 000 0000</span></div>
            <div className="flex items-center gap-4"><MapPin className="size-5 text-[#a26b35]" /><span>Delivering across Pakistan</span></div>
          </div>
        </div>

        <form className="rounded-[2rem] bg-[#e9eee2] p-6 sm:p-10" onSubmit={(event) => event.preventDefault()}>
          <div className="flex flex-col gap-6">
            <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="name">Your name<input id="name" name="name" required className="rounded-xl border border-[#cbd4c3] bg-[#f7f5ee] px-4 py-3 font-normal outline-none transition focus:border-[#a26b35]" placeholder="Your name" /></label>
            <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="email">Email address<input id="email" name="email" type="email" required className="rounded-xl border border-[#cbd4c3] bg-[#f7f5ee] px-4 py-3 font-normal outline-none transition focus:border-[#a26b35]" placeholder="you@example.com" /></label>
            <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="message">How can we help?<textarea id="message" name="message" required rows={5} className="resize-none rounded-xl border border-[#cbd4c3] bg-[#f7f5ee] px-4 py-3 font-normal outline-none transition focus:border-[#a26b35]" placeholder="Tell us a little more..." /></label>
            <button type="submit" className="rounded-full bg-[#243328] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#a26b35]">Send message</button>
          </div>
        </form>
      </section>

      <footer className="border-t border-[#dfe4d6] bg-[#e9eee2] px-5 py-10 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div><a href="/" className="font-serif text-xl font-semibold">NOURISH<span className="text-[#a26b35]">.</span></a><p className="mt-2 text-xs text-[#657064]">Pure Pakistani olive oil for every table.</p></div>
          <div className="flex gap-5 text-sm text-[#657064]"><a href="/" className="hover:text-[#a26b35]">Home</a><a href="/shop" className="hover:text-[#a26b35]">Shop</a><a href="/cart" className="hover:text-[#a26b35]">Cart</a></div>
          <p className="text-xs text-[#657064]">© 2026 Nourish Olive Oil</p>
        </div>
      </footer>
    </main>
  )
}
