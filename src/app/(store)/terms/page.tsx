import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الشروط والأحكام — TechA",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">الشروط والأحكام</h1>
      <div className="space-y-4 text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground">١. مقدمة</h2>
        <p>باستخدامك لهذا الموقع، فإنك توافق على الالتزام بهذه الشروط والأحكام.</p>

        <h2 className="text-xl font-semibold text-foreground">٢. الطلبات والدفع</h2>
        <p>يتم تأكيد الطلبات بعد التحقق من الدفع. يحق لنا إلغاء أي طلب في حال عدم توفر المخزون.</p>

        <h2 className="text-xl font-semibold text-foreground">٣. الشحن والتوصيل</h2>
        <p>يتم الشحن خلال ٣–٥ أيام عمل. قد تختلف أوقات التوصيل حسب الموقع.</p>

        <h2 className="text-xl font-semibold text-foreground">٤. الإرجاع والاستبدال</h2>
        <p>يمكن إرجاع المنتجات خلال ١٤ يوماً من تاريخ الاستلام بشرط أن تكون بحالتها الأصلية.</p>
      </div>
    </div>
  );
}
