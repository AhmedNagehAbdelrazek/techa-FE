"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuthDialogStore } from "@/lib/stores/auth-dialog.store";
import { useTranslation } from "@/lib/i18n/client";

// renders LoginForm inside shadcn Dialog, no extra abstractions
export function LoginDialog() {
  const { isOpen, close } = useAuthDialogStore();
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Login")}</DialogTitle>
          <DialogDescription>
            {t("You need to be logged in to continue.")}
          </DialogDescription>
        </DialogHeader>
        <LoginForm onSuccess={close} />
      </DialogContent>
    </Dialog>
  );
}
