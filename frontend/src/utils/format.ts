import { ASSET_DECIMALS } from "@/config";

export const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return "";
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 1)}…${address.slice(-chars)}`;
};

/** Convert a human amount (e.g. "10.5") into stroops as a string. */
export const toStroops = (amount: string): string => {
  const [whole, fraction = ""] = amount.trim().split(".");
  const paddedFraction = fraction
    .padEnd(ASSET_DECIMALS, "0")
    .slice(0, ASSET_DECIMALS);
  const combined = `${whole}${paddedFraction}`.replace(/^0+(?=\d)/, "");
  return BigInt(combined || "0").toString();
};

/** Convert stroops (string) into a human-readable amount. */
export const fromStroops = (stroops: string): string => {
  const value = BigInt(stroops || "0");
  const divisor = BigInt(10 ** ASSET_DECIMALS);
  const whole = value / divisor;
  const fraction = value % divisor;
  if (fraction === 0n) return whole.toString();
  const fractionStr = fraction
    .toString()
    .padStart(ASSET_DECIMALS, "0")
    .replace(/0+$/, "");
  return `${whole}.${fractionStr}`;
};

export const formatAmount = (stroops: string): string => {
  const human = fromStroops(stroops);
  const [whole, fraction] = human.split(".");
  const grouped = Number(whole).toLocaleString("en-US");
  return fraction ? `${grouped}.${fraction}` : grouped;
};

export const formatDate = (timestamp: number): string =>
  new Date(timestamp * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const timeAgo = (timestamp: number): string => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
