# LLM Duel

Uma aplicação web **self-hosted** que permite comparar outputs de diferentes LLMs a partir de um mesmo prompt, com foco em visualização lado a lado dos resultados em texto, código e imagem.

## Estrutura do Projeto

Este projeto é organizado como um monorepo com dois diretórios principais:

- `/frontend`: Aplicação Next.js para a interface do usuário
- `/backend`: API Node.js/Express para intermediar chamadas às LLMs

## Características

- Comparação lado a lado de diferentes modelos de linguagem
- Suporte para saída em texto, código e imagem
- Visualização rica com suporte a Markdown, syntax highlighting e imagens
- Histórico de comparações
- Configuração via variáveis de ambiente
- Segurança: chaves de API armazenadas apenas no backend

## Requisitos

- Node.js 18+ e npm/yarn/pnpm
- Chaves de API para os LLMs que deseja utilizar

## Configuração

### Backend

1. Navegue até o diretório do backend:
   \`\`\`bash
   cd backend
   \`\`\`

## Modelos Suportados

- **OpenAI**: 
  - GPT-4.1
  - GPT-4.1 mini
  - GPT Image 1
  - o4-mini
  - o3
  - GPT-4.0
  - GPT-4.0 mini
  - GPT-3.5 Turbo

- **Anthropic**: 
  - Claude 3.7 Sonnet
  - Claude 3.5 Haiku
  - Claude 3.5 Sonnet v2
  - Claude 3 Opus

- **Google**: 
  - Gemini 2.5 Pro
  - Gemini 2.5 Flash
  - Gemini 2.0 Flash
  - Gemini 2.0 Flash lite

- **xAI**: Grok-1
- **Mistral AI**: Mistral Large, Mistral Medium, Mistral Small
- **Maritaca AI**: MPT-7B
- **DeepSeek**: DeepSeek Chat, DeepSeek Coder
