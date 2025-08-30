"use client";
// This is a Provider component for your Next.js app that connects:
// Convex (your backend/database in the cloud)
// Clerk (your authentication system)
// and makes both available to all components in your app.


import { ConvexProviderWithClerk } from 'convex/react-clerk'

import { ConvexReactClient } from "convex/react";
import { useAuth } from '@clerk/nextjs';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export function ConvexClientProvider({ children }) {
  return <ConvexProviderWithClerk 
  client={convex} useAuth={useAuth}>
    {children}
  </ConvexProviderWithClerk>;
}
