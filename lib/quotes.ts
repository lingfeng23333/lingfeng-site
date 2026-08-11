import quotesData from "@/data/quotes.json";
import type { Quote } from "./types";

export function getRandomQuote(): Quote {
  const quotes = quotesData as Quote[];
  return quotes[Math.floor(Math.random() * quotes.length)];
}
