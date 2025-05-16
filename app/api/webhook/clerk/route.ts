import type { WebhookEvent } from "@clerk/nextjs/dist/types/server"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { createUser, updateUserEmail, deleteUser } from "@/lib/db"
import { Webhook } from "svix"

export async function POST(req: Request) {
  // Você pode encontrar esta chave no painel do Clerk em Webhooks
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error("Por favor, adicione CLERK_WEBHOOK_SECRET às suas variáveis de ambiente.")
  }

  // Obtenha os cabeçalhos
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // Se não houver cabeçalhos, retorne erro
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Erro: Cabeçalhos ausentes", {
      status: 400,
    })
  }

  // Obtenha o corpo da requisição
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Crie um objeto com os cabeçalhos
  const svix_headers = {
    "svix-id": svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature,
  }

  // Verifique a assinatura do webhook
  let event: WebhookEvent

  try {
    const wh = new Webhook(WEBHOOK_SECRET)
    event = wh.verify(body, svix_headers) as WebhookEvent
  } catch (err) {
    console.error("Erro ao verificar webhook:", err)
    return new Response("Erro: Assinatura inválida", {
      status: 400,
    })
  }

  // Obtenha o tipo de evento
  const eventType = event.type

  // Processe o evento com base no tipo
  if (eventType === "user.created") {
    // Quando um usuário é criado, crie um registro no banco de dados
    const { id, email_addresses } = event.data

    const primaryEmail = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : ""

    try {
      await createUser(id as string, primaryEmail)
      console.log(`Usuário ${id} criado com sucesso e 3 créditos iniciais`)
    } catch (error) {
      console.error("Erro ao criar usuário no banco de dados:", error)
    }
  } else if (eventType === "user.updated") {
    // Quando um usuário é atualizado, atualize o registro no banco de dados
    const { id, email_addresses } = event.data

    const primaryEmail = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : ""

    try {
      await updateUserEmail(id as string, primaryEmail)
      console.log(`Usuário ${id} atualizado com sucesso`)
    } catch (error) {
      console.error("Erro ao atualizar usuário no banco de dados:", error)
    }
  } else if (eventType === "user.deleted") {
    // Quando um usuário é excluído, exclua o registro no banco de dados
    const { id } = event.data

    try {
      await deleteUser(id as string)
      console.log(`Usuário ${id} excluído com sucesso`)
    } catch (error) {
      console.error("Erro ao excluir usuário do banco de dados:", error)
    }
  }

  return NextResponse.json({ success: true })
}
