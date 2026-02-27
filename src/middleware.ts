import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/matches(.*)',
  '/messages(.*)',
  '/competitions(.*)',
  '/profile/edit(.*)',
  '/profile/teacher-setup(.*)',
  '/api/dancer/me(.*)',
  '/api/dancer/styles(.*)',
  '/api/dancer/videos(.*)',
  '/api/competitions(.*)',
  '/api/messages(.*)',
  '/api/upload(.*)',
  '/api/partner-requests(.*)',
  '/api/claim(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
