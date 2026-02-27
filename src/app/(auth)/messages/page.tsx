'use client'

import { useState, useEffect, useRef } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Send, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'

interface Thread {
  dancer: {
    id: string
    firstName: string
    lastName: string
    displayName: string | null
    profilePhoto: string | null
  }
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  isRead: boolean
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [activeThread, setActiveThread] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [myId, setMyId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/messages/threads').then(r => r.json()),
      fetch('/api/dancer/me').then(r => r.json()),
    ]).then(([threadData, me]) => {
      setThreads(threadData)
      setMyId(me.id)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!activeThread) return
    fetch(`/api/messages?with=${activeThread.dancer.id}`)
      .then(r => r.json())
      .then(setMessages)
  }, [activeThread])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!draft.trim() || !activeThread) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: activeThread.dancer.id, content: draft }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages(prev => [...prev, msg])
        setDraft('')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-white">
      {/* Thread list */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-100 bg-white">
          <h2 className="font-display font-bold text-[#0F172A]">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No messages yet</p>
            </div>
          ) : (
            threads.map(thread => (
              <button
                key={thread.dancer.id}
                onClick={() => setActiveThread(thread)}
                className={`w-full text-left p-4 flex items-start gap-3 hover:bg-white transition-colors border-b border-slate-100 ${
                  activeThread?.dancer.id === thread.dancer.id ? 'bg-white border-l-2 border-l-[#D4AF37]' : ''
                }`}
              >
                <Avatar
                  src={thread.dancer.profilePhoto}
                  firstName={thread.dancer.firstName}
                  lastName={thread.dancer.lastName}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#0F172A] truncate">
                    {thread.dancer.displayName || `${thread.dancer.firstName} ${thread.dancer.lastName}`}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{thread.lastMessage}</p>
                </div>
                {thread.unreadCount > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 bg-[#D4AF37] text-[#0F172A] text-xs font-bold rounded-full flex items-center justify-center">
                    {thread.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message view */}
      <div className="flex-1 flex flex-col">
        {!activeThread ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Select a conversation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white">
              <Avatar
                src={activeThread.dancer.profilePhoto}
                firstName={activeThread.dancer.firstName}
                lastName={activeThread.dancer.lastName}
                size="sm"
              />
              <p className="font-semibold text-[#0F172A]">
                {activeThread.dancer.displayName || `${activeThread.dancer.firstName} ${activeThread.dancer.lastName}`}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isMe = msg.senderId === myId
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? 'bg-[#0F172A] text-white rounded-br-sm'
                          : 'bg-slate-100 text-[#0F172A] rounded-bl-sm'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-white/50' : 'text-slate-400'}`}>
                        {format(new Date(msg.createdAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 bg-white flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
              />
              <Button onClick={sendMessage} loading={sending} disabled={!draft.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
