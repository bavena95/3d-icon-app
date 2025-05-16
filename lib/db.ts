import postgres from "postgres"

// Configuração do cliente PostgreSQL
const sql = postgres(process.env.NEON_DATABASE_URL!, {
  ssl: true,
  max: 10, // Limite de conexões para ambiente serverless
})

export default sql

// Tipos para nossas entidades
export type User = {
  id: string
  email: string
  credits: number
  createdAt: Date
  updatedAt: Date
}

export type Icon = {
  id: string
  prompt: string
  staticUrl: string
  animatedUrl: string | null
  createdAt: Date
  userId: string
}

export type Purchase = {
  id: string
  amount: number
  credits: number
  status: string
  provider: string
  createdAt: Date
  userId: string
}

// Funções para usuários
export async function getUserById(userId: string): Promise<User | null> {
  const users = await sql<User[]>`
    SELECT * FROM users WHERE id = ${userId} LIMIT 1
  `
  return users.length > 0 ? users[0] : null
}

export async function createUser(userId: string, email: string, initialCredits = 3): Promise<User> {
  const users = await sql<User[]>`
    INSERT INTO users (id, email, credits, created_at, updated_at)
    VALUES (${userId}, ${email}, ${initialCredits}, NOW(), NOW())
    RETURNING *
  `
  return users[0]
}

export async function updateUserEmail(userId: string, email: string): Promise<User> {
  const users = await sql<User[]>`
    UPDATE users
    SET email = ${email}, updated_at = NOW()
    WHERE id = ${userId}
    RETURNING *
  `
  return users[0]
}

export async function deleteUser(userId: string): Promise<void> {
  await sql`
    DELETE FROM users WHERE id = ${userId}
  `
}

export async function getUserCredits(userId: string): Promise<number> {
  const result = await sql<{ credits: number }[]>`
    SELECT credits FROM users WHERE id = ${userId} LIMIT 1
  `
  return result.length > 0 ? result[0].credits : 0
}

export async function addCreditsToUser(userId: string, amount: number): Promise<User> {
  const users = await sql<User[]>`
    UPDATE users
    SET credits = credits + ${amount}, updated_at = NOW()
    WHERE id = ${userId}
    RETURNING *
  `
  return users[0]
}

export async function decrementUserCredits(userId: string): Promise<User> {
  // Primeiro verificamos se o usuário tem créditos suficientes
  const currentCredits = await getUserCredits(userId)

  if (currentCredits <= 0) {
    throw new Error("Créditos insuficientes")
  }

  const users = await sql<User[]>`
    UPDATE users
    SET credits = credits - 1, updated_at = NOW()
    WHERE id = ${userId}
    RETURNING *
  `
  return users[0]
}

// Funções para ícones
export async function saveIcon(
  userId: string,
  prompt: string,
  staticUrl: string,
  animatedUrl: string | null,
): Promise<Icon> {
  const icons = await sql<Icon[]>`
    INSERT INTO icons (id, prompt, static_url, animated_url, created_at, user_id)
    VALUES (${crypto.randomUUID()}, ${prompt}, ${staticUrl}, ${animatedUrl}, NOW(), ${userId})
    RETURNING *
  `
  return icons[0]
}

export async function getUserIcons(userId: string, limit = 20): Promise<Icon[]> {
  return sql<Icon[]>`
    SELECT * FROM icons
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
}

// Funções para compras
export async function recordPurchase(
  userId: string,
  amount: number,
  credits: number,
  provider = "manual",
): Promise<Purchase> {
  const purchases = await sql<Purchase[]>`
    INSERT INTO purchases (id, amount, credits, status, provider, created_at, user_id)
    VALUES (${crypto.randomUUID()}, ${amount}, ${credits}, 'completed', ${provider}, NOW(), ${userId})
    RETURNING *
  `
  return purchases[0]
}

export async function getUserPurchases(userId: string, limit = 10): Promise<Purchase[]> {
  return sql<Purchase[]>`
    SELECT * FROM purchases
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
}

// Função para inicializar o banco de dados (criar tabelas se não existirem)
export async function initDatabase() {
  // Criar tabela de usuários
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      credits INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL
    )
  `

  // Criar tabela de ícones
  await sql`
    CREATE TABLE IF NOT EXISTS icons (
      id TEXT PRIMARY KEY,
      prompt TEXT NOT NULL,
      static_url TEXT NOT NULL,
      animated_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
    )
  `

  // Criar tabela de compras
  await sql`
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      amount INTEGER NOT NULL,
      credits INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      provider TEXT NOT NULL DEFAULT 'manual',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
    )
  `

  console.log("Database initialized successfully")
}
