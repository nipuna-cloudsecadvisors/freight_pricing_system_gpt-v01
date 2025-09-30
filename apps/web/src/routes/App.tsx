import { Navigate, Route, Routes } from 'react-router-dom';
import { Suspense } from 'react';
import { Layout } from '../components/Layout';
import { RatesPage } from '../features/rates/RatesPage';
import { RateRequestPage } from '../features/rates/RateRequestPage';
import { BookingsPage } from '../features/bookings/BookingsPage';
import { ItinerariesPage } from '../features/itineraries/ItinerariesPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { NotificationsPage } from '../features/notifications/NotificationsPage';

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<div className="p-6">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/rates" element={<RatesPage />} />
          <Route path="/rates/new" element={<RateRequestPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/itineraries" element={<ItinerariesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
