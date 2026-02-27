import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="text-center mb-8 absolute top-20 left-1/2 -translate-x-1/2">
        <h1 className="font-display text-4xl font-bold text-[#0F172A]">Welcome back</h1>
        <p className="text-slate-500 mt-1">Sign in to fill your dance card</p>
      </div>
      <SignIn />
    </div>
  )
}
