"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"
import { CodeBlock } from "./code-block"
import { ImageViewer } from "./image-viewer"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ className, ...props }) => (
            <h1 className={cn("text-xl font-bold mt-6 mb-4 first:mt-0", className)} {...props} />
          ),
          h2: ({ className, ...props }) => <h2 className={cn("text-lg font-bold mt-6 mb-3", className)} {...props} />,
          h3: ({ className, ...props }) => <h3 className={cn("text-base font-bold mt-5 mb-2", className)} {...props} />,
          p: ({ className, ...props }) => <p className={cn("leading-7 mb-4", className)} {...props} />,
          ul: ({ className, ...props }) => <ul className={cn("list-disc pl-6 mb-4", className)} {...props} />,
          ol: ({ className, ...props }) => <ol className={cn("list-decimal pl-6 mb-4", className)} {...props} />,
          li: ({ className, ...props }) => <li className={cn("mb-1", className)} {...props} />,
          a: ({ className, ...props }) => (
            <a
              className={cn("text-primary underline underline-offset-4", className)}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          blockquote: ({ className, ...props }) => (
            <blockquote className={cn("border-l-2 pl-4 italic text-muted-foreground", className)} {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "")
            const language = match ? match[1] : ""
            
            if (!inline && language) {
              return (
                <div className="my-4">
                  <CodeBlock 
                    code={String(children).replace(/\n$/, "")} 
                    language={language} 
                    showLineNumbers={true}
                  />
                </div>
              )
            }
            
            return (
              <code className={cn("bg-muted px-1.5 py-0.5 rounded text-sm font-mono", className)} {...props}>
                {children}
              </code>
            )
          },
          img: ({ src, alt, ...props }) => {
            if (src) {
              return (
                <div className="my-4">
                  <ImageViewer src={src || "/placeholder.svg"} alt={alt || "Image"} />
                </div>
              )
            }
            return <img src={src || "/placeholder.svg"} alt={alt} {...props} />
          },
          table: ({ className, ...props }) => (
            <div className="overflow-x-auto">
              <table className={cn("w-full text-sm border-collapse", className)} {...props} />
            </div>
          ),
          th: ({ className, ...props }) => (
            <th className={cn("border px-3 py-2 text-left font-medium", className)} {...props} />
          ),
          td: ({ className, ...props }) => <td className={cn("border px-3 py-2", className)} {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
