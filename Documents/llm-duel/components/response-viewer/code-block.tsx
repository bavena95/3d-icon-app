"use client"

import { useState } from "react"
import { Highlight, themes } from "prism-react-renderer"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Copy, Check, Download } from 'lucide-react'
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  language: string
  showLineNumbers?: boolean
  className?: string
}

export function CodeBlock({ code, language, showLineNumbers = true, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Normalize language identifier
  const normalizedLanguage = normalizeLanguage(language)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code: ", err)
    }
  }

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `code.${normalizedLanguage}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={cn("relative group", className)}>
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md bg-background/80 backdrop-blur-sm"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="sr-only">Copy code</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md bg-background/80 backdrop-blur-sm"
          onClick={downloadCode}
        >
          <Download className="h-3.5 w-3.5" />
          <span className="sr-only">Download code</span>
        </Button>
      </div>

      <div className="text-xs font-mono px-4 py-1 border-b bg-muted/50">{normalizedLanguage}</div>

      <Highlight theme={isDark ? themes.nightOwl : themes.github} code={code.trim()} language={normalizedLanguage}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={cn("p-4 overflow-x-auto text-sm font-mono custom-scrollbar", className)} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {showLineNumbers && (
                  <span className="inline-block w-6 mr-4 text-right opacity-50 select-none">{i + 1}</span>
                )}
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}

// Helper function to normalize language identifiers
function normalizeLanguage(language: string): string {
  language = language.toLowerCase().trim()
  
  // Map common aliases to standard language identifiers
  const languageMap: Record<string, string> = {
    "js": "javascript",
    "ts": "typescript",
    "py": "python",
    "rb": "ruby",
    "cs": "csharp",
    "c#": "csharp",
    "sh": "bash",
    "shell": "bash",
    "yml": "yaml",
    "jsx": "javascript",
    "tsx": "typescript",
    "md": "markdown",
    "html": "html",
    "css": "css",
    "json": "json",
    "sql": "sql",
    "go": "go",
    "rust": "rust",
    "java": "java",
    "php": "php",
    "c": "c",
    "cpp": "cpp",
    "c++": "cpp",
  }

  return languageMap[language] || language || "plaintext"
}
