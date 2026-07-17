import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TESTIMONIALS = [
  {
    quote:
      "We used to miss half our after-hours booking requests. Now BotFlow answers instantly and our calendar fills itself.",
    name: "Maria Chen",
    role: "Owner, Aurora Salon",
    initials: "MC",
  },
  {
    quote:
      "Setup took fifteen minutes. It answers menu and allergy questions better than some of our new hires.",
    name: "Diego Alvarez",
    role: "General Manager, Casa Bella Ristorante",
    initials: "DA",
  },
  {
    quote:
      "Our front desk used to be buried in insurance questions. BotFlow handles most of it, so my team can focus on patients.",
    name: "Dr. Priya Nair",
    role: "Owner, Riverside Dental",
    initials: "PN",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Loved by business owners
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real results from businesses using BotFlow every day.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role, initials }) => (
            <Card key={name} className="border-border">
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <Quote className="h-6 w-6 text-primary/25" />
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-foreground/80">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
