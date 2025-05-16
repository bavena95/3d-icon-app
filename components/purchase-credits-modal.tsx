"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, Coins, Loader2 } from "lucide-react"
import { useCredits } from "@/hooks/use-credits"
import { useToast } from "@/hooks/use-toast"

interface PurchaseCreditsModalProps {
  open: boolean
  onClose: () => void
}

const plans = [
  {
    id: "single",
    name: "Single Icon",
    credits: 1,
    price: 2.4,
    priceDisplay: "$2.40",
    features: ["1 3D icon", "High resolution", "Commercial use", "No watermark"],
  },
  {
    id: "small",
    name: "Small Pack",
    credits: 10,
    price: 19.9,
    priceDisplay: "$19.90",
    popular: true,
    features: ["10 3D icons", "High resolution", "Commercial use", "No watermark", "Priority support"],
  },
  {
    id: "medium",
    name: "Medium Pack",
    credits: 30,
    price: 49.9,
    priceDisplay: "$49.90",
    features: ["30 3D icons", "High resolution", "Commercial use", "No watermark", "Priority support"],
  },
  {
    id: "large",
    name: "Large Pack",
    credits: 50,
    price: 74.9,
    priceDisplay: "$74.90",
    features: ["50 3D icons", "High resolution", "Commercial use", "No watermark", "Priority support"],
  },
  {
    id: "xlarge",
    name: "XL Pack",
    credits: 100,
    price: 129.9,
    priceDisplay: "$129.90",
    features: ["100 3D icons", "High resolution", "Commercial use", "No watermark", "Priority support"],
  },
]

export default function PurchaseCreditsModal({ open, onClose }: PurchaseCreditsModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { addCredits } = useCredits()
  const { toast } = useToast()

  const handlePurchase = async () => {
    if (!selectedPlan) return

    const plan = plans.find((p) => p.id === selectedPlan)
    if (!plan) return

    setIsProcessing(true)

    try {
      // Call API to add credits
      await addCredits(plan.credits, plan.price)

      toast({
        title: "Purchase successful!",
        description: `${plan.credits} credits have been added to your account.`,
      })

      onClose()
    } catch (error) {
      console.error("Error processing purchase:", error)

      toast({
        title: "Error processing purchase",
        description: "Could not complete your purchase. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Buy Credits</DialogTitle>
          <DialogDescription>Choose a plan to continue creating amazing 3D icons.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {plans.slice(0, 3).map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg overflow-hidden border ${
                selectedPlan === plan.id
                  ? "border-black ring-2 ring-black"
                  : plan.popular
                    ? "border-gray-300"
                    : "border-gray-200"
              } cursor-pointer transition-all`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="bg-black text-white py-1 px-3 text-center">
                  <span className="text-xs font-medium">Most Popular</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-medium">{plan.name}</h3>
                <div className="mt-2 mb-3">
                  <span className="text-2xl font-bold">{plan.priceDisplay}</span>
                </div>
                <div className="flex items-center mb-3">
                  <Coins className="h-4 w-4 text-amber-500 mr-1.5" />
                  <span className="text-sm">{plan.credits} credits</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-1.5 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {plans.slice(3).map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg overflow-hidden border ${
                selectedPlan === plan.id ? "border-black ring-2 ring-black" : "border-gray-200"
              } cursor-pointer transition-all`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{plan.name}</h3>
                  <span className="text-xl font-bold">{plan.priceDisplay}</span>
                </div>
                <div className="flex items-center mt-2">
                  <Coins className="h-4 w-4 text-amber-500 mr-1.5" />
                  <span className="text-sm">{plan.credits} credits</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    ${(plan.price / plan.credits).toFixed(2)} per icon
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            className="bg-black text-white hover:bg-gray-800"
            disabled={!selectedPlan || isProcessing}
            onClick={handlePurchase}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Buy Now"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
