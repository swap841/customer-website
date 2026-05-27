import { getDistanceKm } from "@/utils/distance";

describe("getDistanceKm", () => {
  it("returns 0 for the same coordinates", () => {
    const d = getDistanceKm(17.6868, 74.0066, 17.6868, 74.0066);
    expect(d).toBe(0);
  });

  it("computes distance between two known points (Mumbai–Pune ~120–150 km)", () => {
    const mumbai = { lat: 19.076, lng: 72.8777 };
    const pune = { lat: 18.5204, lng: 73.8567 };
    const d = getDistanceKm(mumbai.lat, mumbai.lng, pune.lat, pune.lng);
    expect(d).toBeGreaterThan(100);
    expect(d).toBeLessThan(160);
  });

  it("is symmetric (A→B equals B→A)", () => {
    const a = { lat: 28.7041, lng: 77.1025 };
    const b = { lat: 12.9716, lng: 77.5946 };
    const d1 = getDistanceKm(a.lat, a.lng, b.lat, b.lng);
    const d2 = getDistanceKm(b.lat, b.lng, a.lat, a.lng);
    expect(d1).toBeCloseTo(d2, 4);
  });

  it("handles very far coordinates (New York–Sydney ~16000 km)", () => {
    const ny = { lat: 40.7128, lng: -74.006 };
    const syd = { lat: -33.8688, lng: 151.2093 };
    const d = getDistanceKm(ny.lat, ny.lng, syd.lat, syd.lng);
    expect(d).toBeGreaterThan(15000);
    expect(d).toBeLessThan(17000);
  });

  it("handles poles", () => {
    const np = { lat: 90, lng: 0 };
    const sp = { lat: -90, lng: 0 };
    const d = getDistanceKm(np.lat, np.lng, sp.lat, sp.lng);
    expect(d).toBeGreaterThan(20000);
  });
});
