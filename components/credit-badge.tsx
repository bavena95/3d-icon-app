import { Coins } from "lucide-react"

interface CreditBadgeProps {
  credits: number
}

export default function CreditBadge({ credits }: CreditBadgeProps) {
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
      <Coins className="h-4 w-4 text-amber-500 mr-1.5" />
      <span className="text-sm font-medium">
        {credits} {credits === 1 ? "crédito" : "créditos"}
      </span>
    </div>
  )
}
