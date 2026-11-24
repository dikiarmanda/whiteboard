export function formatWaktu(date: Date) {
  const diffMs = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat("id", { numeric: "auto" });
  const minutes = Math.round(diffMs / 60000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  return new Intl.DateTimeFormat("id", { dateStyle: "medium" }).format(date);
}

export function clientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim().slice(0, 64) || "unknown";
  }
  return headers.get("x-real-ip")?.trim().slice(0, 64) || "unknown";
}

export function safeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "/boards";
  if (value.startsWith("/boards") || value.startsWith("/board/")) return value;
  return "/boards";
}
