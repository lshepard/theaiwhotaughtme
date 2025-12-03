import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import Script from 'next/script';
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
        {/* Meta Pixel Code */}
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '4100580976862344');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=4100580976862344&ev=PageView&noscript=1"
          />
        </noscript>

        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}