
export function generateFinancialGradient() {
    const gradients = [
      'linear-gradient(45deg, #1A2238, #2C3A5A)', // Azul escuro profundo
      'linear-gradient(45deg, #10141E, #1E2A38)', // Preto com azul escuro
      'linear-gradient(45deg, #0B0D12, #161B25)', // Preto com cinza escuro
      'linear-gradient(45deg, #1F2937, #374151)', // Cinza escuro com azul profundo
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  }
