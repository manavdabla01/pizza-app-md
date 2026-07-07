// Loads the Razorpay checkout.js script once and caches the promise.
let razorpayScriptPromise = null;

export function loadRazorpayScript() {
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay. Check your connection.'));
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}
