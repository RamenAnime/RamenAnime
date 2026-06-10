/**
 * Cross-script search aliases for heavily traded anime/game franchises.
 * Lets US users typing English find Japanese-titled listings and vice versa
 * (Demon Slayer <-> 鬼滅の刃 <-> きめつのやいば).
 *
 * Rules for entries:
 * - All lowercase, NFC-normalized.
 * - Each group lists equivalent terms across English, romaji, kana, and kanji.
 * - Multi-word English aliases are matched word-by-word at lookup time, so
 *   every significant word of the query expands to the group's variants.
 */

export const ALIAS_GROUPS: string[][] = [
  ["pokemon", "ポケモン", "ぽけもん", "ポケットモンスター", "ポケカ"],
  ["demon slayer", "kimetsu no yaiba", "kimetsu", "鬼滅の刃", "きめつのやいば", "鬼滅"],
  ["one piece", "ワンピース", "わんぴーす"],
  ["naruto", "ナルト", "なると"],
  ["dragon ball", "ドラゴンボール", "どらごんぼーる"],
  ["yugioh", "yu-gi-oh", "遊戯王", "ゆうぎおう"],
  ["attack on titan", "shingeki no kyojin", "shingeki", "進撃の巨人", "しんげきのきょじん", "進撃"],
  ["my hero academia", "boku no hero", "hiroaka", "僕のヒーローアカデミア", "ヒロアカ"],
  ["jujutsu kaisen", "呪術廻戦", "じゅじゅつかいせん", "呪術"],
  ["sailor moon", "セーラームーン", "美少女戦士セーラームーン"],
  ["gundam", "gunpla", "ガンダム", "ガンプラ", "機動戦士ガンダム"],
  ["evangelion", "eva", "エヴァンゲリオン", "エヴァ", "新世紀エヴァンゲリオン"],
  ["totoro", "トトロ", "となりのトトロ"],
  ["spy x family", "spy family", "スパイファミリー"],
  ["chainsaw man", "チェンソーマン", "チェーンソーマン"],
  ["hunter x hunter", "hxh", "ハンターハンター"],
  ["bleach", "ブリーチ", "ぶりーち"],
  ["death note", "デスノート"],
  ["fullmetal alchemist", "hagaren", "鋼の錬金術師", "ハガレン"],
  ["tokyo ghoul", "東京喰種", "トーキョーグール"],
  ["fairy tail", "フェアリーテイル"],
  ["sword art online", "sao", "ソードアートオンライン", "ソードアート"],
  ["final fantasy", "ファイナルファンタジー"],
  ["one punch man", "ワンパンマン", "onepunch"],
  ["haikyuu", "ハイキュー", "はいきゅー"],
  ["frieren", "フリーレン", "葬送のフリーレン"],
  ["kirby", "カービィ", "星のカービィ"],
  ["zelda", "ゼルダ", "ゼルダの伝説"],
  ["mario", "マリオ", "スーパーマリオ"],
  ["sonic", "ソニック"],
  ["digimon", "デジモン", "でじもん"],
  ["dragon quest", "ドラゴンクエスト", "ドラクエ"],
  ["monster hunter", "モンスターハンター", "モンハン"],
  ["studio ghibli", "ghibli", "ジブリ", "スタジオジブリ"],
  ["hatsune miku", "miku", "初音ミク", "ミク", "ボーカロイド", "vocaloid"],
  ["cardcaptor sakura", "カードキャプターさくら", "ccさくら"],
  ["jojo", "jojos bizarre adventure", "ジョジョ", "ジョジョの奇妙な冒険"],
  ["berserk", "ベルセルク"],
  ["slam dunk", "スラムダンク"],
  ["inuyasha", "犬夜叉", "いぬやしゃ"],
  ["ranma", "らんま"],
  ["astro boy", "鉄腕アトム", "アトム"],
  ["doraemon", "ドラえもん", "どらえもん"],
  ["godzilla", "ゴジラ", "ごじら"],
];

/** Words too generic to expand on their own (avoid noisy matches). */
const STOPWORDS = new Set(["x", "no", "on", "of", "the", "man", "ball", "note", "moon", "tail", "punch", "art", "online", "boy"]);

const wordIndex = new Map<string, Set<number>>();
for (let gi = 0; gi < ALIAS_GROUPS.length; gi++) {
  for (const alias of ALIAS_GROUPS[gi]) {
    const words = alias.includes(" ") ? alias.split(" ") : [alias];
    for (const word of words) {
      if (STOPWORDS.has(word)) continue;
      if (word.length < 2 && !/[\u3040-\u30ff\u3400-\u9fff]/.test(word)) continue;
      if (!wordIndex.has(word)) wordIndex.set(word, new Set());
      wordIndex.get(word)!.add(gi);
    }
  }
}

/**
 * Return alias variants for a normalized lowercase token.
 * Includes every alias in each group the token belongs to (minus the token).
 */
export function aliasExpansions(token: string): string[] {
  const groups = wordIndex.get(token);
  if (!groups) return [];
  const out = new Set<string>();
  for (const gi of groups) {
    for (const alias of ALIAS_GROUPS[gi]) {
      if (alias !== token) out.add(alias);
    }
  }
  return [...out];
}
