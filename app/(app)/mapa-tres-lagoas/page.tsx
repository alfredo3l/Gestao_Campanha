import Image from "next/image";

import { PageHeader } from "@/components/app/page-header";

export const metadata = { title: "Mapa Três Lagoas" };

export default function MapaTresLagoasPage() {
  return (
    <div className="flex h-full min-h-[calc(100vh-7rem)] flex-col gap-6">
      <PageHeader
        title="Mapa Três Lagoas"
        description="Divisão dos setores da cidade utilizados para organização das ações de campanha."
      />

      <div className="relative flex-1 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
        <div className="relative h-full w-full">
          <Image
            src="/mapa-tres-lagoas.png"
            alt="Mapa de Três Lagoas com setores numerados"
            fill
            sizes="(max-width: 768px) 100vw, 80vw"
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
