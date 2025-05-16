/**
 * Gera um prompt otimizado para o modelo GPT-Image-1 da OpenAI
 * para criar ícones 3D de alta qualidade
 */
export function generateIconPrompt(basePrompt: string): string {
  return `Um ícone 3D de alta qualidade de ${basePrompt}. 
  Renderização 3D fotorrealista com iluminação profissional.
  Estilo moderno e detalhado, com fundo transparente.
  O ícone deve ter aparência tridimensional com sombras suaves e reflexos.
  Cores vibrantes e detalhes nítidos.`
}

/**
 * Estilos de ícones disponíveis
 */
export const iconStyles = {
  modern: "Estilo moderno e minimalista com cores vibrantes",
  realistic: "Estilo fotorrealista com texturas detalhadas",
  cartoon: "Estilo cartoon com cores vivas e formas arredondadas",
  isometric: "Estilo isométrico com perspectiva 3D",
  glassmorphism: "Estilo glass morphism com efeito de vidro e transparência",
  neon: "Estilo neon com cores brilhantes e efeitos de luz",
  clay: "Estilo clay 3D com aparência de argila ou plasticina",
  lowpoly: "Estilo low poly com faces geométricas visíveis",
}

/**
 * Gera um prompt otimizado para o modelo GPT-Image-1 da OpenAI
 * com um estilo específico
 */
export function generateStyledIconPrompt(basePrompt: string, style: keyof typeof iconStyles): string {
  return `Um ícone 3D de alta qualidade de ${basePrompt}. 
  ${iconStyles[style]}.
  Renderização 3D com iluminação profissional.
  O ícone deve ter aparência tridimensional com sombras suaves.
  Fundo transparente.`
}
