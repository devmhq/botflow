import { LandingNavbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
