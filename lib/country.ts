/**
 * Country → flag emoji + display label.
 * Used on product cards and PDP "country of origin" badges.
 */

const COUNTRY_FLAGS: Record<string, string> = {
  China: "🇨🇳",
  India: "🇮🇳",
  Italy: "🇮🇹",
  Vietnam: "🇻🇳",
  Indonesia: "🇮🇩",
  Malaysia: "🇲🇾",
  Thailand: "🇹🇭",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Spain: "🇪🇸",
  Portugal: "🇵🇹",
  Turkey: "🇹🇷",
  USA: "🇺🇸",
  Japan: "🇯🇵",
  Korea: "🇰🇷",
  Denmark: "🇩🇰",
  Sweden: "🇸🇪",
  Netherlands: "🇳🇱",
  Belgium: "🇧🇪",
  UK: "🇬🇧",
  "United Kingdom": "🇬🇧",
  "United States": "🇺🇸",
};

export function flagFor(country: string | null | undefined): string {
  if (!country) return "";
  return COUNTRY_FLAGS[country] ?? "";
}
