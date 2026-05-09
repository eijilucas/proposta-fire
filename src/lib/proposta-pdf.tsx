import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const fmtBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n || 0));

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

async function loadImageDataUrl(url: string): Promise<{ data: string; w: number; h: number } | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    const img = await new Promise<HTMLImageElement | null>((resolve) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => resolve(i);
      i.onerror = () => resolve(null);
      i.src = dataUrl;
    });
    if (!img || !img.naturalWidth) return null;

    // Re-encoda em PNG limpo via canvas para garantir compatibilidade com jsPDF
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#FFFFFF"; // fundo branco para PNGs com transparência
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    return {
      data: canvas.toDataURL("image/png"),
      w: img.naturalWidth,
      h: img.naturalHeight,
    };
  } catch {
    return null;
  }
}

export async function downloadPropostaPDF(data: any) {
  const { proposta, cliente, empresa, itens } = data;
  const cor = empresa?.cor_marca || "#0F4C75";
  const [cR, cG, cB] = hexToRgb(cor);

  const doc = new jsPDF({ unit: "pt", format: "a4", compress: false });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 50;

  // Logo (max 90x90pt)
  let logoW = 0;
  let logoH = 0;
  if (empresa?.logo_url) {
    const img = await loadImageDataUrl(empresa.logo_url);
    if (img && img.w > 0) {
      const maxH = 90;
      const maxW = 90;
      const ratio = img.w / img.h;
      let h = maxH;
      let w = h * ratio;
      if (w > maxW) {
        w = maxW;
        h = w / ratio;
      }
      logoW = w;
      logoH = h;
      try {
        doc.addImage(img.data, "PNG", margin, y - 10, w, h);
      } catch {
        /* falhou silenciosamente */
      }
    }
  }
  const textOffsetX = logoW > 0 ? margin + logoW + 14 : margin;

  // Header text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(cR, cG, cB);
  doc.text(empresa?.nome_empresa || "Empresa", textOffsetX, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  let infoY = y + 20;
  if (empresa?.cnpj_ou_mei) { doc.text(String(empresa.cnpj_ou_mei), textOffsetX, infoY); infoY += 11; }
  if (empresa?.telefone || empresa?.email_contato) {
    doc.text(`${empresa?.telefone || ""}${empresa?.telefone && empresa?.email_contato ? " · " : ""}${empresa?.email_contato || ""}`, textOffsetX, infoY);
  }

  // Right header — proposta number
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("Proposta", pageW - margin, y, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(`#${String(proposta.numero).padStart(4, "0")}`, pageW - margin, y + 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Emissão: ${new Date(proposta.data_emissao).toLocaleDateString("pt-BR")}`, pageW - margin, y + 32, { align: "right" });
  doc.text(`Validade: ${proposta.validade_dias} dias`, pageW - margin, y + 44, { align: "right" });

  // Avanca pelo maior entre o bloco de texto do header e a altura da logo
  y += Math.max(70, logoH + 4);
  doc.setDrawColor(cR, cG, cB);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageW - margin, y);
  y += 16;

  // Cliente
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Para", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(cliente?.nome_empresa || "-", margin, y);
  y += 12;
  doc.setFontSize(9);
  doc.setTextColor(100);
  if (cliente?.nome_responsavel) { doc.text(cliente.nome_responsavel, margin, y); y += 11; }
  if (cliente?.cnpj) { doc.text(`CNPJ: ${cliente.cnpj}`, margin, y); y += 11; }
  if (cliente?.email || cliente?.telefone) {
    doc.text(`${cliente?.email || ""}${cliente?.email && cliente?.telefone ? " · " : ""}${cliente?.telefone || ""}`, margin, y);
    y += 11;
  }
  y += 10;

  // Título proposta
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(cR, cG, cB);
  doc.text(proposta.titulo || "", margin, y);
  y += 16;

  // Tabela de itens
  autoTable(doc, {
    startY: y,
    head: [["Item", "Qtd", "Valor"]],
    body: itens.map((i: any) => [
      `${i.nome}${i.descricao ? `\n${i.descricao}` : ""}`,
      String(i.quantidade),
      fmtBRL(Number(i.valor_total_item || i.quantidade * i.valor_unitario)),
    ]),
    headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "right", cellWidth: 50 },
      2: { halign: "right", cellWidth: 100 },
    },
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { lineColor: [226, 232, 240] },
  });

  // @ts-expect-error lastAutoTable injected
  y = doc.lastAutoTable.finalY + 14;

  // Total
  doc.setDrawColor(cR, cG, cB);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageW - margin, y);
  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Total", pageW - margin - 130, y, { align: "right" });
  doc.setFontSize(14);
  doc.setTextColor(cR, cG, cB);
  doc.text(fmtBRL(Number(proposta.valor_total || 0)), pageW - margin, y, { align: "right" });
  y += 24;

  const sections = [
    { t: "Prazo de execução", v: proposta.prazo_execucao },
    { t: "Condições de pagamento", v: proposta.condicoes_pagamento },
    { t: "LGPD", v: proposta.clausula_lgpd },
    { t: "Garantia", v: proposta.clausula_garantia },
    { t: "Suporte", v: proposta.clausula_suporte },
    { t: "Observações", v: proposta.observacoes },
  ].filter((s) => s.v);

  for (const s of sections) {
    if (y > 760) { doc.addPage(); y = 50; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(s.t, margin, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60);
    const lines = doc.splitTextToSize(String(s.v), pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 11 + 8;
  }

  // Aceite (espaco generoso para assinatura digital tipo gov.br)
  if (y > 600) { doc.addPage(); y = 50; }
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Aceite", margin, y);
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.text("Para aceitar online, acesse o link enviado pelo prestador.", margin, y);
  doc.text("Caso prefira, assine digitalmente no espaco abaixo (compativel com gov.br).", margin, y + 11);
  y += 130; // espaco vertical amplo para acomodar carimbo de assinatura digital
  doc.line(margin, y, margin + 320, y);
  doc.text("Assinatura do contratante", margin, y + 12);

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const footer = `${empresa?.nome_empresa || ""} · ${empresa?.email_contato || empresa?.telefone || ""}`;
    doc.text(footer, pageW / 2, 820, { align: "center" });
    doc.text(`${p}/${totalPages}`, pageW - margin, 820, { align: "right" });
  }

  doc.save(`proposta-${String(proposta.numero).padStart(4, "0")}.pdf`);
}
