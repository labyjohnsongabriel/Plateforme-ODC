// src/app/(admin)/admin/dashboard/components/ChartsSection.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart as ReAreaChart,
  Area,
  defs,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartODC } from '@/components/charts/BarChartODC';
import { DonutChartODC } from '@/components/charts/DonutChartODC';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { ChartLegend } from '@/components/charts/ChartLegend';
import { api } from '@/lib/api';
import { getRoleColor } from '@/lib/chart-theme';

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function ChartsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'charts'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 lg:col-span-2" />
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  /* -------------------- Données -------------------- */
  const usersByRole = (data?.usersByRole ?? []).map((r: any) => ({
    name: r.role,
    value: Number(r.count),
    color: getRoleColor(r.role),
  }));

  const formationsByDomaine = (data?.formationsByDomaine ?? []).map(
    (d: any) => ({
      name: d.domaine,
      value: Number(d.count),
      color: d.couleur ?? '#FF7900',
    }),
  );

  const topFormations = (data?.topFormations ?? []).map((f: any) => ({
    name: f.titre?.length > 30 ? `${f.titre.slice(0, 30)}…` : f.titre,
    value: Number(f.inscriptions),
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ================================================================ */}
      {/* 1. Évolution mensuelle (LineChart)                                 */}
      {/* ================================================================ */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">
            Évolution des inscriptions
          </CardTitle>
          <p className="text-sm text-odc-muted">
            12 derniers mois — inscriptions vs sessions
          </p>
        </CardHeader>

        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart
                data={data?.inscriptionsParMois ?? []}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--odc-border)"
                  strokeOpacity={0.4}
                  vertical={false}
                />
                <XAxis
                  dataKey="mois"
                  tick={{ fill: 'var(--odc-text-muted)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--odc-text-muted)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend content={<ChartLegend />} />

                <Line
                  type="monotone"
                  dataKey="count"
                  name="Inscriptions"
                  stroke="#FF7900"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#FF7900', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  animationDuration={1000}
                />

                <Line
                  type="monotone"
                  dataKey="sessions"
                  name="Sessions"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  animationDuration={1200}
                />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* 2. Répartition par rôle (DonutChart)                              */}
      {/* ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Répartition par rôle</CardTitle>
          <p className="text-sm text-odc-muted">Utilisateurs actifs</p>
        </CardHeader>

        <CardContent>
          {usersByRole.length > 0 ? (
            <DonutChartODC
              data={usersByRole}
              height={280}
              centerLabel="Utilisateurs"
            />
          ) : (
            <EmptyChart />
          )}
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* 3. Formations par domaine (BarChart horizontal)                   */}
      {/* ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Formations par domaine</CardTitle>
          <p className="text-sm text-odc-muted">Catalogue complet</p>
        </CardHeader>

        <CardContent>
          {formationsByDomaine.length > 0 ? (
            <BarChartODC
              data={formationsByDomaine}
              series={[
                {
                  dataKey: 'value',
                  name: 'Formations',
                  color: '#FF7900',
                },
              ]}
              layout="vertical"
              height={280}
              barRadius={4}
            />
          ) : (
            <EmptyChart />
          )}
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* 4. Top formations (BarChart horizontal)                           */}
      {/* ================================================================ */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Top 5 formations</CardTitle>
          <p className="text-sm text-odc-muted">
            Par nombre d&apos;inscriptions
          </p>
        </CardHeader>

        <CardContent>
          {topFormations.length > 0 ? (
            <BarChartODC
              data={topFormations}
              series={[
                {
                  dataKey: 'value',
                  name: 'Inscriptions',
                  color: '#2563EB',
                },
              ]}
              layout="vertical"
              height={280}
              barRadius={4}
            />
          ) : (
            <EmptyChart />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================================
   EMPTY STATE
   ============================================================================ */

function EmptyChart() {
  return (
    <div className="h-[280px] flex items-center justify-center text-sm text-odc-muted">
      Aucune donnée disponible
    </div>
  );
}