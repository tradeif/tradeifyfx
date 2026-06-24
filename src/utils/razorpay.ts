import confetti from "canvas-confetti";

export function triggerRazorpayCheckout({
  amount,
  itemName,
  description,
  userEmail,
  userName,
  onSuccess
}: {
  amount: number;
  itemName: string;
  description: string;
  userEmail: string;
  userName: string;
  onSuccess: () => void;
}) {
  if (amount === 0) {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
    onSuccess();
    return;
  }

  const loadScript = () => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      
      // If script is already loaded, resolve immediately
      if ((window as Window & { Razorpay?: unknown }).Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const simulateCheckout = () => {
    const confirmPay = window.confirm(
      `[TRADEIFYFX PAYMENT SECURE INTEGRATION]\n\n` +
      `Item: ${itemName}\n` +
      `Price: ₹${amount.toLocaleString()}\n` +
      `Description: ${description}\n\n` +
      `Click OK to simulate a successful payment transaction and unlock premium access.`
    );
    if (confirmPay) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      onSuccess();
    }
  };

  const initPay = async () => {
    const isLoaded = await loadScript();
    if (!isLoaded) {
      simulateCheckout();
      return;
    }

    const options = {
      key: "rzp_test_mockkey12345", // Mock Test Key
      amount: amount * 100, // Amount in paise
      currency: "INR",
      name: "TRADEIFYFX",
      description: `${itemName} - ${description}`,
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=120&auto=format&fit=crop",
      handler: function () {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        onSuccess();
      },
      prefill: {
        name: userName || "Premium Trader",
        email: userEmail || "trader@gmail.com",
        contact: "+919799450432"
      },
      theme: {
        color: "#FFD700"
      },
      modal: {
        ondismiss: function() {
          console.log("Payment cancelled by user");
        }
      }
    };

    try {
      const RazorpayConstructor = (window as Window & { Razorpay?: new (opts: unknown) => { open: () => void } }).Razorpay;
      if (RazorpayConstructor) {
        const rzp = new RazorpayConstructor(options);
        rzp.open();
      } else {
        throw new Error("Razorpay is not defined");
      }
    } catch (e) {
      console.warn("Razorpay script error, falling back to simulated payment.", e);
      simulateCheckout();
    }
  };

  initPay();
}
