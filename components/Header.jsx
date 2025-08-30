"use client"
import { useStoreUser } from '@/hooks/useStoreUserEffect'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { LayoutDashboard, Sparkles } from "lucide-react";
import { BarLoader } from "react-spinners";
import { Authenticated, Unauthenticated } from "convex/react";
import { Button } from "./ui/button";


// In your app:
// Authenticated means the user has signed in via Clerk (e.g., with an email/password or Google) and Convex recognizes them. They can access personalized features (e.g., their profile or todos).
// Unauthenticated means the user hasn’t signed in. They see generic content or login/signup prompts (like the SignInButton in your Header).

const Header = () => {
    const path=usePathname();
    const {isLoading}=useStoreUser();

    if(path.includes("/editor")){
      return null;//hide header on editor page
    }
  return (
     <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 text-nowrap">
      {/* Center - Glass Navigation Container */}

      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-8 py-3 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="mr-10 md:mr-20">
          <Image
            src="/logo1.png"
            alt="Editra Logo"
            className="min-w-24 object-cover"
            width={96}
            height={24}
          />
        </Link>

        {path === "/" && (
          <div className="hidden md:flex space-x-6">
            <Link
              href="#features"
              className="text-white font-medium transition-all duration-300 hover:text-cyan-400 cursor-pointer"
            >
              {/* That href="#features" means 👉 it’s a link to a section on the same page that has an element with the id="features". */}
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-white font-medium transition-all duration-300 hover:text-cyan-400 cursor-pointer"
            >
              Pricing
            </Link>
            <Link
              href="#contact"
              className="text-white font-medium transition-all duration-300 hover:text-cyan-400 cursor-pointer"
            >
              Contact
            </Link>
          </div>
        )}

        {/* Auth Actions using Clerk*/}
            {/* When the user is signed out show him the sign in  & sign up button */}
 {/* When the user is signed in show him the user button which is the drop down */} 

         {/* Auth Actions */}
        <div className="flex items-center gap-3 ml-10 md:ml-20">
          <Authenticated>
            <Link href="/dashboard">
              <Button variant="glass" className="hidden sm:flex">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden md:flex">Dashboard</span>
              </Button>
            </Link>

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-lg border border-white/20",
                  userButtonPopoverCard:
                    "shadow-xl backdrop-blur-md bg-slate-900/90 border border-white/20",
                  userPreviewMainIdentifier: "font-semibold text-white",
                },
              }}
              // afterSignOutUrl="/"
            />
          </Authenticated>

          <Unauthenticated>
            <SignInButton>
              <Button variant="glass" className="hidden sm:flex">
                Sign In
              </Button>
            </SignInButton>

            <SignUpButton>
              <Button variant="primary">Get Started</Button>
            </SignUpButton>
          </Unauthenticated>
        </div>

        {isLoading && (
          <div className="fixed bottom-0 left-0 w-full z-40 flex justify-center">
            <BarLoader width={"95%"} color="#06b6d4" />
          </div>
        )}
      </div>
    </header>
  )
}

export default Header