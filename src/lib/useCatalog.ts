"use client";
import { useEffect, useState } from "react";
import { catalogApi } from "@/lib/api";

export type CatalogItem = {
  id: number;
  slug: string;
  label: string;
  isActive?: boolean;
  is_active?: boolean;
  sortOrder?: number;
  sort_order?: number;
};

export function useEventTypes() {
  const [types, setTypes] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/catalog/event-types", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setTypes(Array.isArray(data) ? data : []))
      .catch(() => setTypes([]))
      .finally(() => setLoading(false));
  }, []);

  return { types, loading };
}

export function useProviderTypes() {
  const [types, setTypes] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/catalog/provider-types", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setTypes(Array.isArray(data) ? data : []))
      .catch(() => setTypes([]))
      .finally(() => setLoading(false));
  }, []);

  return { types, loading };
}

export function getTypeLabel(types: CatalogItem[], slug: string): string {
  const t = types.find((x) => x.slug === slug);
  return t?.label || slug;
}
