"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  locationSchema,
  type LocationFormValues,
} from "@/lib/validations/schema";
import { uploadToCloudinary, UploadValidationError } from "@/lib/cloudinary/upload";
import type { Category, Location } from "@/types/database";

const MiniMapPreview = dynamic(() => import("./MiniMapPreview"), {
  ssr: false,
  loading: () => (
    <div className="h-52 w-full animate-pulse rounded-lg bg-ink-300/60" />
  ),
});

interface LocationFormProps {
  categories: Category[];
  initialData?: Location | null;
  onSubmit: (values: LocationFormValues) => Promise<void>;
  onCancel: () => void;
}

export default function LocationForm({
  categories,
  initialData,
  onSubmit,
  onCancel,
}: LocationFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      category_id: initialData?.category_id ?? "",
      name: initialData?.name ?? "",
      address: initialData?.address ?? "",
      description: initialData?.description ?? "",
      latitude: initialData?.latitude ?? -7.1621,
      longitude: initialData?.longitude ?? 112.6381,
      image_url: initialData?.image_url ?? "",
    },
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const imageUrl = watch("image_url");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress(0);
      const result = await uploadToCloudinary(file, setUploadProgress);
      setValue("image_url", result.secure_url, { shouldValidate: true });
      toast.success("Foto berhasil diunggah");
    } catch (err) {
      if (err instanceof UploadValidationError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal mengunggah foto. Coba lagi.");
      }
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const submitHandler = async (values: LocationFormValues) => {
    setIsSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="space-y-4"
      noValidate
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Kategori
        </label>
        <select
          {...register("category_id")}
          className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
        >
          <option value="">Pilih kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="mt-1 text-xs text-red-600">
            {errors.category_id.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Nama Lokasi
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
          Alamat
        </label>
        <input
          {...register("address")}
          className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
        />
        {errors.address && (
          <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Deskripsi
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Latitude
          </label>
          <input
            type="number"
            step="0.0000001"
            {...register("latitude", { valueAsNumber: true })}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />
          {errors.latitude && (
            <p className="mt-1 text-xs text-red-600">
              {errors.latitude.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Longitude
          </label>
          <input
            type="number"
            step="0.0000001"
            {...register("longitude", { valueAsNumber: true })}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />
          {errors.longitude && (
            <p className="mt-1 text-xs text-red-600">
              {errors.longitude.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Pratinjau Peta
        </label>
        <MiniMapPreview
          latitude={latitude}
          longitude={longitude}
          onChange={(lat, lng) => {
            setValue("latitude", lat, { shouldValidate: true });
            setValue("longitude", lng, { shouldValidate: true });
          }}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Foto Lokasi
        </label>
        {imageUrl ? (
          <div className="relative w-fit">
            <img
              src={imageUrl}
              alt="Pratinjau foto lokasi"
              className="h-28 w-40 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => setValue("image_url", "")}
              aria-label="Hapus foto"
              className="absolute -right-2 -top-2 rounded-full bg-ink-900 p-1 text-white"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-300 py-6 text-sm text-ink-500 hover:border-brand-blue hover:text-brand-blue"
          >
            <Upload size={16} />
            Unggah foto (JPG/PNG/WebP, maks 5MB)
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        {uploadProgress !== null && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-300">
            <div
              className="h-full bg-brand-blue transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-dark disabled:opacity-60"
        >
          {isSaving && <Loader2 size={14} className="animate-spin" />}
          Simpan
        </button>
      </div>
    </form>
  );
}
