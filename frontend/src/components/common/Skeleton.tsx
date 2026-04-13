type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div aria-hidden="true" className={["skeleton", className].filter(Boolean).join(" ")} />;
}
