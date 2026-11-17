import type { NavaranData, ShipmentRow } from "./types";

const ACTIVE = new Set(["booked", "picked_up", "in_transit", "customs", "out_for_delivery"]);
export const isActive = (status: string) => ACTIVE.has(status);

export function monthKey(date: string | Date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export function enrichShipments(data: NavaranData): ShipmentRow[] {
  const customerMap = new Map(data.customers.map((c) => [c.id, c.name]));
  const vehicleMap = new Map(data.vehicles.map((v) => [v.id, v.plate]));
  const driverMap = new Map(data.drivers.map((d) => [d.id, d.name]));
  return data.shipments
    .map((shipment) => ({
      ...shipment,
      customerName: customerMap.get(shipment.customerId) ?? null,
      vehiclePlate: shipment.vehicleId ? (vehicleMap.get(shipment.vehicleId) ?? null) : null,
      driverName: shipment.driverId ? (driverMap.get(shipment.driverId) ?? null) : null,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function dashboardSnapshot(data: NavaranData) {
  const rows = enrichShipments(data);
  const activeShipments = rows.filter((row) => isActive(row.status));
  const deliveries = rows.filter((row) => row.status === "delivered");
  const onTime = deliveries.filter((row) => row.deliveredAt && new Date(row.deliveredAt) <= new Date(row.etaAt));
  const onTimeRate = deliveries.length ? Math.round((onTime.length / deliveries.length) * 1000) / 10 : 96.2;

  const openInvoices = data.invoices.filter((i) => !["paid", "draft", "void"].includes(i.status));
  const receivables = openInvoices.reduce((sum, i) => sum + (i.totalAed - i.paidAed), 0);
  const overdue = data.invoices.filter((i) => i.status === "overdue");
  const overdueAmount = overdue.reduce((sum, i) => sum + (i.totalAed - i.paidAed), 0);

  const monthlyRevenue = Array.from({ length: 6 }).map((_, idx) => {
    const ref = new Date();
    ref.setDate(1);
    ref.setMonth(ref.getMonth() - (5 - idx));
    const key = monthKey(ref);
    const monthRows = rows.filter((row) => monthKey(row.pickupAt) === key);
    return {
      label: new Intl.DateTimeFormat("fa-IR", { month: "short" }).format(ref),
      revenue: monthRows.reduce((sum, row) => sum + row.revenueAed, 0),
      cost: monthRows.reduce((sum, row) => sum + row.costAed, 0),
    };
  });

  const currentMonth = monthlyRevenue[5];
  const prevMonth = monthlyRevenue[4];
  const monthlyDelta = prevMonth.revenue
    ? Math.round(((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 1000) / 10
    : 0;

  const totalRevenue = rows.reduce((sum, row) => sum + row.revenueAed, 0);
  const totalCost = rows.reduce((sum, row) => sum + row.costAed, 0);
  const totalExpenses = data.expenses.reduce((sum, expense) => sum + expense.amountAed, 0);

  const statusSplit = Object.entries(
    rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([status, value]) => ({ status, value }));

  const laneMap = new Map<string, { lane: string; shipments: number; weightKg: number; revenue: number }>();
  rows.forEach((row) => {
    const current = laneMap.get(row.destCity) ?? { lane: row.destCity, shipments: 0, weightKg: 0, revenue: 0 };
    current.shipments += 1;
    current.weightKg += row.weightKg;
    current.revenue += row.revenueAed;
    laneMap.set(row.destCity, current);
  });
  const topLanes = [...laneMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  const activity = [...data.events]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 8)
    .map((event) => ({
      ...event,
      trackingCode: rows.find((row) => row.id === event.shipmentId)?.trackingCode ?? "—",
    }));

  return {
    shipments: rows,
    activeShipments,
    deliveries,
    onTimeRate,
    receivables,
    overdueAmount,
    overdueCount: overdue.length,
    openInvoiceCount: openInvoices.length,
    monthlyRevenue,
    monthlyDelta,
    totalRevenue,
    totalCost,
    totalExpenses,
    grossMargin: totalRevenue - totalCost,
    statusSplit,
    topLanes,
    vehicles: data.vehicles,
    drivers: data.drivers,
    alerts: [...data.alerts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 12),
    activity,
    invoices: [...data.invoices].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()),
    openLoads: data.loads.filter((load) => load.status === "open" || load.status === "bidding").length,
    totalWeight: rows.reduce((sum, row) => sum + row.weightKg, 0),
  };
}

export function accountingSnapshot(data: NavaranData) {
  const customerMap = new Map(data.customers.map((c) => [c.id, c.name]));
  const shipmentMap = new Map(data.shipments.map((s) => [s.id, s.trackingCode]));

  const invoices = [...data.invoices]
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .map((invoice) => ({
      ...invoice,
      customerName: customerMap.get(invoice.customerId) ?? "—",
      trackingCode: invoice.shipmentId ? (shipmentMap.get(invoice.shipmentId) ?? null) : null,
    }));

  const invoiceNumberMap = new Map(data.invoices.map((i) => [i.id, i.number]));
  const payments = [...data.payments]
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
    .map((payment) => ({ ...payment, invoiceNumber: invoiceNumberMap.get(payment.invoiceId) ?? "—" }));

  const billed = invoices.reduce((sum, i) => sum + i.totalAed, 0);
  const collected = invoices.reduce((sum, i) => sum + i.paidAed, 0);
  const vatTotal = invoices.reduce((sum, i) => sum + i.vatAed, 0);
  const outstanding = invoices
    .filter((i) => !["paid", "draft", "void"].includes(i.status))
    .reduce((sum, i) => sum + (i.totalAed - i.paidAed), 0);
  const expenseTotal = data.expenses.reduce((sum, e) => sum + e.amountAed, 0);
  const grossMargin = data.shipments.reduce((sum, s) => sum + s.revenueAed - s.costAed, 0);

  const now = Date.now();
  const buckets = [
    { label: "سررسید نشده", min: -99999, max: 0, amount: 0, tone: "accent" },
    { label: "۱ تا ۳۰ روز", min: 1, max: 30, amount: 0, tone: "info" },
    { label: "۳۱ تا ۶۰ روز", min: 31, max: 60, amount: 0, tone: "warn" },
    { label: "بیش از ۶۰ روز", min: 61, max: 99999, amount: 0, tone: "danger" },
  ];
  invoices
    .filter((i) => i.totalAed > i.paidAed && i.status !== "draft" && i.status !== "void")
    .forEach((invoice) => {
      const overdueDays = Math.floor((now - new Date(invoice.dueDate).getTime()) / 86400000);
      const bucket = buckets.find((b) => overdueDays >= b.min && overdueDays <= b.max) ?? buckets[0];
      bucket.amount += invoice.totalAed - invoice.paidAed;
    });

  const expenseByCategory = Object.entries(
    data.expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] ?? 0) + expense.amountAed;
      return acc;
    }, {}),
  ).map(([category, amount]) => ({ category, amount }));

  return {
    invoices,
    payments,
    expenses: [...data.expenses].sort((a, b) => new Date(b.incurredAt).getTime() - new Date(a.incurredAt).getTime()),
    customers: data.customers,
    billed,
    collected,
    vatTotal,
    outstanding,
    expenseTotal,
    grossMargin,
    buckets,
    netProfit: grossMargin - expenseTotal,
    expenseByCategory,
  };
}

export function customersOverview(data: NavaranData) {
  return [...data.customers]
    .sort((a, b) => b.creditLimitAed - a.creditLimitAed)
    .map((customer) => {
      const shipments = data.shipments.filter((s) => s.customerId === customer.id);
      const invoices = data.invoices.filter((i) => i.customerId === customer.id);
      return {
        ...customer,
        shipmentCount: shipments.length,
        activeCount: shipments.filter((s) => isActive(s.status)).length,
        revenueAed: shipments.reduce((sum, s) => sum + s.revenueAed, 0),
        balanceAed: invoices
          .filter((i) => !["paid", "draft", "void"].includes(i.status))
          .reduce((sum, i) => sum + (i.totalAed - i.paidAed), 0),
      };
    });
}

export function fleetSnapshot(data: NavaranData) {
  const driverMap = new Map(data.drivers.map((d) => [d.id, d]));
  return {
    vehicles: data.vehicles.map((vehicle) => {
      const driver = vehicle.driverId ? driverMap.get(vehicle.driverId) : undefined;
      return { ...vehicle, driverName: driver?.name ?? null, driverPhone: driver?.phone ?? null, driverRating: driver?.rating ?? null };
    }),
    alerts: [...data.alerts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    drivers: data.drivers,
    inTransit: data.shipments
      .filter((s) => s.status === "in_transit")
      .map((s) => ({
        id: s.id,
        trackingCode: s.trackingCode,
        status: s.status,
        progressPct: s.progressPct,
        destCity: s.destCity,
        originCity: s.originCity,
        etaAt: s.etaAt,
      })),
  };
}

export function publicMetrics(data: NavaranData) {
  const deliveries = data.shipments.filter((s) => s.status === "delivered");
  const onTime = deliveries.filter((s) => s.deliveredAt && new Date(s.deliveredAt) <= new Date(s.etaAt));
  const now = new Date();
  const monthlyRevenue = data.shipments
    .filter((s) => {
      const d = new Date(s.pickupAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, s) => sum + s.revenueAed, 0);

  return {
    shipmentCount: data.shipments.length,
    activeCount: data.shipments.filter((s) => isActive(s.status)).length,
    onTimeRate: deliveries.length ? Math.round((onTime.length / deliveries.length) * 1000) / 10 : 96.2,
    tonnage: Math.round(data.shipments.reduce((sum, s) => sum + s.weightKg, 0) / 1000),
    fleetSize: data.vehicles.length,
    activeFleet: data.vehicles.filter((v) => v.status === "on_route").length,
    customerCount: data.customers.length,
    billed: data.invoices.reduce((sum, i) => sum + i.totalAed, 0),
    monthlyRevenue,
  };
}

export function navBadges(data: NavaranData) {
  return {
    activeShipments: data.shipments.filter((s) => isActive(s.status)).length,
    openLoads: data.loads.filter((l) => l.status === "open" || l.status === "bidding").length,
    alerts: data.alerts.filter((a) => !a.isResolved).length,
    overdueInvoices: data.invoices.filter((i) => i.status === "overdue").length,
  };
}

export function trackingByCode(data: NavaranData, code: string) {
  const row = enrichShipments(data).find(
    (shipment) => shipment.trackingCode.toUpperCase() === code.trim().toUpperCase(),
  );
  if (!row) return null;
  const events = data.events
    .filter((event) => event.shipmentId === row.id)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  return { shipment: row, events, customerName: row.customerName };
}

export function loadBoard(data: NavaranData, status = "all") {
  const all = [...data.loads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return {
    rows: status === "all" ? all : all.filter((load) => load.status === status),
    all,
    summary: {
      open: all.filter((l) => l.status === "open").length,
      bidding: all.filter((l) => l.status === "bidding").length,
      assigned: all.filter((l) => l.status === "assigned").length,
      value: all.filter((l) => l.status !== "expired").reduce((sum, l) => sum + l.budgetAed, 0),
      weight: all.reduce((sum, l) => sum + l.weightKg, 0),
    },
  };
}

export function sampleTrackingCodes(data: NavaranData, count = 4) {
  return [...data.shipments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, count)
    .map((shipment) => shipment.trackingCode);
}
