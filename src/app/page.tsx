"use client";

import Image from "next/image";
import Link from "next/link";
import { FleetMap, RevenueChart, RouteStrip } from "@/components/charts";
import { TrackingWidget } from "@/components/landing/tracking-widget";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Icons, SectionHeading } from "@/components/ui";
import { num } from "@/lib/format";
import { publicMetrics, sampleTrackingCodes } from "@/lib/selectors";
import { useNavaran } from "@/lib/store";

const IMAGES = {
  port: "https://images.pexels.com/photos/4940273/pexels-photo-4940273.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  cranes: "https://images.pexels.com/photos/13409734/pexels-photo-13409734.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1200",
  warehouse: "https://images.pexels.com/photos/30824313/pexels-photo-30824313.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1000",
  trucks: "https://images.pexels.com/photos/1606957/pexels-photo-1606957.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1000",
};

const SERVICES = [
  {
    icon: <Icons.package />,
    title: "مدیریت بار",
    desc: "ثبت بار، تخته بار هوشمند، دریافت پیشنهاد نرخ و تبدیل سریع بار به محموله با بارنامه دیجیتال.",
    points: ["تخته بار زنده", "پیشنهاد نرخ رقابتی", "تخصیص خودکار ظرفیت"],
  },
  {
    icon: <Icons.truck />,
    title: "حمل و نقل",
    desc: "برنامه‌ریزی FTL/LTL، حمل جاده‌ای، دریایی و هوایی با مدیریت اسناد و ترخیص گمرکی.",
    points: ["مسیریابی چندوجهی", "مدیریت اسناد", "هماهنگی گمرک"],
  },
  {
    icon: <Icons.radar />,
    title: "ترکینگ و مانیتورینگ",
    desc: "ردیابی لحظه‌ای با پینگ GPS، تله‌متری دما و سوخت، و هشدارهای خودکار در مرکز کنترل.",
    points: ["پینگ ۵ دقیقه‌ای", "هشدار زنجیره سرد", "پایگاه داده کامل رویدادها"],
  },
  {
    icon: <Icons.wallet />,
    title: "حسابداری",
    desc: "فاکتور با VAT امارات، مطالبات و سن‌بندی بدهی، دریافتی‌ها و سود ناخالص هر محموله.",
    points: ["VAT ۵٪", "صورت‌حساب عربی/انگلیسی", "سودآوری هر مسیر"],
  },
  {
    icon: <Icons.shield />,
    title: "انبار و توزیع نهایی",
    desc: "مدیریت موجودی، پنجره زمانی تحویل و توزیع نهایی در دبی، شارجه و ابوظبی.",
    points: ["انبار جبل علی", "توزیع شهری", "اثبات تحویل (POD)"],
  },
  {
    icon: <Icons.route />,
    title: "داشبورد مدیریتی",
    desc: "KPI عملیاتی و مالی، عملکرد رانندگان، بهره‌وری ناوگان و گزارش‌های قابل خروجی.",
    points: ["نمودار درآمد/هزینه", "عملکرد راننده", "گزارش شفاف"],
  },
];

const LANES = [
  { from: "دبی", to: "ابوظبی", time: "۲ ساعت", mode: "جاده‌ای", modeKey: "road" },
  { from: "جبل علی", to: "ریاض", time: "۲۴ ساعت", mode: "جاده‌ای", modeKey: "road" },
  { from: "دبی", to: "دوحه", time: "۲۴ ساعت", mode: "جاده‌ای", modeKey: "road" },
  { from: "دبی", to: "کویت‌سیتی", time: "۴۸ ساعت", mode: "جاده‌ای", modeKey: "road" },
  { from: "جبل علی", to: "جده", time: "۳ روز", mode: "دریایی", modeKey: "sea" },
  { from: "دبی", to: "منامه", time: "۲۴ ساعت", mode: "هوایی", modeKey: "air" },
  { from: "شارجه", to: "فجیره", time: "۳ ساعت", mode: "جاده‌ای", modeKey: "road" },
  { from: "ابوظبی", to: "مسقط", time: "۲ روز", mode: "جاده‌ای", modeKey: "road" },
];

const PILOT_PHASES = [
  {
    phase: "فاز صفر",
    title: "کشف و آماده‌سازی",
    period: "دی ۱۴۰۴ — اسفند ۱۴۰۴",
    state: "تکمیل شده",
    tone: "done",
    items: ["نیازسنجی باربران امارات", "طراحی فرآیندها و اسناد", "انتخاب مسیر پایلوت دبی–ابوظبی"],
  },
  {
    phase: "فاز یک",
    title: "پایلوت عملیاتی در دبی",
    period: "فروردین ۱۴۰۵ — شهریور ۱۴۰۵",
    state: "در حال اجرا",
    tone: "live",
    items: ["۴ ناوگان و ۱۰ راننده", "ترکینگ و مانیتورینگ زنده", "فاکتورگذاری و تسویه آزمایشی"],
  },
  {
    phase: "فاز دو",
    title: "راه‌اندازی کامل",
    period: "مهر ۱۴۰۵ — اسفند ۱۴۰۵",
    state: "پیش‌رو",
    tone: "next",
    items: ["اتصال به سامانه گمرک و اظهار الکترونیکی", "اپلیکیشن راننده", "یکپارچه‌سازی حسابداری مشتریان"],
  },
  {
    phase: "فاز سه",
    title: "مدیریت و پشتیبانی مستقر در امارات",
    period: "از فروردین ۱۴۰۶",
    state: "برنامه‌ریزی",
    tone: "plan",
    items: ["تیم عملیات و پشتیبانی مقیم دبی", "SLA با پاسخ کمتر از ۳۰ دقیقه", "توسعه محصول مطابق بازار خلیج"],
  },
];

const TESTIMONIALS = [
  {
    quote:
      "پایلوت ناوران در دبی باعث شد زمان تخصیص ناوگان ما از چند ساعت به کمتر از ۱۵ دقیقه برسد و وضعیت هر محموله را لحظه‌ای ببینیم.",
    name: "Khalid Al Suwaidi",
    role: "مدیر عملیات — Al Maya Foods",
  },
  {
    quote:
      "برای محموله‌های زنجیره سرد، هشدار انحراف دما و گزارش تحویل با امضا، دقیقاً همان چیزی بود که برای ممیزی نیاز داشتیم.",
    name: "Dr. Amina Yusuf",
    role: "مدیر زنجیره تأمین — GulfCare Pharma",
  },
  {
    quote:
      "صورت‌حساب با VAT و سن‌بندی مطالبات، کار ماهانه تیم مالی را برای بارهای بین دبی و ریاض بسیار ساده‌تر کرد.",
    name: "Rohit Menon",
    role: "مدیر مالی — Falcon Electronics",
  },
];

const FAQ = [
  {
    q: "پلتفرم در امارات با چه واحد پولی و قوانینی کار می‌کند؟",
    a: "تمام مبالغ به درهم امارات (AED) و فاکتورها با VAT ۵٪ صادر می‌شوند. فیلد TRN مشتری برای فاکتور رسمی ثبت می‌شود و گزارش‌ها برای اظهارنامه مالیاتی قابل خروجی هستند.",
  },
  {
    q: "پایلوت چطور اجرا می‌شود و داده‌ها کجا نگهداری می‌شوند؟",
    a: "پایلوت در دبی با ناوگان و مشتریان واقعی آغاز می‌شود. داده‌ها در پایگاه‌داده PostgreSQL، با دسترسی نقش‌محور و لاگ رویدادها نگهداری می‌شوند و امکان استقرار در منطقه (Region) امارات وجود دارد.",
  },
  {
    q: "امکان اتصال به GPS و دستگاه‌های تله‌متری وجود دارد؟",
    a: "بله. معماری پلتفرم برای دریافت پینگ از دستگاه‌های GPS/تلوماتیک آماده است و در فاز پایلوت، پینگ‌های پنج‌دقیقه‌ای در مانیتورینگ ناوگان ثبت می‌شود.",
  },
  {
    q: "آیا تیم پشتیبانی در امارات مستقر خواهد بود؟",
    a: "پس از پایان پایلوت، تیم مدیریت و پشتیبانی در دبی مستقر می‌شود و SLA با زمان پاسخ کمتر از ۳۰ دقیقه برای رخدادهای عملیاتی ارائه می‌گردد.",
  },
  {
    q: "آیا چند کاربر با نقش‌های مختلف پشتیبانی می‌شود؟",
    a: "نقش‌های مرکز کنترل، عملیات، حسابداری و مشتری در طراحی دیده شده‌اند. در این نسخه نمایشی، مرکز کنترل با دسترسی کامل فعال است و لایه نقش‌ها قابل توسعه است.",
  },
];

const TONE_STYLES: Record<string, string> = {
  done: "bg-emerald-400",
  live: "bg-lime",
  next: "bg-sky-400",
  plan: "bg-slate-500",
};

const TONE_BADGE: Record<string, string> = {
  done: "badge-success",
  live: "badge-accent",
  next: "badge-info",
  plan: "badge-neutral",
};

const MINI_VEHICLES = [
  { id: 1, plate: "DXB 48217", status: "on_route", lat: 25.118, lng: 55.201, tempC: 4.2, currentCity: "دبی" },
  { id: 2, plate: "AUH 19284", status: "on_route", lat: 24.512, lng: 54.401, tempC: 31.5, currentCity: "ابوظبی" },
  { id: 3, plate: "SHJ 33871", status: "on_route", lat: 25.311, lng: 55.512, tempC: 34.1, currentCity: "شارجه" },
  { id: 4, plate: "DXB 61044", status: "on_route", lat: 24.821, lng: 54.901, tempC: -18.4, currentCity: "ابوظبی" },
  { id: 5, plate: "AJM 77403", status: "idle", lat: 25.405, lng: 55.513, tempC: 29.8, currentCity: "عجمان" },
  { id: 6, plate: "FUJ 11307", status: "on_route", lat: 25.211, lng: 56.012, tempC: 32.7, currentCity: "فجیره" },
  { id: 7, plate: "DXB 90512", status: "on_route", lat: 25.089, lng: 55.148, tempC: 26.4, currentCity: "دبی" },
];

export default function HomePage() {
  const { data } = useNavaran();
  const metrics = publicMetrics(data);
  const codes = sampleTrackingCodes(data, 4);

  return (
    <>
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/6">
          <div className="absolute inset-0 grid-bg radial-fade opacity-70" />
          <div
            className="absolute -top-40 right-1/4 h-[520px] w-[520px] rounded-full blur-[130px]"
            style={{ background: "radial-gradient(circle,rgba(163,230,53,.16),transparent 65%)" }}
          />
          <div
            className="absolute -bottom-40 left-0 h-[420px] w-[420px] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(circle,rgba(45,212,191,.14),transparent 65%)" }}
          />
          <div className="shell relative grid gap-12 py-14 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-20">
            <div className="animate-rise">
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
                  پایلوت عملیاتی امارات · ۲۰۲۶
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-slate-400">
                  دبی · ابوظبی · شارجه · جبل علی
                </span>
                <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] text-emerald-300">
                  ✓ ورود مستقیم، بدون احراز هویت
                </span>
              </div>
              <h1 className="mt-5 text-[34px] leading-[1.28] font-extrabold tracking-tight text-white sm:text-[46px] sm:leading-[1.22]">
                کل زنجیره لجستیک،
                <br />
                <span className="text-gradient">در یک مرکز کنترل</span>
              </h1>
              <p className="mt-5 max-w-xl text-[14px] leading-7 text-slate-400">
                ناوران، پلتفرم یکپارچه مدیریت بار، حمل‌ونقل، ترکینگ، مانیتورینگ ناوگان و حسابداری برای بازار امارات
                است. از تخته بار جبل علی تا تسویه فاکتور در دبی — همه در یک سامانه، با واحد درهم و زبان فارسی.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/dashboard" className="btn btn-primary px-5 py-3">
                  ورود به مرکز کنترل
                  <Icons.arrow />
                </Link>
                <Link href="#tracking" className="btn btn-outline px-5 py-3">
                  رهگیری محموله
                </Link>
                <a href="#pilot" className="btn btn-ghost px-2 py-3 text-[13px]">
                  نقشه راه پایلوت امارات →
                </a>
              </div>

              <div className="mt-8 max-w-md">
                <TrackingWidget samples={codes.slice(0, 3)} />
              </div>

              <dl className="mt-8 grid max-w-xl grid-cols-2 gap-x-8 gap-y-4 border-t border-white/8 pt-6 sm:grid-cols-4">
                {[
                  { label: "محموله فعال", value: num(metrics.activeCount) },
                  { label: "تحویل به‌موقع", value: `${num(metrics.onTimeRate)}٪` },
                  { label: "ناوگان", value: `${num(metrics.fleetSize)} خودرو` },
                  { label: "مشتری B2B", value: num(metrics.customerCount) },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-[10px] text-slate-500">{stat.label}</dt>
                    <dd className="num mt-1 text-base font-extrabold text-white">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative animate-rise" style={{ animationDelay: "120ms" }}>
              <div className="relative overflow-hidden rounded-3xl border border-white/10">
                <Image
                  src={IMAGES.port}
                  alt="بندر کانتینری دبی در غروب"
                  width={1400}
                  height={900}
                  unoptimized
                  priority
                  className="h-[320px] w-full object-cover sm:h-[420px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05090f] via-[#05090f]/40 to-transparent" />
                <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-[10px] text-white backdrop-blur">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
                  Jebel Ali Port · زنده
                </div>
                <div className="absolute right-4 left-4 bottom-4 rounded-2xl border border-white/10 bg-[#060d16]/85 p-3.5 backdrop-blur-md">
                  <div className="mb-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>NAV-7K42QD · غذای یخچالی</span>
                    <span className="text-lime">۶۴٪ مسیر</span>
                  </div>
                  <RouteStrip origin="جبل علی" destination="الهاملیا" progress={64} />
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                    <span>دمای محفظه ۴°C</span>
                    <span>ETA ۱۴:۲۰ · راننده در تماس</span>
                  </div>
                </div>
              </div>

              <div className="absolute -top-5 -left-3 hidden w-44 rounded-2xl border border-white/10 bg-[#0a121d]/95 p-3 shadow-2xl backdrop-blur animate-float sm:block">
                <p className="text-[9px] text-slate-500">تحویل به‌موقع هفته</p>
                <p className="num mt-1 text-xl font-extrabold text-lime">{num(metrics.onTimeRate)}٪</p>
                <div className="mt-2 flex items-end gap-1">
                  {[38, 52, 44, 68, 58, 76, 90].map((h, i) => (
                    <span
                      key={i}
                      className="w-1.5 rounded-sm bg-lime/60"
                      style={{ height: `${h * 0.3}px`, opacity: 0.35 + i * 0.09 }}
                    />
                  ))}
                </div>
              </div>

              <div
                className="absolute -bottom-6 -left-4 hidden items-center gap-2.5 rounded-2xl border border-white/10 bg-[#0a121d]/95 px-3 py-2.5 shadow-2xl backdrop-blur animate-float sm:flex"
                style={{ animationDelay: "1.4s" }}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose/15 text-rose">!</span>
                <div>
                  <p className="text-[10px] font-semibold text-white">هشدار زنجیره سرد</p>
                  <p className="text-[9px] text-slate-500">DXB 61044 · دمای -۱۸.۴°</p>
                </div>
              </div>
            </div>
          </div>

          <div className="shell pb-10">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/8 pt-5 text-[11px] text-slate-500">
              <span className="text-slate-400">مورد اعتماد باربران امارات:</span>
              {["Al Maya Foods", "GulfCare Pharma", "Falcon Electronics", "Sahara Building", "Oasis Retail", "Zenith Chemicals"].map(
                (name) => (
                  <span key={name} className="font-semibold tracking-wide text-slate-500/90">
                    {name}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="shell py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="ماژول‌های پلتفرم"
              title="شش ماژول، یک جریان کاری از بار تا تسویه"
              description="هر ماژول به‌تنهایی قابل استفاده است و در کنار هم، یک اتاق کنترل کامل لجستیک می‌سازد."
            />
            <Link href="/dashboard" className="btn btn-outline btn-sm">
              مشاهده نسخه زنده
              <Icons.arrow />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, index) => (
              <article
                key={service.title}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.045] to-white/[0.012] p-5 transition hover:border-lime/30 hover:from-lime/[0.06]"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0b1521] text-lime">
                    {service.icon}
                  </span>
                  <span className="num text-[11px] text-slate-600">{num(index + 1).padStart(2, "۰")}</span>
                </div>
                <h3 className="mt-4 text-[15px] font-bold text-white">{service.title}</h3>
                <p className="mt-2 text-[12px] leading-6 text-slate-400">{service.desc}</p>
                <ul className="mt-4 space-y-1.5">
                  {service.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="text-lime">✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* PLATFORM */}
        <section id="platform" className="relative border-y border-white/6 bg-[#060c14] py-16 sm:py-20">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="shell relative grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="مرکز کنترل"
                title="تصمیم‌های عملیاتی را از یک اتاق کنترل بگیرید"
                description="داشبورد ناوران، محموله‌های فعال، ناوگان در مسیر و وضعیت مالی را کنار هم می‌آورد؛ بدون اکسل، بدون تماس تلفنی."
              />
              <ul className="mt-7 space-y-4">
                {[
                  { title: "نمای ۳۶۰ درجه محموله", text: "مسیر، دمای محفظه، راننده، اسناد و صورت‌حساب در یک صفحه." },
                  { title: "هشدارهای پیش‌دستانه", text: "انحراف دما، تأخیر جاده‌ای، توقف طولانی و فاکتور معوق." },
                  { title: "گزارش سودآوری مسیر", text: "درآمد، هزینه و حاشیه سود هر مسیر برای قیمت‌گذاری دقیق‌تر." },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-lime/12 text-[11px] text-lime">
                      ✓
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-white">{item.title}</p>
                      <p className="mt-0.5 text-[12px] leading-6 text-slate-400">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="btn btn-primary mt-7">
                باز کردن داشبورد زنده
                <Icons.arrow />
              </Link>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#070e17] shadow-[0_50px_120px_-60px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose/70" />
                    <span className="h-2 w-2 rounded-full bg-amber/70" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
                    <span className="mr-2 text-[10px] text-slate-500">navaran.ae/dashboard</span>
                  </div>
                  <span className="rounded-full border border-lime/25 bg-lime/10 px-2 py-0.5 text-[9px] text-lime">
                    Dubai Control Tower
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                  {[
                    { label: "محموله فعال", value: num(metrics.activeCount), tone: "text-white" },
                    { label: "درآمد ماه", value: `${num(Math.round(metrics.monthlyRevenue / 1000))}هـ`, tone: "text-lime" },
                    { label: "تحویل به‌موقع", value: `${num(metrics.onTimeRate)}٪`, tone: "text-white" },
                    { label: "هشدارها", value: num(2), tone: "text-amber" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                      <p className="text-[9px] text-slate-500">{kpi.label}</p>
                      <p className={`num mt-1 text-sm font-extrabold ${kpi.tone}`}>{kpi.value}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-3">
                  <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                    <div className="mb-2 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">درآمد و هزینه — ۶ ماه</span>
                      <span className="text-lime">AED</span>
                    </div>
                    <RevenueChart
                      height={150}
                      series={[
                        { label: "مهر", revenue: 62000, cost: 41000 },
                        { label: "آبان", revenue: 74000, cost: 48000 },
                        { label: "آذر", revenue: 68000, cost: 45000 },
                        { label: "دی", revenue: 89000, cost: 56000 },
                        { label: "بهمن", revenue: 96000, cost: 61000 },
                        { label: "اسفند", revenue: 108000, cost: 68000 },
                      ]}
                    />
                  </div>
                </div>
                <div className="grid gap-3 border-t border-white/8 p-4 sm:grid-cols-[1.2fr_1fr]">
                  <div className="space-y-2.5">
                    {[
                      { code: "NAV-9B18LM", route: "دبی → ریاض", progress: 48, status: "در مسیر" },
                      { code: "NAV-6M05CV", route: "دبی → ابوظبی", progress: 92, status: "توزیع نهایی" },
                      { code: "NAV-3X77AT", route: "جبل علی → جده", progress: 82, status: "گمرک" },
                    ].map((item) => (
                      <div key={item.code} className="rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-2">
                        <div className="mb-1 flex items-center justify-between text-[9px]">
                          <span className="font-mono text-slate-300">{item.code}</span>
                          <span className="text-slate-500">{item.status}</span>
                        </div>
                        <RouteStrip origin={item.route.split(" → ")[0]} destination={item.route.split(" → ")[1]} progress={item.progress} compact />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: num(metrics.fleetSize), l: "ناوگان" },
                      { v: num(metrics.activeFleet), l: "در حرکت" },
                      { v: `${num(metrics.tonnage)}t`, l: "تناژ" },
                      { v: num(metrics.customerCount), l: "مشتری" },
                    ].map((item) => (
                      <div key={item.l} className="flex flex-col justify-center rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-2">
                        <span className="num text-xs font-bold text-white">{item.v}</span>
                        <span className="text-[9px] text-slate-500">{item.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRACKING */}
        <section id="tracking" className="shell py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeading
                eyebrow="ترکینگ شفاف"
                title="مشتری شما هم می‌تواند محموله را زنده ببیند"
                description="کد رهگیری کافی است؛ مشتری بدون ورود به پنل، مسیر، رویدادها و زمان تخمینی تحویل را می‌بیند."
              />
              <ol className="mt-7 space-y-4">
                {[
                  { t: "کد رهگیری را دریافت کنید", d: "کد در بارنامه و پیامک/ایمیل ثبت بار ارسال می‌شود." },
                  { t: "مسیر و رویدادها را ببینید", d: "تایم‌لاین کامل از بارگیری تا تحویل، با موقعیت و زمان." },
                  { t: "هشدار بگیرید", d: "در صورت تأخیر یا انحراف شرایط، وضعیت استثنا نمایش داده می‌شود." },
                ].map((step, index) => (
                  <li key={step.t} className="flex gap-3">
                    <span className="num flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-lime/30 bg-lime/10 text-[11px] font-bold text-lime">
                      {num(index + 1)}
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-white">{step.t}</p>
                      <p className="mt-0.5 text-[12px] leading-6 text-slate-400">{step.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#070e17] p-5">
              <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-lime/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-500">رهگیری عمومی محموله</p>
                    <p className="mt-1 font-mono text-sm text-white">NAV-7K42QD</p>
                  </div>
                  <span className="badge badge-accent">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
                    در مسیر
                  </span>
                </div>
                <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                  <RouteStrip origin="جبل علی (دبی)" destination="الهاملیا (دبی)" progress={64} />
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {[
                      { l: "وزن", v: "۱۴٬۲۰۰ کیلو" },
                      { l: "دما", v: "۴°C" },
                      { l: "ETA", v: "۳ ساعت" },
                    ].map((item) => (
                      <div key={item.l} className="rounded-lg border border-white/8 bg-[#080f19] px-2 py-2">
                        <p className="text-[9px] text-slate-500">{item.l}</p>
                        <p className="num mt-0.5 text-[11px] font-semibold text-slate-200">{item.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <ol className="relative mt-5 space-y-3 pr-4">
                  <span className="absolute right-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-lime/60 to-white/10" />
                  {[
                    { t: "در مسیر — بزرگراه شیخ زاید", time: "۱۲:۴۰", active: true },
                    { t: "بارگیری در جبل علی", time: "۰۹:۱۵" },
                    { t: "ثبت محموله و صدور بارنامه", time: "۰۷:۵۰" },
                  ].map((ev) => (
                    <li key={ev.t} className="relative">
                      <span
                        className={`absolute right-[-11px] top-1.5 h-2.5 w-2.5 rounded-full border-2 ${
                          ev.active ? "border-lime bg-lime" : "border-slate-600 bg-[#070e17]"
                        }`}
                      />
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className={ev.active ? "font-semibold text-white" : "text-slate-400"}>{ev.t}</span>
                        <span className="num text-[10px] text-slate-600">{ev.time}</span>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-5">
                  <TrackingWidget samples={codes.slice(0, 4)} variant="inline" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COVERAGE */}
        <section id="coverage" className="relative border-y border-white/6 bg-[#060c14] py-16 sm:py-20">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="پوشش جغرافیایی"
                title="از جبل علی تا سراسر خلیج"
                description="شبکه عملیاتی در هفت امیرات و کریدورهای زمینی، دریایی و هوایی به عربستان، قطر، کویت، عمان و بحرین."
              />
              <div className="flex gap-2">
                <span className="badge badge-accent">۷ امیرات</span>
                <span className="badge badge-info">۶ کشور</span>
                <span className="badge badge-success">۲۴/۷ عملیات</span>
              </div>
            </div>
            <div className="mt-9 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
              <div className="card overflow-hidden p-3">
                <FleetMap vehicles={MINI_VEHICLES} height={330} />
                <div className="mt-3 grid grid-cols-2 gap-2 px-1 pb-1 sm:grid-cols-4">
                  {[
                    { l: "هاب اصلی", v: "جبل علی" },
                    { l: "مرکز کنترل", v: "دبی" },
                    { l: "انبارها", v: "۳ سایت" },
                    { l: "میانگین تحویل", v: "۱۸ ساعت" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-2">
                      <p className="text-[9px] text-slate-500">{s.l}</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-slate-200">{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                  <h3 className="text-sm font-bold text-white">کریدورهای فعال</h3>
                  <span className="text-[10px] text-slate-500">زمان تقریبی ترانزیت</span>
                </div>
                <ul className="divide-y divide-white/6">
                  {LANES.map((lane) => (
                    <li key={`${lane.from}-${lane.to}`} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="flex items-center gap-2 text-[12px]">
                        <span className="text-slate-200">{lane.from}</span>
                        <span className="text-slate-600">←</span>
                        <span className="text-slate-200">{lane.to}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="num text-[11px] text-slate-400">{lane.time}</span>
                        <span
                          className={`badge ${
                            lane.modeKey === "sea" ? "badge-info" : lane.modeKey === "air" ? "badge-warn" : "badge-neutral"
                          }`}
                        >
                          {lane.mode}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                { img: IMAGES.warehouse, title: "انبار جبل علی", desc: "۱۲٬۰۰۰ متر مربع، قفسه‌بندی و زنجیره سرد", tag: "منطقه آزاد JAFZA" },
                { img: IMAGES.trucks, title: "ناوگان تحت قرارداد", desc: "کامیون یخچالی، چادری، تخت و ون شهری", tag: "۴۸ خودرو" },
                { img: IMAGES.cranes, title: "عملیات بندری", desc: "هماهنگی کانتینر، ترخیص و حمل پس از ورود", tag: "جبل علی / خورفکان" },
              ].map((item) => (
                <article key={item.title} className="group relative overflow-hidden rounded-2xl border border-white/8">
                  <Image
                    src={item.img}
                    alt={item.title}
                    width={1000}
                    height={700}
                    unoptimized
                    className="h-40 w-full object-cover opacity-80 transition group-hover:scale-[1.03] group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05090f] via-[#05090f]/50 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <span className="text-[9px] text-lime">{item.tag}</span>
                    <p className="mt-1 text-[13px] font-bold text-white">{item.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* MONITORING */}
        <section className="shell py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-bold text-white">مانیتورینگ ناوگان</p>
                    <p className="text-[10px] text-slate-500">آخرین پینگ کمتر از ۵ دقیقه</p>
                  </div>
                  <span className="badge badge-accent">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
                    زنده
                  </span>
                </div>
                <ul className="space-y-2">
                  {[
                    { plate: "DXB 48217", type: "یخچالی", city: "دبی — جاده E11", speed: 78, temp: "۴°C", fuel: 64, warn: false },
                    { plate: "DXB 61044", type: "یخچالی", city: "ابوظبی — E20", speed: 68, temp: "-۱۸.۴°", fuel: 47, warn: true },
                    { plate: "AUH 19284", type: "چادری", city: "ابوظبی — Mafraq", speed: 86, temp: "۳۱.۵°", fuel: 51, warn: false },
                    { plate: "SHJ 33871", type: "تخت", city: "شارجه — E311", speed: 42, temp: "۳۴.۱°", fuel: 73, warn: false },
                  ].map((vehicle) => (
                    <li key={vehicle.plate} className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime/10 text-lime">
                            <Icons.truck />
                          </span>
                          <div>
                            <p className="font-mono text-[11px] text-slate-200">{vehicle.plate}</p>
                            <p className="text-[9px] text-slate-500">
                              {vehicle.type} · {vehicle.city}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className={`num text-[11px] font-semibold ${vehicle.warn ? "text-rose" : "text-slate-200"}`}>
                            {vehicle.temp}
                          </p>
                          <p className="num text-[9px] text-slate-500">{num(vehicle.speed)} km/h</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[9px] text-slate-600">سوخت</span>
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/8">
                          <div className="h-full rounded-full bg-lime/70" style={{ width: `${vehicle.fuel}%` }} />
                        </div>
                        <span className="num text-[9px] text-slate-500">{num(vehicle.fuel)}٪</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <SectionHeading
                eyebrow="مانیتورینگ"
                title="ماشین‌ها حرف می‌زنند، شما تصمیم می‌گیرید"
                description="تله‌متری ناوگان — سرعت، سوخت و دمای محفظه — همراه با قواعد هشدار برای زنجیره سرد و توقف‌های غیرعادی."
              />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { t: "قواعد هشدار انعطاف‌پذیر", d: "برای هر نوع خودرو حد دما، سرعت و توقف تعریف کنید." },
                  { t: "سابقه کامل پینگ", d: "مسیر طی‌شده و رخدادها برای پیگیری دعاوی و بیمه." },
                  { t: "تخصیص هوشمند", d: "نزدیک‌ترین خودرو با ظرفیت مناسب و مجوز مسیر." },
                  { t: "پشتیبانی محلی", d: "تیم عملیات دبی، آماده مداخله در رخداد فوری." },
                ].map((item) => (
                  <div key={item.t} className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                    <p className="text-[12px] font-semibold text-white">{item.t}</p>
                    <p className="mt-1 text-[11px] leading-6 text-slate-400">{item.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ACCOUNTING */}
        <section id="accounting" className="relative border-y border-white/6 bg-[#060c14] py-16 sm:py-20">
          <div className="shell grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="حسابداری و تسویه"
                title="فاکتور با VAT امارات، در همان جایی که بار حرکت می‌کند"
                description="صدور فاکتور از روی محموله، ثبت دریافتی‌ها، سن‌بندی مطالبات و محاسبه سود ناخالص — همه به درهم."
              />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { t: "VAT ۵ درصد", d: "محاسبه خودکار و ثبت TRN مشتری." },
                  { t: "مطالبات و سن‌بندی", d: "نمای ۱ تا ۶۰+ روز برای پیگیری وصول." },
                  { t: "سود هر محموله", d: "درآمد منهای هزینه مستقیم، به‌تفکیک مسیر." },
                  { t: "خروجی گزارش", d: "گزارش قابل ارائه به حسابرس و شرکای اماراتی." },
                ].map((item) => (
                  <div key={item.t} className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                    <p className="text-[12px] font-semibold text-white">{item.t}</p>
                    <p className="mt-1 text-[11px] leading-6 text-slate-400">{item.d}</p>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/accounting" className="btn btn-outline mt-6">
                مشاهده ماژول حسابداری
                <Icons.arrow />
              </Link>
            </div>
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime/12 text-lime">
                    <Icons.wallet />
                  </span>
                  <div>
                    <p className="text-[12px] font-bold text-white">فاکتور نمونه</p>
                    <p className="text-[9px] text-slate-500">Tax Invoice · AED</p>
                  </div>
                </div>
                <span className="badge badge-success">پرداخت شده</span>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 text-[11px]">
                  <div>
                    <p className="text-slate-500">صادر شده برای</p>
                    <p className="mt-1 text-[13px] font-semibold text-white">Al Maya Foods Trading LLC</p>
                    <p className="mt-0.5 text-slate-500" dir="ltr">TRN 100482731500003 · Dubai, AE</p>
                  </div>
                  <div className="text-left">
                    <p className="num font-mono text-slate-300">INV-2026-1041</p>
                    <p className="mt-1 text-[10px] text-slate-500">۱۴ اسفند ۱۴۰۴</p>
                    <p className="text-[10px] text-slate-500" dir="ltr">Due: 30 days</p>
                  </div>
                </div>
                <table className="table-base mt-5 text-[11px]">
                  <thead>
                    <tr>
                      <th>شرح</th>
                      <th className="text-center">تعداد</th>
                      <th className="text-left">مبلغ (AED)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <p className="text-slate-200">حمل یخچالی جبل علی → الهاملیا</p>
                        <p className="text-[10px] text-slate-500">NAV-7K42QD</p>
                      </td>
                      <td className="num text-center">۱</td>
                      <td className="num text-left">۱۸٬۰۰۰</td>
                    </tr>
                    <tr>
                      <td>
                        <p className="text-slate-200">توزیع نهایی دبی</p>
                        <p className="text-[10px] text-slate-500">۶ نقطه تحویل</p>
                      </td>
                      <td className="num text-center">۶</td>
                      <td className="num text-left">۴٬۸۵۰</td>
                    </tr>
                  </tbody>
                </table>
                <dl className="mt-4 space-y-2 border-t border-white/8 pt-3 text-[11px]">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">جمع کل</dt>
                    <dd className="num text-slate-300">۲۲٬۸۵۰ درهم</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">VAT ۵٪</dt>
                    <dd className="num text-slate-300">۱٬۱۴۲ درهم</dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/8 pt-2">
                    <dt className="font-semibold text-white">مبلغ قابل پرداخت</dt>
                    <dd className="num text-sm font-extrabold text-lime">۲۳٬۹۹۲ درهم</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* PILOT ROADMAP */}
        <section id="pilot" className="shell py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="پایلوت امارات"
              title="از پایلوت دبی تا تیم مستقر در امارات"
              description="این پروژه به‌صورت پایلوت در امارات اجرا می‌شود و پس از راه‌اندازی، مدیریت و پشتیبانی آن در دبی ادامه خواهد یافت."
            />
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-[11px] text-slate-400">
              <span className="text-lime">وضعیت فعلی:</span> پایلوت عملیاتی — دبی، امارات
            </div>
          </div>
          <div className="relative mt-10">
            <div className="absolute top-3 right-0 left-0 hidden h-px bg-gradient-to-l from-transparent via-lime/30 to-transparent lg:block" />
            <div className="grid gap-4 lg:grid-cols-4">
              {PILOT_PHASES.map((phase) => (
                <article key={phase.phase} className="card relative p-5">
                  <span className={`absolute -top-1 right-5 h-2.5 w-2.5 rounded-full ${TONE_STYLES[phase.tone]}`} />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">{phase.phase}</span>
                    <span className={`badge ${TONE_BADGE[phase.tone]}`}>{phase.state}</span>
                  </div>
                  <h3 className="mt-3 text-[14px] font-bold text-white">{phase.title}</h3>
                  <p className="num mt-1 text-[10px] text-slate-500">{phase.period}</p>
                  <ul className="mt-4 space-y-2">
                    {phase.items.map((item) => (
                      <li key={item} className="flex gap-2 text-[11px] leading-5 text-slate-400">
                        <span className="text-lime">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 rounded-2xl border border-lime/15 bg-lime/[0.04] p-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <p className="text-[13px] font-bold text-white">تعهد پس از راه‌اندازی در امارات</p>
              <p className="mt-1.5 text-[12px] leading-6 text-slate-400">
                تیم مدیریت پروژه، پشتیبانی فنی و عملیات مستقر در دبی؛ نگهداری و بهبود مستمر محصول، آموزش کاربران و
                گزارش‌های ماهانه عملکرد. دسترسی به پشتیبانی در ساعات کاری امارات و خط اضطراری عملیات ۲۴/۷.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { v: "< ۳۰′", l: "زمان پاسخ SLA" },
                { v: "۹۹.۹٪", l: "دسترس‌پذیری" },
                { v: "دبی", l: "تیم مقیم" },
              ].map((item) => (
                <div key={item.l} className="rounded-xl border border-white/10 bg-[#071019] px-3 py-3 text-center">
                  <p className="num text-sm font-extrabold text-lime">{item.v}</p>
                  <p className="mt-1 text-[9px] text-slate-500">{item.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="border-y border-white/6 bg-[#060c14] py-16">
          <div className="shell">
            <SectionHeading
              eyebrow="از زبان شرکای اماراتی"
              title="نتیجه پایلوت در عمل"
              description="بازخورد اولیه باربران و شرکت‌های حاضر در پایلوت دبی."
            />
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {TESTIMONIALS.map((item) => (
                <figure key={item.name} className="card p-5">
                  <div className="mb-3 text-lime">★★★★★</div>
                  <blockquote className="text-[12px] leading-7 text-slate-300">«{item.quote}»</blockquote>
                  <figcaption className="mt-4 flex items-center gap-3 border-t border-white/8 pt-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-lime/25 bg-lime/10 text-[11px] font-bold text-lime">
                      {item.name
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold text-white">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.role}</p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="shell py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
            <SectionHeading eyebrow="پرسش‌های متداول" title="سؤال‌هایی که پیش از شروع پایلوت می‌پرسند" />
            <div className="divide-y divide-white/8 rounded-2xl border border-white/8 bg-white/[0.02]">
              {FAQ.map((item) => (
                <details key={item.q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-medium text-slate-200 [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="text-lime transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[12px] leading-7 text-slate-400">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden border-t border-white/8 bg-[#05090f] py-16">
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(204,247,90,.14), transparent 60%)" }}
          />
          <div className="shell relative text-center">
            <span className="eyebrow mx-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" />
              آماده برای شروع پایلوت در دبی
            </span>
            <h2 className="mx-auto mt-4 max-w-2xl text-2xl font-extrabold tracking-tight text-white sm:text-[34px] sm:leading-[1.3]">
              بار بعدی را در ناوران ثبت کنید
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[13px] leading-7 text-slate-400">
              نسخه نمایشی مرکز کنترل با داده‌های واقعی‌نما آماده است و بدون ثبت‌نام و رمز عبور باز می‌شود. داده‌ها
              فقط در مرورگر شما ذخیره می‌شوند؛ هیچ دیتابیسی لازم نیست.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard" className="btn btn-primary px-6 py-3">
                ورود به مرکز کنترل
                <Icons.arrow />
              </Link>
              <Link href="/dashboard/loads" className="btn btn-outline px-6 py-3">
                مشاهده تخته بار
              </Link>
              <a href="tel:+97148872210" className="btn btn-ghost px-4 py-3 text-[13px]" dir="ltr">
                +971 4 887 2210
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
