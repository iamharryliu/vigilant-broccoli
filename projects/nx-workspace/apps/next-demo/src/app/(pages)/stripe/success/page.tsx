export default function SuccessPage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-4">Thanks for your order!</h1>
        <p className="text-gray-700">
          We appreciate your business! If you have any questions, please email{' '}
          <a href="mailto:orders@example.com" className="text-blue-600 hover:underline">
            orders@example.com
          </a>
          .
        </p>
      </div>
    </section>
  );
}
