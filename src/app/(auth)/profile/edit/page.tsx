'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { LocationDetector } from '@/components/location/LocationDetector'
import { StyleBadge } from '@/components/dancers/StyleBadge'
import * as Tabs from '@radix-ui/react-tabs'
import { Plus, Trash2, Save, Camera } from 'lucide-react'
import {
  DANCE_STYLES, DANCE_LEVELS, COMPETITION_FREQUENCY_LABELS,
  BUDGET_RANGE_LABELS, TRAVEL_WILLINGNESS_LABELS, US_STATES
} from '@/lib/constants'
import type { Dancer, DanceStyle } from '@prisma/client'

type FullDancer = Dancer & { danceStyles: DanceStyle[] }

const styleOptions = Object.entries(DANCE_STYLES).map(([k, v]) => ({ value: k, label: v.label }))
const levelOptions = Object.entries(DANCE_LEVELS).map(([k, v]) => ({ value: k, label: v }))
const stateOptions = US_STATES.map(s => ({ value: s, label: s }))

export default function EditProfilePage() {
  const { user } = useUser()
  const [dancer, setDancer] = useState<FullDancer | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    firstName: '', lastName: '', displayName: '', bio: '',
    city: '', state: '', heightInches: '', birthYear: '',
    studioName: '', coachName: '', instagramHandle: '', youtubeHandle: '',
    partnerStatus: 'OPEN_TO_INQUIRIES', ndcaId: '',
    competitionFrequency: '', budgetRange: '',
    partnershipType: [] as string[],
  })

  const [teacherForm, setTeacherForm] = useState({
    isTeacher: false, openToProAm: false,
    teacherBio: '', studioAddress: '', studioCity: '', studioState: '',
    travelWillingness: 'LOCAL_ONLY',
    privateLessonPerHour: '', proAmCompRate: '', ratesPublic: false,
  })

  const [newStyle, setNewStyle] = useState({ style: '', level: '', isCompeting: false, wantsToCompete: false })
  const [videoUrl, setVideoUrl] = useState('')
  const [videoTitle, setVideoTitle] = useState('')

  useEffect(() => {
    fetch('/api/dancer/me')
      .then(r => r.json())
      .then((d: FullDancer) => {
        setDancer(d)
        const rates = d.lessonRates as any
        setForm({
          firstName: d.firstName || '',
          lastName: d.lastName || '',
          displayName: d.displayName || '',
          bio: d.bio || '',
          city: d.city || '',
          state: d.state || '',
          heightInches: d.heightInches?.toString() || '',
          birthYear: d.birthYear?.toString() || '',
          studioName: d.studioName || '',
          coachName: d.coachName || '',
          instagramHandle: d.instagramHandle || '',
          youtubeHandle: d.youtubeHandle || '',
          partnerStatus: d.partnerStatus || 'OPEN_TO_INQUIRIES',
          ndcaId: d.ndcaId || '',
          competitionFrequency: d.competitionFrequency || '',
          budgetRange: d.budgetRange || '',
          partnershipType: (d.partnershipType as string[]) || [],
        })
        setTeacherForm({
          isTeacher: d.isTeacher || false,
          openToProAm: d.openToProAm || false,
          teacherBio: d.teacherBio || '',
          studioAddress: d.studioAddress || '',
          studioCity: d.studioCity || '',
          studioState: d.studioState || '',
          travelWillingness: d.travelWillingness || 'LOCAL_ONLY',
          privateLessonPerHour: rates?.privateLessonPerHour?.toString() || '',
          proAmCompRate: rates?.proAmCompRate || '',
          ratesPublic: rates?.ratesPublic || false,
        })
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const lessonRates = {
        privateLessonPerHour: teacherForm.privateLessonPerHour ? parseFloat(teacherForm.privateLessonPerHour) : null,
        proAmCompRate: teacherForm.proAmCompRate || null,
        ratesPublic: teacherForm.ratesPublic,
        packageRates: [],
        currency: 'USD',
      }
      await fetch('/api/dancer/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          heightInches: form.heightInches ? parseInt(form.heightInches) : null,
          birthYear: form.birthYear ? parseInt(form.birthYear) : null,
          ...teacherForm,
          lessonRates,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload/photo', { method: 'POST', body: fd })
      const { url } = await res.json()
      setDancer(prev => prev ? { ...prev, profilePhoto: url } : prev)
    } finally {
      setUploading(false)
    }
  }

  const addStyle = async () => {
    if (!newStyle.style || !newStyle.level) return
    const res = await fetch('/api/dancer/styles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStyle),
    })
    const style = await res.json()
    setDancer(prev => prev ? { ...prev, danceStyles: [...prev.danceStyles, style] } : prev)
    setNewStyle({ style: '', level: '', isCompeting: false, wantsToCompete: false })
  }

  const removeStyle = async (styleId: string) => {
    await fetch(`/api/dancer/styles/${styleId}`, { method: 'DELETE' })
    setDancer(prev => prev ? { ...prev, danceStyles: prev.danceStyles.filter(s => s.id !== styleId) } : prev)
  }

  const addVideo = async () => {
    if (!videoUrl) return
    const res = await fetch('/api/dancer/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: videoUrl, title: videoTitle }),
    })
    setVideoUrl('')
    setVideoTitle('')
  }

  const togglePartnershipType = (type: string) => {
    setForm(f => ({
      ...f,
      partnershipType: f.partnershipType.includes(type)
        ? f.partnershipType.filter(p => p !== type)
        : [...f.partnershipType, type],
    }))
  }

  if (!dancer) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">Edit Profile</h1>
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>

        <Tabs.Root defaultValue="profile">
          <Tabs.List className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-slate-100 w-fit">
            {[
              { value: 'profile', label: 'Profile' },
              { value: 'dancing', label: 'Dancing' },
              { value: 'media', label: 'Media' },
              ...(teacherForm.isTeacher ? [{ value: 'teacher', label: 'Teacher' }] : []),
            ].map(tab => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors data-[state=active]:bg-[#0F172A] data-[state=active]:text-white text-slate-600 hover:text-[#0F172A]"
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* Profile tab */}
          <Tabs.Content value="profile" className="space-y-6">
            {/* Photo */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="font-semibold text-[#0F172A] mb-4">Profile Photo</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-[#0F172A] overflow-hidden flex items-center justify-center">
                    {dancer.profilePhoto ? (
                      <img src={dancer.profilePhoto} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <span className="text-[#D4AF37] font-bold text-xl">
                        {dancer.firstName[0]}{dancer.lastName[0]}
                      </span>
                    )}
                  </div>
                </div>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  <Button variant="outline" size="sm" asChild loading={uploading}>
                    <span><Camera className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Change Photo'}</span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Basic info */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <h2 className="font-semibold text-[#0F172A]">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
                <Input label="Last Name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
              </div>
              <Input label="Display Name" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} hint="How your name appears publicly (optional)" />
              <Textarea label="Bio" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4} placeholder="Tell the community about yourself and your dancing..." />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Birth Year" type="number" value={form.birthYear} onChange={e => setForm(f => ({ ...f, birthYear: e.target.value }))} placeholder="e.g. 1990" min="1900" max="2010" />
                <Input label="Height (inches)" type="number" value={form.heightInches} onChange={e => setForm(f => ({ ...f, heightInches: e.target.value }))} placeholder="e.g. 65" min="48" max="84" />
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <h2 className="font-semibold text-[#0F172A]">Location</h2>
              <LocationDetector
                onDetected={(city, state) => setForm(f => ({ ...f, city, state }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                <Select label="State" options={stateOptions} value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="Select state" />
              </div>
            </div>

            {/* Studio & Social */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <h2 className="font-semibold text-[#0F172A]">Studio & Social</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Studio Name" value={form.studioName} onChange={e => setForm(f => ({ ...f, studioName: e.target.value }))} />
                <Input label="Coach Name" value={form.coachName} onChange={e => setForm(f => ({ ...f, coachName: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Instagram Handle" value={form.instagramHandle} onChange={e => setForm(f => ({ ...f, instagramHandle: e.target.value }))} placeholder="without @" />
                <Input label="YouTube Handle" value={form.youtubeHandle} onChange={e => setForm(f => ({ ...f, youtubeHandle: e.target.value }))} placeholder="your channel handle" />
              </div>
              <Input label="NDCA ID" value={form.ndcaId} onChange={e => setForm(f => ({ ...f, ndcaId: e.target.value }))} placeholder="Your NDCA member number" />
            </div>

            {/* Teacher toggle */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-[#0F172A]">Are you a professional teacher?</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Enable a teacher profile to accept Pro-Am students</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teacherForm.isTeacher}
                    onChange={e => setTeacherForm(f => ({ ...f, isTeacher: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-[#D4AF37]/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]" />
                </label>
              </div>
            </div>
          </Tabs.Content>

          {/* Dancing tab */}
          <Tabs.Content value="dancing" className="space-y-6">
            {/* Partner status */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <h2 className="font-semibold text-[#0F172A]">Partner Status</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'HAS_PARTNER', label: 'Has Partner' },
                  { value: 'LOOKING', label: 'Looking' },
                  { value: 'OPEN_TO_INQUIRIES', label: 'Open to Inquiries' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, partnerStatus: opt.value }))}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                      form.partnerStatus === opt.value
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#A68B2A]'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div>
                <p className="label">Partnership Goals</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'AMATEUR_AMATEUR', label: 'Amateur-Amateur' },
                    { value: 'PRO_AM', label: 'Pro-Am' },
                    { value: 'PRACTICE_ONLY', label: 'Practice Partner' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => togglePartnershipType(opt.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                        form.partnershipType.includes(opt.value)
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#A68B2A]'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Competition preferences */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <h2 className="font-semibold text-[#0F172A]">Competition Preferences</h2>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Competition Frequency"
                  options={Object.entries(COMPETITION_FREQUENCY_LABELS).map(([k, v]) => ({ value: k, label: v }))}
                  value={form.competitionFrequency}
                  onChange={e => setForm(f => ({ ...f, competitionFrequency: e.target.value }))}
                  placeholder="How often do you compete?"
                />
                <Select
                  label="Budget Range"
                  options={Object.entries(BUDGET_RANGE_LABELS).map(([k, v]) => ({ value: k, label: v }))}
                  value={form.budgetRange}
                  onChange={e => setForm(f => ({ ...f, budgetRange: e.target.value }))}
                  placeholder="Your competition budget"
                />
              </div>
            </div>

            {/* Dance styles */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <h2 className="font-semibold text-[#0F172A]">Dance Styles</h2>

              {dancer.danceStyles.length > 0 && (
                <div className="space-y-2">
                  {dancer.danceStyles.map(style => (
                    <div key={style.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <StyleBadge style={style.style} level={style.level} />
                        <div className="flex gap-2 text-xs text-slate-500">
                          {style.isCompeting && <span className="text-green-600">Competing</span>}
                          {style.wantsToCompete && <span className="text-blue-600">Wants to compete</span>}
                        </div>
                      </div>
                      <button onClick={() => removeStyle(style.id)} className="p-1 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <p className="text-sm font-medium text-slate-700">Add a style</p>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    options={styleOptions}
                    value={newStyle.style}
                    onChange={e => setNewStyle(s => ({ ...s, style: e.target.value }))}
                    placeholder="Style"
                  />
                  <Select
                    options={levelOptions}
                    value={newStyle.level}
                    onChange={e => setNewStyle(s => ({ ...s, level: e.target.value }))}
                    placeholder="Level"
                  />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={newStyle.isCompeting} onChange={e => setNewStyle(s => ({ ...s, isCompeting: e.target.checked }))} />
                    Currently competing
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={newStyle.wantsToCompete} onChange={e => setNewStyle(s => ({ ...s, wantsToCompete: e.target.checked }))} />
                    Wants to compete
                  </label>
                </div>
                <Button type="button" size="sm" onClick={addStyle} disabled={!newStyle.style || !newStyle.level}>
                  <Plus className="w-4 h-4" /> Add Style
                </Button>
              </div>
            </div>
          </Tabs.Content>

          {/* Media tab */}
          <Tabs.Content value="media" className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <h2 className="font-semibold text-[#0F172A]">Videos</h2>
              <p className="text-sm text-slate-500">Add YouTube or Instagram links to showcase your dancing.</p>
              <div className="space-y-3">
                <Input
                  label="Video URL"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
                <Input
                  label="Title (optional)"
                  value={videoTitle}
                  onChange={e => setVideoTitle(e.target.value)}
                  placeholder="e.g. Ohio Star Ball 2024 - Waltz"
                />
                <Button size="sm" onClick={addVideo} disabled={!videoUrl}>
                  <Plus className="w-4 h-4" /> Add Video
                </Button>
              </div>
            </div>
          </Tabs.Content>

          {/* Teacher tab */}
          {teacherForm.isTeacher && (
            <Tabs.Content value="teacher" className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                <h2 className="font-semibold text-[#0F172A]">Teacher Profile</h2>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">Open to Pro-Am partnerships</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={teacherForm.openToProAm} onChange={e => setTeacherForm(f => ({ ...f, openToProAm: e.target.checked }))} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]" />
                  </label>
                </div>
                <Textarea label="Teacher Bio" value={teacherForm.teacherBio} onChange={e => setTeacherForm(f => ({ ...f, teacherBio: e.target.value }))} rows={4} placeholder="Your teaching philosophy, experience, specialties..." />
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                <h2 className="font-semibold text-[#0F172A]">Studio Location</h2>
                <Input label="Studio Address" value={teacherForm.studioAddress} onChange={e => setTeacherForm(f => ({ ...f, studioAddress: e.target.value }))} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Studio City" value={teacherForm.studioCity} onChange={e => setTeacherForm(f => ({ ...f, studioCity: e.target.value }))} />
                  <Select label="Studio State" options={stateOptions} value={teacherForm.studioState} onChange={e => setTeacherForm(f => ({ ...f, studioState: e.target.value }))} placeholder="Select state" />
                </div>
                <Select
                  label="Travel Willingness"
                  options={Object.entries(TRAVEL_WILLINGNESS_LABELS).map(([k, v]) => ({ value: k, label: v }))}
                  value={teacherForm.travelWillingness}
                  onChange={e => setTeacherForm(f => ({ ...f, travelWillingness: e.target.value }))}
                />
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-[#0F172A]">Lesson Rates</h2>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={teacherForm.ratesPublic} onChange={e => setTeacherForm(f => ({ ...f, ratesPublic: e.target.checked }))} />
                    Make rates public
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Private Lesson ($/hr)" type="number" value={teacherForm.privateLessonPerHour} onChange={e => setTeacherForm(f => ({ ...f, privateLessonPerHour: e.target.value }))} placeholder="e.g. 120" min="0" />
                  <Input label="Pro-Am Comp Rate" value={teacherForm.proAmCompRate} onChange={e => setTeacherForm(f => ({ ...f, proAmCompRate: e.target.value }))} placeholder="e.g. $150/hour + travel" />
                </div>
              </div>

              <Button onClick={handleSave} loading={saving} size="lg" className="w-full">
                <Save className="w-4 h-4" /> Save All Changes
              </Button>
            </Tabs.Content>
          )}
        </Tabs.Root>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg">
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
