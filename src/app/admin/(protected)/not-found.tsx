import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">الصفحة غير موجودة</p>
      <Link
        href="/admin"
        className="mt-8 rounded-md bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
      >
        العودة إلى لوحة التحكم
      </Link>
    </div>
  );
}
