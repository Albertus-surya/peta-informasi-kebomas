"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Icons from "lucide-react";
import { Loader2, Pencil, Trash2, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/schema";
import ConfirmModal from "./ConfirmModal";
import type { Category } from "@/types/database";

const ICON_OPTIONS = [
  "Landmark",
  "HeartPulse",
  "GraduationCap",
  "Users",
  "Shield",
  "MapPin",
  "Building2",
  "Church",
  "ShoppingBag",
  "TreePine",
  "Bus",
  "Wrench",
];

interface CategoryManagerProps {
  categories: Category[];
  onChanged: () => void;
}

export default function CategoryManager({
  categories,
  onChanged,
}: CategoryManagerProps) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", icon: "MapPin", color: "#f97316" },
  });

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", icon: "MapPin", color: "#f97316" });
    setShowForm(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    reset({
      name: category.name,
      icon: category.icon,
      color: category.color ?? "#f97316",
    });
    setShowForm(true);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    const supabase = createClient();
    const query = editing
      ? supabase.from("categories").update(values).eq("id", editing.id)
      : supabase.from("categories").insert(values);

    const { error } = await query;
    if (error) {
      toast.error("Gagal menyimpan kategori.");
      return;
    }
    toast.success(editing ? "Kategori diperbarui" : "Kategori ditambahkan");
    setShowForm(false);
    onChanged();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);

    if (error) {
      toast.error(
        "Gagal menghapus. Pastikan tidak ada lokasi yang masih memakai kategori ini."
      );
      return;
    }
    toast.success("Kategori dihapus");
    onChanged();
  };

  return (
    <div className="rounded-xl border border-ink-300 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-900">Kategori</h2>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-orange-dark"
        >
          <Plus size={14} /> Tambah
        </button>
      </div>

      <ul className="divide-y divide-ink-300">
        {categories.map((c) => {
          const CategoryIcon =
            (Icons as unknown as Record<string, React.ComponentType<any>>)[
              c.icon
            ] ?? Icons.MapPin;
          return (
            <li key={c.id} className="flex items-center justify-between py-2">
              <span className="flex items-center gap-2 text-sm text-ink-900">
                <span
                  aria-hidden
                  className="h-3 w-3 shrink-0 rounded-full border border-ink-300"
                  style={{ backgroundColor: c.color ?? "#f97316" }}
                />
                <CategoryIcon size={15} style={{ color: c.color ?? "#f97316" }} />
                {c.name}
              </span>
              <span className="flex gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  aria-label={`Edit ${c.name}`}
                  className="rounded p-1.5 text-ink-500 hover:bg-ink-100"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(c)}
                  aria-label={`Hapus ${c.name}`}
                  className="rounded p-1.5 text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </span>
            </li>
          );
        })}
        {categories.length === 0 && (
          <li className="py-4 text-center text-xs text-ink-500">
            Belum ada kategori.
          </li>
        )}
      </ul>

      {showForm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1400] flex items-center justify-center bg-ink-900/40 p-4 animate-fade-in"
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-sm space-y-4 rounded-xl bg-white p-5 shadow-popup animate-slide-up"
            noValidate
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900">
                {editing ? "Edit Kategori" : "Kategori Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Tutup"
                className="text-ink-500 hover:text-ink-900"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">
                Nama Kategori
              </label>
              <input
                {...register("name")}
                className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">
                Ikon
              </label>
              <div className="grid grid-cols-6 gap-2">
                {ICON_OPTIONS.map((iconName) => {
                  const IconComp =
                    (Icons as unknown as Record<string, React.ComponentType<any>>)[
                      iconName
                    ];
                  const active = selectedIcon === iconName;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      aria-label={iconName}
                      aria-pressed={active}
                      onClick={() =>
                        setValue("icon", iconName, { shouldValidate: true })
                      }
                      className={`flex items-center justify-center rounded-lg border p-2 ${
                        active
                          ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                          : "border-ink-300 text-ink-500 hover:bg-ink-100"
                      }`}
                    >
                      <IconComp size={16} />
                    </button>
                  );
                })}
              </div>
              {errors.icon && (
                <p className="mt-1 text-xs text-red-600">{errors.icon.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">
                Warna Titik
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  {...register("color")}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-ink-300 bg-white p-1"
                  aria-label="Pilih warna titik"
                />
                <input
                  type="text"
                  {...register("color")}
                  placeholder="#f97316"
                  className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm uppercase outline-none focus:border-brand-blue"
                />
              </div>
              {errors.color && (
                <p className="mt-1 text-xs text-red-600">{errors.color.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-dark disabled:opacity-60"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus kategori ini?"
        description={`Kategori "${deleteTarget?.name}" akan dihapus permanen. Aksi ini tidak bisa dibatalkan.`}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
