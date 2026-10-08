import mongoose, { Schema, Document, Model } from "mongoose"

export interface IProduct extends Document {
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  currency: string

  image: string
  image2?: string
  image3?: string

  origin: string
  size: string
  stock: number
  bundleQuantity: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    compareAtPrice: {
      type: Number,
      min: 0,
    },

    currency: {
      type: String,
      default: "PKR",
    },

    image: {
      type: String,
      required: true,
    },

    image2: {
      type: String,
      default: "",
    },

    image3: {
      type: String,
      default: "",
    },

    origin: {
      type: String,
      default: "Türkiye",
    },

    size: {
      type: String,
      default: "500ml",
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    bundleQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

const Product: Model<IProduct> =
  mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema)

export default Product