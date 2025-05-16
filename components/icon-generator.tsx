"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowRight, Download, RefreshCw, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { useCredits } from "@/hooks/use-credits"
import CreditBadge from "@/components/credit-badge"
import PurchaseCreditsModal from "@/components/purchase-credits-modal"
import { useUser } from "@clerk/nextjs"

interface IconResult {
  id: string
  prompt: string
  staticUrl: string
  animatedUrl: string | null
  createdAt: string
  fromCache?: boolean
}

export default function IconGenerator() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedIcon, setGeneratedIcon] = useState<IconResult | null>(null)
  const [currentStep, setCurrentStep] = useState<"idle" | "generating" | "animating" | "complete">("idle")
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [skipCache, setSkipCache] = useState(false)
  const { toast } = useToast()
  const { credits, decrementCredits, refreshCredits } = useCredits()
  const { isSignedIn } = useUser()

  // Update the function handleSubmit to handle API errors better
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for the icon",
        variant: "destructive",
      })
      return
    }

    if (!isSignedIn) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to generate icons",
        variant: "destructive",
      })
      return
    }

    if (credits <= 0) {
      setShowPurchaseModal(true)
      return
    }

    try {
      setIsGenerating(true)
      setCurrentStep("generating")
      setGeneratedIcon(null)

      // Create FormData to send the prompt
      const formData = new FormData()
      formData.append("prompt", prompt)

      // Add option to skip cache
      if (skipCache) {
        formData.append("skipCache", "true")
      }

      // Call API to generate the icon
      const response = await fetch("/api/icons", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate icon")
      }

      const data = await response.json()

      if (!data.success || !data.icon) {
        throw new Error("Invalid server response")
      }

      // Update state with the generated icon
      setGeneratedIcon(data.icon)
      setCurrentStep("complete")

      // Update credits only if not from cache
      if (!data.icon.fromCache) {
        await refreshCredits()
      }

      toast({
        title: "Success!",
        description: data.icon.fromCache
          ? "Icon found in cache! No credit was consumed."
          : "Your 3D icon was successfully generated using OpenAI's GPT-Image-1 model",
      })
    } catch (error) {
      console.error("Error generating icon:", error)

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate icon. Please try again.",
        variant: "destructive",
      })

      // If there was an error, update credits to ensure consistency
      await refreshCredits()
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Prompt input area */}
        {!generatedIcon && (
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="prompt" className="text-sm font-medium text-gray-700">
                  Describe your icon
                </label>
                <CreditBadge credits={credits} />
              </div>

              <Textarea
                id="prompt"
                placeholder="e.g., A 3D rocket icon with futuristic details and vibrant colors"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                className="min-h-[120px] resize-none border-gray-200 focus:ring-black focus:border-black rounded-lg"
              />

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="skipCache"
                    checked={skipCache}
                    onChange={(e) => setSkipCache(e.target.checked)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="skipCache" className="text-sm text-gray-500">
                    Skip cache (consumes 1 credit)
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isGenerating || !prompt.trim() || credits <= 0}
                  className="bg-black text-white hover:bg-gray-800 rounded-full px-6"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {currentStep === "generating" ? "Generating..." : "Animating..."}
                    </>
                  ) : (
                    <>
                      Generate Icon
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Generation result */}
        {generatedIcon && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <h3 className="text-lg font-medium">Your icon is ready!</h3>
                {generatedIcon.fromCache && (
                  <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                    <Database className="h-3 w-3 mr-1" />
                    From cache
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-sm border-gray-200 hover:bg-gray-50"
                onClick={() => {
                  setPrompt("")
                  setGeneratedIcon(null)
                  setCurrentStep("idle")
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Create New
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                <div className="relative w-full aspect-square mb-4">
                  <Image
                    src={generatedIcon.staticUrl || "/placeholder.svg"}
                    alt="Generated icon"
                    fill
                    className="object-contain"
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full border-gray-200 hover:bg-gray-50"
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = generatedIcon.staticUrl
                    link.download = `icon3d-${generatedIcon.id}.png`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PNG
                </Button>
              </div>

              {generatedIcon.animatedUrl && (
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <div className="relative w-full aspect-square mb-4">
                    {/* If it's a video, use the video element */}
                    {generatedIcon.animatedUrl.endsWith(".mp4") ? (
                      <video
                        src={generatedIcon.animatedUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Image
                        src={generatedIcon.animatedUrl || "/placeholder.svg"}
                        alt="Animated icon"
                        fill
                        className="object-contain"
                      />
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-gray-200 hover:bg-gray-50"
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = generatedIcon.animatedUrl!
                      link.download = `icon3d-animated-${generatedIcon.id}.${
                        generatedIcon.animatedUrl!.endsWith(".mp4") ? "mp4" : "png"
                      }`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download {generatedIcon.animatedUrl.endsWith(".mp4") ? "MP4" : "PNG"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <PurchaseCreditsModal open={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} />
    </>
  )
}
