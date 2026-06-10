export default function CheckoutLoading() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-32">
      <div className="animate-pulse space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-xl" />
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-200 rounded w-48" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-32" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-100 rounded-xl" />
            <div className="h-20 bg-gray-100 rounded-xl" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-40" />
          <div className="h-24 bg-gray-100 rounded-xl" />
          <div className="h-20 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
