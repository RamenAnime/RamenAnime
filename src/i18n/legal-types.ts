export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type LegalDocumentContent = {
  quickSummaryTitle: string;
  quickSummaryBody: string;
  lastUpdated: string;
  sections: LegalSection[];
};
