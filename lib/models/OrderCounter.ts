import mongoose, { Schema, Document, Model } from "mongoose"

export interface IOrderCounter extends Document {
  name: string
  sequence: number
}

const OrderCounterSchema = new Schema<IOrderCounter>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      default: "order",
    },

    sequence: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
)

const OrderCounter: Model<IOrderCounter> =
  mongoose.models.OrderCounter ||
  mongoose.model<IOrderCounter>(
    "OrderCounter",
    OrderCounterSchema
  )

export default OrderCounter