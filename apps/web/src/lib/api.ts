import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000',
});

export async function fetchPredefinedRates() {
  const { data } = await api.get('/rates/predefined');
  return data as Array<{
    id: string;
    tradeLane: { region: string; name: string };
    validTo: string;
    validFrom: string;
    service: string;
    status: 'ACTIVE' | 'EXPIRED';
  }>;
}

export async function fetchNotifications() {
  const { data } = await api.get('/notifications');
  return data as Array<{ id: string; subject: string; createdAt: string }>;
}

export async function fetchRateRequests() {
  const { data } = await api.get('/rates/requests');
  return data as Array<{ id: string; refNo: string; status: string; processedPercent: number }>;
}

export async function fetchBookings() {
  const { data } = await api.get('/booking-requests');
  return data as Array<{ id: string; status: string; rateSource: string }>;
}

export async function fetchItineraries() {
  const { data } = await api.get('/itineraries');
  return data as Array<{ id: string; status: string; weekStart: string; items: Array<{ id: string; purpose: string }> }>;
}

export async function fetchDashboard() {
  const [status, top, response] = await Promise.all([
    api.get('/reports/status-cards'),
    api.get('/reports/top-sps'),
    api.get('/reports/response-time'),
  ]);
  return {
    status: status.data,
    top: top.data,
    response: response.data,
  };
}

export async function createRateRequest(payload: Record<string, unknown>) {
  const { data } = await api.post('/rates/requests', payload);
  return data;
}

export async function cancelBooking(id: string, reason: string) {
  const { data } = await api.post(`/booking-requests/${id}/cancel`, { reason });
  return data;
}
