"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const showcaseItems = [
  {
    id: 1,
    prompt: "Um ícone de foguete espacial com detalhes futuristas",
    before: "/placeholder-before-1.png",
    after: "/placeholder-after-1.png",
  },
  {
    id: 2,
    prompt: "Um ícone de câmera fotográfica vintage",
    before: "/placeholder-before-2.png",
    after: "/placeholder-after-2.png",
  },
  {
    id: 3,
    prompt: "Um ícone de planta em vaso com estilo minimalista",
    before: "/placeholder-before-3.png",
    after: "/placeholder-after-3.png",
  },
]

export default function BeforeAfterShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? showcaseItems.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === showcaseItems.length - 1 ? 0 : prev + 1))
  }

  const currentItem = showcaseItems[currentIndex]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="bg-white rounded-xl overflow-hidden shadow-md p-6">
          <h3 className="text-lg font-medium mb-4">Prompt</h3>
          <p className="text-gray-600 mb-6">"{currentItem.prompt}"</p>

          <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={currentItem.before || "/placeholder.svg"}
              alt="Conceito original"
              fill
              className="object-contain p-4"
            />
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">Conceito</p>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-md p-6">
          <h3 className="text-lg font-medium mb-4">Resultado</h3>
          <p className="text-gray-600 mb-6">Ícone 3D gerado pela IA</p>

          <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={currentItem.after || "/placeholder.svg"}
              alt="Ícone 3D gerado"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">Ícone 3D</p>
        </div>
      </div>

      <div className="flex justify-center mt-8 space-x-4">
        <Button variant="outline" size="icon" className="rounded-full" onClick={goToPrevious}>
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex space-x-2">
          {showcaseItems.map((_, index) => (
            <button
              key={index}
              className={`w-2.5 h-2.5 rounded-full ${index === currentIndex ? "bg-black" : "bg-gray-300"}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>

        <Button variant="outline" size="icon" className="rounded-full" onClick={goToNext}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
