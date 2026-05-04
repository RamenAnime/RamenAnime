// @ts-nocheck
import { useState } from "react";
import { trpc } from "@/providers/trpc";
export default function Orders() {
  const [filter] = useState("all");
  return <div className="p-6">Orders - Coming Soon (filter: {filter})</div>;
}
