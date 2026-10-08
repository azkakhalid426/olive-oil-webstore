import mongoose, { Schema, Document, Model } from "mongoose"

interface IOrderItem {
  productId: mongoose.Types.ObjectId
  name: string
  image: string
  price: number
  quantity: number
  bundleQuantity: number
}

interface ICustomer {
  name: string
  phone: string
  email?: string
  address: string
  city: string
}

export interface IOrder extends Document {
  orderNumber: string

  customer: ICustomer
  items: IOrderItem[]

  subtotal: number
  delivery: number
  total: number

  currency: string

  paymentMethod:
    | "cod"
    | "bank_transfer"
    | "jazzcash"
    | "easypaisa"
    | "card"

  paymentStatus:
    | "pending"
    | "paid"
    | "failed"
    | "refunded"

  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"

  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    bundleQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  }
)

const CustomerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
)

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customer: {
      type: CustomerSchema,
      required: true,
    },

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) =>
          items.length > 0,
        message:
          "Order must contain at least one item.",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    delivery: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "PKR",
    },

    paymentMethod: {
      type: String,
      enum: [
        "cod",
        "bank_transfer",
        "jazzcash",
        "easypaisa",
        "card",
      ],
      default: "cod",
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
)

const Order: Model<IOrder> =
  mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema)

export default Order