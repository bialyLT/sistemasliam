export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const MONTHS_ES: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

function parseSpanishDate(dateStr: string): Date | null {
  const parts = dateStr.toLowerCase().trim().split(/\s+/);
  if (parts.length < 2) return null;
  const month = MONTHS_ES[parts[0]];
  if (month === undefined) return null;
  const year = parseInt(parts[1], 10);
  if (isNaN(year)) return null;
  return new Date(year, month, 1);
}

function parseDate(dateStr: string): Date | null {
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr.trim());
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return parseSpanishDate(dateStr);
}

export function relativeTime(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date) return dateStr;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return dateStr;
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  if (diffMonths < 1) return "Hoy";
  if (diffMonths === 1) return "1 mes";
  if (diffMonths < 12) return `${diffMonths} meses`;
  const diffYears = Math.floor(diffMonths / 12);
  if (diffYears === 1) return "1 año";
  return `${diffYears} años`;
}
