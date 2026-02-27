'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { CompetitionTimeline } from '@/components/dancers/CompetitionTimeline'
import { StyleBadge } from '@/components/dancers/StyleBadge'
import { Modal } from '@/components/ui/Modal'
import { Plus } from 'lucide-react'
import { DANCE_STYLES, DANCE_LEVELS } from '@/lib/constants'
import type { CompetitionResult } from '@prisma/client'

const styleOptions = Object.entries(DANCE_STYLES).map(([k, v]) => ({ value: k, label: v.label }))
const levelOptions = Object.entries(DANCE_LEVELS).map(([k, v]) => ({ value: k, label: v }))

export default function CompetitionsPage() {
  const [results, setResults] = useState<CompetitionResult[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    competitionName: '',
    competitionDate: '',
    location: '',
    partnerName: '',
    style: '',
    level: '',
    placement: '',
    totalCompetitors: '',
  })

  useEffect(() => {
    fetch('/api/competitions')
      .then(r => r.json())
      .then(data => { setResults(data); setLoading(false) })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          placement: form.placement ? parseInt(form.placement) : null,
          totalCompetitors: form.totalCompetitors ? parseInt(form.totalCompetitors) : null,
          source: 'MANUAL',
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setResults(prev => [updated, ...prev])
        setShowModal(false)
        setForm({ competitionName: '', competitionDate: '', location: '', partnerName: '', style: '', level: '', placement: '', totalCompetitors: '' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">Competition History</h1>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> Add Result
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white rounded-xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <CompetitionTimeline results={results} />
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Competition Result">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Competition Name"
            value={form.competitionName}
            onChange={e => setForm(f => ({ ...f, competitionName: e.target.value }))}
            required
            placeholder="e.g. Ohio Star Ball"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={form.competitionDate}
              onChange={e => setForm(f => ({ ...f, competitionDate: e.target.value }))}
              required
            />
            <Input
              label="Location"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="City, State"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Style"
              options={styleOptions}
              value={form.style}
              onChange={e => setForm(f => ({ ...f, style: e.target.value }))}
              placeholder="Select style"
            />
            <Select
              label="Level"
              options={levelOptions}
              value={form.level}
              onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
              placeholder="Select level"
            />
          </div>
          <Input
            label="Partner Name"
            value={form.partnerName}
            onChange={e => setForm(f => ({ ...f, partnerName: e.target.value }))}
            placeholder="e.g. Jane Smith"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Placement"
              type="number"
              value={form.placement}
              onChange={e => setForm(f => ({ ...f, placement: e.target.value }))}
              min="1"
              placeholder="e.g. 1"
            />
            <Input
              label="Total Competitors"
              type="number"
              value={form.totalCompetitors}
              onChange={e => setForm(f => ({ ...f, totalCompetitors: e.target.value }))}
              min="1"
              placeholder="e.g. 12"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" loading={saving}>Save Result</Button>
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
