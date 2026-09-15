const mongoose = require("mongoose");

const monthlyGroceryItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant: {
      name: { type: String },
      price: { type: Number },
    },
    quantity: { type: Number, min: 1, default: 1 },
    checked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const monthlyGroceryCardSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      default: null,
    },
    auto_order_enabled: { type: Boolean, default: false },
    auto_order_date: { type: Date, default: null },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    items: { type: [monthlyGroceryItemSchema], default: [] },
  },
  { timestamps: true },
);

monthlyGroceryCardSchema.index(
  { user_id: 1, name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);
monthlyGroceryCardSchema.index({ user_id: 1, createdAt: -1 });
monthlyGroceryCardSchema.virtual("address_name").get(function () {
  return this.address_id && typeof this.address_id === "object"
    ? this.address_id.label || null
    : null;
});
monthlyGroceryCardSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("MonthlyGroceryCard", monthlyGroceryCardSchema);
