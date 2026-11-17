"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { buildSeedData, STORE_KEY, STORE_VERSION } from "./seed";
import type { NavaranData, NewLoadInput, NewShipmentInput, Shipment } from "./types";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

function nextId(rows: { id: number }[]) {
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

function newCode(existing: Shipment[]) {
  const used = new Set(existing.map((s) => s.trackingCode));
  for (let attempt = 0; attempt < 20; attempt += 1) {
    let code = "";
    for (let i = 0; i < 6; i += 1) code += CHARS[Math.floor(Math.random() * CHARS.length)];
    const candidate = `NAV-${code}`;
    if (!used.has(candidate)) return candidate;
  }
  return `NAV-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

const PROGRESS: Record<string, number> = {
  booked: 5,
  picked_up: 20,
  in_transit: 55,
  customs: 75,
  out_for_delivery: 90,
  delivered: 100,
  exception: 40,
  cancelled: 0,
};

const TITLES: Record<string, string> = {
  booked: "محموله ثبت شد",
  picked_up: "بارگیری انجام شد",
  in_transit: "محموله در مسیر است",
  customs: "ورود به فرآیند گمرکی",
  out_for_delivery: "تخصیص به توزیع نهایی",
  delivered: "تحویل با امضای گیرنده",
  exception: "ثبت استثنا در مسیر",
  cancelled: "لغو محموله",
};

const nowIso = () => new Date().toISOString();

export type NavaranStore = {
  data: NavaranData;
  hydrated: boolean;
  createShipment: (input: NewShipmentInput) => Shipment;
  addTrackingEvent: (shipmentId: number, status: string, location: string, note: string) => void;
  assignResources: (shipmentId: number, vehicleId: number | null, driverId: number | null) => void;
  createLoad: (input: NewLoadInput) => void;
  placeBid: (loadId: number) => void;
  convertLoad: (loadId: number) => Shipment | null;
  recordPayment: (invoiceId: number, amountAed: number, method: string) => void;
  addExpense: (category: string, description: string, amountAed: number, dateIso: string) => void;
  simulateTelemetry: () => void;
  resolveAlert: (alertId: number) => void;
  markInvoiceSent: (invoiceId: number) => void;
  resetDemo: () => void;
};

const NavaranContext = createContext<NavaranStore | null>(null);

export function NavaranProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<NavaranData>(() => buildSeedData());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { version?: string; data?: NavaranData };
        if (parsed.version === STORE_VERSION && parsed.data?.shipments?.length) {
          setData(parsed.data);
        }
      }
    } catch {
      // اگر ذخیره‌سازی مرورگر در دسترس نبود، از داده پیش‌فرض استفاده می‌کنیم
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ version: STORE_VERSION, data }));
    } catch {
      // دسترسی به localStorage ممکن نیست
    }
  }, [data, hydrated]);

  const createShipment = useCallback((input: NewShipmentInput) => {
    let created: Shipment | null = null;
    setData((prev) => {
      const id = nextId(prev.shipments);
      const shipment: Shipment = {
        id,
        trackingCode: newCode(prev.shipments),
        customerId: input.customerId,
        originCity: input.originCity,
        originEmirate: input.originEmirate,
        destCity: input.destCity,
        destEmirate: input.destEmirate,
        destCountry: input.destCountry,
        mode: input.mode,
        service: input.service,
        status: "booked",
        cargoType: input.cargoType,
        weightKg: input.weightKg,
        volumeM3: input.volumeM3,
        pieces: input.pieces,
        incoterm: input.incoterm,
        temperatureC: input.temperatureC,
        pickupAt: input.pickupAt,
        etaAt: input.etaAt,
        deliveredAt: null,
        revenueAed: input.revenueAed,
        costAed: input.costAed,
        vehicleId: null,
        driverId: null,
        progressPct: 5,
        notes: input.notes || null,
        createdAt: nowIso(),
      };
      created = shipment;
      const event = {
        id: nextId(prev.events),
        shipmentId: id,
        status: "booked",
        title: "محموله در مرکز کنترل دبی ثبت شد",
        location: `${input.originCity}, AE`,
        note: "بارنامه صادر و کد رهگیری برای مشتری ارسال شد.",
        occurredAt: nowIso(),
      };
      const invoice = input.issueInvoice
        ? (() => {
            const vat = Math.round(input.revenueAed * 0.05);
            return {
              id: nextId(prev.invoices),
              number: `INV-2026-${String(1100 + prev.invoices.length)}`,
              customerId: input.customerId,
              shipmentId: id,
              issueDate: nowIso(),
              dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
              subtotalAed: input.revenueAed,
              vatAed: vat,
              totalAed: input.revenueAed + vat,
              paidAed: 0,
              status: "sent",
            };
          })()
        : null;
      return {
        ...prev,
        shipments: [shipment, ...prev.shipments],
        events: [event, ...prev.events],
        invoices: invoice ? [invoice, ...prev.invoices] : prev.invoices,
      };
    });
    return created as unknown as Shipment;
  }, []);

  const addTrackingEvent = useCallback((shipmentId: number, status: string, location: string, note: string) => {
    setData((prev) => ({
      ...prev,
      events: [
        {
          id: nextId(prev.events),
          shipmentId,
          status,
          title: TITLES[status] ?? "به‌روزرسانی وضعیت",
          location: location || "Dubai, AE",
          note: note || null,
          occurredAt: nowIso(),
        },
        ...prev.events,
      ],
      shipments: prev.shipments.map((shipment) =>
        shipment.id === shipmentId
          ? {
              ...shipment,
              status,
              progressPct: PROGRESS[status] ?? 50,
              deliveredAt: status === "delivered" ? nowIso() : null,
            }
          : shipment,
      ),
    }));
  }, []);

  const assignResources = useCallback((shipmentId: number, vehicleId: number | null, driverId: number | null) => {
    setData((prev) => ({
      ...prev,
      shipments: prev.shipments.map((shipment) =>
        shipment.id === shipmentId ? { ...shipment, vehicleId, driverId } : shipment,
      ),
      vehicles: prev.vehicles.map((vehicle) =>
        vehicleId && vehicle.id === vehicleId ? { ...vehicle, status: "on_route", driverId } : vehicle,
      ),
      events: [
        {
          id: nextId(prev.events),
          shipmentId,
          status: "booked",
          title: "ناوگان و راننده تخصیص یافتند",
          location: "مرکز کنترل دبی",
          note: "تخصیص منابع از طریق مرکز کنترل انجام شد.",
          occurredAt: nowIso(),
        },
        ...prev.events,
      ],
    }));
  }, []);

  const createLoad = useCallback((input: NewLoadInput) => {
    setData((prev) => ({
      ...prev,
      loads: [
        {
          id: nextId(prev.loads),
          reference: `LD-${Math.floor(24000 + Math.random() * 900)}`,
          shipperName: input.shipperName,
          originCity: input.originCity,
          destCity: input.destCity,
          cargoType: input.cargoType,
          equipment: input.equipment,
          weightKg: input.weightKg,
          readyDate: input.readyDate || new Date(Date.now() + 86400000).toISOString(),
          budgetAed: input.budgetAed,
          bidCount: 0,
          status: "open",
          contactPhone: input.contactPhone,
          createdAt: nowIso(),
        },
        ...prev.loads,
      ],
    }));
  }, []);

  const placeBid = useCallback((loadId: number) => {
    setData((prev) => ({
      ...prev,
      loads: prev.loads.map((load) =>
        load.id === loadId
          ? { ...load, bidCount: load.bidCount + 1, status: load.status === "open" ? "bidding" : load.status }
          : load,
      ),
    }));
  }, []);

  const convertLoad = useCallback((loadId: number) => {
    let created: Shipment | null = null;
    setData((prev) => {
      const load = prev.loads.find((row) => row.id === loadId);
      if (!load) return prev;
      const customer = prev.customers[0];
      if (!customer) return prev;
      const id = nextId(prev.shipments);
      const shipment: Shipment = {
        id,
        trackingCode: newCode(prev.shipments),
        customerId: customer.id,
        originCity: load.originCity,
        originEmirate: "دبی",
        destCity: load.destCity,
        destEmirate: load.destCity,
        destCountry: "AE",
        mode: "road",
        service: load.equipment === "reefer" ? "reefer" : "ftl",
        status: "booked",
        cargoType: load.cargoType,
        weightKg: load.weightKg,
        volumeM3: Math.max(4, Math.round(load.weightKg / 400)),
        pieces: 1,
        incoterm: "DAP",
        temperatureC: null,
        pickupAt: load.readyDate,
        etaAt: new Date(new Date(load.readyDate).getTime() + 2 * 86400000).toISOString(),
        deliveredAt: null,
        revenueAed: load.budgetAed,
        costAed: Math.round(load.budgetAed * 0.66),
        vehicleId: null,
        driverId: null,
        progressPct: 5,
        notes: `تبدیل شده از تخته بار ${load.reference}`,
        createdAt: nowIso(),
      };
      created = shipment;
      return {
        ...prev,
        shipments: [shipment, ...prev.shipments],
        loads: prev.loads.map((row) => (row.id === loadId ? { ...row, status: "assigned" } : row)),
        events: [
          {
            id: nextId(prev.events),
            shipmentId: id,
            status: "booked",
            title: "بار از تخته بار به محموله تبدیل شد",
            location: `${load.originCity}, AE`,
            note: `مرجع بار: ${load.reference}`,
            occurredAt: nowIso(),
          },
          ...prev.events,
        ],
      };
    });
    return created as unknown as Shipment | null;
  }, []);

  const recordPayment = useCallback((invoiceId: number, amountAed: number, method: string) => {
    setData((prev) => {
      const invoice = prev.invoices.find((row) => row.id === invoiceId);
      if (!invoice || amountAed <= 0) return prev;
      const paid = Math.min(invoice.totalAed, invoice.paidAed + amountAed);
      return {
        ...prev,
        invoices: prev.invoices.map((row) =>
          row.id === invoiceId ? { ...row, paidAed: paid, status: paid >= row.totalAed ? "paid" : "partial" } : row,
        ),
        payments: [
          {
            id: nextId(prev.payments),
            invoiceId,
            amountAed,
            method,
            reference: `PAY-${Date.now().toString().slice(-7)}`,
            paidAt: nowIso(),
          },
          ...prev.payments,
        ],
      };
    });
  }, []);

  const addExpense = useCallback((category: string, description: string, amountAed: number, dateIso: string) => {
    setData((prev) => ({
      ...prev,
      expenses: [
        {
          id: nextId(prev.expenses),
          category,
          description,
          amountAed,
          shipmentId: null,
          incurredAt: dateIso ? new Date(dateIso).toISOString() : nowIso(),
        },
        ...prev.expenses,
      ],
    }));
  }, []);

  const simulateTelemetry = useCallback(() => {
    setData((prev) => {
      const newAlerts = [...prev.alerts];
      const vehicles = prev.vehicles.map((vehicle) => {
        if (vehicle.status === "maintenance") return vehicle;
        const speed = vehicle.status === "on_route" ? Math.max(0, Math.round(45 + Math.random() * 45)) : 0;
        const temp =
          vehicle.type === "reefer"
            ? Math.round((vehicle.tempC < 0 ? -18 - Math.random() * 3 : 2 + Math.random() * 4) * 10) / 10
            : Math.round((28 + Math.random() * 8) * 10) / 10;
        if (vehicle.type === "reefer" && temp > 8 && vehicle.tempC <= 8) {
          newAlerts.unshift({
            id: nextId(newAlerts),
            severity: "critical",
            type: "temperature",
            title: `انحراف دما در ${vehicle.plate}`,
            detail: `دمای محفظه به ${temp} درجه رسید؛ حد مجاز ۸ درجه است.`,
            entityRef: vehicle.plate,
            isResolved: false,
            createdAt: nowIso(),
          });
        }
        return {
          ...vehicle,
          lat: Math.round((vehicle.lat + (Math.random() - 0.5) * 0.14) * 10000) / 10000,
          lng: Math.round((vehicle.lng + (Math.random() - 0.5) * 0.14) * 10000) / 10000,
          speedKph: speed,
          fuelPct: Math.max(8, vehicle.fuelPct - Math.round(Math.random() * 2)),
          tempC: temp,
          odometerKm: vehicle.odometerKm + Math.round(speed / 12),
          lastPingAt: nowIso(),
        };
      });
      return { ...prev, vehicles, alerts: newAlerts };
    });
  }, []);

  const resolveAlert = useCallback((alertId: number) => {
    setData((prev) => ({
      ...prev,
      alerts: prev.alerts.map((alert) => (alert.id === alertId ? { ...alert, isResolved: true } : alert)),
    }));
  }, []);

  const markInvoiceSent = useCallback((invoiceId: number) => {
    setData((prev) => ({
      ...prev,
      invoices: prev.invoices.map((invoice) =>
        invoice.id === invoiceId ? { ...invoice, status: "sent" } : invoice,
      ),
    }));
  }, []);

  const resetDemo = useCallback(() => {
    const fresh = buildSeedData();
    try {
      window.localStorage.removeItem(STORE_KEY);
    } catch {
      // ignore
    }
    setData(fresh);
  }, []);

  const value = useMemo<NavaranStore>(
    () => ({
      data,
      hydrated,
      createShipment,
      addTrackingEvent,
      assignResources,
      createLoad,
      placeBid,
      convertLoad,
      recordPayment,
      addExpense,
      simulateTelemetry,
      resolveAlert,
      markInvoiceSent,
      resetDemo,
    }),
    [
      data,
      hydrated,
      createShipment,
      addTrackingEvent,
      assignResources,
      createLoad,
      placeBid,
      convertLoad,
      recordPayment,
      addExpense,
      simulateTelemetry,
      resolveAlert,
      markInvoiceSent,
      resetDemo,
    ],
  );

  return <NavaranContext.Provider value={value}>{children}</NavaranContext.Provider>;
}

export function useNavaran() {
  const context = useContext(NavaranContext);
  if (!context) throw new Error("useNavaran must be used inside NavaranProvider");
  return context;
}
