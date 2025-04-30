/**
 * Detecta se uma resposta contém blocos de código
 */
export function containsCode(response: string): boolean {
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)?\n([\s\S]*?)```/g
  return codeBlockRegex.test(response)
}

/**
 * Detecta se uma resposta contém imagens
 */
export function containsImages(response: string): boolean {
  const markdownImageRegex = /!\[([^\]]*)\]$$([^)]+)$$/g
  const htmlImageRegex = /<img\s+[^>]*src="([^"]*)"[^>]*>/g
  return markdownImageRegex.test(response) || htmlImageRegex.test(response)
}
