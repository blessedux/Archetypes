"use client";

import { Providers } from "./index";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
} 