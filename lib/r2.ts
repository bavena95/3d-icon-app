import { S3Client } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { GetObjectCommand } from "@aws-sdk/client-s3"

// Configuração do cliente R2
const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "icon3d-assets"

// Função para fazer upload de um arquivo para o R2
export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string,
  metadata?: Record<string, string>,
): Promise<string> {
  try {
    const upload = new Upload({
      client: R2,
      params: {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata,
      },
    })

    await upload.done()

    // Gerar URL assinada para acesso temporário
    const url = await getSignedUrl(
      R2,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }),
      { expiresIn: 60 * 60 * 24 * 7 }, // URL válida por 7 dias
    )

    return url
  } catch (error) {
    console.error("Erro ao fazer upload para R2:", error)
    throw new Error("Falha ao fazer upload do arquivo")
  }
}

// Função para gerar URL assinada para um arquivo existente
export async function getSignedR2Url(key: string): Promise<string> {
  try {
    const url = await getSignedUrl(
      R2,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }),
      { expiresIn: 60 * 60 * 24 }, // URL válida por 1 dia
    )

    return url
  } catch (error) {
    console.error("Erro ao gerar URL assinada:", error)
    throw new Error("Falha ao gerar URL de acesso")
  }
}
