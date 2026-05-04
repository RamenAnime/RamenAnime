import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, CreditCard, Eye, ShoppingBag, Clock, CheckCircle } from "lucide-react";

const statusConfig: Record<string, { color: string; icon: any }> = {
  pending: { color: "bg-yellow-500/10 text-yellow-500", icon: Clock },
  paid: { color: "bg-blue-500/10 text-blue-500", icon: CreditCard },
  shipped: { color: "bg-purple-500/10 text-purple-500", icon: Truck },
  delivered: { color: "bg-green-500/10 text-green-500", icon: CheckCircle },
  cancelled: { color: "bg-red-500/10 text-red-500", icon: Clock },
  disputed: { color: "bg-red-500/10 text-red-500", icon: Clock },
};

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const { data: ordersData } = trpc.marketplace.getMyOrders.useQuery(undefined, { enabled: isAuthenticated });
  const [activeTab, setActiveTab] = useState("buying");
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><div className="text-center space-y-4"><ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto"/><p>Please log in to view orders.</p><Link to="/login"><Button>Log In</Button></Link></div></div>;
  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6"><TabsTrigger value="buying">Buying</TabsTrigger><TabsTrigger value="selling">Selling</TabsTrigger></TabsList>
          <TabsContent value="buying"><OrderList orders={ordersData?.asBuyer || []} type="buyer"/></TabsContent>
          <TabsContent value="selling"><OrderList orders={ordersData?.asSeller || []} type="seller"/></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OrderList({ orders, type }: { orders: any[]; type: "buyer" | "seller" }) {
  if (orders.length === 0) return <Card className="border-border/50"><CardContent className="p-12 text-center"><Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3"/><p>No orders yet.</p><Link to="/shop"><Button size="sm" className="mt-4">Start Shopping</Button></Link></CardContent></Card>;
  return <div className="space-y-4">{orders.map((order: any) => {
    const status = order.status || "pending";
    const config = statusConfig[status] || statusConfig.pending;
    const StatusIcon = config.icon;
    const listing = order.listing;
    const imgs: string[] = listing?.images ? (Array.isArray(listing.images) ? listing.images : JSON.parse(listing.images)) : [];
    const tx = order.transactions?.[0];
    return (
      <Card key={order.id} className="border-border/50 hover:border-primary/30 transition-all">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">{imgs.length > 0 ? <img src={imgs[0]} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-muted-foreground/30"/></div>}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs text-muted-foreground">Order #{order.orderNumber}</p><h3 className="font-semibold text-foreground truncate">{listing?.title || "Item"}</h3></div>
                <Badge className={`${config.color} border-0`}><StatusIcon className="w-3 h-3 mr-1"/>{status}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Transaction #</p><p className="font-mono text-xs">{tx?.transactionNumber || "N/A"}</p></div>
                <div><p className="text-xs text-muted-foreground">Total</p><p className="font-medium">${order.totalAmount}</p></div>
                <div><p className="text-xs text-muted-foreground">{type === "buyer" ? "Seller" : "Buyer"}</p><p className="truncate">{type === "buyer" ? order.seller?.name : order.buyer?.name}</p></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p>{new Date(order.createdAt).toLocaleDateString()}</p></div>
              </div>
              {order.trackingNumber && <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm"><div className="flex items-center gap-2"><Truck className="w-4 h-4 text-primary"/><span className="font-medium">{order.shippingCarrier}</span><span className="font-mono">{order.trackingNumber}</span></div></div>}
              <div className="flex items-center gap-2 mt-4"><Link to={`/orders/${order.id}`}><Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-1"/>View Details</Button></Link></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  })}</div>;
}
