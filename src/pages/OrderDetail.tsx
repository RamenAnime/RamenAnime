// @ts-nocheck
import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
export default function OrderDetail() {
  const { id } = useParams();
  return <div className="p-6">Order {id} - Coming Soon</div>;
}
