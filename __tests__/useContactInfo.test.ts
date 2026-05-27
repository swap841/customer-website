import { renderHook, waitFor } from "@testing-library/react";
import { useContactInfo } from "@/hooks/useContactInfo";

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

const MOCK_CONTACT = {
  phone: "+91 99999 88888",
  email: "test@example.com",
  address: "123 Test St",
  deliveryRadiusKm: 15,
  logoUrl: "https://example.com/logo.png",
  warehouseLat: 19.076,
  warehouseLng: 72.8777,
  storeName: "Test Store",
};

describe("useContactInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts in loading state", () => {
    mockGetDoc.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useContactInfo());
    expect(result.current.loading).toBe(true);
  });

  it("returns contact info when document exists", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => MOCK_CONTACT,
    });

    const { result } = renderHook(() => useContactInfo());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.contactInfo.phone).toBe("+91 99999 88888");
    expect(result.current.contactInfo.storeName).toBe("Test Store");
    expect(result.current.contactInfo.email).toBe("test@example.com");
  });

  it("falls back to defaults when document does not exist", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => false,
      data: () => undefined,
    });

    const { result } = renderHook(() => useContactInfo());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.contactInfo.phone).toBe("+91 98765 43210");
    expect(result.current.contactInfo.storeName).toBe("My Store Grocery");
  });

  it("falls back to defaults on error", async () => {
    mockGetDoc.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useContactInfo());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.contactInfo.phone).toBe("+91 98765 43210");
  });

  it("merges snapshot data over defaults", async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ phone: "+91 11111 22222" }),
    });

    const { result } = renderHook(() => useContactInfo());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.contactInfo.phone).toBe("+91 11111 22222");
    expect(result.current.contactInfo.storeName).toBe("My Store Grocery");
  });
});
