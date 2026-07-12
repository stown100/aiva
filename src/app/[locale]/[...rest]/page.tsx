import { notFound } from "next/navigation";

/** Catches unknown paths inside a locale so the localized 404 renders. */
export default function CatchAllRoute() {
  notFound();
}
