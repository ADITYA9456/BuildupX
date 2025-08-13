// Completely removing custom fonts to resolve font manifest issues
import RazorpayLoader from './components/RazorpayLoader';
import "./globals.css";
import { Providers } from './providers';

export const metadata = {
  title: "BildUpX - Fitness Tracking & Membership",
  description: "Track your nutrition, workouts, and manage your fitness journey",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <RazorpayLoader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
