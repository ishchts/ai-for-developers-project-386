type SectionIntroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function SectionIntro({ eyebrow, title, subtitle }: SectionIntroProps) {
  return (
    <div className="section-intro stack compact">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {subtitle ? <p className="hero-copy">{subtitle}</p> : null}
    </div>
  );
}
