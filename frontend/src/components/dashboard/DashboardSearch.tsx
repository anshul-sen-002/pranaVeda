"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";

/** Search the public practice library directly from the dashboard. */
export function DashboardSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    if (value) router.push(`/yoga?q=${encodeURIComponent(value)}`);
  };

  return (
    <form onSubmit={submit} role="search" className="flex min-h-12 items-center gap-2 rounded-2xl border border-[#e4eade] bg-white/90 p-1.5 pl-3.5 shadow-[0_8px_24px_-20px_rgba(29,63,46,.38)] transition-[border-color,box-shadow] focus-within:border-primary-300 focus-within:shadow-[0_0_0_3px_rgba(143,193,173,.14)] sm:rounded-full sm:pl-4">
      <Search className="size-[18px] shrink-0 text-[#789286]" aria-hidden="true" />
      <label htmlFor="dashboard-library-search" className="sr-only">Search yoga practices</label>
      <input
        id="dashboard-library-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search poses, areas, or difficulty..."
        className="h-9 min-w-0 flex-1 bg-transparent text-sm text-heading placeholder:text-muted focus:outline-none sm:text-[15px]"
      />
      <button type="submit" disabled={!query.trim()} aria-label="Search practices" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-700 text-white transition-all hover:bg-primary-800 active:scale-95 disabled:bg-primary-100 disabled:text-primary-500">
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </form>
  );
}
