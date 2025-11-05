import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The AI Who Taught Me",
  description: "A podcast exploring how AI is transforming education through the stories of teachers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
