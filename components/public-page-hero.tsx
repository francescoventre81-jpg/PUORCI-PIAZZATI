type PublicPageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  number: string;
};

export function PublicPageHero({
  eyebrow,
  title,
  description,
  number,
}: PublicPageHeroProps) {
  return (
    <section className="page-hero">
      <div className="page-hero-lines" aria-hidden="true" />
      <div className="container page-hero-inner">
        <div>
          <span className="page-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <strong aria-hidden="true">{number}</strong>
      </div>
    </section>
  );
}
