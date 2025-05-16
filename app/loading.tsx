import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
    </div>
  )
}
