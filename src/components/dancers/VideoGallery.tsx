'use client'

import { useState } from 'react'
import { Play, ExternalLink } from 'lucide-react'
import type { Video } from '@prisma/client'

function getVideoThumbnail(platform: string, url: string): string | null {
  if (platform === 'YOUTUBE') {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
  }
  return null
}

interface VideoGalleryProps {
  videos: Video[]
}

function getEmbedUrl(platform: string, url: string): string | null {
  if (platform === 'YOUTUBE') {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    if (match) return `https://www.youtube.com/embed/${match[1]}`
  }
  return null
}

export function VideoGallery({ videos }: VideoGalleryProps) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null)

  if (videos.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <Play className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No videos added yet</p>
      </div>
    )
  }

  return (
    <div>
      {activeVideo && (
        <div className="mb-4">
          {getEmbedUrl(activeVideo.platform, activeVideo.url) ? (
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={getEmbedUrl(activeVideo.platform, activeVideo.url)!}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <a href={activeVideo.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#D4AF37] flex items-center gap-1">
              <ExternalLink className="w-4 h-4" /> Open video
            </a>
          )}
          {activeVideo.title && <p className="text-sm font-medium text-slate-700 mt-2">{activeVideo.title}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {videos.map((video) => {
          const thumb = video.thumbnailUrl || getVideoThumbnail(video.platform, video.url)
          const isActive = activeVideo?.id === video.id
          return (
            <button
              key={video.id}
              onClick={() => setActiveVideo(isActive ? null : video)}
              className={`relative aspect-video rounded-lg overflow-hidden bg-[#0F172A] group border-2 transition-all ${
                isActive ? 'border-[#D4AF37]' : 'border-transparent hover:border-[#D4AF37]/50'
              }`}
            >
              {thumb ? (
                <img src={thumb} alt={video.title || 'Video'} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-[#D4AF37]/60" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-[#0F172A] ml-0.5" />
                </div>
              </div>
              {video.title && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white text-xs truncate">{video.title}</p>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
