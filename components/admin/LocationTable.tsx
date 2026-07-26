"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { LocationWithCategory } from "@/types/database";

type SortKey = "name" | "created_at";

interface LocationTableProps {
  locations: LocationWithCategory[];
  onEdit: (location: LocationWithCategory) => void;
  onDelete: (location: LocationWithCategory) => void;
}

const PAGE_SIZE = 8;

export default function LocationTable({
  locations,
  onEdit,
  onDelete,
}: LocationTableProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const list = locations.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q) ||
        (l.categories?.name ?? "").toLowerCase().includes(q)
    );
    list.sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      return (
        (new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()) *
        dir
      );
    });
    return list;
  }, [locations, query, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
    setPage(1);
  };

  return (
    <div className="rounded-xl border border-ink-300 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink-900">Lokasi</h2>
        <div className="flex items-center gap-2 rounded-lg border border-ink-300 px-3 py-1.5">
          <Search size={14} className="text-ink-500" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Cari lokasi..."
            className="w-40 bg-transparent text-xs outline-none sm:w-56"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-300 text-xs text-ink-500">
              <th className="py-2 pr-2">
                <button
                  type="button"
                  onClick={() => toggleSort("name")}
                  className="flex items-center gap-1 hover:text-ink-900"
                >
                  Nama <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="py-2 pr-2">Kategori</th>
              <th className="py-2 pr-2">Alamat</th>
              <th className="py-2 pr-2">
                <button
                  type="button"
                  onClick={() => toggleSort("created_at")}
                  className="flex items-center gap-1 hover:text-ink-900"
                >
                  Dibuat <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="py-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((loc) => (
              <tr key={loc.id} className="border-b border-ink-100">
                <td className="py-2 pr-2 font-medium text-ink-900">
                  {loc.name}
                </td>
                <td className="py-2 pr-2 text-ink-700">
                  {loc.categories?.name ?? "—"}
                </td>
                <td className="max-w-[220px] truncate py-2 pr-2 text-ink-500">
                  {loc.address}
                </td>
                <td className="py-2 pr-2 text-ink-500">
                  {new Date(loc.created_at).toLocaleDateString("id-ID")}
                </td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(loc)}
                    aria-label={`Edit ${loc.name}`}
                    className="rounded p-1.5 text-ink-500 hover:bg-ink-100"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(loc)}
                    aria-label={`Hapus ${loc.name}`}
                    className="rounded p-1.5 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-ink-500">
                  Tidak ada lokasi yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-xs text-ink-500">
          <span>
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded p-1.5 hover:bg-ink-100 disabled:opacity-40"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded p-1.5 hover:bg-ink-100 disabled:opacity-40"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
