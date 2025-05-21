import { createRouteHandlerClient } from "./supabase"
import { v4 as uuidv4 } from "uuid"

// Tipos para nossas entidades
export type User = {
  id: string
  email: string
  name: string | null
  credits: number
  createdAt: string
  updatedAt: string
}

export type Icon = {
  id: string
  prompt: string
  staticUrl: string
  animatedUrl: string | null
  createdAt: string
  userId: string
}

export type Purchase = {
  id: string
  amount: number
  credits: number
  status: string
  provider: string
  createdAt: string
  userId: string
}

// Funções para usuários
export async function getUserById(userId: string): Promise<User | null> {
  const supabase = createRouteHandlerClient()

  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error || !data) {
    console.error("Error fetching user:", error)
    return null
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    credits: data.credits,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function createUser(
  userId: string,
  email: string,
  name: string | null = null,
  initialCredits = 3,
): Promise<User> {
  const supabase = createRouteHandlerClient()

  const { data, error } = await supabase
    .from("users")
    .insert({
      id: userId,
      email,
      name,
      credits: initialCredits,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating user:", error)
    throw new Error("Failed to create user")
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    credits: data.credits,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function updateUserEmail(userId: string, email: string): Promise<User> {
  const supabase = createRouteHandlerClient()

  const { data, error } = await supabase
    .from("users")
    .update({
      email,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating user email:", error)
    throw new Error("Failed to update user email")
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    credits: data.credits,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function deleteUser(userId: string): Promise<void> {
  const supabase = createRouteHandlerClient()

  const { error } = await supabase.from("users").delete().eq("id", userId)

  if (error) {
    console.error("Error deleting user:", error)
    throw new Error("Failed to delete user")
  }
}

export async function getUserCredits(userId: string): Promise<number> {
  const supabase = createRouteHandlerClient()

  const { data, error } = await supabase.from("users").select("credits").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user credits:", error)
    return 0
  }

  return data.credits
}

export async function addCreditsToUser(userId: string, amount: number): Promise<User> {
  const supabase = createRouteHandlerClient()

  // Primeiro, obtemos os créditos atuais
  const { data: userData, error: userError } = await supabase.from("users").select("credits").eq("id", userId).single()

  if (userError) {
    console.error("Error fetching user credits:", userError)
    throw new Error("Failed to fetch user credits")
  }

  // Atualizamos os créditos
  const { data, error } = await supabase
    .from("users")
    .update({
      credits: userData.credits + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error adding credits to user:", error)
    throw new Error("Failed to add credits to user")
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    credits: data.credits,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function decrementUserCredits(userId: string): Promise<User> {
  const supabase = createRouteHandlerClient()

  // Primeiro, obtemos os créditos atuais
  const { data: userData, error: userError } = await supabase.from("users").select("credits").eq("id", userId).single()

  if (userError) {
    console.error("Error fetching user credits:", userError)
    throw new Error("Failed to fetch user credits")
  }

  // Verificamos se o usuário tem créditos suficientes
  if (userData.credits <= 0) {
    throw new Error("Insufficient credits")
  }

  // Decrementamos os créditos
  const { data, error } = await supabase
    .from("users")
    .update({
      credits: userData.credits - 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error decrementing user credits:", error)
    throw new Error("Failed to decrement user credits")
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    credits: data.credits,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// Funções para ícones
export async function saveIcon(
  userId: string,
  prompt: string,
  staticUrl: string,
  animatedUrl: string | null,
): Promise<Icon> {
  const supabase = createRouteHandlerClient()

  const iconId = uuidv4()

  const { data, error } = await supabase
    .from("icons")
    .insert({
      id: iconId,
      prompt,
      static_url: staticUrl,
      animated_url: animatedUrl,
      created_at: new Date().toISOString(),
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving icon:", error)
    throw new Error("Failed to save icon")
  }

  return {
    id: data.id,
    prompt: data.prompt,
    staticUrl: data.static_url,
    animatedUrl: data.animated_url,
    createdAt: data.created_at,
    userId: data.user_id,
  }
}

export async function getUserIcons(userId: string, limit = 20): Promise<Icon[]> {
  const supabase = createRouteHandlerClient()

  const { data, error } = await supabase
    .from("icons")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching user icons:", error)
    return []
  }

  return data.map((icon) => ({
    id: icon.id,
    prompt: icon.prompt,
    staticUrl: icon.static_url,
    animatedUrl: icon.animated_url,
    createdAt: icon.created_at,
    userId: icon.user_id,
  }))
}

// Funções para compras
export async function recordPurchase(
  userId: string,
  amount: number,
  credits: number,
  provider = "manual",
): Promise<Purchase> {
  const supabase = createRouteHandlerClient()

  const purchaseId = uuidv4()

  const { data, error } = await supabase
    .from("purchases")
    .insert({
      id: purchaseId,
      amount,
      credits,
      status: "completed",
      provider,
      created_at: new Date().toISOString(),
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error recording purchase:", error)
    throw new Error("Failed to record purchase")
  }

  return {
    id: data.id,
    amount: data.amount,
    credits: data.credits,
    status: data.status,
    provider: data.provider,
    createdAt: data.created_at,
    userId: data.user_id,
  }
}

export async function getUserPurchases(userId: string, limit = 10): Promise<Purchase[]> {
  const supabase = createRouteHandlerClient()

  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching user purchases:", error)
    return []
  }

  return data.map((purchase) => ({
    id: purchase.id,
    amount: purchase.amount,
    credits: purchase.credits,
    status: purchase.status,
    provider: purchase.provider,
    createdAt: purchase.created_at,
    userId: purchase.user_id,
  }))
}

// Função para inicializar o banco de dados (criar tabelas se não existirem)
// Esta função não é necessária com o Supabase, pois as tabelas são criadas no console do Supabase
export async function initDatabase() {
  console.log("Database initialization is handled through the Supabase dashboard")
}
