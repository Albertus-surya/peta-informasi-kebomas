"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormValues } from "@/lib/validations/schema";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    setIsSubmitting(false);

    if (error) {
      toast.error("Email atau password salah.");
      return;
    }

    toast.success("Berhasil masuk");
    router.push("/admin/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-100 px-4">
      <div className="w-full max-w-sm rounded-xl border border-ink-300 bg-white p-6 shadow-card">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold text-ink-900">
            Admin — Peta Informasi Kebomas
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Masuk untuk mengelola kategori dan lokasi
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-blue-dark disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogIn size={16} />
            )}
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
