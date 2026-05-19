import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

/**
 * 特定商取引法に基づく表記 (Specified Commercial Transactions Act disclosure)
 * Replace bracketed placeholders with your registered business details.
 */
export default function Tokushoho() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-10 bg-background">
      <div className="container max-w-3xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("tokushoho.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("tokushoho.intro")}</p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="font-semibold mb-2">{t("tokushoho.seller")}</h2>
              <p>{t("tokushoho.sellerPlaceholder1")}</p>
              <p>{t("tokushoho.sellerPlaceholder2")}</p>
            </section>
            <section>
              <h2 className="font-semibold mb-2">{t("tokushoho.address")}</h2>
              <p>{t("tokushoho.addressPlaceholder")}</p>
            </section>
            <section>
              <h2 className="font-semibold mb-2">{t("tokushoho.contact")}</h2>
              <p>
                {t("tokushoho.email")}:{" "}
                <a href="mailto:support@ramenanime.com" className="text-primary underline">
                  support@ramenanime.com
                </a>
              </p>
              <p className="text-muted-foreground">{t("tokushoho.contactNote")}</p>
            </section>
            <section>
              <h2 className="font-semibold mb-2">{t("tokushoho.prices")}</h2>
              <p>{t("tokushoho.pricesBody")}</p>
            </section>
            <section>
              <h2 className="font-semibold mb-2">{t("tokushoho.payment")}</h2>
              <p>{t("tokushoho.paymentBody")}</p>
            </section>
            <section>
              <h2 className="font-semibold mb-2">{t("tokushoho.fees")}</h2>
              <p>{t("tokushoho.feesBody")}</p>
            </section>
            <section>
              <h2 className="font-semibold mb-2">{t("tokushoho.delivery")}</h2>
              <p>{t("tokushoho.deliveryBody")}</p>
            </section>
            <section>
              <h2 className="font-semibold mb-2">{t("tokushoho.returns")}</h2>
              <p>{t("tokushoho.returnsBody")}</p>
            </section>
            <p className="text-muted-foreground text-xs pt-4 border-t">
              <Link to="/terms" className="text-primary underline">
                {t("tokushoho.termsLink")}
              </Link>
              {" · "}
              <Link to="/privacy" className="text-primary underline">
                {t("tokushoho.privacyLink")}
              </Link>
              {" · "}
              <Link to="/contact" className="text-primary underline">
                {t("tokushoho.contactLink")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
