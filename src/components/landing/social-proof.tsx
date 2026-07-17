const LOGOS = [
  "Aurora Salon",
  "Bright Auto Group",
  "Casa Bella Ristorante",
  "Riverside Dental",
  "The Cut House",
  "Maple Street Diner",
];

export function SocialProof() {
  return (
    <section className="border-y border-border bg-muted/40 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-sm font-medium text-muted-foreground">
          Trusted by 500+ businesses across salons, restaurants, dental practices, and auto dealerships
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {LOGOS.map((name) => (
            <span
              key={name}
              className="text-lg font-bold tracking-tight text-muted-foreground/60 grayscale"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
