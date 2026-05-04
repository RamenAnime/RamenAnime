import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, CreditCard, Clock, CheckCircle, AlertTriangle, ArrowLeft, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  pending: { color: "bg-yellow-500/10 text-yellow-500", icon: Clock, label: "Pending Payment" },
  paid: { color: "bg-blue-500/10 text-blue-500", icon: CreditCard, label: "Paid" },
  shipped: { color: "bg-purple-500/10 text-purple-500", icon: Truck, label: "Shipped" },
  delivered: { color: "bg-green-500/10 text-green-500", icon: CheckCircle, label: "Delivered" },
  cancelled: { color: "bg-red-500/10 text-red-500", icon: AlertTriangle, label: "Cancelled" },
  disputed: { color: "bg-red-500/10 text-red-500", icon: AlertTriangle, label: "Disputed" },
};

const carrierUrls: Record<string, string> = {
  "Japan Post / EMS": "https://trackings.post.japanpost.jp/services/srv/search/",
  "Kuroneko Yamato": "https://toi.kuronekoyamato.co.jp/bs/bs",
  "Sagawa Express": "https://k2.sagawa-exp.co.jp/p/sagawa/web/okurijosearcheng.jsp",
  "DHL Express": "https://www.dhl.com/en/express/tracking.html",
  "FedEx": "https://www.fedex.com/apps/fedextrack/",
  "UPS": "https://www.ups.com/track",
  "USPS": "https://tools.usps.com/go/TrackConfirmAction",
  "SF Express": "https://www.sf-express.com/us/en/dynamic_function/waybill/",
};

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: order, isLoading } = trpc.marketplace.getOrder.useQuery({ orderId: Number(orderId) }, { enabled: isAuthenticated && !!orderId });

  const markShipped = trpc.marketplace.markShipped.useMutation({ onSuccess: () => { toast.success("Marked as shipped!"); utils.marketplace.getOrder.invalidate({ orderId: Number(orderId) }); }, onError: (e) => toast.error(e.message) });
  const releaseEscrow = trpc.marketplace.releaseEscrow.useMutation({ onSuccess: () => { toast.success("Payment released!"); utils.marketplace.getOrder.invalidate({ orderId: Number(orderId) }); }, onError: (e) => toast.error(e.message) });
  const refreshTracking = trpc.shipping.refreshTracking.useMutation({ onSuccess: (res) => { if (res.success) toast.success("Updated: " + res.status); else toast.error(res.error || "Failed"); utils.marketplace.getOrder.invalidate({ orderId: Number(orderId) }); }, onError: (e) => toast.error(e.message) });

  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><p>Please log in.</p></div>;
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"/></div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center"><p>Order not found.</p></div>;

  const status = order.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const listing = order.listing;
  const imgs: string[] = listing?.images ? (Array.isArray(listing.images) ? listing.images : JSON.parse(listing.images)) : [];
  const tx = order.transactions?.[0];
  const tracking = order.tracking?.[0];

  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 md:px-6 max-w-4xl">
        <Link to="/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4 mr-1"/>Back to Orders</Link>
        <div className="flex items-start justify-between mb-6">
          <div><p className="text-sm text-muted-foreground">Order #{order.orderNumber}</p><h1 className="text-2xl font-bold">{listing?.title || "Order Details"}</h1></div>
          <Badge className={`${config.color} border-0 text-sm px-3 py-1`}><StatusIcon className="w-4 h-4 mr-1"/>{config.label}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50"><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Transaction #</p><p className="font-mono text-sm font-medium">{tx?.transactionNumber || "N/A"}</p></CardContent></Card>
          <Card className="border-border/50"><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Total Amount</p><p className="text-lg font-bold text-primary">${order.totalAmount}</p></CardContent></Card>
          <Card className="border-border/50"><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Escrow Status</p><p className="text-sm font-medium capitalize">{order.escrowStatus}</p></CardContent></Card>
        </div>
        <Tabs defaultValue="details">
          <TabsList className="mb-4"><TabsTrigger value="details">Details</TabsTrigger><TabsTrigger value="tracking">Tracking</TabsTrigger><TabsTrigger value="payment">Payment</TabsTrigger></TabsList>
          <TabsContent value="details">
            <Card className="border-border/50"><CardContent className="p-6 space-y-6">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">{imgs.length > 0 ? <img src={imgs[0]} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-muted-foreground/30"/></div>}</div>
                <div><h3 className="font-semibold">{listing?.title}</h3><p className="text-sm text-muted-foreground">{listing?.category}</p><p className="text-sm text-muted-foreground mt-1">Condition: {listing?.condition}</p></div>
              </div>
              <Separator/>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Buyer</p><p className="font-medium">{order.buyer?.name || "Unknown"}</p></div>
                <div><p className="text-muted-foreground">Seller</p><p className="font-medium">{order.seller?.name || "Unknown"}</p></div>
                <div><p className="text-muted-foreground">Shipping Address</p><p className="font-medium">{order.shippingAddress || "Not provided"}</p></div>
                <div><p className="text-muted-foreground">Order Date</p><p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p></div>
              </div>
              <Separator/>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${(parseFloat(order.totalAmount) - parseFloat(order.feeAmount || "0") - parseFloat(order.shippingCost || "0")).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Fee</span><span>${order.feeAmount || "0.00"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span>${order.shippingCost || "0.00"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span>${order.taxAmount || "0.00"}</span></div>
                <Separator/>
                <div className="flex justify-between font-bold"><span>Total</span><span className="text-primary">${order.totalAmount}</span></div>
              </div>
              <div className="flex gap-2 pt-2">
                {status === "paid" && <Button onClick={() => { const c = prompt("Carrier?"); const t = prompt("Tracking number?"); if (c && t) markShipped.mutate({ orderId: order.id, carrier: c, trackingNumber: t }); }} className="bg-primary"><Truck className="w-4 h-4 mr-1"/>Mark as Shipped</Button>}
                {status === "shipped" && order.escrowStatus === "held" && <Button onClick={() => releaseEscrow.mutate({ orderId: order.id })} className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-4 h-4 mr-1"/>Release Payment</Button>}
              </div>
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="tracking">
            <Card className="border-border/50"><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Truck className="w-5 h-5 text-primary"/>Package Tracking</CardTitle></CardHeader><CardContent className="p-6">
              {tracking ? <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-muted-foreground">Carrier</p><p className="font-medium">{tracking.carrier}</p></div>
                  <div><p className="text-sm text-muted-foreground">Tracking #</p><p className="font-mono font-medium">{tracking.trackingNumber}</p></div>
                  <div><p className="text-sm text-muted-foreground">Status</p><Badge variant="outline" className="capitalize">{tracking.status?.replace("_", " ")}</Badge></div>
                </div>
                {tracking.lastEvent && <div className="p-3 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">Latest Update</p><p className="text-sm">{tracking.lastEvent}</p>{tracking.lastLocation && <p className="text-xs text-muted-foreground mt-1">{tracking.lastLocation}</p>}</div>}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => refreshTracking.mutate({ orderId: order.id })} disabled={refreshTracking.isPending}><RefreshCw className={`w-4 h-4 mr-1 ${refreshTracking.isPending ? "animate-spin" : ""}`}/>Refresh</Button>
                  {carrierUrls[tracking.carrier] && <a href={carrierUrls[tracking.carrier]} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline"><ExternalLink className="w-4 h-4 mr-1"/>Track on Carrier Site</Button></a>}
                </div>
              </div> : <div className="text-center py-8"><Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2"/><p className="text-muted-foreground text-sm">No tracking information yet.</p></div>}
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="payment">
            <Card className="border-border/50"><CardContent className="p-6 space-y-4">
              {tx ? <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground">Transaction #</p><p className="font-mono font-medium">{tx.transactionNumber}</p></div>
                  <div><p className="text-muted-foreground">Amount</p><p className="font-medium">${tx.amount} {tx.currency}</p></div>
                  <div><p className="text-muted-foreground">Payment Method</p><p className="font-medium capitalize">{tx.paymentMethod?.replace("_", " ")}</p></div>
                  <div><p className="text-muted-foreground">Status</p><Badge variant={tx.status === "completed" ? "default" : "outline"} className="capitalize">{tx.status}</Badge></div>
                </div>
                <Separator/>
                <div className="flex justify-between text-sm"><span>Fee</span><span>${tx.fee}</span></div>
                <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800 mt-2"><AlertTriangle className="w-4 h-4 inline mr-1"/>Refunds are handled by your payment processor, not Ramen Anime. Contact {tx.paymentMethod?.replace("_", " ")} directly.</div>
              </> : <p className="text-muted-foreground text-center py-8">No payment information available.</p>}
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
