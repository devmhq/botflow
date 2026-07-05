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
    <section className="border-y border-neutral-200 bg-neutral-50 py-10 dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Trusted by 500+ businesses across salons, restaurants, dental practices, and auto dealerships
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {LOGOS.map((name) => (
            <span
              key={name}
              className="text-lg font-bold tracking-tight text-neutral-400 grayscale dark:text-neutral-600"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
