import { LoadingState } from "@/components/ui/LoadingState";

export default function StoreLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <LoadingState variant="skeleton" />
    </div>
  );
}
