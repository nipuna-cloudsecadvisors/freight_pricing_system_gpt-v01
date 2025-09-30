import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchPredefinedRates, fetchRateRequests } from '../../lib/api';

export function RatesPage() {
  const { data: rates, isLoading } = useQuery({ queryKey: ['rates'], queryFn: fetchPredefinedRates });
  const { data: requests } = useQuery({ queryKey: ['rate-requests'], queryFn: fetchRateRequests });

  if (isLoading) {
    return <div>Loading rates...</div>;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold">Pre-defined Rates</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {rates?.map((rate) => {
            const validTo = new Date(rate.validTo);
            const now = new Date();
            const diffDays = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const badge = rate.status === 'EXPIRED' ? 'bg-expired text-white' : diffDays <= 7 ? 'bg-expiring text-black' : 'bg-slate-200';
            return (
              <article key={rate.id} className="rounded-lg bg-white p-4 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold">{rate.tradeLane.name}</h3>
                    <p className="text-sm text-slate-500">Service: {rate.service}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>
                    Valid to {format(validTo, 'dd MMM yyyy')}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Recent Rate Requests</h2>
        <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Processed %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {requests?.map((req) => (
                <tr key={req.id}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{req.refNo}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{req.status}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{req.processedPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
