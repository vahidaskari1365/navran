export type Customer = {
  id: number;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  emirate: string;
  trn: string;
  industry: string;
  creditLimitAed: number;
  status: string;
  createdAt: string;
};

export type Driver = {
  id: number;
  name: string;
  phone: string;
  licenseNo: string;
  emirate: string;
  rating: number;
  status: string;
};

export type Vehicle = {
  id: number;
  plate: string;
  type: string;
  make: string;
  model: string;
  capacityKg: number;
  status: string;
  currentCity: string;
  lat: number;
  lng: number;
  speedKph: number;
  fuelPct: number;
  tempC: number;
  odometerKm: number;
  driverId: number | null;
  lastPingAt: string;
};

export type Shipment = {
  id: number;
  trackingCode: string;
  customerId: number;
  originCity: string;
  originEmirate: string;
  destCity: string;
  destEmirate: string;
  destCountry: string;
  mode: string;
  service: string;
  status: string;
  cargoType: string;
  weightKg: number;
  volumeM3: number;
  pieces: number;
  incoterm: string;
  temperatureC: number | null;
  pickupAt: string;
  etaAt: string;
  deliveredAt: string | null;
  revenueAed: number;
  costAed: number;
  vehicleId: number | null;
  driverId: number | null;
  progressPct: number;
  notes: string | null;
  createdAt: string;
};

export type ShipmentEvent = {
  id: number;
  shipmentId: number;
  status: string;
  title: string;
  location: string;
  note: string | null;
  occurredAt: string;
};

export type Load = {
  id: number;
  reference: string;
  shipperName: string;
  originCity: string;
  destCity: string;
  cargoType: string;
  equipment: string;
  weightKg: number;
  readyDate: string;
  budgetAed: number;
  bidCount: number;
  status: string;
  contactPhone: string;
  createdAt: string;
};

export type Invoice = {
  id: number;
  number: string;
  customerId: number;
  shipmentId: number | null;
  issueDate: string;
  dueDate: string;
  subtotalAed: number;
  vatAed: number;
  totalAed: number;
  paidAed: number;
  status: string;
};

export type Payment = {
  id: number;
  invoiceId: number;
  amountAed: number;
  method: string;
  reference: string;
  paidAt: string;
};

export type Expense = {
  id: number;
  category: string;
  description: string;
  amountAed: number;
  shipmentId: number | null;
  incurredAt: string;
};

export type Alert = {
  id: number;
  severity: string;
  type: string;
  title: string;
  detail: string;
  entityRef: string | null;
  isResolved: boolean;
  createdAt: string;
};

export type NavaranData = {
  customers: Customer[];
  drivers: Driver[];
  vehicles: Vehicle[];
  shipments: Shipment[];
  events: ShipmentEvent[];
  loads: Load[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  alerts: Alert[];
};

export type ShipmentRow = Shipment & {
  customerName: string | null;
  vehiclePlate: string | null;
  driverName: string | null;
};

export type NewShipmentInput = {
  customerId: number;
  originCity: string;
  originEmirate: string;
  destCity: string;
  destEmirate: string;
  destCountry: string;
  mode: string;
  service: string;
  cargoType: string;
  weightKg: number;
  volumeM3: number;
  pieces: number;
  incoterm: string;
  temperatureC: number | null;
  pickupAt: string;
  etaAt: string;
  revenueAed: number;
  costAed: number;
  notes: string;
  issueInvoice: boolean;
};

export type NewLoadInput = {
  shipperName: string;
  originCity: string;
  destCity: string;
  cargoType: string;
  equipment: string;
  weightKg: number;
  readyDate: string;
  budgetAed: number;
  contactPhone: string;
};
