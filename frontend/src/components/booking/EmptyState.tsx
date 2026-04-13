import { Card } from "../common/Card";

type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <Card className="empty-state">
      <div className="stack compact">
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </Card>
  );
}
