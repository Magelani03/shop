import { toast } from "sonner";

/**
 * After opening a blank tab synchronously (e.g. on form submit), point it at the WhatsApp URL.
 * If the blank tab was blocked, show a toast with a manual open action.
 */
export function navigatePopupToWhatsApp(
  popup: Window | null,
  whatsappUrl: string | null | undefined,
  options: {
    successToast?: string;
    notConfiguredToast?: string;
    blockedDescription?: string;
  } = {},
): void {
  if (!whatsappUrl) {
    popup?.close();
    toast.info(
      options.notConfiguredToast ??
        "WhatsApp is not configured for this store yet.",
    );
    return;
  }

  if (popup) {
    popup.location.href = whatsappUrl;
    if (options.successToast) {
      toast.success(options.successToast);
    }
  } else {
    toast.info(
      options.blockedDescription ??
        "Your browser blocked the new tab. Open WhatsApp manually.",
      {
        action: {
          label: "Open WhatsApp",
          onClick: () => window.open(whatsappUrl, "_blank"),
        },
      },
    );
  }
}
