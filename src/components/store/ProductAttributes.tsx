"use client";

import type { ProductAttributes as ProductAttributesType } from "@/lib/types/product";

interface ProductAttributesProps {
  attributes: ProductAttributesType;
}

function AttributeTable({ title, pairs }: { title: string; pairs: { label: string; value: string }[] }) {
  if (pairs.length === 0) return null;
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <table className="w-full text-sm">
        <tbody>
          {pairs.map((pair, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="w-1/3 py-2 font-medium text-muted-foreground">{pair.label}</td>
              <td className="py-2">{pair.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProductAttributes({ attributes }: ProductAttributesProps) {
  const hasDetails = attributes.details.length > 0;
  const hasSpecs = attributes.specs.length > 0;

  if (!hasDetails && !hasSpecs) return null;

  return (
    <div className="space-y-6">
      {hasDetails && <AttributeTable title="Product Details" pairs={attributes.details} />}
      {hasSpecs && <AttributeTable title="Product Information" pairs={attributes.specs} />}
    </div>
  );
}
