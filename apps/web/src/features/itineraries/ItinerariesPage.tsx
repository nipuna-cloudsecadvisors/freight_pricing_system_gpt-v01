import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchItineraries } from '../../lib/api';

export function ItinerariesPage() {
  const { data, isLoading } = useQuery({ queryKey: ['itineraries'], queryFn: fetchItineraries });

  if (isLoading) {
    return <div>Loading itineraries...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Upcoming Itineraries</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {data?.map((itinerary) => (
          <article key={itinerary.id} className="rounded-lg bg-white p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Week of {format(new Date(itinerary.weekStart), 'dd MMM')}</h3>
                <p className="text-sm text-slate-500">Status: {itinerary.status}</p>
              </div>
              <span className="rounded bg-slate-200 px-3 py-1 text-xs text-slate-600">{itinerary.items.length} stops</span>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {itinerary.items.map((item) => (
                <li key={item.id} className="rounded bg-slate-50 p-2">{item.purpose}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
