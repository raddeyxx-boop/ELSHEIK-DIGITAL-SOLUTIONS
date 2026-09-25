import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Alsheikh Digital Solutions", template: "%s | Alsheikh Digital Solutions" },
  description: "Websites, applications, automation, and intelligent digital systems engineered for real business.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

