import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

/**
 * 特定商取引法に基づく表記 (Specified Commercial Transactions Act disclosure)
 * Replace bracketed placeholders with your registered business details.
 */
export default function Tokushoho() {
  const { i18n } = useTranslation();
  const ja = i18n.language.startsWith("ja");

  return (
    <div className="min-h-screen py-10 bg-background">
      <div className="container max-w-3xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {ja ? "特定商取引法に基づく表記" : "Specified Commercial Transactions Disclosure"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {ja
                ? "日本国内のお客様向けの法定表示です。内容は事業者情報確定後に更新してください。"
                : "Legal disclosure for customers in Japan. Update placeholders with your registered business details."}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="font-semibold mb-2">{ja ? "販売事業者" : "Seller"}</h2>
              <p>[Your legal business name / 事業者名]</p>
              <p>[Representative name / 代表者名]</p>
            </section>
            <section>
              <h2 className="font-semibold mb-2">{ja ? "所在地" : "Address"}</h2>
              <p>[Registered business address / 住所]</p>
            </section>
            <section>
              <h2 className="font-semibold mb-2">{ja ? "連絡先" : "Contact"}</h2>
              <p>
                {ja ? "メール" : "Email"}:{" "}
                <a href="mailto:support@ramenanime.com" className="text-primary underline">
                  support@ramenanime.com
                </a>
              </p>
              <p className="text-muted-foreground">
                {ja
                  ? "お問い合わせはメールにて受付（電話番号は取得後に記載）"
                  : "Inquiries by email (add phone number when available)"}
              </p>
            </section>
            <section>
              <h2 className="font-semibold mb-2">{ja ? "販売価格" : "Prices"}</h2>
              <p>
                {ja
                  ? "各商品ページに表示（消費税10%込みの表示を推奨）"
                  : "Shown on each listing (include 10% consumption tax for JP buyers when applicable)"}
              </p>
            </section>
            <section>
              <h2 className="font-semibold mb-2">{ja ? "支払方法・時期" : "Payment"}</h2>
              <p>
                {ja
                  ? "クレジットカード（Stripe）。オークション落札後48時間以内にお支払い。"
                  : "Credit card via Stripe. Auction winners must pay within 48 hours."}
              </p>
            </section>
            <section>
              <h2 className="font-semibold mb-2">{ja ? "商品代金以外の必要料金" : "Additional fees"}</h2>
              <p>
                {ja
                  ? "送料、プラットフォーム手数料（購入時に明示）"
                  : "Shipping and platform fees as shown at checkout"}
              </p>
            </section>
            <section>
              <h2 className="font-semibold mb-2">{ja ? "引渡時期" : "Delivery"}</h2>
              <p>
                {ja
                  ? "出品者発送後、追跡番号で確認（目安：国内1–2週間、海外2–4週間）"
                  : "After seller ships; tracking provided (typical 1–2 weeks domestic, 2–4 weeks international)"}
              </p>
            </section>
            <section>
              <h2 className="font-semibold mb-2">{ja ? "返品・キャンセル" : "Returns & cancellations"}</h2>
              <p>
                {ja
                  ? "出品者ポリシーおよび当社利用規約に従います。虚偽表示・未着の場合はサポートへ。"
                  : "Per seller policy and our Terms of Service. Contact support for misrepresentation or non-delivery."}
              </p>
            </section>
            <p className="text-muted-foreground text-xs pt-4 border-t">
              <Link to="/terms" className="text-primary underline">
                {ja ? "利用規約" : "Terms of Service"}
              </Link>
              {" · "}
              <Link to="/privacy" className="text-primary underline">
                {ja ? "プライバシーポリシー" : "Privacy Policy"}
              </Link>
              {" · "}
              <Link to="/contact" className="text-primary underline">
                {ja ? "お問い合わせ" : "Contact"}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
