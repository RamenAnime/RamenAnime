import { useTranslation } from "react-i18next";

export const SUBFORUM_IDS = ["general", "anime", "gaming", "trading", "3dprints", "offtopic"] as const;
export type SubforumId = (typeof SUBFORUM_IDS)[number];

export function useSubforums() {
  const { t } = useTranslation();
  return SUBFORUM_IDS.map((id) => ({
    id,
    name: t(`forum.subforums.${id}.name`),
    desc: t(`forum.subforums.${id}.desc`),
  }));
}
