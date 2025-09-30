import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';

import { authRouter } from './modules/auth/auth.router';
import { customerRouter } from './modules/customers/customer.router';
import { rateRouter } from './modules/rates/rate.router';
import { bookingRouter } from './modules/bookings/booking.router';
import { itineraryRouter } from './modules/itineraries/itinerary.router';
import { notificationRouter } from './modules/notifications/notification.router';
import { reportRouter } from './modules/reports/report.router';
import { masterRouter } from './modules/masters/master.router';
import { errorHandler } from './middleware/error-handler';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.use('/auth', authRouter);
  app.use('/customers', customerRouter);
  app.use('/rates', rateRouter);
  app.use('/booking-requests', bookingRouter);
  app.use('/itineraries', itineraryRouter);
  app.use('/notifications', notificationRouter);
  app.use('/reports', reportRouter);
  app.use('/', masterRouter);

  app.use(errorHandler);
  return app;
}
