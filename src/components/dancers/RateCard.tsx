import { DollarSign, Lock } from 'lucide-react'

interface PackageRate {
  sessions: number
  price: number
  description: string
}

interface LessonRates {
  privateLessonPerHour?: number | null
  packageRates?: PackageRate[]
  proAmCompRate?: string | null
  currency?: string
  ratesPublic?: boolean
}

interface RateCardProps {
  rates: LessonRates | null
  teacherName?: string
}

export function RateCard({ rates, teacherName }: RateCardProps) {
  if (!rates || !rates.ratesPublic) {
    return (
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Lock className="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <p className="font-medium text-slate-700 text-sm">Pricing is private</p>
          <p className="text-xs text-slate-500 mt-0.5">Contact {teacherName || 'this teacher'} directly for lesson rates.</p>
        </div>
      </div>
    )
  }

  const currency = rates.currency || 'USD'
  const symbol = currency === 'USD' ? '$' : currency

  return (
    <div className="space-y-4">
      {rates.privateLessonPerHour && (
        <div className="flex items-center gap-3 p-4 bg-[#D4AF37]/5 rounded-xl border border-[#D4AF37]/20">
          <DollarSign className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-700">Private lesson</p>
            <p className="text-xl font-bold text-[#0F172A]">{symbol}{rates.privateLessonPerHour}<span className="text-sm font-normal text-slate-500">/hour</span></p>
          </div>
        </div>
      )}

      {rates.packageRates && rates.packageRates.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Packages</p>
          <div className="grid gap-2">
            {rates.packageRates.map((pkg, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-700">{pkg.sessions} lessons</p>
                  {pkg.description && <p className="text-xs text-slate-500">{pkg.description}</p>}
                </div>
                <p className="font-bold text-[#0F172A]">{symbol}{pkg.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {rates.proAmCompRate && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pro-Am Competition Rate</p>
          <p className="text-sm text-slate-700 mt-1">{rates.proAmCompRate}</p>
        </div>
      )}
    </div>
  )
}
