export const dynamic = "force-static";

/**
 * این پروژه کاملاً فرانت‌اند است و به دیتابیس وابسته نیست.
 * داده‌های نمایشی در مرورگر کاربر (localStorage) نگهداری می‌شود.
 */
export async function GET() {
  return Response.json({ ok: true, mode: "frontend-only", storage: "localStorage" });
}
