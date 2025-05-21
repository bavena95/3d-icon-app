import crypto from "crypto"
import { createRouteHandlerClient } from "./supabase"
import { v4 as uuidv4 } from "uuid"

// Interface para os itens do cache
export interface CacheItem {
  id: string
  promptHash: string
  prompt: string
  staticUrl: string
  animatedUrl: string | null
  createdAt: string
  lastAccessedAt: string
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
  const supabase = createRouteHandlerClient()

  try {
    // Buscar o item no cache
    const { data, error } = await supabase.from("icon_cache").select("*").eq("prompt_hash", hash).single()

    if (error || !data) {
      return null
    }

    // Atualizar o contador de acessos e o timestamp de último acesso
    await supabase
      .from("icon_cache")
      .update({
        access_count: data.access_count + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq("id", data.id)

    return {
      id: data.id,
      promptHash: data.prompt_hash,
      prompt: data.prompt,
      staticUrl: data.static_url,
      animatedUrl: data.animated_url,
      createdAt: data.created_at,
      lastAccessedAt: data.last_accessed_at,
      accessCount: data.access_count,
    }
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
  const id = uuidv4()
  const supabase = createRouteHandlerClient()

  try {
    // Verificar se o item já existe no cache
    const { data: existingData } = await supabase.from("icon_cache").select("id").eq("prompt_hash", hash).single()

    if (existingData) {
      // Se o item já existe, atualizar o contador de acessos e o timestamp
      const { data, error } = await supabase
        .from("icon_cache")
        .update({
          access_count: existingData.access_count + 1,
          last_accessed_at: new Date().toISOString(),
        })
        .eq("id", existingData.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        id: data.id,
        promptHash: data.prompt_hash,
        prompt: data.prompt,
        staticUrl: data.static_url,
        animatedUrl: data.animated_url,
        createdAt: data.created_at,
        lastAccessedAt: data.last_accessed_at,
        accessCount: data.access_count,
      }
    }

    // Se o item não existe, inserir um novo
    const { data, error } = await supabase
      .from("icon_cache")
      .insert({
        id,
        prompt_hash: hash,
        prompt,
        static_url: staticUrl,
        animated_url: animatedUrl,
        created_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
        access_count: 1,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return {
      id: data.id,
      promptHash: data.prompt_hash,
      prompt: data.prompt,
      staticUrl: data.static_url,
      animatedUrl: data.animated_url,
      createdAt: data.created_at,
      lastAccessedAt: data.last_accessed_at,
      accessCount: data.access_count,
    }
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
  const supabase = createRouteHandlerClient()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  try {
    const { data, error } = await supabase
      .from("icon_cache")
      .delete()
      .lt("last_accessed_at", cutoffDate.toISOString())
      .select("id")

    if (error) {
      throw error
    }

    return data?.length || 0
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
  oldestItem: string | null
  newestItem: string | null
}> {
  const supabase = createRouteHandlerClient()

  try {
    // Obter contagem total de itens
    const { count: totalItems, error: countError } = await supabase
      .from("icon_cache")
      .select("*", { count: "exact", head: true })

    if (countError) {
      throw countError
    }

    // Obter soma total de acessos
    const { data: hitsData, error: hitsError } = await supabase.rpc("sum_access_count")

    if (hitsError) {
      console.error("Erro ao obter soma de acessos:", hitsError)
    }

    const totalHits = hitsData || 0

    // Obter item mais antigo
    const { data: oldestData, error: oldestError } = await supabase
      .from("icon_cache")
      .select("created_at")
      .order("created_at", { ascending: true })
      .limit(1)
      .single()

    if (oldestError && oldestError.code !== "PGRST116") {
      console.error("Erro ao obter item mais antigo:", oldestError)
    }

    // Obter item mais recente
    const { data: newestData, error: newestError } = await supabase
      .from("icon_cache")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (newestError && newestError.code !== "PGRST116") {
      console.error("Erro ao obter item mais recente:", newestError)
    }

    return {
      totalItems: totalItems || 0,
      totalHits,
      oldestItem: oldestData?.created_at || null,
      newestItem: newestData?.created_at || null,
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
