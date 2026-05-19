/** Resolve extended UI strings from each locale's base translation tree (same English source text). */

type StringTree = Record<string, unknown>;

function flattenStrings(obj: StringTree, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      out[path] = value;
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(out, flattenStrings(value as StringTree, path));
    }
  }
  return out;
}

function setByPath(tree: StringTree, path: string, value: string): void {
  const parts = path.split(".");
  let cur: StringTree = tree;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p] as StringTree;
  }
  cur[parts[parts.length - 1]] = value;
}

function cloneTree<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/** Map English source text -> first key path in the English base bundle. */
function englishTextToPath(enFlat: Record<string, string>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [path, text] of Object.entries(enFlat)) {
    if (!map[text]) map[text] = path;
  }
  return map;
}

/**
 * Clone extended English bundle and replace leaf strings when the target locale's
 * base bundle has the same key path (matched via identical English text in en base).
 */
export function resolveExtendedForLocale(
  extendedEn: StringTree,
  enBase: StringTree,
  targetBase: StringTree
): StringTree {
  const out = cloneTree(extendedEn);
  const enFlat = flattenStrings(enBase);
  const targetFlat = flattenStrings(targetBase);
  const enTextToPath = englishTextToPath(enFlat);
  const extFlat = flattenStrings(extendedEn);

  for (const [extPath, enText] of Object.entries(extFlat)) {
    const basePath = enTextToPath[enText];
    if (basePath && targetFlat[basePath] && targetFlat[basePath] !== enText) {
      setByPath(out, extPath, targetFlat[basePath]);
    }
  }

  return out;
}
