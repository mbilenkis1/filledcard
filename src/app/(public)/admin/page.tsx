'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ShieldCheck, Users, Trophy, Star, RefreshCw } from 'lucide-react'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'filledcard-admin'

interface AdminStats {
  totalDancers: number
  claimedProfiles: number
  unclaimedProfiles: number
  totalTeachers: number
  verifiedTeachers: number
  totalCompetitions: number
  pendingTeacherVerifications: Dancer[]
}

interface Dancer {
  id: string
  firstName: string
  lastName: string
  email: string
  isTeacher: boolean
  teacherVerified: boolean
  isClaimed: boolean
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(false)

  const login = () => {
    if (password === 'filledcard-admin') setAuthed(true)
    else alert('Wrong password')
  }

  const loadStats = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/stats')
    const data = await res.json()
    setStats(data)
    setLoading(false)
  }

  const verifyTeacher = async (dancerId: string) => {
    await fetch(`/api/admin/verify-teacher/${dancerId}`, { method: 'POST' })
    loadStats()
  }

  useEffect(() => {
    if (authed) loadStats()
  }, [authed])

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <ShieldCheck className="w-12 h-12 text-[#D4AF37] mx-auto mb-2" />
            <h1 className="font-display text-2xl font-bold text-[#0F172A]">Admin Access</h1>
          </div>
          <div className="space-y-3">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
            />
            <Button onClick={login} className="w-full">Sign In</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">Admin Dashboard</h1>
          <Button variant="outline" size="sm" onClick={loadStats} loading={loading}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {stats && (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: <Users className="w-5 h-5 text-[#D4AF37]" />, label: 'Total Dancers', value: stats.totalDancers },
                { icon: <Users className="w-5 h-5 text-green-500" />, label: 'Claimed', value: stats.claimedProfiles },
                { icon: <Users className="w-5 h-5 text-slate-400" />, label: 'Unclaimed', value: stats.unclaimedProfiles },
                { icon: <Star className="w-5 h-5 text-[#D4AF37]" />, label: 'Verified Teachers', value: stats.verifiedTeachers },
                { icon: <Trophy className="w-5 h-5 text-blue-500" />, label: 'Competition Results', value: stats.totalCompetitions },
                { icon: <Star className="w-5 h-5 text-orange-400" />, label: 'Total Teachers', value: stats.totalTeachers },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    {stat.icon}
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                  <p className="font-display font-bold text-2xl text-[#0F172A]">{stat.value.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Pending teacher verifications */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="font-display font-semibold text-xl text-[#0F172A] mb-4">
                Pending Teacher Verifications ({stats.pendingTeacherVerifications.length})
              </h2>
              {stats.pendingTeacherVerifications.length === 0 ? (
                <p className="text-slate-400 text-sm">No pending verifications</p>
              ) : (
                <div className="space-y-3">
                  {stats.pendingTeacherVerifications.map(dancer => (
                    <div key={dancer.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-[#0F172A]">{dancer.firstName} {dancer.lastName}</p>
                        <p className="text-xs text-slate-500">{dancer.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <a href={`/dancer/${dancer.id}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">View Profile</Button>
                        </a>
                        <Button size="sm" onClick={() => verifyTeacher(dancer.id)}>
                          Verify Teacher
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
