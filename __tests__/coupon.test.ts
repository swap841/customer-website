import { validateCoupon } from "@/lib/coupon";
import type { Coupon } from "@/lib/coupon";

const mockGetDoc = jest.fn();
const mockDoc = jest.fn();

jest.mock("firebase/firestore", () => ({
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  getFirestore: jest.fn(() => ({})),
}));

jest.mock("@/lib/firebaseClient", () => ({
  db: {},
}));

function makeCoupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    code: "SAVE20",
    discountType: "percent",
    value: 20,
    discount: 20,
    minOrderAmount: 100,
    minOrderValue: 100,
    expiresAt: new Date(Date.now() + 86400000),
    usageLimit: 100,
    usedCount: 0,
    isActive: true,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("validateCoupon", () => {
  it("returns valid with discount for a valid coupon", async () => {
    const coupon = makeCoupon();
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => coupon, id: "SAVE20" });

    const result = await validateCoupon("SAVE20", 500);

    expect(result.valid).toBe(true);
    expect(result.discount).toBe(100);
    expect(result.error).toBeUndefined();
  });

  it("returns error when coupon code does not exist", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false });

    const result = await validateCoupon("INVALID", 500);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Coupon code not found");
  });

  it("returns error when coupon is inactive", async () => {
    const coupon = makeCoupon({ isActive: false });
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => coupon, id: "INACTIVE" });

    const result = await validateCoupon("INACTIVE", 500);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("This coupon is no longer active");
  });

  it("returns error when coupon has expired", async () => {
    const coupon = makeCoupon({ expiresAt: new Date(Date.now() - 86400000) });
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => coupon, id: "EXPIRED" });

    const result = await validateCoupon("EXPIRED", 500);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("This coupon has expired");
  });

  it("returns error when order value is below minimum", async () => {
    const coupon = makeCoupon({ minOrderAmount: 300, minOrderValue: 300 });
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => coupon, id: "MINORDER" });

    const result = await validateCoupon("MINORDER", 200);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Minimum order value of ₹300 required");
  });

  it("caps discount at subtotal", async () => {
    const coupon = makeCoupon({ discountType: "flat", value: 500, discount: 500, minOrderAmount: 0, minOrderValue: 0 });
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => coupon, id: "BIG" });

    const result = await validateCoupon("BIG", 50);

    expect(result.valid).toBe(true);
    expect(result.discount).toBe(50);
  });

  it("returns error when usage limit is reached", async () => {
    const coupon = makeCoupon({ usedCount: 100, usageLimit: 100 });
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => coupon, id: "USEDUP" });

    const result = await validateCoupon("USEDUP", 500);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("This coupon has reached its usage limit");
  });

  it("handles flat discount type", async () => {
    const coupon = makeCoupon({ discountType: "flat", value: 50, discount: 50 });
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => coupon, id: "FLAT50" });

    const result = await validateCoupon("FLAT50", 500);

    expect(result.valid).toBe(true);
    expect(result.discount).toBe(50);
  });

  it("handles percent discount type", async () => {
    const coupon = makeCoupon({ discountType: "percent", value: 10, discount: 10 });
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => coupon, id: "PCT10" });

    const result = await validateCoupon("PCT10", 200);

    expect(result.valid).toBe(true);
    expect(result.discount).toBe(20);
  });

  it("returns error on Firestore exception", async () => {
    mockGetDoc.mockRejectedValue(new Error("network error"));

    const result = await validateCoupon("ERROR", 500);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Failed to validate coupon");
  });
});
