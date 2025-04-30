"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Download, Maximize, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from "@/lib/utils"

interface ImageViewerProps {
  src: string
  alt?: string
  className?: string
}

export function ImageViewer({ src, alt = "Generated image", className }: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [imageError, setImageError] = useState(false)

  // Normalize image source if it's a placeholder
  const imageSrc = src.startsWith("/placeholder") || src.includes("placeholder.svg") 
    ? src 
    : (src || "/placeholder.svg?key=b4fs1")

  const downloadImage = () => {
    // For placeholder images, we can't directly download them
    if (imageSrc.includes("placeholder.svg")) {
      // Create a canvas to draw the image and then download it
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()
      img.crossOrigin = "anonymous"
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        try {
          const link = document.createElement("a")
          link.download = "generated-image.png"
          link.href = canvas.toDataURL("image/png")
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } catch (e) {
          console.error("Error downloading image:", e)
        }
      }
      
      img.src = imageSrc
    } else {
      // For regular images, download directly
      const link = document.createElement("a")
      link.href = imageSrc
      link.download = "generated-image.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleReset = () => {
    setZoom(1)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className={cn("relative group rounded-lg overflow-hidden border", className)}>
      <div className="relative aspect-video w-full">
        <Image
          src={imageError ? "/placeholder.svg?height=400&width=600&query=image%20error" : imageSrc}
          alt={alt}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          onError={handleImageError}
        />
      </div>

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-black/20 transition-colors" />

      <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md bg-background/80 backdrop-blur-sm">
              <Maximize className="h-3.5 w-3.5" />
              <span className="sr-only">View full size</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-screen-lg w-full p-1 sm:p-2">
            <div className="relative h-[80vh] w-full overflow-auto custom-scrollbar">
              <div
                className="relative min-h-full min-w-full flex items-center justify-center"
                style={{ transform: `scale(${zoom})` }}
              >
                <Image
                  src={imageError ? "/placeholder.svg?height=800&width=1200&query=image%20error" : imageSrc}
                  alt={alt}
                  width={1200}
                  height={800}
                  className="object-contain max-w-full max-h-full transition-transform"
                  unoptimized
                  onError={handleImageError}
                />
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-1 rounded-full border shadow-sm">
              <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 0.5}>
                <ZoomOut className="h-4 w-4" />
                <span className="sr-only">Zoom out</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs px-2 h-8">
                {Math.round(zoom * 100)}%
              </Button>
              <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 3}>
                <ZoomIn className="h-4 w-4" />
                <span className="sr-only">Zoom in</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md bg-background/80 backdrop-blur-sm"
          onClick={downloadImage}
        >
          <Download className="h-3.5 w-3.5" />
          <span className="sr-only">Download image</span>
        </Button>
      </div>
    </div>
  )
}
