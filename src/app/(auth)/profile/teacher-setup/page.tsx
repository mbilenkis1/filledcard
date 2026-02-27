'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'
import { TRAVEL_WILLINGNESS_LABELS, US_STATES } from '@/lib/constants'
import { GraduationCap, MapPin, DollarSign, Plus, Trash2, ArrowRight, Check } from 'lucide-react'

interface PackageRate {
  sessions: number
  price: number
  description: string
}

const STEPS = ['Welcome', 'Bio', 'Studio', 'Rates', 'Done']

export default function TeacherSetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    openToProAm: true,
    teacherBio: '',
    studioAddress: '',
    studioCity: '',
    studioState: '',
    travelWillingness: 'LOCAL_ONLY',
    privateLessonPerHour: '',
    proAmCompRate: '',
    ratesPublic: true,
    packageRates: [] as PackageRate[],
  })

  const [newPackage, setNewPackage] = useState({ sessions: '', price: '', description: '' })

  const stateOptions = US_STATES.map(s => ({ value: s, label: s }))
  const travelOptions = Object.entries(TRAVEL_WILLINGNESS_LABELS).map(([k, v]) => ({ value: k, label: v }))

  const addPackage = () => {
    if (!newPackage.sessions || !newPackage.price) return
    setForm(f => ({
      ...f,
      packageRates: [...f.packageRates, {
        sessions: parseInt(newPackage.sessions),
        price: parseFloat(newPackage.price),
        description: newPackage.description,
      }],
    }))
    setNewPackage({ sessions: '', price: '', description: '' })
  }

  const removePackage = (i: number) => {
    setForm(f => ({ ...f, packageRates: f.packageRates.filter((_, idx) => idx !== i) }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const lessonRates = {
        privateLessonPerHour: form.privateLessonPerHour ? parseFloat(form.privateLessonPerHour) : null,
        proAmCompRate: form.proAmCompRate || null,
        packageRates: form.packageRates,
        ratesPublic: form.ratesPublic,
        currency: 'USD',
      }

      const res = await fetch('/api/dancer/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isTeacher: true,
          openToProAm: form.openToProAm,
          teacherBio: form.teacherBio,
          studioAddress: form.studioAddress,
          studioCity: form.studioCity,
          studioState: form.studioState,
          travelWillingness: form.travelWillingness,
          lessonRates,
        }),
      })

      if (res.ok) {
        setStep(4)
      } else {
        toast({ type: 'error', title: 'Save failed', description: 'Please try again.' })
      }
    } finally {
      setSaving(false)
    }
  }

  const progress = (step / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#0F172A] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">Teacher Setup</h1>
          <p className="text-slate-500 mt-1 text-sm">Set up your professional teaching profile</p>
        </div>

        {/* Progress */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Step {step + 1} of {STEPS.length - 1}</span>
              <span>{STEPS[step]}</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4AF37] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center space-y-6">
            <div className="space-y-3">
              <h2 className="font-display text-xl font-bold text-[#0F172A]">Welcome, future teacher!</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Your teacher profile will appear in the <strong>Teachers directory</strong> and help amateur dancers find you for Pro-Am partnerships and private lessons.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 text-left">
              {[
                { icon: GraduationCap, text: 'Your bio and specialties' },
                { icon: MapPin, text: 'Studio location' },
                { icon: DollarSign, text: 'Lesson rates (optional)' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">{text}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-4 bg-[#D4AF37]/5 rounded-xl border border-[#D4AF37]/20">
              <div>
                <p className="font-medium text-sm text-[#0F172A]">Open to Pro-Am partnerships?</p>
                <p className="text-xs text-slate-500 mt-0.5">Students can send you Pro-Am requests</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.openToProAm}
                  onChange={e => setForm(f => ({ ...f, openToProAm: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]" />
              </label>
            </div>

            <Button onClick={() => setStep(1)} className="w-full">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step 1: Bio */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <div>
              <h2 className="font-display text-xl font-bold text-[#0F172A]">Your Teacher Bio</h2>
              <p className="text-slate-500 text-sm mt-1">Tell prospective students about your experience and teaching style.</p>
            </div>

            <Textarea
              label="Teacher Bio"
              value={form.teacherBio}
              onChange={e => setForm(f => ({ ...f, teacherBio: e.target.value }))}
              rows={6}
              placeholder="e.g. International-level competitor with 15 years of teaching experience. I specialize in Standard and Latin, working with students from Bronze through Championship levels. My approach focuses on..."
            />

            <p className="text-xs text-slate-400">
              {form.teacherBio.length} characters — aim for 100–400 for best results
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1">Back</Button>
              <Button onClick={() => setStep(2)} className="flex-1" disabled={!form.teacherBio.trim()}>
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Studio */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <div>
              <h2 className="font-display text-xl font-bold text-[#0F172A]">Studio Location</h2>
              <p className="text-slate-500 text-sm mt-1">Where do you primarily teach?</p>
            </div>

            <Input
              label="Studio Address (optional)"
              value={form.studioAddress}
              onChange={e => setForm(f => ({ ...f, studioAddress: e.target.value }))}
              placeholder="123 Dance Studio Ave"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={form.studioCity}
                onChange={e => setForm(f => ({ ...f, studioCity: e.target.value }))}
                placeholder="New York"
              />
              <Select
                label="State"
                options={stateOptions}
                value={form.studioState}
                onChange={e => setForm(f => ({ ...f, studioState: e.target.value }))}
                placeholder="Select state"
              />
            </div>
            <Select
              label="Travel Willingness"
              options={travelOptions}
              value={form.travelWillingness}
              onChange={e => setForm(f => ({ ...f, travelWillingness: e.target.value }))}
            />

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Rates */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <div>
              <h2 className="font-display text-xl font-bold text-[#0F172A]">Lesson Rates</h2>
              <p className="text-slate-500 text-sm mt-1">Optional — you can always update this later.</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <p className="text-sm font-medium text-slate-700">Make rates visible to everyone</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.ratesPublic}
                  onChange={e => setForm(f => ({ ...f, ratesPublic: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Private Lesson ($/hr)"
                type="number"
                value={form.privateLessonPerHour}
                onChange={e => setForm(f => ({ ...f, privateLessonPerHour: e.target.value }))}
                placeholder="e.g. 120"
                min="0"
              />
              <Input
                label="Pro-Am Comp Rate"
                value={form.proAmCompRate}
                onChange={e => setForm(f => ({ ...f, proAmCompRate: e.target.value }))}
                placeholder="e.g. $150/hr + travel"
              />
            </div>

            {/* Package rates */}
            <div>
              <p className="label">Package Rates (optional)</p>
              {form.packageRates.map((pkg, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mb-2">
                  <div className="text-sm">
                    <span className="font-medium text-[#0F172A]">{pkg.sessions} lessons</span>
                    <span className="text-slate-500"> — ${pkg.price}</span>
                    {pkg.description && <span className="text-slate-400"> · {pkg.description}</span>}
                  </div>
                  <button onClick={() => removePackage(i)} className="p-1 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Sessions (e.g. 5)"
                    type="number"
                    value={newPackage.sessions}
                    onChange={e => setNewPackage(p => ({ ...p, sessions: e.target.value }))}
                    min="1"
                  />
                  <Input
                    placeholder="Price ($)"
                    type="number"
                    value={newPackage.price}
                    onChange={e => setNewPackage(p => ({ ...p, price: e.target.value }))}
                    min="0"
                  />
                </div>
                <Input
                  placeholder="Description (optional)"
                  value={newPackage.description}
                  onChange={e => setNewPackage(p => ({ ...p, description: e.target.value }))}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addPackage}
                  disabled={!newPackage.sessions || !newPackage.price}
                >
                  <Plus className="w-4 h-4" /> Add Package
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button onClick={handleSave} loading={saving} className="flex-1">
                Save & Finish <Check className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-[#0F172A]">You're all set!</h2>
              <p className="text-slate-500 text-sm mt-2">
                Your teacher profile is live. Students can now find you in the Teachers directory.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push('/teachers')} className="w-full">
                View Teachers Directory
              </Button>
              <Button variant="outline" onClick={() => router.push('/profile/edit')} className="w-full">
                Edit Full Profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
