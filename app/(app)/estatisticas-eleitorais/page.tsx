import { PageHeader } from "@/components/app/page-header";

export const metadata = { title: "Estatísticas Eleitorais" };

const POWER_BI_URL =
  "https://app.powerbi.com/view?r=eyJrIjoiMTI1MDFkMjQtYzFiNS00MDlmLWI4OWMtN2E0YWJiNGU2MDBhIiwidCI6IjRiMDY3ODM4LTUxZjUtNDFhMC04ZDc0LTY3Mzk5MTA3NzUxNSJ9";

export default function EstatisticasEleitoraisPage() {
  return (
    <div className="flex h-full min-h-[calc(100vh-7rem)] flex-col gap-6">
      <PageHeader
        title="Estatísticas Eleitorais"
        description="Painel analítico embarcado do Power BI com indicadores eleitorais consolidados."
      />

      <div className="relative flex-1 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
        <iframe
          title="Estatísticas Eleitorais - Power BI"
          src={POWER_BI_URL}
          className="absolute inset-0 h-full w-full"
          frameBorder={0}
          allowFullScreen
        />
      </div>
    </div>
  );
}
