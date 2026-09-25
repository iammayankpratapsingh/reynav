// Booking performance domain types.
import type { ConnectionStatus } from "./connection";

export type FunnelStage = {
  id: string;
  label: string;
  value: number;
  /** How the value reads, so the UI never has to guess a currency. */
  format: "count" | "currency";
};

export type BookingIntegration = {
  id: string;
  name: string;
  status: ConnectionStatus;
  /** True for the one currently supplying booking data. */
  isActive: boolean;
};

/** One booking, from an uploaded CSV or a connected platform. */
export type BookingRecord = {
  bookedOn: string;
  serviceName: string;
  price: number;
  channel: "online" | "phone" | "walk-in";
  status: "completed" | "cancelled" | "no-show";
};

export type ServiceRevenue = {
  serviceName: string;
  bookings: number;
  revenue: number;
  /** Share of the period's revenue, 0–1. */
  share: number;
};

export type PeriodSummary = {
  from: string;
  to: string;
  bookings: number;
  revenue: number;
  averageValue: number;
  /** Share of bookings made online, 0–1. */
  onlineShare: number;
};

export type BeforeAfter = {
  /** The day REYNAV started working for the business. */
  splitOn: string;
  before: PeriodSummary;
  after: PeriodSummary;
  byService: { serviceName: string; beforeRevenue: number; afterRevenue: number }[];
};

/** Where the booking numbers came from, so the screen can say so. */
export type BookingDataSource = "csv" | "platform";

export type BookingPerformance = {
  dataSource: BookingDataSource;
  serviceRevenue: ServiceRevenue[];
  beforeAfter: BeforeAfter | null;
  periodLabel: string;
  stages: FunnelStage[];
  /** Share of website visits that became bookings, 0–1. */
  conversionRate: number;
  integrations: BookingIntegration[];
};
