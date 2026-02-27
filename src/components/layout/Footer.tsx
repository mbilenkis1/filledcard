import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                <span className="text-[#0F172A] font-display font-bold text-sm">FC</span>
              </div>
              <span className="font-display font-bold text-lg">FilledCard</span>
            </div>
            <p className="text-slate-400 text-sm">Fill Your Dance Card</p>
            <p className="text-slate-500 text-xs mt-2">
              The social platform for competitive ballroom dancers.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 text-[#D4AF37]">Discover</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/search" className="hover:text-white transition-colors">Find Dancers</Link></li>
              <li><Link href="/teachers" className="hover:text-white transition-colors">Browse Teachers</Link></li>
              <li><Link href="/claim" className="hover:text-white transition-colors">Claim Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 text-[#D4AF37]">Account</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/sign-up" className="hover:text-white transition-colors">Sign Up Free</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/profile/edit" className="hover:text-white transition-colors">Edit Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 text-[#D4AF37]">About</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-xs">
          © {new Date().getFullYear()} FilledCard. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
