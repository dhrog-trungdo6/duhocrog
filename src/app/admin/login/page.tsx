"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Đăng nhập thất bại");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối, thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <GraduationCap className="h-10 w-10 text-primary" aria-hidden />
          <h1 className="text-xl font-extrabold text-slate-800">
            ROG Admin — CRM
          </h1>
          <p className="text-sm text-slate-500">Khu vực nội bộ, cần mật khẩu quản trị.</p>
        </div>

        <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Mật khẩu
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            id="admin-password"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 py-2.5 pl-9 pr-3 focus:border-primary focus:outline-none"
          />
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-accent">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-5 w-full" disabled={loading || !password}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Đăng nhập
        </Button>
      </form>
    </main>
  );
}
