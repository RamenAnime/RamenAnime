import { useComplianceFramework } from "./ComplianceRouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useLegalInterpolationVars, useTermsSections } from "@/hooks/useLegalContent";
import { LegalParagraph } from "./LegalParagraph";

export default function TermsOfService() {
  const { t } = useTranslation();
  const { framework } = useComplianceFramework();
  const f = framework;
  const bundle = useTermsSections();
  const vars = useLegalInterpolationVars();

  if (!bundle) {
    return null;
  }

  const defaultOpen = bundle.sections[0]?.id ?? "terms-1";

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">{t("legal.backHome")}</Link>
        </Button>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-2">{t("legal.termsTitle")}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {t("legal.lastUpdated", { date: bundle.lastUpdated })} |{" "}
          {t("legal.applicableLaw", {
            law: f?.privacyLaw ?? t("legal.defaults.globalTermsLaw"),
          })}{" "}
          |{" "}
          {t("legal.yourRegion", {
            region: f?.name ?? t("legal.defaults.globalRegion"),
          })}
        </p>

        <Accordion type="multiple" defaultValue={[defaultOpen]} className="space-y-2">
          {bundle.sections.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="text-lg font-semibold">
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed space-y-3">
                {section.paragraphs.map((paragraph, index) => (
                  <LegalParagraph key={`${section.id}-${index}`} text={paragraph} vars={vars} />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
