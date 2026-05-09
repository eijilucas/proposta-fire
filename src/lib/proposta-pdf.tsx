import { Buffer } from "buffer";
if (typeof window !== "undefined" && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}
import { Document, Page, Text, View, StyleSheet, pdf, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#0F172A" },
  header: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 2, paddingBottom: 12, marginBottom: 16 },
  empresaName: { fontSize: 14, fontWeight: 700 },
  small: { fontSize: 9, color: "#475569" },
  block: { marginBottom: 12 },
  blockTitle: { fontSize: 11, fontWeight: 700, marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  table: { marginTop: 8, borderTopWidth: 1, borderColor: "#E2E8F0" },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#E2E8F0", paddingVertical: 6 },
  th: { fontWeight: 700, backgroundColor: "#F8FAFC", padding: 6, fontSize: 9 },
  c1: { flex: 3 }, c2: { flex: 1, textAlign: "right" }, c3: { flex: 1, textAlign: "right" }, c4: { flex: 1.5, textAlign: "right" },
  totalLine: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8, paddingTop: 8, borderTopWidth: 2 },
  totalLabel: { fontWeight: 700, marginRight: 16 },
  totalValue: { fontWeight: 700, fontSize: 14 },
  section: { marginTop: 12, fontSize: 9, color: "#334155" },
  sectionTitle: { fontWeight: 700, marginBottom: 2, color: "#0F172A", fontSize: 10 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#94A3B8", textAlign: "center", borderTopWidth: 1, paddingTop: 8 },
});

const fmtBRL = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export function PropostaPDF({ proposta, cliente, empresa, itens }: any) {
  const cor = empresa?.cor_marca || "#0F4C75";
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.header, { borderColor: cor }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {empresa?.logo_url && <Image src={empresa.logo_url} style={{ width: 50, height: 50, objectFit: "contain" }} />}
            <View>
              <Text style={[styles.empresaName, { color: cor }]}>{empresa?.nome_empresa || "Empresa"}</Text>
              {empresa?.cnpj_ou_mei && <Text style={styles.small}>{empresa.cnpj_ou_mei}</Text>}
              {empresa?.telefone && <Text style={styles.small}>{empresa.telefone} · {empresa?.email_contato}</Text>}
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.small}>Proposta</Text>
            <Text style={{ fontSize: 18, fontWeight: 700 }}>#{String(proposta.numero).padStart(4, "0")}</Text>
            <Text style={styles.small}>Emissão: {new Date(proposta.data_emissao).toLocaleDateString("pt-BR")}</Text>
            <Text style={styles.small}>Validade: {proposta.validade_dias} dias</Text>
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Para</Text>
          <Text>{cliente?.nome_empresa}</Text>
          {cliente?.nome_responsavel && <Text style={styles.small}>{cliente.nome_responsavel}</Text>}
          {cliente?.cnpj && <Text style={styles.small}>CNPJ: {cliente.cnpj}</Text>}
          {(cliente?.email || cliente?.telefone) && <Text style={styles.small}>{cliente.email} · {cliente.telefone}</Text>}
        </View>

        <Text style={[styles.blockTitle, { fontSize: 14, color: cor }]}>{proposta.titulo}</Text>

        <View style={styles.table}>
          <View style={[styles.tr, { backgroundColor: "#F8FAFC" }]}>
            <Text style={[styles.th, styles.c1]}>Item</Text>
            <Text style={[styles.th, styles.c2]}>Unid</Text>
            <Text style={[styles.th, styles.c3]}>Qtd</Text>
            <Text style={[styles.th, styles.c4]}>Valor</Text>
          </View>
          {itens.map((i: any) => (
            <View key={i.id} style={styles.tr}>
              <View style={styles.c1}>
                <Text style={{ fontWeight: 700 }}>{i.nome}</Text>
                {i.descricao && <Text style={styles.small}>{i.descricao}</Text>}
              </View>
              <Text style={styles.c2}>{i.unidade}</Text>
              <Text style={styles.c3}>{i.quantidade}</Text>
              <Text style={styles.c4}>{fmtBRL(Number(i.valor_total_item || i.quantidade * i.valor_unitario))}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.totalLine, { borderColor: cor }]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={[styles.totalValue, { color: cor }]}>{fmtBRL(Number(proposta.valor_total || 0))}</Text>
        </View>

        {proposta.prazo_execucao && <View style={styles.section}><Text style={styles.sectionTitle}>Prazo de execução</Text><Text>{proposta.prazo_execucao}</Text></View>}
        {proposta.condicoes_pagamento && <View style={styles.section}><Text style={styles.sectionTitle}>Condições de pagamento</Text><Text>{proposta.condicoes_pagamento}</Text></View>}
        {proposta.clausula_lgpd && <View style={styles.section}><Text style={styles.sectionTitle}>LGPD</Text><Text>{proposta.clausula_lgpd}</Text></View>}
        {proposta.clausula_garantia && <View style={styles.section}><Text style={styles.sectionTitle}>Garantia</Text><Text>{proposta.clausula_garantia}</Text></View>}
        {proposta.clausula_suporte && <View style={styles.section}><Text style={styles.sectionTitle}>Suporte</Text><Text>{proposta.clausula_suporte}</Text></View>}
        {proposta.observacoes && <View style={styles.section}><Text style={styles.sectionTitle}>Observações</Text><Text>{proposta.observacoes}</Text></View>}

        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Aceite</Text>
          <Text>Para aceitar online, acesse o link enviado pelo prestador.</Text>
          <Text style={{ marginTop: 30 }}>_____________________________________</Text>
          <Text style={styles.small}>Assinatura do contratante</Text>
        </View>

        <Text style={styles.footer}>{empresa?.nome_empresa} · {empresa?.email_contato || empresa?.telefone || ""}</Text>
      </Page>
    </Document>
  );
}

export async function downloadPropostaPDF(data: any) {
  const blob = await pdf(<PropostaPDF {...data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `proposta-${String(data.proposta.numero).padStart(4, "0")}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
