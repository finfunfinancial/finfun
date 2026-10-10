export type Coupon = { kind: "percent" | "flat"; value: number };

/** Discount in paise for a price in paise. Percent coupons round to the nearest paisa; never more than the price. */
export function discountFor(pricePaise: number, coupon: Coupon | null): number {
  if (!coupon) return 0;
  const off = coupon.kind === "percent" ? Math.round((pricePaise * Math.min(coupon.value, 100)) / 100) : coupon.value;
  return Math.min(Math.max(off, 0), pricePaise);
}
