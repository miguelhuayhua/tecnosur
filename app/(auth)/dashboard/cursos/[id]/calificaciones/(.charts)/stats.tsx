import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";

import { Stat } from "@/config/charts";
interface Props {
  stats: Array<Stat>
}

export default function Stats({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 mt-3 border gap-px rounded-xl bg-border overflow-hidden">
      {stats.map((stat, index) => (
        <Card
          key={stat.titulo}
          className="rounded-none border-0 shadow-none bg-card hover:bg-accent/50 transition-colors"
        >
          <CardContent >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.titulo}
              </CardTitle>
            </div>

            <div className="text-xs text-muted-foreground/80 font-medium">
              {stat.badge}
            </div>

            <NumberTicker
              className="text-3xl font-bold"
              value={+stat.valor}
            />

            <CardDescription className="text-xs">
              {stat.descripcion}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}