import { PropsWithChildren } from "react";

type InlineMessageProps = PropsWithChildren<{
  title: string;
  tone?: "neutral" | "success" | "warning" | "error";
  message?: string;
}>;

export function InlineMessage({
  title,
  tone = "neutral",
  message,
  children,
}: InlineMessageProps) {
  return (
    <div className={`inline-message tone-${tone}`}>
      <div className="stack compact">
        <strong>{title}</strong>
        {message ? <p>{message}</p> : null}
        {children}
      </div>
    </div>
  );
}
