# LLM Duel - Backend

Backend para o projeto LLM Duel, uma aplicação que permite comparar outputs de diferentes LLMs a partir de um mesmo prompt.

## Tecnologias

- Node.js
- Express
- TypeScript
- Axios
- Integrações com APIs de LLMs (OpenAI, Claude, Gemini, xAI, DeepSeek, Mistral, Maritaca)

## Configuração

1. Clone o repositório
2. Instale as dependências:
   \`\`\`bash
   npm install
   \`\`\`
3. Copie o arquivo `.env.example` para `.env` e preencha com suas chaves de API:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
4. Inicie o servidor de desenvolvimento:
   \`\`\`bash
   npm run dev
   \`\`\`

## Endpoints

A API expõe os seguintes endpoints:

- `POST /api/openai` - Gera respostas usando OpenAI
- `POST /api/claude` - Gera respostas usando Anthropic Claude
- `POST /api/gemini` - Gera respostas usando Google Gemini
- `POST /api/xai` - Gera respostas usando xAI (Grok)
- `POST /api/deepseek` - Gera respostas usando DeepSeek
- `POST /api/mistral` - Gera respostas usando Mistral AI
- `POST /api/maritaca` - Gera respostas usando Maritaca AI

### Formato da Requisição

\`\`\`json
{
  "prompt": "string",
  "mode": "text" | "code" | "image",
  "options": {
    // parâmetros adicionais específicos do modelo
    "temperature": 0.7,
    "max_tokens": 2048,
    "model": "modelo-específico" // opcional, sobrescreve o padrão
  }
}
\`\`\`

### Formato da Resposta

\`\`\`json
{
  "model": "provedor/modelo",
  "response": "string",
  "timeTaken": 1234, // tempo em ms
  "tokensUsed": 123, // quando disponível
  "containsCode": true, // se a resposta contém blocos de código
  "containsImages": false // se a resposta contém imagens
}
\`\`\`

## Scripts

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila o TypeScript para JavaScript
- `npm start` - Inicia o servidor de produção
- `npm test` - Executa os testes
