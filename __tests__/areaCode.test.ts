import { getAreaCode } from "@/lib/areaCode";

describe("getAreaCode", () => {
  it("returns first 3 digits of a valid 6-digit pincode", () => {
    expect(getAreaCode("411001")).toBe("411");
  });

  it("returns first 3 digits for another pincode", () => {
    expect(getAreaCode("110001")).toBe("110");
  });

  it("returns first 3 digits for a 6-digit pincode starting with 0", () => {
    expect(getAreaCode("041001")).toBe("041");
    expect(getAreaCode("001001")).toBe("001");
  });

  it("returns '000' for empty string", () => {
    expect(getAreaCode("")).toBe("000");
  });

  it("returns '000' for pincode shorter than 3 digits", () => {
    expect(getAreaCode("12")).toBe("000");
    expect(getAreaCode("5")).toBe("000");
  });

  it("handles alphanumeric input gracefully", () => {
    expect(getAreaCode("ABC123")).toBe("ABC");
  });

  it("works with exactly 3-digit input", () => {
    expect(getAreaCode("400")).toBe("400");
  });
});
