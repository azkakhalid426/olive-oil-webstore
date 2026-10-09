
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Landmark,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";

type Customer = {
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
};

type PaymentMethod = "cod" | "bank_transfer";

const BANK = {
  name: "Faysal Bank Limited",
  title: "Azka Khalid",
  accountNumber: "3376444000006146",
  iban: "FBLPK3376444000006146",
};

const WHATSAPP_NUMBER = "923011100950";

const formatPrice = (price: number, currency = "PKR") =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);

export default function CheckoutPage() {
  const {
    cart,
    subtotal,
    delivery,
    total,
    cartReady,
    clearCart,
    openCart,
    itemCount,
  } = useCart();

  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    email: "",
    city: "",
    address: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cod");

  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [completedOrder, setCompletedOrder] = useState({
    total: 0,
    currency: "PKR",
  });
  const [copyState, setCopyState] = useState<
    "account" | "iban" | ""
  >("");

  const currency = cart[0]?.currency ?? "PKR";

  useEffect(() => {
    if (!orderSuccess) return;

    const saved = sessionStorage.getItem(
      "completed-order-total"
    );

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      if (
        typeof parsed?.total === "number" &&
        parsed.total > 0
      ) {
        setCompletedOrder({
          total: parsed.total,
          currency:
            typeof parsed.currency === "string"
              ? parsed.currency
              : "PKR",
        });
      }
    } catch {
      // Ignore invalid session storage data.
    }
  }, [orderSuccess]);

  const updateCustomer = (
    field: keyof Customer,
    value: string
  ) => {
    setCustomer((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) setError("");
  };

  const copyValue = async (
    value: string,
    kind: "account" | "iban"
  ) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyState(kind);
      window.setTimeout(() => setCopyState(""), 1800);
    } catch {
      setError(
        "Copy failed. Please select and copy the number manually."
      );
    }
  };

  const whatsappMessage = () => {
    const message = [
      "Hello, I have made a bank transfer for my BİRSEN HANIM Olive Oil order.",
      "",
      `Customer name: ${customer.name.trim() || "[Your name]"}`,
      `Phone: ${customer.phone.trim() || "[Your phone number]"}`,
      `City: ${customer.city.trim() || "[Your city]"}`,
      `Order amount: ${formatPrice(total, currency)}`,
      "",
      "I am attaching my payment screenshot/transaction proof here.",
      "Please verify my payment and confirm my order.",
    ].join("\n");

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;
  };

  const placeOrder = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Your basket is empty.");
      return;
    }

    if (!customer.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!customer.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!customer.city.trim()) {
      setError("Please enter your city.");
      return;
    }

    if (!customer.address.trim()) {
      setError(
        "Please enter your complete delivery address."
      );
      return;
    }

    const finalSubtotal = cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price) * Number(item.quantity),
      0
    );

    const finalDelivery =
      finalSubtotal >= 5000 || finalSubtotal === 0
        ? 0
        : 250;

    const finalOrderTotal =
      finalSubtotal + finalDelivery;

    const finalCurrency =
      cart[0]?.currency ?? "PKR";

    setPlacingOrder(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            name: customer.name.trim(),
            phone: customer.phone.trim(),
            email: customer.email.trim(),
            address: customer.address.trim(),
            city: customer.city.trim(),
          },
          items: cart.map((item) => ({
            productId: item._id,
            quantity: item.quantity,
          })),
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "We could not place your order."
        );
      }

      const completed = {
        total: finalOrderTotal,
        currency: finalCurrency,
      };

      setCompletedOrder(completed);

      sessionStorage.setItem(
        "completed-order-total",
        JSON.stringify(completed)
      );

      setOrderId(
        data.order?.orderNumber
          ? String(data.order.orderNumber)
          : ""
      );

      clearCart();
      setOrderSuccess(true);

      window.history.replaceState(
        {},
        "",
        "/checkout"
      );
    } catch (orderError) {
      console.error(orderError);

      setError(
        orderError instanceof Error
          ? orderError.message
          : "We could not place your order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-2xl border border-[#dce2d5] bg-white px-4 py-3.5 text-sm !text-black caret-black outline-none transition placeholder:!text-[#657064] focus:border-[#a26934] focus:ring-4 focus:ring-[#a26934]/10";
  const labelClass =
    "block text-sm font-semibold text-[#243328]";

  if (!cartReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eee9dc] text-[#243328]">
        <div className="text-center">
          <ShoppingBag className="mx-auto mb-4 size-8 text-[#a26934]" />
          <p className="text-sm text-[#657064]">
            Preparing your checkout...
          </p>
        </div>
      </main>
    );
  }

  if (orderSuccess) {
    return (
      <main className="min-h-screen bg-[#eee9dc] text-[#243328]">
        <Announcement />
        <Header itemCount={0} openCart={openCart} />

        <section className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center px-5 py-16">
          <div className="w-full rounded-[2rem] bg-[#e9eee2] p-7 text-center sm:p-12">
            <CheckCircle2 className="mx-auto size-16 text-[#a26934]" />

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#a26934]">
              Order received
            </p>

            <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
              Thank you for your order.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#657064] sm:text-base">
              Your order has been received. We will contact
              you on your phone number to confirm the delivery.
            </p>

            {orderId && (
              <div className="mx-auto mt-7 max-w-md rounded-2xl bg-white/70 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.15em] text-[#657064]">
                  Order number
                </p>
                <p className="mt-2 break-all font-mono text-lg font-bold tracking-wide">
                  {orderId}
                </p>
              </div>
            )}

            <div className="mx-auto mt-8 max-w-md rounded-2xl bg-[#243328] p-5 text-left text-white">
              <div className="flex justify-between gap-4">
                <span className="text-[#c4cdbb]">Total</span>
                <span className="font-semibold">
                  {formatPrice(
                    completedOrder.total,
                    completedOrder.currency
                  )}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4">
                <span className="text-[#c4cdbb]">Payment</span>
                <span className="text-right font-semibold">
                  {paymentMethod === "bank_transfer"
                    ? "Bank Transfer"
                    : "Cash on Delivery"}
                </span>
              </div>

              {paymentMethod === "bank_transfer" && (
                <p className="mt-4 rounded-xl bg-white/10 p-3 text-sm leading-6 text-[#f5d6ae]">
                  Payment verification is pending. If you
                  have not sent your payment proof yet,
                  contact us on WhatsApp and attach your
                  transaction screenshot.
                </p>
              )}
            </div>

            {paymentMethod === "bank_transfer" && (
              <a
                href={whatsappMessage()}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#1ebc59]"
              >
                <MessageCircle className="size-5" />
                Send payment proof on WhatsApp
              </a>
            )}

            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-full bg-[#243328] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3b513f]"
            >
              Continue shopping
            </Link>
          </div>
        </section>

        <Footer />
        <PaymentAnimation />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eee9dc] text-[#243328]">
      <Announcement />
      <Header
        itemCount={itemCount}
        openCart={openCart}
      />

      <section className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:pt-14 lg:px-10 lg:pt-16">
        <div className="mb-9">
          <Link
            href="/cart"
            className="mb-7 inline-flex items-center gap-2 text-sm text-[#657064] transition hover:text-[#a26934]"
          >
            <ArrowLeft className="size-4" />
            Back to basket
          </Link>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#a26934]">
            Secure checkout
          </p>

          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            Almost yours.
          </h1>

          <p className="mt-3 text-sm text-[#657064] sm:text-base">
            Add your delivery details and choose how you
            would like to pay.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-[#aebba5] bg-white/30 p-10 text-center sm:p-12">
            <ShoppingBag className="mx-auto mb-4 size-8 text-[#a26934]" />

            <p className="font-serif text-2xl">
              Your basket is empty.
            </p>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#657064]">
              Add an olive oil product before continuing to
              checkout.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-full bg-[#243328] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3b513f]"
            >
              Browse the collection
            </Link>
          </div>
        ) : (
          <form
            onSubmit={placeOrder}
            className="grid gap-8 lg:grid-cols-[1fr_390px] lg:gap-10"
          >
            <div className="space-y-7">
              {/* DELIVERY DETAILS */}
              <section className="rounded-[2rem] border border-[#dce2d5] bg-[#e9eee2] p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#a26934] shadow-sm">
                    <Truck className="size-6" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a26934]">
                      Step 01 · Delivery
                    </p>

                    <h2 className="mt-2 font-serif text-3xl">
                      Where should we deliver?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#657064]">
                      Please enter a reachable phone number
                      and complete address so your parcel
                      reaches you smoothly.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-x-5 gap-y-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className={labelClass}>
                      Full name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={customer.name}
                      onChange={(e) =>
                        updateCustomer("name", e.target.value)
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className={labelClass}>
                      Phone number *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={customer.phone}
                      onChange={(e) =>
                        updateCustomer("phone", e.target.value)
                      }
                      placeholder="03XX XXXXXXX"
                      autoComplete="tel"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email{" "}
                      <span className="font-normal text-[#657064]">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={customer.email}
                      onChange={(e) =>
                        updateCustomer("email", e.target.value)
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className={labelClass}>
                      City *
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={customer.city}
                      onChange={(e) =>
                        updateCustomer("city", e.target.value)
                      }
                      placeholder="e.g. Lahore"
                      autoComplete="address-level2"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className={labelClass}>
                      Complete delivery address *
                    </label>
                    <textarea
                      id="address"
                      value={customer.address}
                      onChange={(e) =>
                        updateCustomer("address", e.target.value)
                      }
                      placeholder="House / apartment number, street, area, nearby landmark..."
                      autoComplete="street-address"
                      rows={4}
                      required
                      className={`${inputClass} resize-y`}
                    />
                    <p className="mt-2 text-xs leading-5 text-[#657064]">
                      Include house number, street, area and
                      a nearby landmark where possible.
                    </p>
                  </div>
                </div>
              </section>

              {/* PAYMENT METHOD */}
              <section className="rounded-[2rem] border border-[#dce2d5] bg-[#e9eee2] p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a26934]">
                  Step 02 · Payment
                </p>

                <h2 className="mt-2 font-serif text-3xl">
                  Choose payment method
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#657064]">
                  Select Bank Transfer to see the account
                  details and payment-proof instructions, or
                  choose Cash on Delivery.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <PaymentChoice
                    selected={paymentMethod === "bank_transfer"}
                    title="Bank Transfer"
                    description="Transfer first, then send payment proof on WhatsApp."
                    onClick={() => setPaymentMethod("bank_transfer")}
                  />

                  <PaymentChoice
                    selected={paymentMethod === "cod"}
                    title="Cash on Delivery"
                    description="Pay when your parcel arrives."
                    onClick={() => setPaymentMethod("cod")}
                  />
                </div>

                {paymentMethod === "bank_transfer" && (
                  <div className="mt-6 rounded-[1.5rem] border border-[#cbd4c3] bg-white p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e9eee2] text-[#a26934]">
                        <Landmark className="size-5" />
                      </div>

                      <div>
                        <h3 className="font-serif text-2xl">
                          Bank transfer details
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-[#657064]">
                          Transfer the exact payable amount
                          shown in your order summary.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 divide-y divide-[#e5e9e0] rounded-xl border border-[#e5e9e0] px-4">
                      <BankRow
                        label="Bank name"
                        value={BANK.name}
                      />

                      <BankRow
                        label="Account title"
                        value={BANK.title}
                      />

                      {/* COPY BUTTON ONLY FOR ACCOUNT NUMBER */}
                      <div className="flex items-center justify-between gap-3 py-4">
                        <div className="min-w-0">
                          <p className="text-xs text-[#657064]">
                            Account number
                          </p>
                          <p className="mt-1 break-all text-sm font-semibold tracking-wide text-[#243328]">
                            {BANK.accountNumber}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            copyValue(
                              BANK.accountNumber,
                              "account"
                            )
                          }
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#cbd4c3] px-3 py-2 text-xs font-semibold text-[#243328] transition hover:border-[#a26934] hover:bg-[#f8f5ed]"
                          aria-label="Copy account number"
                        >
                          <Copy className="size-3.5" />
                          {copyState === "account"
                            ? "Copied"
                            : "Copy"}
                        </button>
                      </div>

                      {/* COPY BUTTON ONLY FOR IBAN */}
                      <div className="flex items-center justify-between gap-3 py-4">
                        <div className="min-w-0">
                          <p className="text-xs text-[#657064]">
                            IBAN
                          </p>
                          <p className="mt-1 break-all text-sm font-semibold tracking-wide text-[#243328]">
                            {BANK.iban}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            copyValue(BANK.iban, "iban")
                          }
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#cbd4c3] px-3 py-2 text-xs font-semibold text-[#243328] transition hover:border-[#a26934] hover:bg-[#f8f5ed]"
                          aria-label="Copy IBAN"
                        >
                          <Copy className="size-3.5" />
                          {copyState === "iban"
                            ? "Copied"
                            : "Copy"}
                        </button>
                      </div>
                    </div>

                    {/* SHAKING PAYMENT PROOF REMINDER */}
                    <div className="payment-nudge mt-5 rounded-2xl border border-[#e0b77f] bg-[#fff5e8] p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f4e0c5] text-[#925b24]">
                          <MessageCircle className="size-5" />
                        </div>

                        <div>
                          <p className="font-bold leading-6 text-[#75461d]">
                            Send your payment screenshot or
                            proof on WhatsApp!
                          </p>

                          <p className="mt-1 text-sm leading-6 text-[#775f49]">
                            After transferring the amount,
                            tap the button below and attach
                            your transaction screenshot in
                            WhatsApp.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* WHATSAPP BUTTON ON CHECKOUT PAGE */}
                    <a
                      href={whatsappMessage()}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-4 text-center text-sm font-bold text-white transition hover:bg-[#1ebc59] focus:outline-none focus:ring-4 focus:ring-[#25D366]/25"
                    >
                      <MessageCircle className="size-5" />
                      Send payment proof on WhatsApp
                    </a>

                    <p className="mt-3 text-xs leading-5 text-[#657064]">
                      WhatsApp opens with a prepared message.
                      Attach the payment screenshot manually.
                      Your payment remains subject to verification.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* ORDER SUMMARY */}
            <aside className="h-fit rounded-[2rem] bg-[#243328] p-6 text-[#f7f5ee] sm:p-7 lg:sticky lg:top-6">
              <h2 className="font-serif text-3xl">
                Your order
              </h2>

              <div className="mt-7 flex flex-col gap-5 border-b border-[#50604f] pb-6">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-4"
                  >
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-[#344438]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-[#aeb9aa]">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="whitespace-nowrap text-sm font-semibold">
                      {formatPrice(
                        Number(item.price) *
                          Number(item.quantity),
                        item.currency
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 border-b border-[#50604f] py-6 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[#c4cdbb]">
                    Subtotal
                  </span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#c4cdbb]">
                    Delivery
                  </span>
                  <span>
                    {delivery === 0
                      ? "Free"
                      : formatPrice(delivery, currency)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between gap-4 pt-5 text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total, currency)}</span>
              </div>

              {paymentMethod === "bank_transfer" && (
                <div className="mt-5 flex gap-2 rounded-xl bg-white/10 p-3 text-xs leading-5 text-[#f5d6ae]">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                  <span>
                    Bank-transfer payments are confirmed
                    after the payment proof is checked.
                  </span>
                </div>
              )}

              {error && (
                <p
                  role="alert"
                  className="mt-5 rounded-xl bg-[#8d3f37] px-4 py-3 text-sm text-white"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={placingOrder}
                className="mt-7 w-full rounded-full bg-[#d6a46d] px-5 py-4 text-sm font-bold text-[#243328] transition hover:bg-[#f0c18b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placingOrder
                  ? "Placing your order..."
                  : "Place order"}
              </button>

              <p className="mt-5 flex items-center gap-2 text-xs text-[#c4cdbb]">
                <Truck className="size-4 shrink-0" />
                Nationwide delivery across Pakistan
              </p>

              <p className="mt-3 text-xs leading-5 text-[#aeb9aa]">
                {paymentMethod === "bank_transfer"
                  ? "Please send payment proof on WhatsApp. Orders are subject to payment verification."
                  : "Payment will be collected when your order is delivered."}
              </p>
            </aside>
          </form>
        )}
      </section>

      <Footer />
      <PaymentAnimation />
    </main>
  );
}

function PaymentChoice({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-2xl border-2 p-4 text-left transition ${
        selected
          ? "border-[#a26934] bg-white shadow-sm"
          : "border-[#cbd4c3] bg-white/50 hover:border-[#a26934]/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
            selected
              ? "border-[#a26934]"
              : "border-[#aebba5]"
          }`}
        >
          {selected && (
            <span className="size-2.5 rounded-full bg-[#a26934]" />
          )}
        </span>

        <span>
          <span className="block font-semibold">{title}</span>
          <span className="mt-1 block text-sm leading-5 text-[#657064]">
            {description}
          </span>
        </span>
      </div>
    </button>
  );
}

function Announcement() {
  return (
    <div className="bg-[#243328] px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5f2e8]">
      Premium Turkish Extra Virgin Olive Oil
      <span className="mx-2 text-[#d7a66c]">·</span>
      Delivered Across Pakistan
    </div>
  );
}

function Header({
  itemCount,
  openCart,
}: {
  itemCount: number;
  openCart: () => void;
}) {
  return (
    <header className="border-b border-[#243328]/5 bg-[#eee9dc]">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:h-[82px] sm:px-6 lg:px-10">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-serif text-[25px] font-bold tracking-[-0.04em] text-[#243328] sm:text-[30px]">
            VinKimya
          </span>
          <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-[#657064] sm:text-[9px]">
            (Private) Limited
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-8">
          <Link
            href="/"
            className="text-xs font-medium text-[#657064] transition hover:text-[#a26934] sm:text-sm"
          >
            Home
          </Link>
          <Link
            href="/shop"
            className="text-xs font-medium text-[#657064] transition hover:text-[#a26934] sm:text-sm"
          >
            Shop
          </Link>
          <Link
            href="/#reviews"
            className="hidden text-sm font-medium text-[#657064] transition hover:text-[#a26934] sm:inline"
          >
            Reviews
          </Link>
        </nav>

        <button
          type="button"
          onClick={openCart}
          aria-label="Shopping cart"
          title="Shopping cart"
          className="relative flex size-10 items-center justify-center rounded-full border border-[#243328]/15 bg-white/30 text-[#243328] transition hover:border-[#a26934] hover:bg-[#a26934] hover:text-white sm:size-12"
        >
          <ShoppingBag className="size-5" />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-[#a26934] px-1.5 py-0.5 text-[10px] font-bold text-white">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

function BankRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="py-4">
      <p className="text-xs text-[#657064]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#243328]">
        {value}
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-[#142018] px-5 py-12 text-[#d9dfd5] lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="relative h-[70px] w-[250px] max-w-full">
              <img
                src="/vinkimya-logo.png"
                alt="VinKimya (Private) Limited"
                className="h-full w-full object-contain object-left"
              />
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#9da99f]">
              VinKimya (Private) Limited brings BİRSEN HANIM
              Premium Turkish Extra Virgin Olive Oil to
              customers across Pakistan.
            </p>
          </div>

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
              <Link href="/#reviews" className="transition hover:text-white">
                Reviews
              </Link>
            </div>
          </div>

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
  );
}

function PaymentAnimation() {
  return (
    <style jsx global>{`
      @keyframes paymentNudge {
        0%, 100% {
          transform: translateX(0) rotate(0);
        }
        15% {
          transform: translateX(-3px) rotate(-0.5deg);
        }
        30% {
          transform: translateX(3px) rotate(0.5deg);
        }
        45% {
          transform: translateX(-3px) rotate(-0.5deg);
        }
        60% {
          transform: translateX(2px) rotate(0.3deg);
        }
        75% {
          transform: translateX(-1px) rotate(0);
        }
      }

      .payment-nudge {
        animation: paymentNudge 1.15s ease-in-out infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .payment-nudge {
          animation: none;
        }
      }
    `}</style>
  );
}
