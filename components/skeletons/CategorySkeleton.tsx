export default function CategorySkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden">
      {Array(6).fill(0).map((_, i) => (
        <div key={i} className="flex-shrink-0 animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
          <div className="h-2 bg-gray-200 rounded mt-1 w-12 mx-auto" />
        </div>
      ))}
    </div>
  );
}
