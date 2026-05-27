export function getAreaCode(pincode: string): string {
  if (!pincode || pincode.length < 3) return "000";
  return pincode.substring(0, 3);
}
