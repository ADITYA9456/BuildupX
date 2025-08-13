'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function RazorpayLoader() {
  useEffect(() => {
    // Make the Razorpay key available globally
    window.RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  }, []);

  return (
    <Script
      id="razorpay-checkout-js"
      src="https://checkout.razorpay.com/v1/checkout.js"
      strategy="lazyOnload"
    />
  );
}
