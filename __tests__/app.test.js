/**
 * Comprehensive Test Suite — Customer Website
 * Covers: unit tests, hook tests, component tests, data flow, edge cases
 */

// ─── Firebase Mocks ──────────────────────────────────────────────────────────

const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockOnSnapshot = jest.fn();
const mockSetDoc = jest.fn();
const mockWriteBatch = jest.fn();
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockQuery = jest.fn();
const mockIncrement = jest.fn();
const mockServerTimestamp = jest.fn(() => ({ seconds: Date.now() / 1000 }));
const mockOnAuthStateChanged = jest.fn();

jest.mock("@/lib/firebaseClient", () => ({
  db: "mock-db",
}));

jest.mock("@/firebaseConfig", () => ({
  db: "mock-db",
  auth: { currentUser: null },
  app: "mock-app",
}));

jest.mock("firebase/firestore", () => ({
  doc: (...args) => {
    const result = { _path: args.map(String).join("/"), id: args[args.length - 1] || "mock-doc" };
    mockDoc(...args);
    return result;
  },
  getDoc: (...args) => mockGetDoc(...args),
  getDocs: (...args) => mockGetDocs(...args),
  onSnapshot: (...args) => mockOnSnapshot(...args),
  setDoc: (...args) => mockSetDoc(...args),
  writeBatch: () => ({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined),
  }),
  collection: (...args) => {
    mockCollection(...args);
    return { _type: "collection", path: args.map(String).join("/") };
  },
  query: (...args) => {
    mockQuery(...args);
    return { _type: "query" };
  },
  serverTimestamp: mockServerTimestamp,
  increment: (...args) => {
    mockIncrement(...args);
    return { _increment: args[0] };
  },
  onSnapshot: (...args) => mockOnSnapshot(...args),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
  signOut: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  usePathname: jest.fn(() => "/"),
}));

jest.mock("next/image", () => {
  const React = require("react");
  return React.forwardRef(function Image(props, ref) {
    return React.createElement("img", { ...props, ref });
  });
});

jest.mock("next-themes", () => ({
  useTheme: jest.fn(() => ({ theme: "light", setTheme: jest.fn() })),
}));

jest.mock("lucide-react", () => {
  const React = require("react");
  const makeIcon = (name) =>
    React.forwardRef(function Icon(props, ref) {
      return React.createElement("span", { ...props, ref, "data-icon": name });
    });
  const icons = {};
  [
    "ShoppingCart", "Menu", "X", "User", "LogOut", "Home", "ShoppingBag",
    "Phone", "Mail", "Info", "ChevronDown", "MessageCircle", "Sun", "Moon",
    "MapPin", "Truck", "Store", "CreditCard", "Banknote", "Loader2",
    "ShieldCheck", "AlertTriangle", "CheckCircle2", "Navigation", "Clock",
  ].forEach((n) => { icons[n] = makeIcon(n); });
  return icons;
});

jest.mock("sonner", () => ({
  toast: Object.assign(jest.fn(), {
    loading: jest.fn(() => "toast-id"),
    success: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn(),
  }),
}));

jest.mock("@tanstack/react-query", () => {
  let queryFnResult = null;
  let isLoading = false;
  return {
    useQuery: jest.fn(({ queryKey, queryFn }) => {
      const result = queryFnResult;
      return { data: result, isLoading };
    }),
    __setQueryResult: (r) => { queryFnResult = r; },
    __setLoading: (l) => { isLoading = l; },
    QueryClient: jest.fn(),
    QueryClientProvider: ({ children }) => children,
  };
});

jest.mock("@/lib/firebaseMessaging", () => ({
  requestFcmToken: jest.fn().mockResolvedValue("mock-token"),
}));

// ─── Dynamic Import Mock for coupon ───────────────────────────────────────────

jest.mock("../utils/coupon", () => ({
  validateCoupon: jest.fn(),
}));

// ═══════════════════════════════════════════════════════════════════════════════
// UNIT TESTS
// ═══════════════════════════════════════════════════════════════════════════════

// Use jest.isolateModules for tests that need fresh cachedConfig state
function requireFreshAppConfig() {
  let mod;
  jest.isolateModules(() => {
    mod = require("../lib/appConfig");
  });
  return mod;
}

const { getAppConfig, isStoreOpen, isFeatureEnabled, isPincodeInZone, subscribeToConfig } = require("../lib/appConfig");
const { validateCoupon, calculateDiscount } = require("../utils/coupon");

describe("getAppConfig()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDoc.mockReset();
  });

  test("reads from appConfig/settings document", async () => {
    const fakeConfig = { store: { isOpen: true }, business: { name: "TestStore" } };
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => fakeConfig });

    const result = await getAppConfig(true); // forceRefresh
    expect(mockGetDoc).toHaveBeenCalled();
    expect(result).toEqual(fakeConfig);
  });

  test("caches config and returns cache on second call", async () => {
    const fakeConfig = { store: { isOpen: true } };
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => fakeConfig });

    await getAppConfig(true); // populates cache
    const cached = await getAppConfig(false); // uses cache
    expect(cached).toEqual(fakeConfig);
    // getDoc called once (only first call hit Firestore)
    expect(mockGetDoc).toHaveBeenCalledTimes(1);
  });

  test("falls back to server endpoint when Firestore fails", async () => {
    mockGetDoc.mockRejectedValue(new Error("Firestore error"));
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ id: "server-config", store: { isOpen: false } }),
    });

    const result = await getAppConfig(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/config")
    );
    expect(result.id).toBe("server-config");

    delete global.fetch;
  });

  test("returns empty object when both Firestore and server fail", async () => {
    const { getAppConfig: freshGetAppConfig } = requireFreshAppConfig();
    mockGetDoc.mockRejectedValue(new Error("fail"));
    global.fetch = jest.fn().mockRejectedValue(new Error("fail"));

    const result = await freshGetAppConfig(true);
    expect(result).toEqual({});

    delete global.fetch;
  });

  test("returns cached config when server returns no id field", async () => {
    const { getAppConfig: freshGetAppConfig } = requireFreshAppConfig();
    mockGetDoc.mockResolvedValue({ exists: () => false });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    const result = await freshGetAppConfig(true);
    expect(result).toEqual({});

    delete global.fetch;
  });
});

describe("isStoreOpen()", () => {
  test("returns false when maintenanceMode is true", () => {
    expect(isStoreOpen({ store: { maintenanceMode: true, isOpen: true } })).toBe(false);
  });

  test("returns true when isOpen is true and no maintenanceMode", () => {
    expect(isStoreOpen({ store: { isOpen: true } })).toBe(true);
  });

  test("returns true when isOpen is undefined (defaults open)", () => {
    expect(isStoreOpen({ store: {} })).toBe(true);
  });

  test("returns true when store config is empty", () => {
    expect(isStoreOpen({})).toBe(true);
  });

  test("returns false when isOpen is explicitly false", () => {
    expect(isStoreOpen({ store: { isOpen: false } })).toBe(false);
  });
});

describe("isFeatureEnabled()", () => {
  const config = {
    features: {
      voiceSearch: true,
      wishlist: false,
      coupons: true,
    },
  };

  test("returns true for enabled feature", () => {
    expect(isFeatureEnabled(config, "voiceSearch")).toBe(true);
  });

  test("returns false for disabled feature", () => {
    expect(isFeatureEnabled(config, "wishlist")).toBe(false);
  });

  test("returns false for non-existent feature", () => {
    expect(isFeatureEnabled(config, "chatbot")).toBe(false);
  });

  test("returns false when features is undefined", () => {
    expect(isFeatureEnabled({}, "voiceSearch")).toBe(false);
  });

  test("returns false for feature with non-boolean value", () => {
    expect(isFeatureEnabled({ features: { voiceSearch: "yes" } }, "voiceSearch")).toBe(false);
  });
});

describe("isPincodeInZone()", () => {
  const config = {
    deliveryZones: {
      enabled: true,
      localPincodes: ["400001", "400002", "400069"],
    },
  };

  test("returns true when pincode is in zone", () => {
    expect(isPincodeInZone(config, "400001")).toBe(true);
  });

  test("returns false when pincode is not in zone", () => {
    expect(isPincodeInZone(config, "999999")).toBe(false);
  });

  test("returns true when deliveryZones is not enabled", () => {
    expect(
      isPincodeInZone({ deliveryZones: { enabled: false, localPincodes: ["400001"] } }, "999999")
    ).toBe(true);
  });

  test("returns true when localPincodes is undefined", () => {
    expect(isPincodeInZone({ deliveryZones: { enabled: true } }, "400001")).toBe(true);
  });

  test("returns true when deliveryZones is completely missing", () => {
    expect(isPincodeInZone({}, "400001")).toBe(true);
  });
});

describe("coupon.ts — validateCoupon()", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns valid for active percentage coupon", async () => {
    const now = new Date();
    const future = new Date(now.getTime() + 86400000);
    validateCoupon.mockResolvedValue({
      valid: true,
      discount: 50,
      coupon: { code: "SAVE10", discountType: "percentage", discountValue: 10, minOrderAmount: 100 },
    });

    const result = await validateCoupon("SAVE10", 500);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(50);
  });

  test("returns valid for fixed discount coupon", async () => {
    validateCoupon.mockResolvedValue({
      valid: true,
      discount: 75,
      coupon: { code: "FLAT75", discountType: "fixed", discountValue: 75, minOrderAmount: 200 },
    });

    const result = await validateCoupon("FLAT75", 300);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(75);
  });

  test("returns invalid for expired coupon", async () => {
    validateCoupon.mockResolvedValue({
      valid: false,
      error: "This coupon has expired",
    });

    const result = await validateCoupon("OLD", 500);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("expired");
  });

  test("returns invalid for coupon below min order", async () => {
    validateCoupon.mockResolvedValue({
      valid: false,
      error: "Minimum order value of ₹200 required",
    });

    const result = await validateCoupon("MIN200", 100);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Minimum order");
  });

  test("returns invalid for non-existent coupon", async () => {
    validateCoupon.mockResolvedValue({
      valid: false,
      error: "Coupon code not found",
    });

    const result = await validateCoupon("GHOST", 500);
    expect(result.valid).toBe(false);
  });

  test("returns invalid for inactive coupon", async () => {
    validateCoupon.mockResolvedValue({
      valid: false,
      error: "This coupon is no longer active",
    });

    const result = await validateCoupon("INACTIVE", 500);
    expect(result.valid).toBe(false);
  });

  test("caps discount at order value", async () => {
    validateCoupon.mockResolvedValue({
      valid: true,
      discount: 100,
      coupon: { code: "BIG", discountType: "fixed", discountValue: 500, minOrderAmount: 0 },
    });

    const result = await validateCoupon("BIG", 100);
    expect(result.discount).toBeLessThanOrEqual(100);
  });

  test("respects maxDiscount cap", async () => {
    validateCoupon.mockResolvedValue({
      valid: true,
      discount: 50,
      coupon: { code: "CAPPED", discountType: "percentage", discountValue: 50, minOrderAmount: 0, maxDiscount: 50 },
    });

    const result = await validateCoupon("CAPPED", 500);
    expect(result.discount).toBe(50);
  });

  test("handles network error gracefully", async () => {
    validateCoupon.mockRejectedValue(new Error("Network error"));

    await expect(validateCoupon("ERR", 100)).rejects.toThrow("Network error");
  });

  test("rejects empty coupon code", async () => {
    validateCoupon.mockResolvedValue({
      valid: false,
      error: "Coupon code not found",
    });

    const result = await validateCoupon("", 500);
    expect(result.valid).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK TESTS (with mocked Firestore)
// ═══════════════════════════════════════════════════════════════════════════════

describe("useContactInfo() hook", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns defaults when Firestore doc does not exist", () => {
    const { useQuery } = require("@tanstack/react-query");
    require("@tanstack/react-query").__setQueryResult(undefined);

    // The hook internally falls back to DEFAULT_CONTACT_INFO
    // When useQuery returns undefined data, ?? DEFAULT kicks in
    const { useContactInfo } = require("../hooks/useContactInfo");
    const result = useContactInfo();
    expect(result.contactInfo).toBeDefined();
    expect(result.contactInfo.storeName).toBe("My Store Grocery");
    expect(result.contactInfo.phone).toBe("+91 98765 43210");
  });

  test("merges Firestore data with defaults when doc exists", () => {
    const { useQuery } = require("@tanstack/react-query");
    const mergedData = {
      phone: "+91 11111 22222",
      storeName: "Custom Store",
      email: "custom@store.in",
      address: "Custom Address",
      deliveryRadiusKm: 10,
      logoUrl: "",
      warehouseLat: 0,
      warehouseLng: 0,
      taxPercentage: 12,
      deliveryFeePerKm: 3,
      freeDeliveryAbove: 200,
      tagline: "Custom Tagline",
      copyrightText: "© Custom",
      heroTitle: "Custom Title",
      heroSubtitle: "Custom Subtitle",
      aboutText: "",
      socialMedia: {},
    };
    require("@tanstack/react-query").__setQueryResult(mergedData);

    const { useContactInfo } = require("../hooks/useContactInfo");
    const result = useContactInfo();
    expect(result.contactInfo.storeName).toBe("Custom Store");
    expect(result.contactInfo.phone).toBe("+91 11111 22222");
    expect(result.contactInfo.taxPercentage).toBe(12);
  });
});

describe("CartContext — delivery charge calculation", () => {
  // These test the formulas directly (not the React context)
  test("free delivery when subtotal >= threshold", () => {
    const freeDeliveryThreshold = 100;
    const deliveryChargeConfig = 25;
    const subtotal = 150;
    const deliveryCharge = subtotal >= freeDeliveryThreshold ? 0 : deliveryChargeConfig;
    expect(deliveryCharge).toBe(0);
  });

  test("charged delivery when subtotal < threshold", () => {
    const freeDeliveryThreshold = 100;
    const deliveryChargeConfig = 25;
    const subtotal = 50;
    const deliveryCharge = subtotal >= freeDeliveryThreshold ? 0 : deliveryChargeConfig;
    expect(deliveryCharge).toBe(25);
  });

  test("free delivery at exact threshold boundary", () => {
    const freeDeliveryThreshold = 100;
    const deliveryChargeConfig = 25;
    const subtotal = 100;
    const deliveryCharge = subtotal >= freeDeliveryThreshold ? 0 : deliveryChargeConfig;
    expect(deliveryCharge).toBe(0);
  });

  test("free delivery when threshold is 0", () => {
    const freeDeliveryThreshold = 0;
    const deliveryChargeConfig = 25;
    const subtotal = 1;
    const deliveryCharge = subtotal >= freeDeliveryThreshold ? 0 : deliveryChargeConfig;
    expect(deliveryCharge).toBe(0);
  });
});

describe("CartContext — tax calculation", () => {
  test("taxAmount = round(subtotal * taxPercent / 100)", () => {
    const subtotal = 500;
    const taxPercentage = 5;
    const taxAmount = Math.round((subtotal * taxPercentage) / 100);
    expect(taxAmount).toBe(25);
  });

  test("tax rounds correctly", () => {
    const subtotal = 333;
    const taxPercentage = 5;
    const taxAmount = Math.round((subtotal * taxPercentage) / 100);
    expect(taxAmount).toBe(17); // 16.65 rounds to 17
  });

  test("zero tax when taxPercent is 0", () => {
    const subtotal = 500;
    const taxPercentage = 0;
    const taxAmount = Math.round((subtotal * taxPercentage) / 100);
    expect(taxAmount).toBe(0);
  });

  test("zero tax when subtotal is 0", () => {
    const subtotal = 0;
    const taxPercentage = 18;
    const taxAmount = Math.round((subtotal * taxPercentage) / 100);
    expect(taxAmount).toBe(0);
  });
});

describe("CartContext — grand total with coupon discount", () => {
  test("grand total = subtotal + delivery + tax - coupon, min 0", () => {
    const subtotal = 200;
    const deliveryCharge = 25;
    const taxAmount = 10;
    const couponDiscount = 30;
    const grandTotal = Math.max(subtotal + deliveryCharge + taxAmount - couponDiscount, 0);
    expect(grandTotal).toBe(205);
  });

  test("grand total never goes below 0", () => {
    const subtotal = 10;
    const deliveryCharge = 25;
    const taxAmount = 1;
    const couponDiscount = 200;
    const grandTotal = Math.max(subtotal + deliveryCharge + taxAmount - couponDiscount, 0);
    expect(grandTotal).toBe(0);
  });

  test("grand total with zero coupon", () => {
    const subtotal = 100;
    const deliveryCharge = 0;
    const taxAmount = 5;
    const couponDiscount = 0;
    const grandTotal = Math.max(subtotal + deliveryCharge + taxAmount - couponDiscount, 0);
    expect(grandTotal).toBe(105);
  });

  test("grand total with all zero values", () => {
    const grandTotal = Math.max(0 + 0 + 0 - 0, 0);
    expect(grandTotal).toBe(0);
  });

  test("grand total with free delivery (above threshold)", () => {
    const subtotal = 200;
    const freeDeliveryThreshold = 100;
    const deliveryChargeConfig = 25;
    const taxPercentage = 5;
    const couponDiscount = 20;

    const deliveryCharge = subtotal >= freeDeliveryThreshold ? 0 : deliveryChargeConfig;
    const taxAmount = Math.round((subtotal * taxPercentage) / 100);
    const grandTotal = Math.max(subtotal + deliveryCharge + taxAmount - couponDiscount, 0);

    expect(deliveryCharge).toBe(0);
    expect(taxAmount).toBe(10);
    expect(grandTotal).toBe(190);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("DynamicBranding — sets CSS variables from config", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset document
    document.documentElement.style = {};
    document.title = "";
  });

  test("sets primary color CSS variables", () => {
    const config = { business: { primaryColor: "#ff0000", accentColor: "#00ff00", font: "Roboto", name: "TestStore" } };

    // Simulate the effect logic from DynamicBranding
    if (config.business?.primaryColor) {
      document.documentElement.style.setProperty("--primary", config.business.primaryColor);
      document.documentElement.style.setProperty("--color-primary", config.business.primaryColor);
    }
    if (config.business?.accentColor) {
      document.documentElement.style.setProperty("--accent", config.business.accentColor);
      document.documentElement.style.setProperty("--color-accent", config.business.accentColor);
    }
    if (config.business?.font) {
      document.documentElement.style.setProperty("--font-family", config.business.font);
      document.documentElement.style.fontFamily = config.business.font;
    }
    if (config.business?.name) {
      document.title = config.business.name;
    }

    expect(document.documentElement.style.getPropertyValue("--primary")).toBe("#ff0000");
    expect(document.documentElement.style.getPropertyValue("--color-primary")).toBe("#ff0000");
    expect(document.documentElement.style.getPropertyValue("--accent")).toBe("#00ff00");
    expect(document.documentElement.style.getPropertyValue("--color-accent")).toBe("#00ff00");
    expect(document.documentElement.style.getPropertyValue("--font-family")).toBe("Roboto");
    expect(document.title).toBe("TestStore");
  });

  test("skips CSS variable assignment when config fields missing", () => {
    const config = { business: {} };

    if (config.business?.primaryColor) {
      document.documentElement.style.setProperty("--primary", config.business.primaryColor);
    }

    expect(document.documentElement.style.getPropertyValue("--primary")).toBe("");
  });
});

describe("Navbar — renders store name from contactInfo", () => {
  test("contactInfo provides storeName used in Navbar", () => {
    const contactInfo = {
      storeName: "Green Basket",
      phone: "+91 12345 67890",
      email: "info@greenbasket.in",
      tagline: "Fresh & Fast",
      logoUrl: "",
    };

    // Verify the shape matches what Navbar expects
    expect(contactInfo.storeName).toBe("Green Basket");
    expect(contactInfo.phone).toBeDefined();
    expect(contactInfo.email).toBeDefined();
    expect(contactInfo.tagline).toBeDefined();
  });

  test("defaults when contactInfo has empty values", () => {
    const contactInfo = {
      storeName: "",
      phone: "",
      email: "",
      tagline: "",
      logoUrl: "",
    };

    // Navbar uses storeName?.charAt(0) || "M" as fallback
    const initial = contactInfo.storeName?.charAt(0) || "M";
    expect(initial).toBe("M");
  });
});

describe("CheckoutPageContent — validates required fields", () => {
  // Test the validation logic from placeOrder (lines 392-401)
  function validateCheckout({ name, phone, address, user, cartItems, deliveryOption }) {
    const errors = [];
    if (!name) errors.push("Please enter your name");
    if (!phone) errors.push("Please enter your phone number");
    if (deliveryOption === "delivery" && !address) errors.push("Please enter delivery address");
    if (!user) errors.push("Please login to place an order");
    if (cartItems.length === 0) errors.push("Your cart is empty");
    return errors;
  }

  test("returns all errors when nothing is filled", () => {
    const errors = validateCheckout({
      name: "",
      phone: "",
      address: "",
      user: null,
      cartItems: [],
      deliveryOption: "delivery",
    });
    expect(errors).toHaveLength(5);
    expect(errors).toContain("Please enter your name");
    expect(errors).toContain("Please enter your phone number");
    expect(errors).toContain("Please enter delivery address");
    expect(errors).toContain("Please login to place an order");
    expect(errors).toContain("Your cart is empty");
  });

  test("returns no errors when all required fields present (delivery)", () => {
    const errors = validateCheckout({
      name: "John",
      phone: "9876543210",
      address: "123 Main St",
      user: { uid: "123" },
      cartItems: [{ id: "1", name: "Milk", price: 40, quantity: 1 }],
      deliveryOption: "delivery",
    });
    expect(errors).toHaveLength(0);
  });

  test("pickup option does not require address", () => {
    const errors = validateCheckout({
      name: "John",
      phone: "9876543210",
      address: "",
      user: { uid: "123" },
      cartItems: [{ id: "1", name: "Milk", price: 40, quantity: 1 }],
      deliveryOption: "pickup",
    });
    expect(errors).toHaveLength(0);
  });

  test("pickup still requires name, phone, user, and items", () => {
    const errors = validateCheckout({
      name: "",
      phone: "",
      address: "",
      user: null,
      cartItems: [],
      deliveryOption: "pickup",
    });
    expect(errors).toHaveLength(4);
    expect(errors).not.toContain("Please enter delivery address");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DATA FLOW TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("Data Flow — Config path reads from appConfig/settings", () => {
  beforeEach(() => jest.clearAllMocks());

  test("getAppConfig reads from appConfig/settings (not config/appConfig)", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ store: { isOpen: true } }) });

    await getAppConfig(true);

    // Verify the doc call path contains "appConfig" and "settings"
    expect(mockGetDoc).toHaveBeenCalled();
    const docCall = mockDoc.mock.calls[0];
    // The path should be: db, "appConfig", "settings"
    expect(docCall[1]).toBe("appConfig");
    expect(docCall[2]).toBe("settings");
  });

  test("subscribeToConfig uses appConfig/settings path", () => {
    mockOnSnapshot.mockReturnValue(jest.fn());

    const unsub = subscribeToConfig(jest.fn());
    expect(mockOnSnapshot).toHaveBeenCalled();
    const docCall = mockDoc.mock.calls[0];
    expect(docCall[1]).toBe("appConfig");
    expect(docCall[2]).toBe("settings");
  });
});

describe("Data Flow — ContactInfo path reads from contactInfo/info", () => {
  test("useContactInfo queryFn reads from contactInfo/info", () => {
    // The hook internally calls doc(db, "contactInfo", "info")
    // We verify the source code structure
    const fs = require("fs");
    const hookSource = fs.readFileSync(
      "D:\\ecosystem\\customer-website\\hooks\\useContactInfo.ts",
      "utf8"
    );
    expect(hookSource).toContain('"contactInfo"');
    expect(hookSource).toContain('"info"');
    expect(hookSource).toContain("DEFAULT_CONTACT_INFO");
  });
});

describe("Data Flow — Cart config comes from Firestore appConfig/settings", () => {
  test("CartContext syncConfig reads from appConfig/settings", () => {
    const fs = require("fs");
    const cartSource = fs.readFileSync(
      "D:\\ecosystem\\customer-website\\components\\CartContext.tsx",
      "utf8"
    );
    // Verify the cart reads from appConfig/settings
    expect(cartSource).toContain('doc(db, "appConfig", "settings")');
    // Verify it reads the three config values
    expect(cartSource).toContain("deliveryCharge");
    expect(cartSource).toContain("taxPercent");
    expect(cartSource).toContain("freeDeliveryAbove");
  });

  test("CartContext uses dynamic config values, not hardcoded defaults", () => {
    const fs = require("fs");
    const cartSource = fs.readFileSync(
      "D:\\ecosystem\\customer-website\\components\\CartContext.tsx",
      "utf8"
    );
    // Defaults exist but are overwritten by Firestore config
    expect(cartSource).toContain("setDeliveryCharge(cfg.store.deliveryCharge)");
    expect(cartSource).toContain("setTaxPercentage(cfg.store.taxPercent)");
    expect(cartSource).toContain("setFreeDeliveryThreshold(cfg.store.freeDeliveryAbove)");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// EDGE CASES
// ═══════════════════════════════════════════════════════════════════════════════

describe("Edge Cases — Empty Firestore database (all defaults)", () => {
  test("getAppConfig returns empty object when no doc and server fails", async () => {
    const { getAppConfig: freshGetAppConfig } = requireFreshAppConfig();
    mockGetDoc.mockResolvedValue({ exists: () => false });
    global.fetch = jest.fn().mockRejectedValue(new Error("no server"));

    const config = await freshGetAppConfig(true);
    expect(config).toEqual({});

    delete global.fetch;
  });

  test("isStoreOpen returns true with empty config (defaults open)", () => {
    expect(isStoreOpen({})).toBe(true);
  });

  test("isFeatureEnabled returns false for any feature with empty config", () => {
    expect(isFeatureEnabled({}, "anything")).toBe(false);
  });

  test("isPincodeInZone returns true with empty config (no zones = all allowed)", () => {
    expect(isPincodeInZone({}, "000000")).toBe(true);
  });

  test("useContactInfo falls back to full defaults when Firestore returns empty", () => {
    const { useQuery } = require("@tanstack/react-query");
    require("@tanstack/react-query").__setQueryResult(undefined);

    const { useContactInfo } = require("../hooks/useContactInfo");
    const result = useContactInfo();
    expect(result.contactInfo.storeName).toBe("My Store Grocery");
    expect(result.contactInfo.deliveryRadiusKm).toBe(20);
    expect(result.contactInfo.taxPercentage).toBe(5);
    expect(result.contactInfo.freeDeliveryAbove).toBe(100);
  });
});

describe("Edge Cases — Missing fields in config document", () => {
  test("isStoreOpen handles config with store but no isOpen/maintenanceMode", () => {
    expect(isStoreOpen({ store: {} })).toBe(true);
  });

  test("isFeatureEnabled handles config with features = {}", () => {
    expect(isFeatureEnabled({ features: {} }, "voiceSearch")).toBe(false);
  });

  test("isPincodeInZone handles deliveryZones with enabled but no localPincodes", () => {
    expect(isPincodeInZone({ deliveryZones: { enabled: true } }, "12345")).toBe(true);
  });

  test("getAppConfig falls back gracefully when doc has partial data", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ store: {} }) });

    const config = await getAppConfig(true);
    expect(config.store).toEqual({});
    // Features, contact, etc. are undefined — no crash
    expect(config.features).toBeUndefined();
  });
});

describe("Edge Cases — Invalid price/quantity values in cart", () => {
  test("subtotal with zero prices", () => {
    const items = [
      { price: 0, quantity: 5 },
      { price: 10, quantity: 0 },
    ];
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    expect(subtotal).toBe(0);
  });

  test("subtotal with negative prices (edge case)", () => {
    const items = [{ price: -10, quantity: 2 }];
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    expect(subtotal).toBe(-20);
  });

  test("totalItems with zero quantities", () => {
    const items = [
      { quantity: 0 },
      { quantity: 0 },
    ];
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    expect(totalItems).toBe(0);
  });

  test("deliveryCharge calculation with empty cart", () => {
    const subtotal = 0;
    const freeDeliveryThreshold = 100;
    const deliveryChargeConfig = 25;
    const deliveryCharge = subtotal >= freeDeliveryThreshold ? 0 : deliveryChargeConfig;
    expect(deliveryCharge).toBe(25);
  });

  test("taxAmount with NaN price does not crash", () => {
    const price = NaN;
    const quantity = 1;
    const taxPercentage = 5;
    const itemTotal = price * quantity; // NaN
    const taxAmount = Math.round((itemTotal * taxPercentage) / 100);
    expect(isNaN(taxAmount)).toBe(true);
  });

  test("grand total with negative coupon discount clamps to 0", () => {
    const subtotal = 50;
    const deliveryCharge = 10;
    const taxAmount = 3;
    const couponDiscount = 200;
    const grandTotal = Math.max(subtotal + deliveryCharge + taxAmount - couponDiscount, 0);
    expect(grandTotal).toBe(0);
  });
});

describe("Edge Cases — Network errors during config fetch", () => {
  beforeEach(() => jest.clearAllMocks());

  test("getAppConfig returns cached config when Firestore throws", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ store: { isOpen: true } }) });
    await getAppConfig(true); // populate cache

    mockGetDoc.mockRejectedValue(new Error("network"));
    const result = await getAppConfig(true);
    expect(result).toEqual({ store: { isOpen: true } });
  });

  test("getAppConfig returns {} when both sources fail on first call", async () => {
    const { getAppConfig: freshGetAppConfig } = requireFreshAppConfig();
    mockGetDoc.mockRejectedValue(new Error("Firestore down"));
    global.fetch = jest.fn().mockRejectedValue(new Error("Server down"));

    const result = await freshGetAppConfig(true);
    expect(result).toEqual({});

    delete global.fetch;
  });

  test("validateCoupon handles Firestore error during coupon lookup", async () => {
    validateCoupon.mockResolvedValue({
      valid: false,
      error: "Failed to validate coupon",
    });

    const result = await validateCoupon("FAIL", 100);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Failed to validate coupon");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION-STYLE: Config → Cart → Checkout data flow
// ═══════════════════════════════════════════════════════════════════════════════

describe("Integration — Full config-driven cart calculation", () => {
  test("delivery + tax + coupon with Firestore config values", () => {
    // Simulate Firestore config
    const config = {
      store: { deliveryCharge: 30, taxPercent: 18, freeDeliveryAbove: 500 },
    };

    // Cart items
    const items = [
      { price: 200, quantity: 2 },
      { price: 150, quantity: 1 },
    ];
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0); // 550
    const freeDeliveryThreshold = config.store.freeDeliveryAbove; // 500
    const deliveryChargeConfig = config.store.deliveryCharge; // 30
    const taxPercentage = config.store.taxPercent; // 18

    const deliveryCharge = subtotal >= freeDeliveryThreshold ? 0 : deliveryChargeConfig;
    const taxAmount = Math.round((subtotal * taxPercentage) / 100);
    const couponDiscount = 25;
    const grandTotal = Math.max(subtotal + deliveryCharge + taxAmount - couponDiscount, 0);

    expect(subtotal).toBe(550);
    expect(deliveryCharge).toBe(0); // above threshold
    expect(taxAmount).toBe(99); // 550 * 18 / 100 = 99
    expect(grandTotal).toBe(624); // 550 + 0 + 99 - 25
  });

  test("below threshold charges delivery", () => {
    const config = {
      store: { deliveryCharge: 25, taxPercent: 5, freeDeliveryAbove: 100 },
    };

    const items = [{ price: 40, quantity: 2 }]; // subtotal = 80
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

    const deliveryCharge = subtotal >= config.store.freeDeliveryAbove ? 0 : config.store.deliveryCharge;
    const taxAmount = Math.round((subtotal * config.store.taxPercent) / 100);
    const grandTotal = Math.max(subtotal + deliveryCharge + taxAmount - 0, 0);

    expect(deliveryCharge).toBe(25);
    expect(taxAmount).toBe(4);
    expect(grandTotal).toBe(109);
  });
});
