/** Apply Kyoto / Kansai flavor to Japanese UI and legal copy. Preserves {{placeholders}} and HTML. */

const PH_TOKEN = "\uE000";

function protectPlaceholders(text: string): { text: string; slots: string[] } {
  const slots: string[] = [];
  const out = text.replace(/\{\{[^}]+\}\}/g, (m) => {
    slots.push(m);
    return `${PH_TOKEN}${slots.length - 1}${PH_TOKEN}`;
  });
  return { text: out, slots };
}

function restorePlaceholders(text: string, slots: string[]): string {
  return text.replace(new RegExp(`${PH_TOKEN}(\\d+)${PH_TOKEN}`, "g"), (_, i) => slots[Number(i)] ?? "");
}

function hasJapanese(text: string): boolean {
  return /[\u3040-\u30ff\u4e00-\u9fff]/.test(text);
}

const PHRASE_RULES: [string, string][] = [
  ["当社は", "うちは"],
  ["当社が", "うちが"],
  ["当社の", "うちの"],
  ["当社を", "うちを"],
  ["当社に", "うちに"],
  ["当社", "うち"],
  ["お客様", "お客さん"],
  ["ご利用", "お使い"],
  ["ご確認", "確認"],
  ["ご覧", "見て"],
  ["いただけます", "してもらえますわ"],
  ["いただき", "もらい"],
  ["くださいませ", "おくれやすませ"],
  ["ください。", "おくれやす。"],
  ["ください", "おくれやす"],
  ["ではありません", "ちゃう"],
  ["ではない", "ちゃう"],
  ["ありません", "ありまへん"],
  ["できません", "できまへん"],
  ["いません", "おらへん"],
  ["ません", "まへん"],
  ["しています", "してますわ"],
  ["しております", "しておりますわ"],
  ["となります", "になりますわ"],
  ["されます", "されますわ"],
  ["あります", "ありますわ"],
  ["ございます", "おます"],
  ["ですか", "どすか"],
  ["ますか", "まっすか"],
  ["です。", "どす。"],
  ["ます。", "まっす。"],
  ["です、", "どす、"],
  ["ます、", "まっす、"],
  ["している", "してる"],
  ["することができ", "でき"],
  ["することが", "するのが"],
  ["することが", "するのが"],
  ["利用規約", "利用ルール"],
  ["プライバシーポリシー", "プライバシーの話"],
  ["お問い合わせ", "問い合わせ"],
  ["ありがとうございます", "おおきに"],
  ["ありがとう", "おおきに"],
  ["本当に", "ほんまに"],
  ["非常に", "めっちゃ"],
  ["可能です", "できまっす"],
];

export function applyKyotoDialect(text: string): string {
  if (!text || typeof text !== "string" || !hasJapanese(text)) return text;

  const { text: protectedText, slots } = protectPlaceholders(text);
  let out = protectedText;

  for (const [from, to] of PHRASE_RULES) {
    if (out.includes(from)) out = out.split(from).join(to);
  }

  out = out.replace(/(?<!っ)ます/g, "まっす");
  out = out.replace(/(?<!ど)です/g, "どす");

  return restorePlaceholders(out, slots);
}

export function applyKyotoDialectDeep<T>(value: T): T {
  if (typeof value === "string") {
    return applyKyotoDialect(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => applyKyotoDialectDeep(item)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = applyKyotoDialectDeep(v);
    }
    return out as T;
  }
  return value;
}
