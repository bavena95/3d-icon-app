import crypto from "crypto"
import sql from "./db"

// Interface para os itens do cache
export interface CacheItem {
  id: string
  promptHash: string
  prompt: string
  staticUrl: string
  animatedUrl: string | null
  createdAt: Date
  lastAccessedAt: Date
  accessCount: number
}

/**
 * Normaliza um prompt para melhorar a taxa de acertos do cache
 * Remove espaços extras, converte para minúsculas, etc.
 */
export function normalizePrompt(prompt: string): string {
  return prompt.trim().toLowerCase().replace(/\s+/g, " ")
}

/**
 * Gera um hash para um prompt
 */
export function hashPrompt(prompt: string): string {
  const normalized = normalizePrompt(prompt)
  return crypto.createHash("md5").update(normalized).digest("hex")
}

/**
 * Verifica se um prompt está no cache
 */
export async function checkCache(prompt: string): Promise<CacheItem | null> {
  const hash = hashPrompt(prompt)

  try {
    const results = await sql<CacheItem[]>`
      SELECT 
        id, 
        prompt_hash as "promptHash", 
        prompt, 
        static_url as "staticUrl", 
        animated_url as "animatedUrl", 
        created_at as "createdAt", 
        last_accessed_at as "lastAccessedAt",
        access_count as "accessCount"
      FROM icon_cache 
      WHERE prompt_hash = ${hash}
      LIMIT 1
    `

    if (results.length > 0) {
      // Atualizar o contador de acessos e o timestamp de último acesso
      await sql`
        UPDATE icon_cache 
        SET 
          access_count = access_count + 1,
          last_accessed_at = NOW()
        WHERE id = ${results[0].id}
      `

      return results[0]
    }

    return null
  } catch (error) {
    console.error("Erro ao verificar cache:", error)
    return null
  }
}

/**
 * Adiciona um item ao cache
 */
export async function addToCache(prompt: string, staticUrl: string, animatedUrl: string | null): Promise<CacheItem> {
  const hash = hashPrompt(prompt)
  const id = crypto.randomUUID()

  try {
    const results = await sql<CacheItem[]>`
      INSERT INTO icon_cache (
        id, 
        prompt_hash, 
        prompt, 
        static_url, 
        animated_url, 
        created_at, 
        last_accessed_at, 
        access_count
      )
      VALUES (
        ${id}, 
        ${hash}, 
        ${prompt}, 
        ${staticUrl}, 
        ${animatedUrl}, 
        NOW(), 
        NOW(), 
        1
      )
      ON CONFLICT (prompt_hash) 
      DO UPDATE SET 
        access_count = icon_cache.access_count + 1,
        last_accessed_at = NOW()
      RETURNING 
        id, 
        prompt_hash as "promptHash", 
        prompt, 
        static_url as "staticUrl", 
        animated_url as "animatedUrl", 
        created_at as "createdAt", 
        last_accessed_at as "lastAccessedAt",
        access_count as "accessCount"
    `

    return results[0]
  } catch (error) {
    console.error("Erro ao adicionar ao cache:", error)
    throw error
  }
}

/**
 * Remove itens antigos do cache
 * @param days Número de dias para manter itens no cache
 */
export async function cleanupCache(days = 30): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM icon_cache
      WHERE last_accessed_at < NOW() - INTERVAL '${days} days'
      RETURNING id
    `

    return result.length
  } catch (error) {
    console.error("Erro ao limpar cache:", error)
    return 0
  }
}

/**
 * Obtém estatísticas do cache
 */
export async function getCacheStats(): Promise<{
  totalItems: number
  totalHits: number
  oldestItem: Date | null
  newestItem: Date | null
}> {
  try {
    const countResult = await sql<[{ count: number }]>`
      SELECT COUNT(*) as count FROM icon_cache
    `

    const hitsResult = await sql<[{ sum: number }]>`
      SELECT SUM(access_count) as sum FROM icon_cache
    `

    const oldestResult = await sql<[{ oldest: Date }]>`
      SELECT MIN(created_at) as oldest FROM icon_cache
    `

    const newestResult = await sql<[{ newest: Date }]>`
      SELECT MAX(created_at) as newest FROM icon_cache
    `

    return {
      totalItems: countResult[0]?.count || 0,
      totalHits: hitsResult[0]?.sum || 0,
      oldestItem: oldestResult[0]?.oldest || null,
      newestItem: newestResult[0]?.newest || null,
    }
  } catch (error) {
    console.error("Erro ao obter estatísticas do cache:", error)
    return {
      totalItems: 0,
      totalHits: 0,
      oldestItem: null,
      newestItem: null,
    }
  }
}
