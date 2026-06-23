"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// ponytail: no Tooltip shadcn component — using native title
import type { Setting } from "@/lib/api/admin-banners-settings-media";

interface SettingsGroupProps {
  title: string;
  settings: Setting[];
  values: Record<string, string | number | boolean>;
  onChange: (key: string, value: string | number | boolean) => void;
  onUploadImage: (key: string) => void; // ponytail: parent triggers file input
}

// ponytail: single component, no separate InputRenderer abstraction
function SettingInput({
  setting,
  value,
  onChange,
  onUploadImage,
}: {
  setting: Setting;
  value: string | number | boolean;
  onChange: (v: string | number | boolean) => void;
  onUploadImage: () => void;
}) {
  const baseCn = setting.is_active ? "" : "opacity-60 pointer-events-none"; // ponytail: no pointer-events for graying out, still editable via label

  switch (setting.type) {
    case "textarea":
      return <Textarea className={baseCn} value={String(value)} onChange={(e) => onChange(e.target.value)} rows={3} />;
    case "boolean":
      return (
        <input
          type="checkbox"
          className="size-4" // ponytail: native checkbox
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
    case "image":
      return (
        <div className="flex items-center gap-2">
          <Input className={baseCn} value={String(value)} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
          <button type="button" onClick={() => !setting.is_active || onUploadImage()} className="text-sm text-primary hover:underline disabled:opacity-50" disabled={!setting.is_active}>
            Upload
          </button>
        </div>
      );
    case "color":
      return <input type="color" className="size-10 cursor-pointer rounded border" value={String(value)} onChange={(e) => onChange(e.target.value)} />; // ponytail: native color input
    case "number":
      return <Input type="number" className={baseCn} value={String(value)} onChange={(e) => onChange(Number(e.target.value))} />;
    default:
      return <Input className={baseCn} value={String(value)} onChange={(e) => onChange(e.target.value)} />;
  }
}

export function SettingsGroup({ title, settings, values, onChange, onUploadImage }: SettingsGroupProps) {
  return (
    <fieldset className="rounded-lg border p-4">
      <legend className="px-2 text-sm font-semibold">{title}</legend>
      <div className="space-y-4">
        {settings.map((s) => (
          <div key={s.key} className="space-y-1">
              <div className="flex items-center gap-1">
                <Label htmlFor={s.key}>{s.key.split(".").pop()}</Label>
                {!s.is_active && (
                  <span className="cursor-help text-xs text-muted-foreground" title="Inactive setting">ⓘ</span>
                )}
              </div>
              <SettingInput setting={s} value={values[s.key] ?? s.value} onChange={(v) => onChange(s.key, v)} onUploadImage={() => onUploadImage(s.key)} />
            </div>
        ))}
      </div>
    </fieldset>
  );
}
