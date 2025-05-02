"use client"

import { useMemo } from "react"
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
  // Garantir que o conteúdo seja uma string válida
  const safeContent = useMemo(() => {
    if (!content || typeof content !== "string") return ""
    return content
  }, [content])

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ className, children, ...props }) => (
            <h1 className={cn("text-xl font-bold mt-6 mb-4 first:mt-0", className)} {...props}>
              {children}
            </h1>
          ),
          h2: ({ className, children, ...props }) => (
            <h2 className={cn("text-lg font-bold mt-6 mb-3", className)} {...props}>
              {children}
            </h2>
          ),
          h3: ({ className, children, ...props }) => (
            <h3 className={cn("text-base font-bold mt-5 mb-2", className)} {...props}>
              {children}
            </h3>
          ),
          p: ({ className, children, ...props }) => (
            <p className={cn("leading-7 mb-4", className)} {...props}>
              {children}
            </p>
          ),
          ul: ({ className, children, ...props }) => (
            <ul className={cn("list-disc pl-6 mb-4", className)} {...props}>
              {children}
            </ul>
          ),
          ol: ({ className, children, ...props }) => (
            <ol className={cn("list-decimal pl-6 mb-4", className)} {...props}>
              {children}
            </ol>
          ),
          li: ({ className, children, ...props }) => (
            <li className={cn("mb-1", className)} {...props}>
              {children}
            </li>
          ),
          a: ({ className, href, children, ...props }) => {
            // Verificar se o href é válido
            const safeHref = href || "#"
            return (
              <a
                className={cn("text-primary underline underline-offset-4", className)}
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            )
          },
          blockquote: ({ className, children, ...props }) => (
            <blockquote className={cn("border-l-2 pl-4 italic text-muted-foreground", className)} {...props}>
              {children}
            </blockquote>
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "")
            const language = match ? match[1] : ""

            if (!inline && language) {
              const codeContent = String(children || "").replace(/\n$/, "")
              return (
                <div className="my-4">
                  <CodeBlock code={codeContent} language={language} showLineNumbers={true} />
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
            // Garantir que temos um src válido
            const safeSrc = src || "/abstract-colorful-swirls.png"
            const safeAlt = alt || "Image"

            return (
              <div className="my-4">
                <ImageViewer src={safeSrc || "/placeholder.svg"} alt={safeAlt} />
              </div>
            )
          },
          table: ({ className, children, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className={cn("w-full text-sm border-collapse", className)} {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ className, children, ...props }) => (
            <th className={cn("border px-3 py-2 text-left font-medium", className)} {...props}>
              {children}
            </th>
          ),
          td: ({ className, children, ...props }) => (
            <td className={cn("border px-3 py-2", className)} {...props}>
              {children}
            </td>
          ),
          // Adicionar tratamento para outros elementos comuns
          hr: ({ className, ...props }) => <hr className={cn("my-6 border-t border-border", className)} {...props} />,
          pre: ({ className, children, ...props }) => (
            <pre className={cn("overflow-auto p-0 bg-transparent", className)} {...props}>
              {children}
            </pre>
          ),
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  )
}
