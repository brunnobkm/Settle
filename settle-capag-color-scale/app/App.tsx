import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Escala decidida na reunião diária de 07/07/2026 (ver README.md desta pasta).
// A e B têm a mesma cor: são a faixa elegível a garantia da União; a letra diferencia.
const ESCALA = [
  { nota: "A", variante: "success", token: "success", leitura: "Boa capacidade de pagamento" },
  { nota: "B", variante: "success", token: "success", leitura: "Capacidade média, ainda elegível" },
  { nota: "C", variante: "warning", token: "warning", leitura: "Capacidade baixa, não elegível" },
  { nota: "D", variante: "destructive", token: "destructive", leitura: "Situação crítica" },
  { nota: "NE", variante: "secondary", token: "neutro", leitura: "Sem classificação (status do produto)" },
  { nota: "ND", variante: "secondary", token: "neutro", leitura: "Sem classificação (status do produto)" },
] as const

export default function App() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6 sm:p-10">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground uppercase">Settle</span>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">CAPAG: escala de cores</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cor de cada categoria</CardTitle>
          <CardDescription>
            Decidida na reunião diária de 07/07/2026. A e B ficam com a mesma cor (faixa elegível a garantia da
            União); a letra diferencia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Exemplo</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Leitura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ESCALA.map((c) => (
                <TableRow key={c.nota}>
                  <TableCell className="font-medium">{c.nota}</TableCell>
                  <TableCell>
                    <Badge variant={c.variante}>{c.nota}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="font-mono text-xs">{c.token}</code>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.leitura}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}
