import type {
  Alert,
  Customer,
  Driver,
  Expense,
  Invoice,
  Load,
  NavaranData,
  Payment,
  Shipment,
  ShipmentEvent,
  Vehicle,
} from "./types";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
/** لنگر زمانی گردشده به ساعت، تا داده‌ها بین سرور و مرورگر یکسان بمانند. */
const BOOT = Math.floor(Date.now() / HOUR) * HOUR;

const at = (offsetMs: number) => new Date(BOOT + offsetMs).toISOString();

export const STORE_KEY = "navaran-demo-store";
export const STORE_VERSION = "v1";

const CUSTOMERS: Omit<Customer, "id" | "createdAt">[] = [
  { name: "Al Maya Foods Trading LLC", contactName: "Khalid Al Suwaidi", email: "ops@almaya-foods.ae", phone: "+971 4 338 1122", emirate: "دبی", trn: "100482731500003", industry: "مواد غذایی", creditLimitAed: 250000, status: "active" },
  { name: "Marina Fresh Distribution", contactName: "Sara Haddad", email: "logistics@marinafresh.ae", phone: "+971 4 552 8840", emirate: "دبی", trn: "100736291400003", industry: "میوه و سبزیجات", creditLimitAed: 180000, status: "active" },
  { name: "GulfCare Pharma FZE", contactName: "Dr. Amina Yusuf", email: "supply@gulfcare.ae", phone: "+971 4 701 3390", emirate: "شارجه", trn: "100918273600003", industry: "دارو و تجهیزات", creditLimitAed: 400000, status: "active" },
  { name: "Falcon Electronics DMCC", contactName: "Rohit Menon", email: "rohit@falconelec.ae", phone: "+971 4 445 2201", emirate: "دبی", trn: "100223344500003", industry: "الکترونیک", creditLimitAed: 320000, status: "active" },
  { name: "Sahara Building Materials", contactName: "Omar Al Hammadi", email: "accounts@saharabuild.ae", phone: "+971 2 671 4432", emirate: "ابوظبی", trn: "100556677800003", industry: "مصالح ساختمانی", creditLimitAed: 150000, status: "active" },
  { name: "Oasis Retail Group", contactName: "Leila Nasser", email: "leila@oasisretail.ae", phone: "+971 6 522 7781", emirate: "شارجه", trn: "100889900100003", industry: "خرده‌فروشی", creditLimitAed: 275000, status: "active" },
  { name: "Dune Textiles Trading", contactName: "Hassan Rezaei", email: "hassan@dunetextiles.ae", phone: "+971 4 289 6644", emirate: "دبی", trn: "100334455600003", industry: "نساجی", creditLimitAed: 120000, status: "active" },
  { name: "Hilal Auto Parts LLC", contactName: "Yousef Karim", email: "yousef@hilalparts.ae", phone: "+971 7 244 9900", emirate: "رأس‌الخیمه", trn: "100112233400003", industry: "قطعات خودرو", creditLimitAed: 90000, status: "active" },
  { name: "Zenith Chemicals FZE", contactName: "Nadia Farouk", email: "ops@zenithchem.ae", phone: "+971 4 812 3344", emirate: "دبی", trn: "100667788900003", industry: "مواد شیمیایی", creditLimitAed: 500000, status: "active" },
  { name: "Pearl Home Décor", contactName: "Mariam Al Ali", email: "mariam@pearlhome.ae", phone: "+971 9 222 1177", emirate: "فجیره", trn: "100990011200003", industry: "دکوراسیون", creditLimitAed: 75000, status: "active" },
];

const DRIVERS: Omit<Driver, "id">[] = [
  { name: "Rashid Al Mansoori", phone: "+971 50 442 1188", licenseNo: "DXB-849213", emirate: "دبی", rating: 4.9, status: "on_route" },
  { name: "Imran Khan", phone: "+971 55 771 4402", licenseNo: "DXB-772901", emirate: "دبی", rating: 4.7, status: "on_route" },
  { name: "Sanjay Kumar", phone: "+971 52 339 8821", licenseNo: "SHJ-118743", emirate: "شارجه", rating: 4.8, status: "available" },
  { name: "Abdullah Al Balushi", phone: "+971 56 882 3311", licenseNo: "AUH-556218", emirate: "ابوظبی", rating: 4.6, status: "on_route" },
  { name: "Mohammed Irfan", phone: "+971 50 990 2244", licenseNo: "DXB-663311", emirate: "دبی", rating: 4.5, status: "available" },
  { name: "Rajesh Nair", phone: "+971 54 220 9911", licenseNo: "AJM-332190", emirate: "عجمان", rating: 4.8, status: "on_route" },
  { name: "Bilal Ahmed", phone: "+971 58 118 7733", licenseNo: "DXB-901224", emirate: "دبی", rating: 4.4, status: "rest" },
  { name: "Salem Al Zaabi", phone: "+971 50 774 1100", licenseNo: "AUH-441098", emirate: "ابوظبی", rating: 4.9, status: "available" },
  { name: "Vinod Thomas", phone: "+971 55 330 8822", licenseNo: "RAK-228741", emirate: "رأس‌الخیمه", rating: 4.6, status: "available" },
  { name: "Tariq Hussain", phone: "+971 52 661 4477", licenseNo: "SHJ-774512", emirate: "شارجه", rating: 4.7, status: "on_route" },
];

const VEHICLES: Omit<Vehicle, "id" | "lastPingAt">[] = [
  { plate: "DXB 48217", type: "reefer", make: "Mercedes-Benz", model: "Actros 2545", capacityKg: 18000, status: "on_route", currentCity: "دبی", lat: 25.118, lng: 55.201, speedKph: 78, fuelPct: 64, tempC: 4.2, odometerKm: 214500, driverId: 1 },
  { plate: "AUH 19284", type: "curtain", make: "Volvo", model: "FH16", capacityKg: 24000, status: "on_route", currentCity: "ابوظبی", lat: 24.512, lng: 54.401, speedKph: 86, fuelPct: 51, tempC: 31.5, odometerKm: 338200, driverId: 4 },
  { plate: "SHJ 33871", type: "flatbed", make: "MAN", model: "TGS 33.400", capacityKg: 22000, status: "on_route", currentCity: "شارجه", lat: 25.311, lng: 55.512, speedKph: 42, fuelPct: 73, tempC: 34.1, odometerKm: 187600, driverId: 10 },
  { plate: "DXB 90512", type: "van", make: "Isuzu", model: "NPR 75", capacityKg: 4500, status: "on_route", currentCity: "دبی", lat: 25.089, lng: 55.148, speedKph: 54, fuelPct: 82, tempC: 26.4, odometerKm: 98400, driverId: 6 },
  { plate: "AJM 77403", type: "curtain", make: "Scania", model: "R450", capacityKg: 24000, status: "idle", currentCity: "عجمان", lat: 25.405, lng: 55.513, speedKph: 0, fuelPct: 91, tempC: 29.8, odometerKm: 152700, driverId: 3 },
  { plate: "DXB 61044", type: "reefer", make: "Mercedes-Benz", model: "Atego 1224", capacityKg: 7500, status: "on_route", currentCity: "ابوظبی", lat: 24.821, lng: 54.901, speedKph: 68, fuelPct: 47, tempC: -18.4, odometerKm: 121300, driverId: 2 },
  { plate: "RAK 28190", type: "trailer", make: "Volvo", model: "FMX 460", capacityKg: 32000, status: "maintenance", currentCity: "رأس‌الخیمه", lat: 25.789, lng: 55.943, speedKph: 0, fuelPct: 38, tempC: 33.2, odometerKm: 402100, driverId: 9 },
  { plate: "AUH 55017", type: "tanker", make: "MAN", model: "TGS 26.440", capacityKg: 20000, status: "on_route", currentCity: "ابوظبی", lat: 24.201, lng: 54.612, speedKph: 72, fuelPct: 59, tempC: 28.9, odometerKm: 276400, driverId: 8 },
  { plate: "SHJ 40922", type: "van", make: "Toyota", model: "Hiace", capacityKg: 1200, status: "on_route", currentCity: "دبی", lat: 25.244, lng: 55.331, speedKph: 38, fuelPct: 66, tempC: 25.1, odometerKm: 64800, driverId: 5 },
  { plate: "DXB 73018", type: "flatbed", make: "Scania", model: "G410", capacityKg: 18000, status: "idle", currentCity: "دبی", lat: 25.012, lng: 55.061, speedKph: 0, fuelPct: 88, tempC: 30.4, odometerKm: 198700, driverId: null },
  { plate: "FUJ 11307", type: "curtain", make: "Isuzu", model: "Giga 360", capacityKg: 16000, status: "on_route", currentCity: "فجیره", lat: 25.211, lng: 56.012, speedKph: 61, fuelPct: 55, tempC: 32.7, odometerKm: 143200, driverId: 7 },
  { plate: "DXB 88455", type: "reefer", make: "Volvo", model: "FE280", capacityKg: 11000, status: "idle", currentCity: "دبی", lat: 24.987, lng: 55.027, speedKph: 0, fuelPct: 94, tempC: 2.8, odometerKm: 87500, driverId: null },
];

export const STATUS_FLOW = ["booked", "picked_up", "in_transit", "customs", "out_for_delivery", "delivered"];

type ShipmentRaw = {
  code: string;
  customer: number;
  originCity: string;
  destCity: string;
  destEmirate: string;
  destCountry?: string;
  mode: string;
  service: string;
  status: string;
  cargoType: string;
  weightKg: number;
  volumeM3: number;
  pieces: number;
  revenueAed: number;
  costAed: number;
  progressPct: number;
  vehicle: number | null;
  driver: number | null;
  pickup: number;
  eta: number;
  temp?: number;
  incoterm?: string;
};

const SHIPMENTS: ShipmentRaw[] = [
  { code: "NAV-7K42QD", customer: 0, originCity: "جبل علی (دبی)", destCity: "الهاملیا", destEmirate: "دبی", mode: "road", service: "reefer", status: "in_transit", cargoType: "غذای یخچالی", weightKg: 14200, volumeM3: 38, pieces: 620, revenueAed: 4850, costAed: 3120, progressPct: 64, vehicle: 0, driver: 0, pickup: -9 * HOUR, eta: 3 * HOUR, temp: 4 },
  { code: "NAV-9B18LM", customer: 2, originCity: "دبی", destCity: "الریاض", destEmirate: "ریاض", destCountry: "SA", mode: "road", service: "ftl", status: "in_transit", cargoType: "دارو و تجهیزات پزشکی", weightKg: 8600, volumeM3: 24, pieces: 210, revenueAed: 12400, costAed: 8100, progressPct: 48, vehicle: 1, driver: 3, pickup: -20 * HOUR, eta: 16 * HOUR, temp: 15, incoterm: "DDP" },
  { code: "NAV-3X77AT", customer: 3, originCity: "جبل علی (دبی)", destCity: "گمرک جده", destEmirate: "جده", destCountry: "SA", mode: "sea", service: "b2b", status: "customs", cargoType: "قطعات الکترونیکی", weightKg: 17800, volumeM3: 62, pieces: 144, revenueAed: 22750, costAed: 15300, progressPct: 82, vehicle: null, driver: null, pickup: -6 * DAY, eta: 2 * DAY },
  { code: "NAV-6M05CV", customer: 1, originCity: "دبی", destCity: "ابوظبی", destEmirate: "ابوظبی", mode: "road", service: "ftl", status: "out_for_delivery", cargoType: "میوه و سبزیجات تازه", weightKg: 11200, volumeM3: 30, pieces: 480, revenueAed: 3900, costAed: 2450, progressPct: 92, vehicle: 5, driver: 2, pickup: -10 * HOUR, eta: 1 * HOUR, temp: 6 },
  { code: "NAV-1Z64PH", customer: 4, originCity: "ابوظبی", destCity: "الرویس", destEmirate: "ابوظبی", mode: "road", service: "ftl", status: "delivered", cargoType: "مصالح ساختمانی", weightKg: 23800, volumeM3: 44, pieces: 96, revenueAed: 5600, costAed: 3980, progressPct: 100, vehicle: 7, driver: 4, pickup: -2 * DAY, eta: -1 * DAY },
  { code: "NAV-8T23RN", customer: 5, originCity: "شارجه", destCity: "دبی", destEmirate: "دبی", mode: "road", service: "last_mile", status: "delivered", cargoType: "کالای خرده‌فروشی", weightKg: 3400, volumeM3: 12, pieces: 320, revenueAed: 1450, costAed: 890, progressPct: 100, vehicle: 8, driver: 5, pickup: -1 * DAY, eta: -20 * HOUR },
  { code: "NAV-4H92FW", customer: 6, originCity: "دبی", destCity: "دوحه", destEmirate: "دوحه", destCountry: "QA", mode: "road", service: "ftl", status: "booked", cargoType: "منسوجات", weightKg: 9600, volumeM3: 34, pieces: 260, revenueAed: 7800, costAed: 5100, progressPct: 0, vehicle: 4, driver: 3, pickup: 12 * HOUR, eta: 36 * HOUR },
  { code: "NAV-5W71GK", customer: 7, originCity: "رأس‌الخیمه", destCity: "شارجه", destEmirate: "شارجه", mode: "road", service: "ltl", status: "picked_up", cargoType: "قطعات خودرو", weightKg: 5200, volumeM3: 18, pieces: 74, revenueAed: 2350, costAed: 1490, progressPct: 18, vehicle: 2, driver: 9, pickup: -2 * HOUR, eta: 5 * HOUR },
  { code: "NAV-2P38DX", customer: 8, originCity: "جبل علی (دبی)", destCity: "ابوظبی", destEmirate: "ابوظبی", mode: "road", service: "ftl", status: "in_transit", cargoType: "مواد شیمیایی (کلاس ۸)", weightKg: 18600, volumeM3: 40, pieces: 120, revenueAed: 9200, costAed: 6300, progressPct: 56, vehicle: 7, driver: 7, pickup: -6 * HOUR, eta: 4 * HOUR, incoterm: "EXW" },
  { code: "NAV-0R55BQ", customer: 9, originCity: "فجیره", destCity: "دبی", destEmirate: "دبی", mode: "road", service: "ltl", status: "exception", cargoType: "دکوراسیون منزل", weightKg: 4100, volumeM3: 26, pieces: 88, revenueAed: 2100, costAed: 2560, progressPct: 35, vehicle: 10, driver: 8, pickup: -14 * HOUR, eta: 2 * HOUR },
  { code: "NAV-6J19YY", customer: 0, originCity: "دبی", destCity: "کویت‌سیتی", destEmirate: "کویت", destCountry: "KW", mode: "road", service: "ftl", status: "in_transit", cargoType: "مواد غذایی بسته‌بندی", weightKg: 15400, volumeM3: 42, pieces: 540, revenueAed: 13600, costAed: 9200, progressPct: 72, vehicle: 1, driver: 1, pickup: -28 * HOUR, eta: 20 * HOUR },
  { code: "NAV-7D62SS", customer: 2, originCity: "شارجه", destCity: "عجمان", destEmirate: "عجمان", mode: "road", service: "last_mile", status: "delivered", cargoType: "دارو (زنجیره سرد)", weightKg: 1800, volumeM3: 9, pieces: 140, revenueAed: 1250, costAed: 720, progressPct: 100, vehicle: 11, driver: 6, pickup: -3 * DAY, eta: -3 * DAY + 6 * HOUR, temp: 3 },
  { code: "NAV-8F41MC", customer: 3, originCity: "دبی", destCity: "منامه", destEmirate: "منامه", destCountry: "BH", mode: "air", service: "b2b", status: "booked", cargoType: "الکترونیک حساس", weightKg: 1400, volumeM3: 6, pieces: 38, revenueAed: 9800, costAed: 7200, progressPct: 0, vehicle: null, driver: null, pickup: 2 * DAY, eta: 3 * DAY },
  { code: "NAV-9C27NB", customer: 1, originCity: "دبی", destCity: "العین", destEmirate: "ابوظبی", mode: "road", service: "reefer", status: "out_for_delivery", cargoType: "لبنیات", weightKg: 6400, volumeM3: 20, pieces: 210, revenueAed: 2980, costAed: 1810, progressPct: 88, vehicle: 5, driver: 0, pickup: -7 * HOUR, eta: 2 * HOUR, temp: 4 },
  { code: "NAV-3G88TV", customer: 5, originCity: "ابوظبی", destCity: "مسقط", destEmirate: "مسقط", destCountry: "OM", mode: "road", service: "ftl", status: "delivered", cargoType: "کالای عمومی", weightKg: 12400, volumeM3: 36, pieces: 180, revenueAed: 10400, costAed: 7100, progressPct: 100, vehicle: 7, driver: 3, pickup: -5 * DAY, eta: -3 * DAY },
  { code: "NAV-1L40KJ", customer: 4, originCity: "دبی", destCity: "ابوظبی", destEmirate: "ابوظبی", mode: "road", service: "ftl", status: "delivered", cargoType: "سیمان و مصالح", weightKg: 24200, volumeM3: 40, pieces: 60, revenueAed: 5900, costAed: 4100, progressPct: 100, vehicle: 2, driver: 9, pickup: -7 * DAY, eta: -6 * DAY },
];

const EVENT_TITLES: Record<string, string> = {
  booked: "محموله ثبت شد و بارنامه صادر گردید",
  picked_up: "بارگیری در مبدأ انجام شد",
  in_transit: "محموله از مرکز توزیع خارج شد",
  customs: "ورود به محوطه گمرکی",
  out_for_delivery: "تخصیص به راننده توزیع نهایی",
  delivered: "تحویل با امضای گیرنده",
};

function journey(shipment: Shipment, seed: ShipmentRaw): ShipmentEvent[] {
  const targetIndex = seed.status === "exception" ? 2 : STATUS_FLOW.indexOf(seed.status);
  const steps = targetIndex >= 0 ? targetIndex + 1 : 1;
  const pickup = new Date(shipment.pickupAt).getTime();
  const eta = new Date(shipment.etaAt).getTime();
  const result: ShipmentEvent[] = [];
  for (let i = 0; i < steps; i += 1) {
    const status = STATUS_FLOW[i];
    result.push({
      id: 0,
      shipmentId: shipment.id,
      status,
      title: EVENT_TITLES[status],
      location:
        i === 0
          ? `${seed.originCity}, AE`
          : `${seed.destCity}${seed.destCountry && seed.destCountry !== "AE" ? `, ${seed.destCountry}` : ", AE"}`,
      note:
        status === "customs"
          ? "اظهارنامه گمرکی ثبت و بارنامه T1 صادر شد."
          : status === "in_transit"
            ? "پینگ GPS هر ۵ دقیقه ثبت می‌شود."
            : "به‌روزرسانی توسط مرکز کنترل دبی.",
      occurredAt: new Date(pickup + (i / Math.max(steps - 1, 1)) * (eta - pickup) * 0.92).toISOString(),
    });
  }
  if (seed.status === "exception") {
    result.push({
      id: 0,
      shipmentId: shipment.id,
      status: "exception",
      title: "تأخیر به دلیل محدودیت جاده‌ای",
      location: `${seed.destCity}, AE`,
      note: "مسیر جایگزین فعال شد؛ ETA بازمحاسبه گردید.",
      occurredAt: at(-3 * HOUR),
    });
  }
  return result;
}

const LOADS: Omit<Load, "id" | "createdAt" | "readyDate">[] = [
  { reference: "LD-24081", shipperName: "Al Maya Foods Trading", originCity: "جبل علی (دبی)", destCity: "ابوظبی", cargoType: "غذای یخچالی", equipment: "reefer", weightKg: 16000, budgetAed: 4200, bidCount: 6, status: "bidding", contactPhone: "+971 50 221 8844" },
  { reference: "LD-24082", shipperName: "Falcon Electronics DMCC", originCity: "دبی", destCity: "الریاض", cargoType: "قطعات الکترونیکی", equipment: "curtain", weightKg: 12000, budgetAed: 9800, bidCount: 3, status: "open", contactPhone: "+971 55 118 2200" },
  { reference: "LD-24083", shipperName: "Sahara Building Materials", originCity: "ابوظبی", destCity: "العین", cargoType: "مصالح ساختمانی", equipment: "flatbed", weightKg: 24000, budgetAed: 3100, bidCount: 9, status: "bidding", contactPhone: "+971 52 447 9911" },
  { reference: "LD-24084", shipperName: "GulfCare Pharma", originCity: "شارجه", destCity: "جده", cargoType: "دارو (زنجیره سرد)", equipment: "reefer", weightKg: 7200, budgetAed: 14500, bidCount: 2, status: "open", contactPhone: "+971 4 701 3390" },
  { reference: "LD-24085", shipperName: "Oasis Retail Group", originCity: "دبی", destCity: "شارجه", cargoType: "کالای خرده‌فروشی", equipment: "van", weightKg: 2800, budgetAed: 950, bidCount: 11, status: "bidding", contactPhone: "+971 56 903 4411" },
  { reference: "LD-24086", shipperName: "Zenith Chemicals FZE", originCity: "جبل علی (دبی)", destCity: "مسقط", cargoType: "مواد شیمیایی", equipment: "tanker", weightKg: 20000, budgetAed: 11200, bidCount: 4, status: "open", contactPhone: "+971 4 812 3344" },
  { reference: "LD-24087", shipperName: "Pearl Home Décor", originCity: "فجیره", destCity: "دبی", cargoType: "دکوراسیون", equipment: "curtain", weightKg: 4200, budgetAed: 1750, bidCount: 5, status: "open", contactPhone: "+971 9 222 1177" },
  { reference: "LD-24088", shipperName: "Hilal Auto Parts", originCity: "رأس‌الخیمه", destCity: "دوحه", cargoType: "قطعات خودرو", equipment: "curtain", weightKg: 9400, budgetAed: 6800, bidCount: 1, status: "assigned", contactPhone: "+971 7 244 9900" },
  { reference: "LD-24089", shipperName: "Marina Fresh Distribution", originCity: "دبی", destCity: "کویت‌سیتی", cargoType: "میوه و سبزیجات", equipment: "reefer", weightKg: 13500, budgetAed: 11800, bidCount: 7, status: "bidding", contactPhone: "+971 4 552 8840" },
];

const INVOICES: { customer: number; shipment: string; subtotal: number; paid: number; issuedDaysAgo: number; status: string }[] = [
  { customer: 0, shipment: "NAV-7K42QD", subtotal: 4850, paid: 0, issuedDaysAgo: 4, status: "sent" },
  { customer: 2, shipment: "NAV-9B18LM", subtotal: 12400, paid: 12400, issuedDaysAgo: 22, status: "paid" },
  { customer: 3, shipment: "NAV-3X77AT", subtotal: 22750, paid: 10000, issuedDaysAgo: 30, status: "overdue" },
  { customer: 1, shipment: "NAV-6M05CV", subtotal: 3900, paid: 0, issuedDaysAgo: 8, status: "sent" },
  { customer: 4, shipment: "NAV-1Z64PH", subtotal: 5600, paid: 5600, issuedDaysAgo: 34, status: "paid" },
  { customer: 5, shipment: "NAV-8T23RN", subtotal: 1450, paid: 1450, issuedDaysAgo: 12, status: "paid" },
  { customer: 6, shipment: "NAV-4H92FW", subtotal: 7800, paid: 0, issuedDaysAgo: 3, status: "sent" },
  { customer: 7, shipment: "NAV-5W71GK", subtotal: 2350, paid: 1200, issuedDaysAgo: 16, status: "partial" },
  { customer: 8, shipment: "NAV-2P38DX", subtotal: 9200, paid: 0, issuedDaysAgo: 28, status: "overdue" },
  { customer: 9, shipment: "NAV-0R55BQ", subtotal: 2100, paid: 0, issuedDaysAgo: 6, status: "sent" },
  { customer: 0, shipment: "NAV-6J19YY", subtotal: 13600, paid: 6800, issuedDaysAgo: 45, status: "partial" },
  { customer: 3, shipment: "NAV-8F41MC", subtotal: 9800, paid: 0, issuedDaysAgo: 1, status: "draft" },
  { customer: 5, shipment: "NAV-3G88TV", subtotal: 10400, paid: 10400, issuedDaysAgo: 40, status: "paid" },
  { customer: 2, shipment: "NAV-7D62SS", subtotal: 1250, paid: 1250, issuedDaysAgo: 25, status: "paid" },
  { customer: 4, shipment: "NAV-1L40KJ", subtotal: 5900, paid: 0, issuedDaysAgo: 52, status: "overdue" },
];

const EXPENSES: { category: string; description: string; amountAed: number; daysAgo: number }[] = [
  { category: "سوخت", description: "دیزل ناوگان — جایگاه ENOC دبی", amountAed: 4200, daysAgo: 2 },
  { category: "عوارض جاده", description: "عوارض مسیر دبی — ابوظبی", amountAed: 680, daysAgo: 3 },
  { category: "دستمزد راننده", description: "حق‌الزحمه رانندگان شیفت شب", amountAed: 8600, daysAgo: 5 },
  { category: "نگهداری", description: "سرویس دوره‌ای کامیون RAK 28190", amountAed: 2750, daysAgo: 8 },
  { category: "انبار", description: "اجاره انبار جبل علی — واحد B12", amountAed: 18500, daysAgo: 10 },
  { category: "بیمه", description: "بیمه بار و مسئولیت ناوگان", amountAed: 6400, daysAgo: 14 },
  { category: "گمرک", description: "هزینه ترخیص محموله NAV-3X77AT", amountAed: 3150, daysAgo: 6 },
  { category: "سوخت", description: "دیزل ناوگان — جایگاه ADNOC ابوظبی", amountAed: 3870, daysAgo: 1 },
  { category: "دستمزد راننده", description: "پاداش تحویل به‌موقع", amountAed: 2400, daysAgo: 4 },
  { category: "پشتیبانی", description: "اشتراک پشتیبانی محلی امارات", amountAed: 5200, daysAgo: 12 },
];

const ALERTS: Omit<Alert, "id" | "createdAt">[] = [
  { severity: "critical", type: "temperature", title: "انحراف دما در یخچال DXB 61044", detail: "دمای محفظه به -18.4 درجه رسید؛ حد مجاز -20 است.", entityRef: "DXB 61044", isResolved: false },
  { severity: "warning", type: "delay", title: "تأخیر جاده‌ای در محور فجیره — دبی", detail: "محموله NAV-0R55BQ با ۳ ساعت تأخیر مواجه شد.", entityRef: "NAV-0R55BQ", isResolved: false },
  { severity: "warning", type: "finance", title: "فاکتور معوق INV-2026-1043", detail: "۱۲٬۷۵۰ درهم معوق از Falcon Electronics DMCC.", entityRef: "INV-2026-1043", isResolved: false },
  { severity: "info", type: "driver", title: "پایان ساعات مجاز رانندگی", detail: "Bilal Ahmed به استراحت اجباری منتقل شد.", entityRef: "bilal-ahmed", isResolved: false },
  { severity: "info", type: "customs", title: "اظهارنامه گمرکی جده تأیید شد", detail: "محموله NAV-3X77AT آماده ترخیص نهایی است.", entityRef: "NAV-3X77AT", isResolved: true },
];

export function buildSeedData(): NavaranData {
  const customers: Customer[] = CUSTOMERS.map((customer, index) => ({
    ...customer,
    id: index + 1,
    createdAt: at(-(120 - index * 6) * DAY),
  }));

  const drivers: Driver[] = DRIVERS.map((driver, index) => ({ ...driver, id: index + 1 }));

  const vehicles: Vehicle[] = VEHICLES.map((vehicle, index) => ({
    ...vehicle,
    id: index + 1,
    lastPingAt: at(-Math.round(1 + index * 0.7) * 60_000),
  }));

  const shipments: Shipment[] = [];
  const events: ShipmentEvent[] = [];
  let eventId = 0;

  SHIPMENTS.forEach((seed, index) => {
    const shipment: Shipment = {
      id: index + 1,
      trackingCode: seed.code,
      customerId: seed.customer + 1,
      originCity: seed.originCity,
      originEmirate: seed.originCity.includes("ابوظبی") ? "ابوظبی" : "دبی",
      destCity: seed.destCity,
      destEmirate: seed.destEmirate,
      destCountry: seed.destCountry ?? "AE",
      mode: seed.mode,
      service: seed.service,
      status: seed.status,
      cargoType: seed.cargoType,
      weightKg: seed.weightKg,
      volumeM3: seed.volumeM3,
      pieces: seed.pieces,
      incoterm: seed.incoterm ?? "DAP",
      temperatureC: seed.temp ?? null,
      pickupAt: at(seed.pickup),
      etaAt: at(seed.eta),
      deliveredAt: seed.status === "delivered" ? at(seed.eta) : null,
      revenueAed: seed.revenueAed,
      costAed: seed.costAed,
      vehicleId: seed.vehicle === null ? null : seed.vehicle + 1,
      driverId: seed.driver === null ? null : seed.driver + 1,
      progressPct: seed.progressPct,
      notes: "پایلوت امارات — مرکز عملیات دبی.",
      createdAt: at(seed.pickup - 6 * HOUR),
    };
    shipments.push(shipment);
    journey(shipment, seed).forEach((event) => {
      eventId += 1;
      events.push({ ...event, id: eventId });
    });
  });

  // تاریخچه پنج ماه گذشته برای نمودار روند
  const historyLanes = [
    { city: "الریاض", country: "SA", cargo: "کالای عمومی", revenue: 11800 },
    { city: "ابوظبی", country: "AE", cargo: "غذای یخچالی", revenue: 4200 },
    { city: "دوحه", country: "QA", cargo: "مصالح ساختمانی", revenue: 7600 },
    { city: "جده", country: "SA", cargo: "قطعات الکترونیکی", revenue: 15400 },
    { city: "شارجه", country: "AE", cargo: "کالای خرده‌فروشی", revenue: 2100 },
    { city: "مسقط", country: "OM", cargo: "میوه و سبزیجات", revenue: 9800 },
  ];

  const history: Shipment[] = [];
  for (let monthBack = 5; monthBack >= 1; monthBack -= 1) {
    for (let i = 0; i < 4; i += 1) {
      const lane = historyLanes[(monthBack + i) % historyLanes.length];
      const base = new Date(BOOT);
      base.setHours(8 + i, 30, 0, 0);
      base.setDate(3 + i * 6);
      base.setMonth(base.getMonth() - monthBack);
      const pickup = base.getTime();
      const eta = pickup + 30 * HOUR;
      const revenue = lane.revenue + i * 420 + (5 - monthBack) * 260;
      const id = shipments.length + 1;
      history.push({
        id,
        trackingCode: `NAV-H${monthBack}${i}${String.fromCharCode(65 + ((monthBack * 4 + i) % 26))}${String.fromCharCode(70 + ((monthBack + i) % 19))}`,
        customerId: ((monthBack + i) % customers.length) + 1,
        originCity: "جبل علی (دبی)",
        originEmirate: "دبی",
        destCity: lane.city,
        destEmirate: lane.city,
        destCountry: lane.country,
        mode: lane.country !== "AE" && i === 3 ? "sea" : "road",
        service: i % 3 === 0 ? "ftl" : "ltl",
        status: "delivered",
        cargoType: lane.cargo,
        weightKg: 6000 + i * 2200,
        volumeM3: 18 + i * 4,
        pieces: 80 + i * 20,
        incoterm: "DAP",
        temperatureC: null,
        pickupAt: new Date(pickup).toISOString(),
        etaAt: new Date(eta).toISOString(),
        deliveredAt: new Date(eta - 45 * 60_000).toISOString(),
        revenueAed: revenue,
        costAed: Math.round(revenue * (0.6 + i * 0.02)),
        vehicleId: null,
        driverId: null,
        progressPct: 100,
        notes: "تاریخچه عملیاتی پایلوت امارات.",
        createdAt: new Date(pickup - 6 * HOUR).toISOString(),
      });
    }
  }
  shipments.push(...history);

  [...history].forEach((shipment) => {
    eventId += 1;
    events.push({
      id: eventId,
      shipmentId: shipment.id,
      status: "booked",
      title: EVENT_TITLES.booked,
      location: "جبل علی, AE",
      note: "ثبت تاریخی از سامانه.",
      occurredAt: new Date(new Date(shipment.pickupAt).getTime() - 5 * HOUR).toISOString(),
    });
    eventId += 1;
    events.push({
      id: eventId,
      shipmentId: shipment.id,
      status: "delivered",
      title: EVENT_TITLES.delivered,
      location: `${shipment.destCity}, ${shipment.destCountry}`,
      note: "تحویل به‌موقع ثبت شد.",
      occurredAt: shipment.deliveredAt ?? shipment.pickupAt,
    });
  });

  const loads: Load[] = LOADS.map((load, index) => ({
    ...load,
    id: index + 1,
    readyDate: at((6 + index * 8) * HOUR),
    createdAt: at(-(index * 3 + 1) * HOUR),
  }));

  const invoices: Invoice[] = [];
  const payments: Payment[] = [];
  let paymentId = 0;
  let invoiceIndex = 0;

  const pushInvoice = (input: {
    customerId: number;
    shipmentId: number | null;
    subtotal: number;
    paid: number;
    issueDate: string;
    dueDate: string;
    status: string;
    number: string;
  }) => {
    const vat = Math.round(input.subtotal * 0.05);
    invoiceIndex += 1;
    const invoice: Invoice = {
      id: invoiceIndex,
      number: input.number,
      customerId: input.customerId,
      shipmentId: input.shipmentId,
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      subtotalAed: input.subtotal,
      vatAed: vat,
      totalAed: input.subtotal + vat,
      paidAed: input.paid,
      status: input.status,
    };
    invoices.push(invoice);
    if (input.paid > 0) {
      paymentId += 1;
      payments.push({
        id: paymentId,
        invoiceId: invoice.id,
        amountAed: input.paid,
        method: paymentId % 3 === 0 ? "bank_transfer" : paymentId % 3 === 1 ? "cheque" : "card",
        reference: `PAY-2026${String(7100 + paymentId)}`,
        paidAt: at(-(3 + paymentId * 2) * DAY),
      });
    }
    return invoice;
  };

  INVOICES.forEach((seed, index) => {
    const shipment = shipments.find((row) => row.trackingCode === seed.shipment);
    pushInvoice({
      customerId: seed.customer + 1,
      shipmentId: shipment?.id ?? null,
      subtotal: seed.subtotal,
      paid: seed.paid,
      issueDate: at(-seed.issuedDaysAgo * DAY),
      dueDate: at(-(seed.issuedDaysAgo - 30) * DAY),
      status: seed.status,
      number: `INV-2026-${String(1041 + index).padStart(4, "0")}`,
    });
  });

  history.forEach((shipment, index) => {
    const subtotal = shipment.revenueAed;
    const vat = Math.round(subtotal * 0.05);
    pushInvoice({
      customerId: shipment.customerId,
      shipmentId: shipment.id,
      subtotal,
      paid: subtotal + vat,
      issueDate: new Date(new Date(shipment.pickupAt).getTime() + DAY).toISOString(),
      dueDate: new Date(new Date(shipment.pickupAt).getTime() + 31 * DAY).toISOString(),
      status: "paid",
      number: `INV-2025-${String(1301 + index).padStart(4, "0")}`,
    });
  });

  const expenses: Expense[] = EXPENSES.map((expense, index) => ({
    id: index + 1,
    category: expense.category,
    description: expense.description,
    amountAed: expense.amountAed,
    shipmentId: null,
    incurredAt: at(-expense.daysAgo * DAY),
  }));

  const alerts: Alert[] = ALERTS.map((alert, index) => ({
    ...alert,
    id: index + 1,
    createdAt: at(-(index * 2 + 0.75) * HOUR),
  }));

  return { customers, drivers, vehicles, shipments, events, loads, invoices, payments, expenses, alerts };
}
