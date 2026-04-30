import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/common/Navbar";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SkyEstate | Premium Real Estate & Modern Listings",
  description: "Find your dream home with the most advanced real estate platform. Buy, sell, and rent properties with ease.",
  keywords: ["real estate", "property listing", "buy home", "rent apartment", "luxury villa"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col font-sans" suppressHydrationWarning>
        <AuthProvider>
          <Toaster position="top-right" />
          <Navbar />
          <main className="flex-grow">{children}</main>
          {/* Footer */}
          <footer className="bg-background py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="col-span-1 md:col-span-1">
                  <div className="flex items-center space-x-2 mb-4">
                    <img src="/logo.png" alt="SkyEstate" className="h-12 w-auto object-contain" />
                  </div>
                  <p className="text-muted text-sm leading-relaxed">
                    The world's most advanced platform for buying, selling, and renting premium real estate.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-sm text-muted">
                    <li><a href="/properties" className="hover:text-primary">All Properties</a></li>
                    <li><a href="/dashboard" className="hover:text-primary">My Dashboard</a></li>
                    <li><a href="/favorites" className="hover:text-primary">Favorites</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Support</h4>
                  <ul className="space-y-2 text-sm text-muted">
                    <li><a href="#" className="hover:text-primary">Help Center</a></li>
                    <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Newsletter</h4>
                  <p className="text-sm text-muted mb-4 text-pretty">Subscribe to get latest property updates.</p>
                  <div className="flex gap-2">
                    <input type="email" placeholder="Email" className="bg-background px-3 py-2 rounded-lg border border-border text-xs focus:outline-none w-full" />
                    <button className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold">Join</button>
                  </div>
                </div>
              </div>
              <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted font-medium">
                <p>© 2024 SkyEstate Inc. All rights reserved.</p>
                <div className="flex gap-6">
                  <a href="#">Twitter</a>
                  <a href="#">LinkedIn</a>
                  <a href="#">Facebook</a>
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
