import { HTMLAttributes, PropsWithChildren } from "react";

type CardProps = PropsWithChildren<
  HTMLAttributes<HTMLElement> & {
    as?: "article" | "section" | "div" | "form";
    elevated?: boolean;
  }
>;

export function Card({ as = "div", children, className = "", elevated = false, ...props }: CardProps) {
  const Component = as;
  const classes = ["card", elevated ? "card-elevated" : "", className].filter(Boolean).join(" ");

  return (
    <Component {...props} className={classes}>
      {children}
    </Component>
  );
}
