"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { CodeBlock } from "./code-block"
import { ImageViewer } from "./image-viewer"
import { MarkdownRenderer } from "./markdown-renderer"
import { parseResponse } from "@/lib/response-parser"
import type { ResponseBlock, ModelResponse } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Copy, Check, Code, ImageIcon, FileText } from 'lucide-react'
import { cn } from "@/lib/utils"

interface ResponseViewerProps {
  response: ModelResponse
  className?: string
}

export function ResponseViewer({ response, className }: ResponseViewerProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("all")

  // Parse the response to identify different content blocks (text, code, images)
  const blocks = parseResponse(response.response)

  // Filter blocks by type for the tabs
  const textBlocks = blocks.filter((block) => block.type === "text")
  const codeBlocks = blocks.filter((block) => block.type === "code")
  const imageBlocks = blocks.filter((block) => block.type === "image")

  // Count of each block type for the tab labels
  const textCount = textBlocks.length
  const codeCount = codeBlocks.length
  const imageCount = imageBlocks.length

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response.response)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="all" className="text-xs">
              Tudo
            </TabsTrigger>
            {textCount > 0 && (
              <TabsTrigger value="text" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Texto {textCount > 1 && `(${textCount})`}
              </TabsTrigger>
            )}
            {codeCount > 0 && (
              <TabsTrigger value="code" className="text-xs">
                <Code className="h-3 w-3 mr-1" />
                Código {codeCount > 1 && `(${codeCount})`}
              </TabsTrigger>
            )}
            {imageCount > 0 && (
              <TabsTrigger value="image" className="text-xs">
                <ImageIcon className="h-3 w-3 mr-1" />
                Imagens {imageCount > 1 && `(${imageCount})`}
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 px-2">
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="sr-only">Copy to clipboard</span>
        </Button>
      </div>

      <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
        <TabsContent value="all" className="mt-0 space-y-4">
          {blocks.map((block, index) => (
            <RenderBlock key={index} block={block} />
          ))}
        </TabsContent>

        <TabsContent value="text" className="mt-0 space-y-4">
          {textBlocks.map((block, index) => (
            <RenderBlock key={index} block={block} />
          ))}
        </TabsContent>

        <TabsContent value="code" className="mt-0 space-y-4">
          {codeBlocks.map((block, index) => (
            <RenderBlock key={index} block={block} />
          ))}
        </TabsContent>

        <TabsContent value="image" className="mt-0 space-y-4">
          {imageBlocks.map((block, index) => (
            <RenderBlock key={index} block={block} />
          ))}
        </TabsContent>
      </div>
    </div>
  )
}

// Melhorar o componente RenderBlock para lidar melhor com diferentes tipos de conteúdo
function RenderBlock({ block }: { block: ResponseBlock }) {
  switch (block.type) {
    case "text":
      return <MarkdownRenderer content={block.content} />
    case "code":
      return (
        <Card className="overflow-hidden">
          <CodeBlock code={block.content} language={block.language || "plaintext"} />
        </Card>
      )
    case "image":
      return <ImageViewer src={block.content || "/placeholder.svg"} alt={block.alt || "Generated image"} />
    default:
      return <p className="text-sm">{block.content}</p>
  }
}

export default ResponseViewer
