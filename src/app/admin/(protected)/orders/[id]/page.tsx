import type { Metadata } from "next";
import { OrderDetail } from "@/components/admin/OrderDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `الطلب #${id} — TechA` };
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  return <OrderDetail orderId={id} />;
}
