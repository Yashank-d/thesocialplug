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
      placeholder="SEARCH BY NAME, EMAIL OR INSTAGRAM..."
      defaultValue={defaultValue}
      onChange={handleSearch}
      className="glass-input rounded-2xl text-sm mb-4"
    />
  );
}
