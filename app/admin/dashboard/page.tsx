"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import CategoryManager from "@/components/admin/CategoryManager";
import LocationTable from "@/components/admin/LocationTable";
import LocationForm from "@/components/admin/LocationForm";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { SidebarSkeleton } from "@/components/ui/Skeleton";
import type {
  Category,
  Location,
  LocationWithCategory,
} from "@/types/database";
import type { LocationFormValues } from "@/lib/validations/schema";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<LocationWithCategory | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const [categoriesRes, locationsRes] = await Promise.all([
      supabase.from("categories").select("*").order("created_at"),
      supabase
        .from("locations")
        .select("*, categories(id, name, icon, color)")
        .order("created_at", { ascending: false }),
    ]);

    if (categoriesRes.error || locationsRes.error) {
      toast.error("Gagal memuat data dari server.");
    } else {
      setCategories(categoriesRes.data ?? []);
      setLocations((locationsRes.data as LocationWithCategory[]) ?? []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const openCreateLocation = () => {
    setEditingLocation(null);
    setFormOpen(true);
  };

  const openEditLocation = (location: LocationWithCategory) => {
    setEditingLocation(location);
    setFormOpen(true);
  };

  const handleSaveLocation = async (values: LocationFormValues) => {
    const supabase = createClient();
    const payload = {
      ...values,
      description: values.description || null,
      image_url: values.image_url || null,
    };

    const query = editingLocation
      ? supabase.from("locations").update(payload).eq("id", editingLocation.id)
      : supabase.from("locations").insert(payload);

    const { error } = await query;
    if (error) {
      toast.error("Gagal menyimpan lokasi.");
      return;
    }
    toast.success(editingLocation ? "Lokasi diperbarui" : "Lokasi ditambahkan");
    setFormOpen(false);
    loadData();
  };

  const confirmDeleteLocation = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("locations")
      .delete()
      .eq("id", deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);

    if (error) {
      toast.error("Gagal menghapus lokasi.");
      return;
    }
    toast.success("Lokasi dihapus");
    loadData();
  };

  return (
    <div className="min-h-dvh bg-ink-100">
      <header className="flex items-center justify-between border-b border-ink-300 bg-white px-4 py-3 sm:px-6">
        <h1 className="text-base font-semibold text-ink-900">
          Dashboard Admin — Peta Informasi Kebomas
        </h1>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-ink-700 hover:bg-ink-100"
        >
          <LogOut size={15} /> Keluar
        </button>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {isLoading ? (
          <SidebarSkeleton />
        ) : (
          <>
            <CategoryManager categories={categories} onChanged={loadData} />

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink-900">
                  Kelola Lokasi
                </h2>
                <button
                  type="button"
                  onClick={openCreateLocation}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-orange-dark"
                >
                  <Plus size={14} /> Tambah Lokasi
                </button>
              </div>
              <LocationTable
                locations={locations}
                onEdit={openEditLocation}
                onDelete={setDeleteTarget}
              />
            </div>
          </>
        )}
      </main>

      {formOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1400] flex items-center justify-center bg-ink-900/40 p-4 animate-fade-in"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-popup kd-scroll animate-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900">
                {editingLocation ? "Edit Lokasi" : "Lokasi Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="Tutup"
                className="text-ink-500 hover:text-ink-900"
              >
                <X size={16} />
              </button>
            </div>
            <LocationForm
              categories={categories}
              initialData={editingLocation}
              onSubmit={handleSaveLocation}
              onCancel={() => setFormOpen(false)}
            />
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus lokasi ini?"
        description={`Lokasi "${deleteTarget?.name}" akan dihapus permanen. Aksi ini tidak bisa dibatalkan.`}
        isLoading={isDeleting}
        onConfirm={confirmDeleteLocation}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
