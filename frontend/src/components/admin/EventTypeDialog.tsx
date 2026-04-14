import { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { InlineMessage } from "../common/InlineMessage";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";

type EventTypeDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  title: string;
  description: string;
  durationMinutes: string;
  errors: Partial<Record<"title" | "durationMinutes", string>>;
  submitError: string | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function EventTypeDialog({
  open,
  mode,
  title,
  description,
  durationMinutes,
  errors,
  submitError,
  isSubmitting,
  onOpenChange,
  onTitleChange,
  onDescriptionChange,
  onDurationChange,
  onSubmit,
}: EventTypeDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="max-w-[34rem] border border-border bg-popover text-popover-foreground shadow-[var(--shadow-md)]"
        data-testid="event-type-dialog"
        showCloseButton={false}
      >
        <form className="flex flex-col gap-5" onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === "edit" ? t("admin.editTitle") : t("admin.createTitle")}</DialogTitle>
            <DialogDescription>
              {mode === "edit"
                ? t("admin.editEventTypeDialogHint")
                : t("admin.createEventTypeDialogHint")}
            </DialogDescription>
          </DialogHeader>

          {submitError ? (
            <InlineMessage
              message={submitError}
              title={t("admin.createErrorTitle")}
              tone="error"
            />
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="event-type-title">{t("admin.titleLabel")}</Label>
            <Input
              aria-invalid={Boolean(errors.title)}
              id="event-type-title"
              onChange={(event) => onTitleChange(event.target.value)}
              value={title}
            />
            {errors.title ? <p className="field-error">{errors.title}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="event-type-description">{t("admin.descriptionLabel")}</Label>
            <Textarea
              id="event-type-description"
              onChange={(event) => onDescriptionChange(event.target.value)}
              rows={4}
              value={description}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="event-type-duration">{t("admin.durationLabel")}</Label>
            <Input
              aria-invalid={Boolean(errors.durationMinutes)}
              id="event-type-duration"
              min="1"
              onChange={(event) => onDurationChange(event.target.value)}
              type="number"
              value={durationMinutes}
            />
            {errors.durationMinutes ? (
              <p className="field-error">{errors.durationMinutes}</p>
            ) : null}
          </div>

          <DialogFooter className="gap-3">
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              {t("admin.cancelCta")}
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting
                ? t("common.saving")
                : mode === "edit"
                  ? t("admin.saveCta")
                  : t("admin.createCta")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
