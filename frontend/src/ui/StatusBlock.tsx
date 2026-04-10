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
    <section className={`status-block ${tone}`}>
      <h3>{title}</h3>
      <p>{message}</p>
    </section>
  );
}
