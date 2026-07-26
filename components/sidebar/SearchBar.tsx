"use client";

import { useMemo, useState } from "react";
import { Search, MapPin } from "lucide-react";
import { debounce } from "@/lib/utils";
import { useMapStore } from "@/lib/store/mapStore";
import type { LocationWithCategory } from "@/types/database";

interface SearchBarProps {
  locations: LocationWithCategory[];
}

export default function SearchBar({ locations }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const flyToLocation = useMapStore((s) => s.flyToLocation);

  const debouncedSetQuery = useMemo(
    () => debounce((value: string) => setDebouncedQuery(value), 300),
    []
  );

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    return locations
      .filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          loc.address.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [debouncedQuery, locations]);

  const handleSelect = (loc: LocationWithCategory) => {
    flyToLocation(loc);
    setQuery(loc.name);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 rounded-lg border border-ink-300 bg-white px-3 py-2 shadow-sm focus-within:border-brand-blue">
        <Search size={16} className="shrink-0 text-ink-500" />
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-results"
          value={query}
          placeholder="Cari Lokasi"
          onChange={(e) => {
            setQuery(e.target.value);
            debouncedSetQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-500"
        />
      </div>

      {isOpen && debouncedQuery.trim() && (
        <ul
          id="search-results"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[1100] max-h-64 overflow-y-auto rounded-lg border border-ink-300 bg-white py-1 shadow-popup kd-scroll animate-slide-up"
        >
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-ink-500">
              Tidak ada lokasi yang cocok dengan &ldquo;{debouncedQuery}&rdquo;
            </li>
          ) : (
            results.map((loc) => (
              <li key={loc.id}>
                <button
                  type="button"
                  role="option"
                  onMouseDown={() => handleSelect(loc)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-ink-100"
                >
                  <MapPin
                    size={14}
                    className="mt-0.5 shrink-0 text-brand-orange"
                  />
                  <span>
                    <span className="block font-medium text-ink-900">
                      {loc.name}
                    </span>
                    <span className="block truncate text-xs text-ink-500">
                      {loc.address}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
