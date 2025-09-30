import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchNotifications } from '../../lib/api';

export function NotificationsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications });

  if (isLoading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Notifications</h2>
      <ul className="space-y-3">
        {data?.map((notification) => (
          <li key={notification.id} className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm font-semibold text-slate-900">{notification.subject}</p>
            <p className="text-xs text-slate-500">{format(new Date(notification.createdAt), 'dd MMM yyyy HH:mm')}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
