export const formatBRL = (n: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n || 0));

export const formatNumeroProposta = (n: number | null | undefined) =>
  String(n ?? 0).padStart(4, "0");

export const formatDate = (d: string | Date | null | undefined) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("pt-BR");
};

export const statusLabel: Record<string, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  visualizada: "Visualizada",
  aceita: "Aceita",
  recusada: "Recusada",
  expirada: "Expirada",
};

export const statusClass: Record<string, string> = {
  rascunho: "badge-rascunho",
  enviada: "badge-enviada",
  visualizada: "badge-visualizada",
  aceita: "badge-aceita",
  recusada: "badge-recusada",
  expirada: "badge-expirada",
};
