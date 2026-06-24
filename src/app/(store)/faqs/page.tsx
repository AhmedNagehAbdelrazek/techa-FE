import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة — TechA",
};

const faqs = [
  { q: "How long does shipping take?", a: "Standard shipping takes 3–5 business days within the Kingdom." },
  { q: "What is the return policy?", a: "You can return products within 14 days of delivery in their original condition." },
  { q: "How can I track my order?", a: "Once shipped, you will receive a tracking number via email and SMS." },
  { q: "Do you ship internationally?", a: "Currently we ship within Saudi Arabia only." },
  { q: "What payment methods do you accept?", a: "We accept Mada, Visa, Mastercard, Apple Pay, and cash on delivery." },
];

export default function FAQsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">FAQs</h1>
      <div className="space-y-6">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-lg border p-4">
            <h2 className="mb-2 font-semibold">{faq.q}</h2>
            <p className="text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
