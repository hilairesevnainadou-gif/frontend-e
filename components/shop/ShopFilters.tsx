"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PriceBucket } from "@/lib/price-buckets";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/product";
import { Search, Sparkles, Tag, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/**
 * A horizontal bar rather than the previous 240 px sidebar: stacked vertically
 * the search box, two toggles, eight categories and five budgets ran taller
 * than the viewport, and on mobile they pushed the products off the screen.
 */
export default function ShopFilters({
  categories,
  priceBuckets,
}: {
  categories: Category[];
  priceBuckets: PriceBucket[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") || "";
  const activeMin = searchParams.get("min_price");
  const activeMax = searchParams.get("max_price");
  const activeNew = searchParams.get("new") === "1";
  const activeSale = searchParams.get("on_sale") === "1";
  const activeSearch = searchParams.get("search") || "";
  const [searchValue, setSearchValue] = useState(activeSearch);

  const hasActiveFilters =
    !!activeCategory || !!activeMin || !!activeMax || activeNew || activeSale || !!activeSearch;

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ search: searchValue.trim() || null, category: null, new: null, on_sale: null });
  }

  function selectCategory(slug: string | null) {
    navigate({ category: slug, new: null, on_sale: null, search: null });
  }

  function selectBudget(bucket: PriceBucket) {
    navigate({
      min_price: bucket.min !== undefined ? String(bucket.min) : null,
      max_price: bucket.max !== undefined ? String(bucket.max) : null,
    });
  }

  function toggleQuickFilter(key: "new" | "on_sale") {
    const isActive = key === "new" ? activeNew : activeSale;
    navigate({
      new: null,
      on_sale: null,
      category: null,
      search: null,
      [key]: isActive ? null : "1",
    });
  }

  const chip = (isActive: boolean) =>
    cn(
      "rounded-full border px-3.5 py-1.5 text-sm transition-colors whitespace-nowrap",
      isActive
        ? "border-primary bg-primary text-primary-foreground font-medium"
        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
    );

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 mb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Rechercher un produit..."
            className="pl-9"
            aria-label="Rechercher un produit"
          />
        </form>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={activeNew ? "default" : "outline"}
            onClick={() => toggleQuickFilter("new")}
            className="gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Nouveautés
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activeSale ? "default" : "outline"}
            onClick={() => toggleQuickFilter("on_sale")}
            className="gap-1.5"
          >
            <Tag className="h-3.5 w-3.5" />
            Promotions
          </Button>
          {hasActiveFilters && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => router.push(pathname)}
              className="gap-1.5 text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Effacer
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mr-1">
          Catégories
        </span>
        <button
          type="button"
          onClick={() => selectCategory(null)}
          className={chip(!activeCategory && !activeNew && !activeSale && !activeSearch)}
        >
          Toutes
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => selectCategory(c.slug)}
            className={chip(activeCategory === c.slug)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {priceBuckets.length > 1 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mr-1">
            Budget
          </span>
          {priceBuckets.map((bucket) => {
            const isActive =
              (bucket.min !== undefined ? String(bucket.min) : null) === (activeMin || null) &&
              (bucket.max !== undefined ? String(bucket.max) : null) === (activeMax || null);

            return (
              <button
                key={bucket.label}
                type="button"
                onClick={() => selectBudget(bucket)}
                className={chip(isActive)}
              >
                {bucket.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
