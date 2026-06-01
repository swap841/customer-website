export function getAreaCode(pincode: string): string {
  if (pincode.length < 3) return "000";
  return pincode.substring(0, 3);
}
