import BannerSkeleton from "./BannerSkeleton";
import CategorySkeleton from "./CategorySkeleton";
import ProductGridSkeleton from "./ProductGridSkeleton";

export default function HomePageSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <BannerSkeleton />
      <CategorySkeleton />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
