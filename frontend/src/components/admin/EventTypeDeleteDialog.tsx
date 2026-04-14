import { useTranslation } from "react-i18next";
import { InlineMessage } from "../common/InlineMessage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

type EventTypeDeleteDialogProps = {
  open: boolean;
  title: string;
  isDeleting: boolean;
  submitError: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function EventTypeDeleteDialog({
  open,
  title,
  isDeleting,
  submitError,
  onOpenChange,
  onConfirm,
}: EventTypeDeleteDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent
        className="border border-border bg-popover text-popover-foreground shadow-[var(--shadow-md)]"
        data-testid="event-type-delete-dialog"
      >
        <AlertDialogHeader className="items-start text-left">
          <AlertDialogTitle>{t("admin.deleteConfirmEventType")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("admin.deleteEventTypeDescription", { title })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {submitError ? (
          <InlineMessage
            message={submitError}
            title={t("admin.deleteBlockedTitle")}
            tone="error"
          />
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("admin.cancelCta")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            variant="destructive"
          >
            {isDeleting ? t("common.saving") : t("admin.deleteCta")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
