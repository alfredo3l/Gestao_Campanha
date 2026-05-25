import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  title: string;
  description?: string;
  fase?: string;
}

export function PagePlaceholder({ title, description, fase }: Props) {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-2xl font-semibold text-ink-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Em construção</CardTitle>
          <CardDescription>
            {fase ? `Esta tela será implementada na ${fase}.` : "Esta tela ainda não foi implementada."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-ink-500">
          Veja o HANDOFF.md (seções 3 e 9) para o escopo e a ordem de implementação.
        </CardContent>
      </Card>
    </div>
  );
}
