import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية — TechA",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>
      <div className="space-y-4 text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
        <p>We collect information you provide when creating an account, placing an order, or contacting support.</p>

        <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
        <p>We use your information to process orders, improve our services, and send relevant communications.</p>

        <h2 className="text-xl font-semibold text-foreground">3. Data Protection</h2>
        <p>We implement industry-standard security measures to protect your personal data.</p>

        <h2 className="text-xl font-semibold text-foreground">4. Third-Party Sharing</h2>
        <p>We do not sell your data. We may share it with trusted partners for order fulfillment and payment processing.</p>
      </div>
    </div>
  );
}
