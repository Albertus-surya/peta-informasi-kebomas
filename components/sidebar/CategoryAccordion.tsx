"use client";

import { useState } from "react";
import { ChevronDown, MapPin, Inbox } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/lib/store/mapStore";
import type { Category, LocationWithCategory } from "@/types/database";

interface CategoryAccordionProps {
  categories: Category[];
  locations: LocationWithCategory[];
}

export default function CategoryAccordion({
  categories,
  locations,
}: CategoryAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    new Set(categories[0] ? [categories[0].id] : [])
  );
  const selectedLocation = useMapStore((s) => s.selectedLocation);
  const flyToLocation = useMapStore((s) => s.flyToLocation);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-ink-500">
        <Inbox size={28} />
        <p className="text-sm">Belum ada kategori lokasi.</p>
      </div>
    );
  }

  return (
    <nav aria-label="Kategori lokasi" className="flex flex-col">
      {categories.map((category) => {
        const isOpen = openIds.has(category.id);
        const items = locations.filter(
          (loc) => loc.category_id === category.id
        );
        const CategoryIcon =
          (Icons as unknown as Record<string, React.ComponentType<any>>)[
            category.icon
          ] ?? Icons.MapPin;

        return (
          <div key={category.id} className="border-b border-ink-300">
            <button
              type="button"
              onClick={() => toggle(category.id)}
              aria-expanded={isOpen}
              aria-controls={`category-panel-${category.id}`}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-ink-900 hover:bg-ink-100"
            >
              <span className="flex items-center gap-2">
                <CategoryIcon size={16} className="text-brand-orange" />
                {category.name}
                <span className="text-xs font-normal text-ink-500">
                  ({items.length})
                </span>
              </span>
              <ChevronDown
                size={16}
                className={cn(
                  "shrink-0 text-ink-500 transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {isOpen && (
              <ul
                id={`category-panel-${category.id}`}
                className="animate-slide-up pb-2"
              >
                {items.length === 0 ? (
                  <li className="px-9 py-2 text-xs text-ink-500">
                    Belum ada lokasi di kategori ini.
                  </li>
                ) : (
                  items.map((loc) => (
                    <li key={loc.id}>
                      <button
                        type="button"
                        onClick={() => flyToLocation(loc)}
                        className={cn(
                          "flex w-full items-center gap-2 px-9 py-1.5 text-left text-sm text-ink-700 hover:bg-ink-100",
                          selectedLocation?.id === loc.id &&
                            "bg-brand-blue/10 font-medium text-brand-blue"
                        )}
                      >
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">{loc.name}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
