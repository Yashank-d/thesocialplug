"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

export default function AttendeeSearch({
  defaultValue,
}: {
  defaultValue: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    startTransition(() => {
      const params = new URLSearchParams();
      if (value) params.set("search", value);
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <input
      type="text"
      placeholder="search by name, email or instagram..."
      defaultValue={defaultValue}
      onChange={handleSearch}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors mb-4 bg-white"
    />
  );
}
