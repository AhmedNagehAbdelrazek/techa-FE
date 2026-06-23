import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "اتصل بنا — TechA",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">اتصل بنا</h1>
      <div className="space-y-4 text-muted-foreground">
        <p>نحن هنا لمساعدتك. تواصل معنا عبر أي من القنوات التالية:</p>
        <div className="rounded-lg border p-6 space-y-3">
          <p><strong>البريد الإلكتروني:</strong> support@techa.com</p>
          <p><strong>الهاتف:</strong> +966 123 456 789</p>
          <p><strong>ساعات العمل:</strong> الأحد – الخميس، ٩ صباحاً – ٦ مساءً</p>
        </div>
        <p className="text-sm">سيتم الرد على استفسارك خلال ٢٤ ساعة عمل.</p>
      </div>
    </div>
  );
}
