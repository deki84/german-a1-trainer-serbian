import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Nur der KI-Lehrer braucht ein Konto. Lernen und Lektionen bleiben offen.
const isProtected = createRouteMatcher(["/api/chat(.*)", "/api/transcribe(.*)"]);
export default clerkMiddleware(async (auth, request) => {
  if (isProtected(request)) await auth.protect();
});

export const config = {
  matcher: [
    
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API-Routen immer prüfen
    "/(api|trpc)(.*)",
  ],
};
