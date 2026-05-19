import { interpolateLegal } from "@/hooks/useLegalContent";

const HTML_TAG = /<[a-z][\s\S]*>/i;

type LegalParagraphProps = {
  text: string;
  vars: Record<string, string | number | boolean>;
  className?: string;
};

export function LegalParagraph({ text, vars, className }: LegalParagraphProps) {
  const content = interpolateLegal(text, vars);

  if (HTML_TAG.test(content)) {
    return (
      <div
        className={className ?? "text-sm leading-relaxed space-y-3"}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return <p className={className ?? "text-sm leading-relaxed"}>{content}</p>;
}
