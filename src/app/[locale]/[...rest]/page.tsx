import { notFound } from "next/navigation";

// Unmatched paths under a locale render that locale's not-found page (inside its
// layout) instead of the root English 404.
export default function UnknownLocalePath() {
  notFound();
}
