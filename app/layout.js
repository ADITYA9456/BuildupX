// Completely removing custom fonts to resolve font manifest issues
import RazorpayLoader from './components/RazorpayLoader';
import "./globals.css";
import { Providers } from './providers';

export const metadata = {
  title: "BildUpX - Fitness Tracking & Membership",
  description: "Track your nutrition, workouts, and manage your fitness journey",
  manifest: "/manifest.json",
  themeColor: "#22c55e",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BuildupX"
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#22c55e" />
      </head>
      <body className="antialiased">
        <Providers>
          <RazorpayLoader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
