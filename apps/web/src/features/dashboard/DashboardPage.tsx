import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '../../lib/api';

export function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard });

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold">Status Overview</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
          {data?.status?.map((card: { status: string; count: number }) => (
            <div key={card.status} className="rounded-lg bg-white p-4 shadow">
              <p className="text-sm text-slate-500">{card.status}</p>
              <p className="text-2xl font-bold">{card.count}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Top Sales People</h2>
        <ul className="mt-3 space-y-2">
          {data?.top?.map((item: { salespersonId: string; name: string; count: number }) => (
            <li key={item.salespersonId} className="flex items-center justify-between rounded-lg bg-white p-4 shadow">
              <span>{item.name}</span>
              <span className="text-sm text-slate-500">{item.count} requests</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Average Response Time</h2>
        <p className="mt-2 rounded-lg bg-white p-4 shadow">{data?.response?.averageHours ?? 0} hours</p>
      </section>
    </div>
  );
}
