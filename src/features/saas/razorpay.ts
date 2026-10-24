import { toast } from '@/store/toastStore';

import type { PaymentOrder } from './services/saasService';

/**
 * Razorpay's checkout window, loaded only when somebody pays. The platform
 * creates the order and checks the signature afterwards; this file only opens
 * the window and hands back what Razorpay returns.
 */

const CHECKOUT_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

export interface CheckoutResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed', handler: (response: { error?: { description?: string } }) => void): void;
}

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

/** The person closed the window without paying: not an error worth alarming anybody over. */
export class CheckoutDismissed extends Error {
  constructor() {
    super('The payment window was closed before the payment was made. Nothing was charged.');
    this.name = 'CheckoutDismissed';
  }
}

let loading: Promise<RazorpayConstructor> | null = null;

function loadCheckout(): Promise<RazorpayConstructor> {
  const existing = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
  if (existing) return Promise.resolve(existing);

  loading ??= new Promise<RazorpayConstructor>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = CHECKOUT_SCRIPT;
    script.async = true;
    script.onload = () => {
      const loaded = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
      if (loaded) resolve(loaded);
      else reject(new Error('The payment window could not be started. Please try again.'));
    };
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error('The payment window could not be loaded. Check your internet connection and try again.'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export async function openCheckout(order: PaymentOrder): Promise<CheckoutResult> {
  const Razorpay = await loadCheckout();

  return new Promise<CheckoutResult>((resolve, reject) => {
    const checkout = new Razorpay({
      key: order.key_id,
      order_id: order.order_id,
      amount: order.amount_paise,
      currency: order.currency,
      name: order.name,
      description: order.description,
      prefill: order.prefill,
      handler: (response: CheckoutResult) => resolve(response),
      modal: { ondismiss: () => reject(new CheckoutDismissed()) },
    });
    // A failed attempt leaves the window open for another try, so it only
    // says so; the promise settles when the person pays or gives up.
    checkout.on('payment.failed', (response) => {
      toast.error('Payment failed', response.error?.description ?? 'Try again, or use another payment method.');
    });
    checkout.open();
  });
}
