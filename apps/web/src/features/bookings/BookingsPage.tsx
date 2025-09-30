import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelBooking, fetchBookings } from '../../lib/api';

export function BookingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['bookings'], queryFn: fetchBookings });
  const mutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelBooking(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });

  if (isLoading) {
    return <div>Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Booking Requests</h2>
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Source</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data?.map((booking) => (
              <tr key={booking.id}>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{booking.id}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{booking.status}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{booking.rateSource}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  <button
                    onClick={() => mutation.mutate({ id: booking.id, reason: 'Client requested cancellation' })}
                    className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
