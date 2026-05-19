import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Clock, Send } from "lucide-react";

export default function Contact() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12 space-y-4">
          <p className="text-sm font-medium text-primary tracking-wider uppercase">{t("contact.subtitle")}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t("contact.title")}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{t("contact.desc")}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t("contact.email")}</p>
                  <a href="mailto:ramenanime@protonmail.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">ramenanime@protonmail.com</a>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t("contact.responseTime")}</p>
                  <p className="text-sm text-muted-foreground">{t("contact.responseWithin24h")}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t("contact.shippingFrom")}</p>
                  <p className="text-sm text-muted-foreground">{t("contact.shipsWorldwide")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{t("contact.name")}</label>
                      <Input placeholder={t("contact.name")} className="bg-muted/50 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{t("contact.emailLabel")}</label>
                      <Input type="email" placeholder={t("contact.emailPlaceholder")} className="bg-muted/50 border-border/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("contact.subject")}</label>
                    <Input placeholder={t("contact.subject")} className="bg-muted/50 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("contact.message")}</label>
                    <Textarea placeholder={t("contact.message")} rows={5} className="bg-muted/50 border-border/50" />
                  </div>
                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                    <Send className="mr-2 h-4 w-4" />
                    {submitted ? t("contact.messageSent") : t("contact.sendMessage")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
