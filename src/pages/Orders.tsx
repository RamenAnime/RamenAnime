import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Eye,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "disputed"
  | "refunded";

interface OrderListing {
  title: string;
  thumbnail?: string;
  price: string;
}

interface OrderUser {
  username: string;
  name?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  buyerId: number;
  sellerId: number;
  listingId: number;
  totalAmount: string;
  taxAmount: string;
  feeAmount: string;
  shippingCost: string;
  currency: string;
  status: OrderStatus;
  shippingCarrier?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  listing?: OrderListing;
  seller?: OrderUser;
  buyer?: OrderUser;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusConfig(t: (key: string) => string): Record<
  OrderStatus,
  { label: string; color: string; icon: React.ReactNode }
> {
  return {
    pending: {
      label: t("orders.pending"),
      color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    paid: {
      label: t("orders.paid"),
      color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
    },
    shipped: {
      label: t("orders.shipped"),
      color: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      icon: <Truck className="w-3.5 h-3.5" />,
    },
    delivered: {
      label: t("orders.delivered"),
      color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    cancelled: {
      label: t("orders.cancelled"),
      color: "bg-gray-500/15 text-gray-400 border-gray-500/30",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    disputed: {
      label: t("orders.disputed"),
      color: "bg-red-500/15 text-red-400 border-red-500/30",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    refunded: {
      label: t("orders.refunded"),
      color: "bg-orange-500/15 text-orange-400 border-orange-500/30",
      icon: <Package className="w-3.5 h-3.5" />,
    },
  };
}

function formatCurrency(amount: string, currency: string) {
  const num = parseFloat(amount);
  if (Number.isNaN(num)) return amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(num);
}

function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  OrderCard sub-component                                            */
/* ------------------------------------------------------------------ */

function OrderCard({
  order,
  onClick,
  t,
}: {
  order: Order;
  onClick: (id: number) => void;
  t: import("i18next").TFunction;
}) {
  const cfg = getStatusConfig(t)[order.status];

  return (
    <Card
      className="bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#d4a853]/40 transition-colors cursor-pointer group"
      onClick={() => onClick(order.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: image placeholder + title */}
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-16 h-16 rounded-lg bg-[#2a2a2a] flex items-center justify-center shrink-0 overflow-hidden">
              {order.listing?.thumbnail ? (
                <img
                  src={order.listing.thumbnail}
                  alt={order.listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-7 h-7 text-[#555]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">
                {order.listing?.title ?? t("common.unknownItem")}
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                {t("orders.orderNumber", { number: order.orderNumber })}
              </p>
              <p className="text-xs text-white/40">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Right: amount + status */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <p className="text-sm font-semibold text-[#d4a853]">
              {formatCurrency(order.totalAmount, order.currency)}
            </p>
            <Badge
              variant="outline"
              className={`text-xs font-medium ${cfg.color} flex items-center gap-1`}
            >
              {cfg.icon}
              {cfg.label}
            </Badge>
          </div>
        </div>

        {/* Bottom row: seller/buyer + view */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2a2a2a]">
          <div className="text-xs text-white/40">
            {order.seller && (
              <span>
                {t("orders.sellerLabel")} <span className="text-white/60">{order.seller.username}</span>
              </span>
            )}
            {order.buyer && (
              <span>
                {t("orders.buyerLabel")} <span className="text-white/60">{order.buyer.username}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-[#d4a853] opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="w-3.5 h-3.5" />
            {t("orders.viewOrder")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Orders Page                                                        */
/* ------------------------------------------------------------------ */

export default function Orders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"purchases" | "sales">("purchases");

  const {
    data: purchases,
    isLoading: purchasesLoading,
    error: purchasesError,
  } = trpc.stripe.myOrders.useQuery();

  const {
    data: sales,
    isLoading: salesLoading,
    error: salesError,
  } = trpc.stripe.mySales.useQuery();

  const handleOrderClick = (id: number) => {
    navigate(`/orders/${id}`);
  };

  const isLoading = activeTab === "purchases" ? purchasesLoading : salesLoading;
  const error = activeTab === "purchases" ? purchasesError : salesError;
  const orders: Order[] =
    activeTab === "purchases"
      ? (purchases as Order[] | undefined) ?? []
      : (sales as Order[] | undefined) ?? [];

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/5"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{t("orders.title")}</h1>
        </div>
        <p className="text-sm text-white/40 ml-12">
          {t("orders.pageSubtitle")}
        </p>
      </div>

      <Separator className="bg-[#2a2a2a] max-w-4xl mx-auto" />

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "purchases" | "sales")}
          className="w-full"
        >
          <TabsList className="bg-[#1a1a1a] border border-[#2a2a2a] mb-4">
            <TabsTrigger
              value="purchases"
              className="data-[state=active]:bg-[#d4a853]/15 data-[state=active]:text-[#d4a853] data-[state=active]:shadow-none text-white/60"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              {t("orders.myPurchases")}
            </TabsTrigger>
            <TabsTrigger
              value="sales"
              className="data-[state=active]:bg-[#d4a853]/15 data-[state=active]:text-[#d4a853] data-[state=active]:shadow-none text-white/60"
            >
              <Package className="w-4 h-4 mr-2" />
              {t("orders.mySales")}
            </TabsTrigger>
          </TabsList>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="mt-0">
            {purchasesLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-[#d4a853] animate-spin" />
                <p className="text-sm text-white/40">{t("orders.loadingPurchases")}</p>
              </div>
            ) : purchasesError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <p className="text-sm text-white/60">
                  {t("orders.loadPurchasesError")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2a2a2a] text-white/70 hover:text-white hover:bg-white/5"
                  onClick={() => window.location.reload()}
                >
                  {t("common.retry")}
                </Button>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-[#555]" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-white/80">
                    {t("orders.noPurchases")}
                  </p>
                  <p className="text-sm text-white/40 mt-1 max-w-sm">
                    {t("orders.noPurchasesDesc")}
                  </p>
                </div>
                <Button
                  className="bg-[#d4a853] text-black hover:bg-[#c49a4b] font-medium"
                  onClick={() => navigate("/browse")}
                >
                  {t("orders.browseListings")}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onClick={handleOrderClick}
                    t={t}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="mt-0">
            {salesLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-[#d4a853] animate-spin" />
                <p className="text-sm text-white/40">{t("orders.loadingSales")}</p>
              </div>
            ) : salesError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <p className="text-sm text-white/60">
                  {t("orders.loadSalesError")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2a2a2a] text-white/70 hover:text-white hover:bg-white/5"
                  onClick={() => window.location.reload()}
                >
                  {t("common.retry")}
                </Button>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                  <Package className="w-7 h-7 text-[#555]" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-white/80">
                    {t("orders.noSales")}
                  </p>
                  <p className="text-sm text-white/40 mt-1 max-w-sm">
                    {t("orders.noSalesDesc")}
                  </p>
                </div>
                <Button
                  className="bg-[#d4a853] text-black hover:bg-[#c49a4b] font-medium"
                  onClick={() => navigate("/sell")}
                >
                  {t("orders.createListing")}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onClick={handleOrderClick}
                    t={t}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
