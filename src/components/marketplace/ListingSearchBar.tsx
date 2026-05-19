import { useTranslation } from "react-i18next";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ListingSort } from "@/hooks/useMarketplaceListings";

type Props = {
  value: string;
  onChange: (value: string) => void;
  sortBy: ListingSort;
  onSortChange: (sort: ListingSort) => void;
  totalCount: number;
  isFetching?: boolean;
  className?: string;
};

export function ListingSearchBar({
  value,
  onChange,
  sortBy,
  onSortChange,
  totalCount,
  isFetching,
  className = "",
}: Props) {
  const { t } = useTranslation();

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t("marketplace.search")}
            className="pl-10 pr-10 bg-muted/50 border-border/50"
            aria-label={t("marketplace.search")}
          />
          {isFetching && value.trim() ? (
            <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          ) : null}
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => onChange("")}
              aria-label={t("marketplace.clearSearch")}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        <Select value={sortBy} onValueChange={(v) => onSortChange(v as ListingSort)}>
          <SelectTrigger className="w-full sm:w-[200px] bg-muted/50 border-border/50">
            <SelectValue placeholder={t("marketplace.sortLabel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("marketplace.sortNewest")}</SelectItem>
            <SelectItem value="relevance">{t("marketplace.sortRelevance")}</SelectItem>
            <SelectItem value="price_asc">{t("marketplace.sortPriceAsc")}</SelectItem>
            <SelectItem value="price_desc">{t("marketplace.sortPriceDesc")}</SelectItem>
            <SelectItem value="ending_soon">{t("marketplace.sortEndingSoon")}</SelectItem>
            <SelectItem value="popular">{t("marketplace.sortPopular")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {value.trim() || totalCount > 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          {t("marketplace.resultsCount", { count: totalCount })}
        </p>
      ) : null}
    </div>
  );
}
