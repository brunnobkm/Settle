// Conteúdo simulado dos PDFs da licitação (Câmara Municipal de Petrolina).
// Os quatro corpos ficam sempre montados (só o aberto aparece): os Ranges dos
// requisitos apontam para estes nós e precisam continuar válidos ao trocar de arquivo.
// data-doc marca o corpo de cada arquivo; data-titulo marca os títulos de seção.

import type { ReactNode } from "react"

import type { DocId } from "./dados"

function Cabecalho({ titulo, sub, tag, children }: { titulo: string; sub: string; tag: string; children?: ReactNode }) {
  return (
    <div className="text-center">
      {children}
      <h2 className="text-lg font-extrabold tracking-[.02em]">{titulo}</h2>
      <div className="mt-0.5 text-base font-bold italic">{sub}</div>
      <div className="mt-1 text-[15px] font-extrabold tracking-[.04em]">{tag}</div>
    </div>
  )
}

function Titulo({ children }: { children: ReactNode }) {
  return (
    <div data-titulo className="mt-[22px] mb-1.5 font-extrabold">
      {children}
    </div>
  )
}

function P({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={className ?? "my-3 text-justify"}>{children}</p>
}

/** Brasão do órgão, em tons de cinza como numa cópia digitalizada. */
function Brasao() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className="mx-auto mb-3.5 block size-[86px]">
      <circle cx="50" cy="50" r="46" className="fill-foreground/75 stroke-foreground" strokeWidth="2" />
      <circle cx="50" cy="50" r="28" className="fill-foreground/45" />
      <circle cx="50" cy="50" r="11" className="fill-foreground/85" />
      <g className="fill-background">
        {[
          [50, 33],
          [62, 38],
          [66, 50],
          [62, 62],
          [50, 67],
          [38, 62],
          [34, 50],
          [38, 38],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.6" />
        ))}
      </g>
      <path d="M16 70 Q50 86 84 70" className="fill-none stroke-background" strokeWidth="2.4" opacity=".85" />
    </svg>
  )
}

const td = "border border-foreground px-[9px] py-1.5 align-top leading-normal"
const tdChave = `${td} w-[38%] font-bold whitespace-nowrap`

export function Documento({ visto }: { visto: DocId }) {
  return (
    <>
      <div data-doc="edital" hidden={visto !== "edital"}>
        <Cabecalho titulo="CÂMARA DE VEREADORES DE PETROLINA" sub="Casa Vereador Plínio Amorim" tag="EDITAL">
          <Brasao />
        </Cabecalho>

        <P className="mt-[26px] mb-3 text-center">
          <b>PREGÃO ELETRÔNICO Nº 004/2026</b>
        </P>
        <P className="-mt-1.5 mb-3 text-center">
          <b>PROCESSO ADMINISTRATIVO Nº 080/2026</b>
        </P>

        <P>
          <b>A Câmara Municipal de Petrolina</b>, inscrito no C.N.P.J/MF sob o nº 11.473.675/0001-74, através da Agente de
          Contratação, e auxiliada pela <b>Equipe de Apoio</b>, tornam público que fará licitação, na modalidade de{" "}
          <b>PREGÃO</b>, na forma <b>ELETRÔNICA</b>, critério de julgamento <b>MENOR PREÇO</b> (representado pelo{" "}
          <b>MENOR VALOR UNITÁRIO</b>), de acordo com o descrito neste edital e seus anexos, objetivando a contratação
          conforme segue:
        </P>

        <table className="mt-[18px] mb-2 w-full border-collapse text-[13.5px]">
          <tbody>
            <tr>
              <td className={tdChave}>SOLICITANTE:</td>
              <td className={td}>Câmara Municipal de Petrolina.</td>
            </tr>
            <tr>
              <td className={tdChave}>MODALIDADE/Nº</td>
              <td className={td}>PREGÃO ELETRÔNICO Nº 004/2026</td>
            </tr>
            <tr>
              <td className={tdChave}>PROCESSO ADMINISTRATIVO Nº</td>
              <td className={td}>080/2026</td>
            </tr>
            <tr>
              <td colSpan={2} className={td}>
                <b>OBJETO:</b> Contratação de empresa especializada para fornecimento, em regime de Software as a Service
                (SaaS), de plataforma informatizada de Gestão Eletrônica de Documentos, Processos Administrativos,
                Comunicação Institucional Interna e Externa e Atendimento Digital ao Cidadão, com implantação, migração de
                dados, parametrização, treinamento, suporte técnico, manutenção corretiva, adaptativa e evolutiva, para
                atendimento das necessidades da Câmara Municipal de Petrolina, conforme especificações/quantitativos
                indicados neste edital e anexos.
              </td>
            </tr>
            <tr>
              <td colSpan={2} className={`${td} font-bold`}>
                CRITÉRIO DE JULGAMENTO: MENOR PREÇO, representado MENOR VALOR UNITÁRIO
              </td>
            </tr>
            <tr>
              <td colSpan={2} className={`${td} font-bold`}>
                MODO DE DISPUTA: ABERTO E FECHADO
              </td>
            </tr>
            <tr>
              <td colSpan={2} className={td}>
                <b>ACESSO AO EDITAL / LOCAL DA SESSÃO:</b> Conforme item 2 deste edital
              </td>
            </tr>
            <tr>
              <td colSpan={2} className={td}>
                <b>DAS DATAS E HORÁRIOS DO CERTAME:</b> Conforme item 3 deste edital
              </td>
            </tr>
            <tr>
              <td colSpan={2} className={td}>
                <b>PLATAFORMA ELETRÔNICA:</b> Portal de Compras Públicas
              </td>
            </tr>
            <tr>
              <td colSpan={2} className={td}>
                <b>INFORMAÇÕES:</b> O edital e seus anexos encontram-se disponíveis:
                <br />- na plataforma do Portal de Compras Públicas -{" "}
                <a href="#" data-nao-prototipado className="text-primary underline">
                  www.portaldecompraspublicas.com.br
                </a>
                ;
                <br />- no{" "}
                <a href="#" data-nao-prototipado className="text-primary underline">
                  site www.gov.br/pncp
                </a>
                .
                <br />
                <b>Obs.:</b> Ainda, poderão ser solicitados pelo e-mail diretoriacamarapetrolina@gmail.com
              </td>
            </tr>
          </tbody>
        </table>

        <Titulo>1. DO OBJETO</Titulo>
        <P>
          1.1. O objeto da presente licitação é a escolha da proposta mais vantajosa para a contratação do objeto acima
          descrito, conforme condições, quantidades e exigências estabelecidas neste Edital e seus anexos.
        </P>
        <P>
          1.2. O critério de julgamento adotado será o <b>menor preço unitário</b> do item, observadas as exigências
          contidas neste Edital e seus anexos quanto às especificações do objeto.
        </P>

        <Titulo>2. DOS RECURSOS ORÇAMENTÁRIOS</Titulo>
        <P>
          2.1. As despesas decorrentes da presente contratação correrão à conta de recursos específicos consignados no
          orçamento vigente da Câmara Municipal de Petrolina.
        </P>
      </div>

      <div data-doc="etp" hidden={visto !== "etp"}>
        <Cabecalho titulo="ESTUDO TÉCNICO PRELIMINAR" sub="Câmara Municipal de Petrolina" tag="ETP Nº 080/2026" />
        <Titulo>1. DESCRIÇÃO DA NECESSIDADE</Titulo>
        <P>
          1.1. A contratação visa modernizar a gestão eletrônica de documentos e processos administrativos da Câmara
          Municipal de Petrolina, reduzindo o uso de papel e o tempo de tramitação.
        </P>
        <Titulo>2. REQUISITOS DA SOLUÇÃO</Titulo>
        <P>
          2.1. A solução deverá ser ofertada em regime de Software as a Service (SaaS), com disponibilidade mínima de 99,5%
          e suporte técnico em horário comercial.
        </P>
        <P>
          2.2. Deverá contemplar gestão eletrônica de documentos, processos administrativos, comunicação institucional e
          atendimento digital ao cidadão.
        </P>
        <Titulo>3. ESTIMATIVA DE CUSTOS</Titulo>
        <P>
          3.1. O valor estimado da contratação foi obtido por meio de pesquisa de mercado junto a fornecedores do ramo.
        </P>
      </div>

      <div data-doc="tr" hidden={visto !== "tr"}>
        <Cabecalho titulo="TERMO DE REFERÊNCIA" sub="Câmara Municipal de Petrolina" tag="TR Nº 004/2026" />
        <Titulo>1. DO OBJETO</Titulo>
        <P>
          1.1. Contratação de plataforma informatizada, em regime de SaaS, para gestão eletrônica de documentos e processos
          administrativos.
        </P>
        <Titulo>2. ESPECIFICAÇÕES TÉCNICAS</Titulo>
        <P>2.1. O sistema deverá permitir assinatura eletrônica, controle de versões e trilha de auditoria completa.</P>
        <P>2.2. Deverá integrar-se ao Portal de Compras Públicas e ao PNCP.</P>
      </div>

      <div data-doc="contrato" hidden={visto !== "contrato"}>
        <Cabecalho titulo="MINUTA DE CONTRATO" sub="Câmara Municipal de Petrolina" tag="Contrato Nº 004/2026" />
        <Titulo>CLÁUSULA PRIMEIRA - DO OBJETO</Titulo>
        <P>
          1.1. O presente contrato tem por objeto o fornecimento de plataforma SaaS de gestão eletrônica de documentos,
          conforme especificações do edital.
        </P>
        <Titulo>CLÁUSULA SEGUNDA - DA VIGÊNCIA</Titulo>
        <P>2.1. O prazo de vigência é de 12 (doze) meses, contado da assinatura, prorrogável na forma da lei.</P>
      </div>
    </>
  )
}
