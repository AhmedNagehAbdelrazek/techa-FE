import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "عن المتجر — TechA",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">عن TechA</h1>
      <div className="space-y-4 text-muted-foreground">
        <p>
          TechA هو متجر إلكتروني متخصص في تقديم أحدث المنتجات التقنية بأفضل الأسعار.
          نسعى لتوفير تجربة تسوق سلسة وآمنة لعملائنا في جميع أنحاء المملكة.
        </p>
        <p>
          نؤمن بأن التكنولوجيا يجب أن تكون في متناول الجميع، لذلك نعمل باستمرار
          على توسيع تشكيلة منتجاتنا وتقديم عروض تنافسية.
        </p>
        <h2 className="text-xl font-semibold text-foreground mt-8">رؤيتنا</h2>
        <p>أن نكون الوجهة الأولى للتسوق الإلكتروني في المنطقة.</p>
      </div>
    </div>
  );
}
