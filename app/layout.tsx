import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowBoard AI — Real SaaS Dashboard",
  description: "Full-stack Supabase SaaS dashboard with real CRUD and dynamic KPIs"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
