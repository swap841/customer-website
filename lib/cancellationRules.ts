const CANCELLABLE_STATUSES = new Set(["Pending", "Confirmed", "Packing"]);
const NEVER_CANCELLABLE = new Set([
  "Ready to Dispatch", "Assigned", "Accepted",
  "Out for Delivery", "Delivered", "Cancelled", "Awaiting Verification",
]);

const TIME_LIMITS: Record<string, number> = {
  Pending: Infinity,
  Confirmed: 10,
  Packing: 5,
};

export interface CancellationResult {
  allowed: boolean;
  reason: string;
}

export function canCancelOrder(status: string, createdAt: Date): CancellationResult {
  if (NEVER_CANCELLABLE.has(status)) {
    return { allowed: false, reason: `Cannot cancel order with status "${status}".` };
  }
  if (!CANCELLABLE_STATUSES.has(status)) {
    return { allowed: false, reason: `Cannot cancel order with status "${status}".` };
  }

  const now = new Date();
  const ageMinutes = (now.getTime() - createdAt.getTime()) / 60000;

  if (ageMinutes > 60) {
    return { allowed: false, reason: "Order was placed more than 1 hour ago. Please contact support." };
  }

  const limit = TIME_LIMITS[status] || 0;
  if (ageMinutes > limit) {
    return { allowed: false, reason: `Cancellation window for "${status}" orders has expired (${limit} minutes).` };
  }

  return { allowed: true, reason: "" };
}
