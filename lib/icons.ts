import { uploadToR2 } from "./r2"

export type IconData = {
  id: string
  prompt: string
  imageUrl: string
  animatedUrl: string | null
  createdAt: number
}

// Esta função agora é um wrapper para a função saveIcon em lib/db.ts
export async function saveIcon(prompt: string, imageUrl: string, animatedUrl: string | null): Promise<IconData> {
  // Implementação mínima para compatibilidade
  return {
    id: crypto.randomUUID(),
    prompt,
    imageUrl,
    animatedUrl,
    createdAt: Date.now(),
  }
}

// Esta função agora é um wrapper para a função uploadToR2 em lib/r2.ts
export async function uploadToBlob(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  try {
    // Usar a função uploadToR2 do lib/r2.ts
    return await uploadToR2(buffer, filename, contentType)
  } catch (error) {
    console.error("Error uploading to blob storage:", error)
    throw new Error("Failed to upload file")
  }
}

// Função para obter ícones recentes (implementação mínima)
export async function getRecentIcons(): Promise<IconData[]> {
  return []
}
