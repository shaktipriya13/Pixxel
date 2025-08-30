import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import {FloatingShapes} from "@/components/floating-shapes";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";

const inter=Inter({subsets:["latin"]}); 

export const metadata = {
  title: "Editra",
  description: "AI Image Editor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
           <ClerkProvider
            // publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            // appearance={{
            //   baseTheme: shadesOfPurple,
            // }}
          >

            <ConvexClientProvider>

            <Header/>
           <main className="bg-slate-900 min-h-[2000px] text-white overflow-x-hidden"> 
            <FloatingShapes/>
            <Toaster richColors/>
            {children}</main>
            </ConvexClientProvider>
            </ClerkProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
