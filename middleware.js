import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';


const isProtectedRoutes=createRouteMatcher(["/dashboard(.*)","/editor(.*)"]);


// This is the core logic of the middleware, running for every request to your app that matches the config.matcher patterns
export default clerkMiddleware(async(auth,req)=>{

  const {userId}=await auth();

  if(!userId&& isProtectedRoutes(req)){
     const {redirectToSignIn}=await auth();
    //  Redirect unauthenticated users to the sign-in page if they try to access protected routes.
     return redirectToSignIn();
  }
  return NextResponse.next();
})
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}