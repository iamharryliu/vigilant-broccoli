export default function StripeCheckoutPage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <img
            src="https://i.imgur.com/EHyR2nP.png"
            alt="The cover of Stubborn Attachments"
            className="w-full rounded-lg mb-4"
          />
          <h3 className="text-2xl font-bold mb-2">Stubborn Attachments</h3>
          <h5 className="text-xl text-gray-700">$20.00</h5>
        </div>
        <form action="/api/stripe/checkout-session" method="POST">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Checkout
          </button>
        </form>
      </div>
    </section>
  );
}
