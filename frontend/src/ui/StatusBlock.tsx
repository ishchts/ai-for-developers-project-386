type StatusBlockProps = {
  title: string;
  message: string;
  tone?: "neutral" | "error" | "warning" | "success";
};

export function StatusBlock({
  title,
  message,
  tone = "neutral",
}: StatusBlockProps) {
  return (
    <section className={`inline-message tone-${tone} status-block`}>
      <h3>{title}</h3>
      <p>{message}</p>
    </section>
  );
}
