import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import type { Order } from '@/shared/models';

export interface OrderStatusDisplay {
  label: string;
  color: string;
  icon: string;
}

const STATUS_MAP: Record<string, OrderStatusDisplay> = {
  'Pending': { label: 'Order Placed', color: 'bg-yellow-100 text-yellow-800', icon: '📦' },
  'Packing': { label: 'Being Packed', color: 'bg-orange-100 text-orange-800', icon: '📦' },
  'Ready to Dispatch': { label: 'Ready to Dispatch', color: 'bg-purple-100 text-purple-800', icon: '📍' },
  'Assigned': { label: 'Assigned to Delivery', color: 'bg-blue-100 text-blue-800', icon: '👤' },
  'Accepted': { label: 'Accepted', color: 'bg-sky-100 text-sky-800', icon: '✅' },
  'Out for Delivery': { label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-800', icon: '🚗' },
  'Delivered': { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: '✅' },
  'Cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
};

export function useOrderTracking(userId: string | undefined, orderId: string | undefined) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !orderId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', userId, 'orders', orderId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = { id: docSnap.id, userId, ...docSnap.data() } as Order;
          setOrder(data);
          setError(null);
        } else {
          setError('Order not found');
          setOrder(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching order:', err);
        setError('Failed to load order');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, orderId]);

  return { order, loading, error };
}

export function getStatusDisplay(status: string): OrderStatusDisplay {
  return STATUS_MAP[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: '❓' };
}
