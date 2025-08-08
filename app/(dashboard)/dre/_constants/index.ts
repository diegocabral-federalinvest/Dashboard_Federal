
  // Gerar anos para seleção
  export const availableYears = Array.from({ length: 8 }, (_, i) => {
    const year = new Date().getFullYear() - 3 + i;
    return year;
  });

  // Meses para seleção
  export const months = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" }
  ];

  // Trimestres para seleção
  export const quarters = [
    { value: 1, label: "1º Trimestre (Jan-Mar)" },
    { value: 2, label: "2º Trimestre (Abr-Jun)" },
    { value: 3, label: "3º Trimestre (Jul-Set)" },
    { value: 4, label: "4º Trimestre (Out-Dez)" }
  ];

  // Animation variants
  export const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      }
    }
  };

  export const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };