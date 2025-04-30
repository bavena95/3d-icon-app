import type { ResponseBlock } from "./types"

/**
 * Parse a response string to identify different content blocks (text, code, images)
 */
export function parseResponse(response: string): ResponseBlock[] {
  const blocks: ResponseBlock[] = []

  // Regular expressions to identify different content types
  const codeBlockRegex = /\`\`\`([a-zA-Z0-9_-]*)?\n([\s\S]*?)\`\`\`/g
  const inlineImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  const htmlImageRegex = /<img\s+[^>]*src="([^"]*)"[^>]*>/g

  // Keep track of the last index we've processed
  let lastIndex = 0
  let match: RegExpExecArray | null

  // First, extract code blocks
  while ((match = codeBlockRegex.exec(response)) !== null) {
    // If there's text before this code block, add it as a text block
    if (match.index > lastIndex) {
      const textContent = response.substring(lastIndex, match.index).trim()
      if (textContent) {
        blocks.push({
          type: "text",
          content: textContent,
        })
      }
    }

    // Add the code block
    blocks.push({
      type: "code",
      language: match[1] || "plaintext",
      content: match[2].trim(),
    })

    // Update the last index
    lastIndex = match.index + match[0].length
  }

  // Add any remaining text after the last code block
  if (lastIndex < response.length) {
    const remainingContent = response.substring(lastIndex).trim()
    if (remainingContent) {
      blocks.push({
        type: "text",
        content: remainingContent,
      })
    }
  }

  // Process the blocks to extract images from text blocks
  const processedBlocks: ResponseBlock[] = []
  
  for (const block of blocks) {
    if (block.type === "code") {
      processedBlocks.push(block)
      continue
    }

    const textContent = block.content
    let textLastIndex = 0
    let textBlocks: ResponseBlock[] = []
    
    // Extract markdown images
    while ((match = inlineImageRegex.exec(textContent)) !== null) {
      if (match.index > textLastIndex) {
        const textBeforeImage = textContent.substring(textLastIndex, match.index).trim()
        if (textBeforeImage) {
          textBlocks.push({
            type: "text",
            content: textBeforeImage,
          })
        }
      }

      textBlocks.push({
        type: "image",
        content: match[2], // The image URL
        alt: match[1] || "Image",
      })

      textLastIndex = match.index + match[0].length
    }

    // Extract HTML images
    let htmlContent = textLastIndex < textContent.length ? textContent.substring(textLastIndex) : ""
    textLastIndex = 0
    
    if (htmlContent) {
      let htmlBlocks: ResponseBlock[] = []
      
      while ((match = htmlImageRegex.exec(htmlContent)) !== null) {
        if (match.index > textLastIndex) {
          const textBeforeImage = htmlContent.substring(textLastIndex, match.index).trim()
          if (textBeforeImage) {
            htmlBlocks.push({
              type: "text",
              content: textBeforeImage,
            })
          }
        }

        htmlBlocks.push({
          type: "image",
          content: match[1], // The image URL
          alt: "Image",
        })

        textLastIndex = match.index + match[0].length
      }

      if (textLastIndex < htmlContent.length) {
        const remainingHtml = htmlContent.substring(textLastIndex).trim()
        if (remainingHtml) {
          htmlBlocks.push({
            type: "text",
            content: remainingHtml,
          })
        }
      }

      if (htmlBlocks.length > 0) {
        textBlocks = [...textBlocks, ...htmlBlocks]
      } else if (htmlContent.trim()) {
        textBlocks.push({
          type: "text",
          content: htmlContent,
        })
      }
    }

    if (textBlocks.length > 0) {
      processedBlocks.push(...textBlocks)
    } else if (textContent.trim()) {
      processedBlocks.push({
        type: "text",
        content: textContent,
      })
    }
  }

  return processedBlocks.length > 0 ? processedBlocks : blocks
}

/**
 * Detect if a response contains code blocks
 */
export function containsCode(response: string): boolean {
  const codeBlockRegex = /\`\`\`([a-zA-Z0-9_-]*)?\n([\s\S]*?)\`\`\`/g
  return codeBlockRegex.test(response)
}

/**
 * Detect if a response contains images
 */
export function containsImages(response: string): boolean {
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  const htmlImageRegex = /<img\s+[^>]*src="([^"]*)"[^>]*>/g
  return markdownImageRegex.test(response) || htmlImageRegex.test(response)
}
