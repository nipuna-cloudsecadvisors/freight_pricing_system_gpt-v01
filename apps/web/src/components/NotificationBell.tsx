import { useQuery } from '@tanstack/react-query';
import { fetchNotifications } from '../lib/api';

export function NotificationBell() {
  const { data } = useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications });
  const unread = data?.length ?? 0;
  return (
    <button className="relative rounded-full bg-slate-200 p-3 text-slate-700">
      <span className="sr-only">Notifications</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2a6 6 0 0 0-6 6v3.586l-.707.707A1 1 0 0 0 6 14h12a1 1 0 0 0 .707-1.707L18 11.586V8a6 6 0 0 0-6-6z" />
        <path d="M14 17a2 2 0 1 1-4 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
          {unread}
        </span>
      )}
    </button>
  );
}
