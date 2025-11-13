import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { PostHogProvider } from '../components/PostHogProvider';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}