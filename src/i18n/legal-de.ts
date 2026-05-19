import type { LegalDocumentContent } from "./legal-types";

export const privacy: LegalDocumentContent = {
  quickSummaryTitle: "Kurzfassung",
  quickSummaryBody:
    "Wir erheben nur die minimal erforderlichen Daten zum Betrieb unserer Dienste. Wir verkaufen Ihre personenbezogenen Daten nicht. Wir verwenden branchenübliche Verschlüsselung. Sie haben Rechte auf Zugang, Berichtigung und Löschung Ihrer Daten. Wir bewahren Daten maximal {{dataRetentionDays}} Tage auf.",
  lastUpdated: "2. Mai 2025",
  sections: [
    {
      id: "privacy-1",
      title: "1. Einleitung und Geltungsbereich",
      paragraphs: [
        'Diese Datenschutzerklärung beschreibt, wie Ramen Anime („wir“, „uns“ oder „unser“) Ihre personenbezogenen Daten erhebt, verwendet, speichert, teilt und schützt, wenn Sie unsere Website, mobilen Anwendungen, den Marktplatz, das soziale Forum und verwandte Dienste (gemeinsam die „Dienste“) nutzen.',
        "Diese Richtlinie entspricht {{privacyLaw}} und gilt weltweit für alle Nutzer. Je nach Standort können Ihnen zusätzliche Rechte gemäß Abschnitt 10 zustehen.",
        "Durch die Nutzung unserer Dienste stimmen Sie den in dieser Richtlinie beschriebenen Praktiken zu. Wenn Sie nicht zustimmen, nutzen Sie die Dienste bitte nicht.",
      ],
    },
    {
      id: "privacy-2",
      title: "2. Von uns erhobene Informationen",
      paragraphs: [
        "<p><strong>2.1 Von Ihnen direkt bereitgestellte Informationen:</strong></p>",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>Kontoinformationen:</strong> Benutzername, E-Mail-Adresse, Passwort (als bcrypt-Hash mit Kostenfaktor 12 gespeichert)</li><li><strong>Profilinformationen:</strong> Anzeigename, Bio, Avatar, Standort, Interessen (alle optional)</li><li><strong>Marktplatzinformationen:</strong> Lieferadressen, Zahlungsmethoden-Tokens (verarbeitet von Stripe/PayPal - wir speichern niemals vollständige Kartennummern)</li><li><strong>Foruminhalte:</strong> Beiträge, Kommentare, Nachrichten, die Sie erstellen</li><li><strong>Kommunikation:</strong> Kundensupport-Anfragen, Feedback</li><li><strong>Altersverifizierung:</strong> Altersbestätigung, optionale ID-Verifizierung für altersbeschränkte Inhalte</li></ul>',
        "<p><strong>2.2 Automatisch erhobene Informationen:</strong></p>",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>Geräteinformationen:</strong> IP-Adresse, Browsertyp, Betriebssystem, Gerätekennungen</li><li><strong>Nutzungsdaten:</strong> Besuchte Seiten, genutzte Funktionen, Verweildauer, Klickmuster</li><li><strong>Geolokalisierung:</strong> Aus IP-Adresse abgeleitetes Land für Compliance (MwSt.-Berechnung, Altersverifizierung, Exportkontrollen)</li><li><strong>Cookies und ähnliche Technologien:</strong> Siehe Abschnitt 8 (Cookie-Richtlinie)</li></ul>',
        "<p><strong>2.3 Informationen von Dritten:</strong></p>",
        '<ul class="list-disc pl-5 space-y-1"><li>Zahlungsdienstleister (Stripe, PayPal) - Transaktionsbestätigung, letzte 4 Ziffern der Karte</li><li>Authentifizierungsdienste (bei OAuth-Nutzung)</li><li>Betrugspräventionsdienste</li></ul>',
      ],
    },
    {
      id: "privacy-3",
      title: "3. Wie wir Ihre Informationen verwenden",
      paragraphs: [
        "Wir verwenden Ihre personenbezogenen Daten für folgende Zwecke:",
        '<table class="w-full text-xs border-collapse my-4"><thead><tr class="border-b"><th class="text-left py-2">Zweck</th><th class="text-left py-2">Rechtsgrundlage (DSGVO)</th><th class="text-left py-2">Verwendete Daten</th></tr></thead><tbody class="space-y-2"><tr class="border-b border-border/50"><td class="py-2">Kontoerstellung und -verwaltung</td><td>Vertragserfüllung</td><td>Benutzername, E-Mail, Passwort-Hash</td></tr><tr class="border-b border-border/50"><td class="py-2">Dienstbereitstellung</td><td>Vertragserfüllung</td><td>Profildaten, Forumposts, Einstellungen</td></tr><tr class="border-b border-border/50"><td class="py-2">Zahlungsabwicklung</td><td>Vertragserfüllung</td><td>Zahlungstokens, Transaktionsverlauf</td></tr><tr class="border-b border-border/50"><td class="py-2">Steuer-Compliance</td><td>Rechtliche Verpflichtung</td><td>Transaktionsdaten, Land, MwSt.-Aufzeichnungen</td></tr><tr class="border-b border-border/50"><td class="py-2">Sicherheit und Betrugsprävention</td><td>Berechtigtes Interesse</td><td>IP-Adresse, Geräteinformationen, Nutzungsmuster</td></tr><tr class="border-b border-border/50"><td class="py-2">Altersverifizierung</td><td>Rechtliche Verpflichtung</td><td>Alterserklärung, optionale Ausweisdokumente</td></tr><tr class="border-b border-border/50"><td class="py-2">Rechtliche Compliance (Exportkontrollen, Sanktionen)</td><td>Rechtliche Verpflichtung</td><td>Land, Transaktionsdetails</td></tr><tr class="border-b border-border/50"><td class="py-2">Dienstverbesserung</td><td>Berechtigtes Interesse</td><td>Aggregierte Nutzungsanalysen</td></tr><tr class="border-b border-border/50"><td class="py-2">Kundensupport</td><td>Vertragserfüllung</td><td>Kontodaten, Kommunikationsverlauf</td></tr><tr><td class="py-2">Marketing (nur mit Einwilligung)</td><td>Einwilligung</td><td>E-Mail, Einstellungen</td></tr></tbody></table>',
      ],
    },
    {
      id: "privacy-4",
      title: "4. Wie wir Ihre Informationen teilen",
      paragraphs: [
        "Wir verkaufen Ihre personenbezogenen Daten nicht. Wir teilen Daten nur in folgenden Fällen:",
        '<ul class="list-disc pl-5 space-y-2"><li><strong>Dienstleister:</strong> Zahlungsdienstleister (Stripe, PayPal), Hosting-Anbieter (Render), E-Mail-Dienste, Analyseanbieter. Alle sind durch Datenverarbeitungsverträge gebunden.</li><li><strong>Andere Nutzer:</strong> Ihre Profilinformationen und Forumposts sind für andere Nutzer sichtbar, wie vom Dienstdesign vorgesehen.</li><li><strong>Rechtliche Anforderungen:</strong> Wenn gesetzlich, per Gerichtsbeschluss oder von Behörden verlangt. Wir benachrichtigen Sie, sofern nicht untersagt.</li><li><strong>Unternehmensübertragungen:</strong> Im Zusammenhang mit Fusion, Übernahme oder Vermögensverkauf, mit Benachrichtigung der Nutzer.</li><li><strong>Mit Ihrer Einwilligung:</strong> Für jeden von Ihnen ausdrücklich genehmigten Zweck.</li></ul>',
      ],
    },
    {
      id: "privacy-5",
      title: "5. Datenspeicherung und -löschung",
      paragraphs: [
        "Wir bewahren personenbezogene Daten so lange auf, wie für die in dieser Richtlinie beschriebenen Zwecke erforderlich:",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>Kontodaten:</strong> Bis zur Kontolöschung oder {{dataRetentionDays}} Tage Inaktivität</li><li><strong>Transaktionsaufzeichnungen:</strong> {{transactionRetentionDays}} Tage (steuer-/rechtliche Anforderungen)</li><li><strong>Forumposts:</strong> Bis zur Löschung durch den Nutzer oder Kontoschließung</li><li><strong>Logdateien:</strong> 90 Tage</li><li><strong>Cookie-Einwilligungsaufzeichnungen:</strong> 2 Jahre</li></ul>',
        "Bei Löschanfrage löschen oder anonymisieren wir Ihre personenbezogenen Daten innerhalb von 30 Tagen, außer wenn gesetzliche Aufbewahrung erforderlich ist (Transaktionsaufzeichnungen für Steuerzwecke).",
      ],
    },
    {
      id: "privacy-6",
      title: "6. Datensicherheit",
      paragraphs: [
        "Wir implementieren branchenübliche Sicherheitsmaßnahmen:",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>Verschlüsselung:</strong> TLS 1.3 für alle Daten während der Übertragung; AES-256 für ruhende Daten</li><li><strong>Passwörter:</strong> bcrypt-Hashing mit Kostenfaktor 12 (64-Byte/512-Bit-Ausgabe)</li><li><strong>Authentifizierung:</strong> JWT-Tokens mit httpOnly-Cookies; Sitzungsablauf nach 1 Jahr</li><li><strong>Zugriffskontrollen:</strong> Rollenbasierter Zugriff (Nutzer/Admin); Prinzip der geringsten Rechte</li><li><strong>Überwachung:</strong> Automatische Protokollierung von Zugriffsversuchen; Anomalieerkennung</li><li><strong>Reaktion auf Verletzungen:</strong> Bei einer Datenpanne benachrichtigen wir betroffene Nutzer innerhalb von {{breachNotificationHours}} Stunden, wie von {{privacyLaw}} gefordert.</li></ul>',
      ],
    },
    {
      id: "privacy-7",
      title: "7. Internationale Datenübermittlungen",
      paragraphs: [
        "Ihre Daten werden auf Servern in den Vereinigten Staaten gespeichert. Für Nutzer in der EU/des EWR, im Vereinigten Königreich und anderen Rechtsordnungen mit Schutzanforderungen für Datenübermittlungen:",
        '<ul class="list-disc pl-5 space-y-1"><li>Wir verwenden von der Europäischen Kommission genehmigte Standardvertragsklauseln (SCCs)</li><li>Für UK-Übermittlungen halten wir uns an den UK-Nachtrag zu den SCCs</li><li>Wir überwachen Angemessenheitsbeschlüsse und rechtliche Entwicklungen zu Übermittlungen</li><li>Alle Übermittlungen sind durch Verschlüsselung während der Übertragung (TLS 1.3) geschützt</li></ul>',
      ],
    },
    {
      id: "privacy-8",
      title: "8. Cookie-Richtlinie",
      paragraphs: [
        "Wir verwenden Cookies und ähnliche Technologien wie folgt:",
        '<table class="w-full text-xs border-collapse my-4"><thead><tr class="border-b"><th class="text-left py-2">Kategorie</th><th class="text-left py-2">Zweck</th><th class="text-left py-2">Dauer</th><th class="text-left py-2">Erforderlich?</th></tr></thead><tbody><tr class="border-b border-border/50"><td class="py-2">Essenziell</td><td>Authentifizierung, Sicherheit, Sitzungsverwaltung</td><td>Sitzung - 1 Jahr</td><td>Ja (nicht deaktivierbar)</td></tr><tr class="border-b border-border/50"><td class="py-2">Präferenzen</td><td>Sprachauswahl, Theme, Anzeigeeinstellungen</td><td>1 Jahr</td><td>Nein</td></tr><tr class="border-b border-border/50"><td class="py-2">Analyse</td><td>Dienstverbesserung, Nutzungsstatistiken</td><td>1 Jahr</td><td>Nein</td></tr><tr><td class="py-2">Marketing</td><td>Personalisierte Empfehlungen (bei Einwilligung)</td><td>1 Jahr</td><td>Nein</td></tr></tbody></table>',
        "{{cookieConsentNote}}",
      ],
    },
    {
      id: "privacy-9",
      title: "9. Datenschutz von Kindern",
      paragraphs: [
        "Wir halten COPPA (USA), DSGVO-Anforderungen für Kinder (EU) und gleichwertige Gesetze weltweit ein. Unsere Dienste richten sich nicht an Kinder unter 13 Jahren.",
        "Wir erheben wissentlich keine personenbezogenen Daten von Kindern unter {{ageOfConsent}} ohne {{parentalConsentPhrase}}. Wenn Sie Elternteil sind und glauben, Ihr Kind habe ohne Einwilligung Daten bereitgestellt, kontaktieren Sie uns umgehend; wir löschen die Informationen.",
        "Altersbeschränkte Bereiche unserer Dienste (soziales Forum, Marktplatz) erfordern die Bestätigung, dass Nutzer mindestens 18 Jahre alt sind.",
      ],
    },
    {
      id: "privacy-10",
      title: "10. Ihre Datenschutzrechte",
      paragraphs: [
        "Je nach Standort können Ihnen folgende Rechte zustehen:",
        '<table class="w-full text-xs border-collapse my-4"><thead><tr class="border-b"><th class="text-left py-2">Recht</th><th class="text-left py-2">Beschreibung</th><th class="text-left py-2">Verfügbar in</th></tr></thead><tbody><tr class="border-b border-border/50"><td class="py-2">Auskunft</td><td>Kopie Ihrer personenbezogenen Daten anfordern</td><td>Alle Rechtsordnungen</td></tr><tr class="border-b border-border/50"><td class="py-2">Berichtigung</td><td>Berichtigung unrichtiger Daten anfordern</td><td>Alle Rechtsordnungen</td></tr><tr class="border-b border-border/50"><td class="py-2">Löschung (Recht auf Vergessenwerden)</td><td>Löschung Ihrer Daten anfordern</td><td>{{rightToBeForgottenDetail}}</td></tr><tr class="border-b border-border/50"><td class="py-2">Datenübertragbarkeit</td><td>Daten in strukturiertem, maschinenlesbarem Format erhalten</td><td>{{dataPortabilityDetail}}</td></tr><tr class="border-b border-border/50"><td class="py-2">Widerspruch</td><td>Widerspruch gegen Verarbeitung aufgrund berechtigter Interessen</td><td>EU, UK, Brasilien, Südkorea</td></tr><tr class="border-b border-border/50"><td class="py-2">Einschränkung</td><td>Einschränkung der Verarbeitung anfordern</td><td>EU, UK, Brasilien</td></tr><tr class="border-b border-border/50"><td class="py-2">Einwilligung widerrufen</td><td>Einwilligung jederzeit widerrufen</td><td>Alle Rechtsordnungen (wenn Einwilligung Grundlage)</td></tr><tr><td class="py-2">Beschwerde einreichen</td><td>Beschwerde bei Aufsichtsbehörde</td><td>EU, UK, Brasilien, Südkorea</td></tr></tbody></table>',
        "Zur Ausübung eines Rechts schreiben Sie uns an privacy@ramenanime.app. Wir antworten innerhalb von 30 Tagen.",
      ],
    },
    {
      id: "privacy-11",
      title: "11. Automatisierte Entscheidungsfindung und Profiling",
      paragraphs: [
        "Wir betreiben kein Profiling oder keine automatisierte Entscheidungsfindung mit rechtlichen Auswirkungen für Sie, außer:",
        '<ul class="list-disc pl-5 space-y-1"><li>Algorithmen zur Betrugserkennung und -prävention</li><li>Automatisierte Spam-/Inhaltsfilter für Forumposts</li><li>Geolokalisierungsbasierte Zugriffskontrolle und Steuerberechnung</li></ul>',
        "Diese Systeme führen nicht zu automatisierten Entscheidungen, die Ihre Rechte erheblich beeinträchtigen. Menschliche Überprüfung ist bei strittigen Entscheidungen verfügbar.",
      ],
    },
    {
      id: "privacy-12",
      title: "12. Änderungen dieser Richtlinie",
      paragraphs: [
        'Wir können diese Datenschutzerklärung regelmäßig aktualisieren. Wesentliche Änderungen werden mindestens 30 Tage vor Inkrafttreten per E-Mail oder auffälligem Hinweis mitgeteilt. Fortgesetzte Nutzung nach Änderungen gilt als Annahme. Das Datum „Zuletzt aktualisiert“ oben zeigt die letzte Überarbeitung.',
      ],
    },
    {
      id: "privacy-13",
      title: "13. Kontakt",
      paragraphs: [
        "<p><strong>Datenschutzbeauftragter:</strong> dpo@ramenanime.app</p>",
        "<p><strong>Datenschutzanfragen:</strong> privacy@ramenanime.app</p>",
        "<p><strong>Postanschrift:</strong><br />Ramen Anime Privacy Office<br />123 Anime Street<br />Los Angeles, CA 90001<br />United States</p>",
        "<p><strong>EU-Aufsichtsbehörden:</strong> Sie haben das Recht, bei Ihrer lokalen Datenschutzbehörde Beschwerde einzulegen. Liste unter: https://edpb.europa.eu/about-edpb/board/members</p>",
      ],
    },
  ],
};

export const terms: LegalDocumentContent = {
  quickSummaryTitle: "",
  quickSummaryBody: "",
  lastUpdated: "2. Mai 2025",
  sections: [
    {
      id: "terms-1",
      title: "1. Annahme der Bedingungen",
      paragraphs: [
        'Durch den Zugriff auf oder die Nutzung von ラーメンアニメ („Ramen Anime“, „wir“, „uns“ oder „unser“), einschließlich Website, mobiler Anwendungen, Marktplatz, sozialem Forum und verwandten Diensten (gemeinsam die „Dienste“), stimmen Sie diesen Nutzungsbedingungen („Bedingungen“) zu. Wenn Sie nicht zustimmen, dürfen Sie die Dienste nicht nutzen.',
        "Diese Bedingungen bilden eine rechtsverbindliche Vereinbarung zwischen Ihnen und Ramen Anime. Wir behalten uns vor, diese Bedingungen jederzeit zu ändern. Änderungen treten mit Veröffentlichung in Kraft. Fortgesetzte Nutzung nach Änderungen gilt als Annahme. Wesentliche Änderungen teilen wir mindestens 30 Tage vorher per E-Mail oder auffälligem Hinweis mit, wie gesetzlich erforderlich.",
        "Bei Zugriff aus der EU werden diese Bedingungen durch EU-spezifische Bestimmungen ergänzt. Als Einwohner Kaliforniens bleiben Ihre Rechte nach CCPA und CPRA unberührt.",
      ],
    },
    {
      id: "terms-2",
      title: "2. Berechtigung und Kontoregistrierung",
      paragraphs: [
        "<p><strong>2.1 Altersanforderungen.</strong> Sie müssen mindestens 18 Jahre alt sein, um ein Konto zu erstellen und die vollen Dienste einschließlich Marktplatz und Forum zu nutzen. Unter 18 Jahren nur mit Beteiligung und Einwilligung eines Elternteils oder Erziehungsberechtigten und nur allgemeine Shop-Funktionen ohne Nutzer-zu-Nutzer-Interaktion. Mit Kontoerstellung versichern Sie, diese Anforderungen zu erfüllen.</p>",
        "<p><strong>2.2 Elterliche Einwilligung.</strong> Nach {{privacyLaw}} ist bei Alter unter {{ageOfConsent}} nachweisbare elterliche Einwilligung vor Erhebung, Nutzung oder Offenlegung personenbezogener Daten erforderlich. Wir nutzen E-Mail-Verifizierung mit Folgebestätigung als Mechanismus, konsistent mit COPPA (USA) und gleichwertigen Rahmenwerken.</p>",
        "<p><strong>2.3 Kontosicherheit.</strong> Sie sind für Vertraulichkeit Ihrer Zugangsdaten und alle Aktivitäten unter Ihrem Konto verantwortlich. Benachrichtigen Sie uns bei unbefugter Nutzung. Wir setzen branchenübliche Maßnahmen ein: bcrypt mit Kostenfaktor 12, HTTPS/TLS 1.3, JWT-Sitzungen mit httpOnly-Cookies.</p>",
        "<p><strong>2.4 Kontokündigung.</strong> Wir können Konten nach eigenem Ermessen bei Verstößen, illegalen Aktivitäten oder zum Schutz der Community sperren oder kündigen. In der EU haben Sie nach DSGVO Art. 17 jederzeit Kündigungs- und Löschungsrecht.</p>",
      ],
    },
    {
      id: "terms-3",
      title: "3. Privatsphäre und Datenschutz",
      paragraphs: [
        "Ihr Datenschutz wird durch unsere Datenschutzerklärung geregelt, die durch Verweis einbezogen ist. Unsere Praktiken entsprechen {{privacyLaw}}.",
        "<p><strong>3.1 Datenerhebung.</strong> Wir erheben: (a) Kontodaten; (b) freiwillige Profildaten; (c) Marktplatz-Transaktionsdaten; (d) Forumposts und Kommentare; (e) IP und Geräteinformationen für Sicherheit und Geolokalisierung; (f) Cookies gemäß Cookie-Richtlinie.</p>",
        "<p><strong>3.2 Rechtsgrundlagen (DSGVO/LGPD).</strong> Wir verarbeiten auf Grundlage von: (a) Vertragserfüllung; (b) berechtigten Interessen (Sicherheit, Betrugsprävention); (c) rechtlicher Verpflichtung; (d) Einwilligung (Marketing, optionale Funktionen).</p>",
        "<p><strong>3.3 Ihre Rechte.</strong> Je nach Rechtsordnung: Auskunft, Berichtigung, Löschung, Widerspruch, Datenübertragbarkeit, Widerruf der Einwilligung, Beschwerde bei Aufsichtsbehörden. Kontakt siehe Abschnitt 16.</p>",
        "<p><strong>3.4 Aufbewahrung.</strong> Wir bewahren Daten {{dataRetentionDays}} Tage oder so lange wie für Zwecke, rechtliche Pflichten, Streitbeilegung und Durchsetzung erforderlich. Danach sichere Löschung oder Anonymisierung.</p>",
        "<p><strong>3.5 Internationale Übermittlungen.</strong> Daten können in andere Länder einschließlich der USA übermittelt werden. Für EU/EWR, UK und andere Rechtsordnungen setzen wir von der EU-Kommission genehmigte SCCs ein.</p>",
      ],
    },
    {
      id: "terms-4",
      title: "4. Marktplatzbedingungen",
      paragraphs: [
        "<p><strong>4.1 Art des Marktplatzes.</strong> Der Ramen Anime Marktplatz ist eine Plattform, die Käufer und Verkäufer von Anime-Waren verbindet. Wir sind nicht Partei von Transaktionen zwischen Nutzern. Wir erwerben kein Eigentum an verkauften Artikeln und garantieren nicht die Qualität, Sicherheit oder Legalität gelisteter Artikel.</p>",
        "<p><strong>4.2 Pflichten der Verkäufer.</strong> Verkäufer müssen: (a) Artikel korrekt beschreiben; (b) alle anwendbaren Gesetze zum Verkauf von Waren einhalten; (c) keine verbotenen Artikel verkaufen, einschließlich Fälschungen, Waffen, regulierter Substanzen oder Artikel, die geistige Eigentumsrechte verletzen; (d) Artikel innerhalb der angegebenen Frist versenden; (e) alle anwendbaren Steuern gemäß ihrer Rechtsordnung erheben und abführen.</p>",
        "<p><strong>4.3 Pflichten der Käufer.</strong> Käufer müssen: (a) Artikel zügig bezahlen; (b) keine betrügerischen Rückbuchungen vornehmen; (c) Probleme innerhalb von 30 Tagen nach Lieferung melden. Käufer sind dafür verantwortlich, Importbeschränkungen und Zölle in ihrem Land zu verstehen.</p>",
        "<p><strong>4.4 Verbotene Artikel.</strong> Folgendes darf nicht verkauft werden: Fälschungen, Waffen oder Waffenrepliken, Erwachseneninhalte, Artikel, die Hassrede oder Gewalt fördern, gestohlene Güter, exportkontrollierte Artikel (militärisch/dual-use) und alle Artikel, die nach lokalen Gesetzen des Käufers oder Verkäufers verboten sind.</p>",
        "<p><strong>4.5 Streitbeilegung.</strong> Bei Streitigkeiten zwischen Käufern und Verkäufern müssen beide Parteien zuerst eine Lösung über unser internes Streitverfahren anstreben. Bleibt der Streit nach 14 Tagen ungelöst, kann er der Mediation zugeführt werden. Nutzer in der EU können auch die Europäische Plattform zur Online-Streitbeilegung (OS) nutzen.</p>",
        "<p><strong>4.6 Steuer-Compliance.</strong> Auf Ramen Anime angezeigte Preise können je nach Standort mit oder ohne MwSt./Steuern ausgewiesen sein. Wir berechnen und zeigen anwendbare Steuern automatisch nach dem Land des Käufers mit unserer Tax Engine an. Verkäufer sind für die Abführung erhobener Steuern an ihre lokalen Steuerbehörden verantwortlich. Wir stellen Transaktionsaufzeichnungen für die Steuererklärung bereit.</p>",
        "<p><strong>4.7 Plattformgebühren.</strong> Wir erheben eine Plattformgebühr auf abgeschlossene Transaktionen. Aktuelle Gebühren: 8 % des Artikelpreises für Standardverkäufer, 5 % für verifizierte Verkäufer. Gebühren können mit 30 Tagen Vorankündigung geändert werden.</p>",
      ],
    },
    {
      id: "terms-5",
      title: "5. MwSt., GST und Steuer-Compliance",
      paragraphs: [
        "<p><strong>5.1 Steuererhebung.</strong> Ramen Anime fungiert als Marktplatz-Vermittler in Rechtsordnungen, die eine Marktplatz-Steuererhebung vorschreiben. Wir berechnen, erheben und führen automatisch anwendbare Steuern ab, einschließlich MwSt. (EU/UK), GST (Australien, Kanada, Singapur), Verbrauchsteuer (Japan) und US-Umsatzsteuer, wo gesetzlich erforderlich.</p>",
        "<p><strong>5.2 EU-MwSt.</strong> Für Käufer in EU-Mitgliedstaaten wird MwSt. zum im Wohnsitzland des Käufers geltenden Satz berechnet. Dies folgt den EU-MwSt.-E-Commerce-Regeln (Richtlinie des Rates 2017/2455 und 2019/1995). Verkäufer müssen sich für Marktplatzverkäufe in der EU nicht separat für MwSt. registrieren.</p>",
        "<p><strong>5.3 UK-MwSt.</strong> Für Käufer im Vereinigten Königreich gilt UK-MwSt. von 20 % auf digitale Dienste und anwendbare Waren. Dies folgt den UK-MwSt.-E-Commerce-Vorschriften nach dem Brexit.</p>",
        "<p><strong>5.4 US-Umsatzsteuer.</strong> Wir erheben Umsatzsteuer in US-Bundesstaaten, in denen wir wirtschaftlichen Nexus haben oder Marktplatz-Vermittlergesetze gelten. Käufer in Bundesstaaten ohne Umsatzsteuer werden nicht belastet.</p>",
        "<p><strong>5.5 Digitale Dienststeuer.</strong> In Rechtsordnungen mit Digital Services Tax (DST) sind anwendbare Steuern in der Plattformgebührenberechnung enthalten und werden wie erforderlich abgeführt.</p>",
        "<p><strong>5.6 Steuerunterlagen.</strong> Wir stellen Verkäufern steuerliche Berichte auf Transaktionsebene bereit. Käufer erhalten Steuerrechnungen, wo erforderlich. Wir bewahren Steuerunterlagen {{taxRecordRetentionYears}} Jahre gemäß anwendbarem Steuerrecht auf.</p>",
        "<p><strong>5.7 Exportzölle.</strong> Bei internationalen Sendungen sind Käufer für Importzölle, Zollgebühren oder Tarife in ihrem Land verantwortlich. Diese sind nicht im Kaufpreis enthalten, sofern nicht ausdrücklich angegeben.</p>",
      ],
    },
    {
      id: "terms-6",
      title: "6. Soziales Forum und Nutzerinhalte",
      paragraphs: [
        "<p><strong>6.1 Eigentum an Inhalten.</strong> Sie behalten das Eigentum an Inhalten, die Sie im Forum, in Ihrem Profil und in Kommentaren veröffentlichen. Durch die Veröffentlichung gewähren Sie uns eine weltweite, nicht-exklusive, gebührenfreie Lizenz zur Nutzung, Vervielfältigung, Änderung, Anpassung, Veröffentlichung und Anzeige solcher Inhalte zum Betrieb und zur Bewerbung der Dienste.</p>",
        "<p><strong>6.2 Inhaltsstandards.</strong> Sie dürfen keine Inhalte veröffentlichen, die: (a) rechtswidrig, schädlich, bedrohlich, beleidigend, belästigend, diffamierend oder in die Privatsphäre eingreifend sind; (b) geistige Eigentumsrechte verletzen; (c) Malware oder schädlichen Code enthalten; (d) illegale Aktivitäten fördern; (e) explizit sexuelle Inhalte enthalten (unsere Plattform richtet sich an ein allgemeines Publikum mit animebezogenen Inhalten); (f) Spam oder unbefugte Werbung darstellen.</p>",
        "<p><strong>6.3 Inhaltsmoderation.</strong> Wir behalten uns vor, Inhalte zu entfernen, die gegen diese Bedingungen verstoßen. Wir setzen automatisierte Systeme und menschliche Moderatoren ein. Unsere Moderationsentscheidungen sind endgültig. Nach dem EU Digital Services Act (DSA) haben Sie das Recht, Moderationsentscheidungen anzufechten.</p>",
        "<p><strong>6.4 Altersbeschränkte Inhalte.</strong> Bestimmte Forenbereiche erfordern eine Altersverifizierung. Sie dürfen Altersverifizierungssysteme nicht umgehen. Falsche Altersangaben sind Grund für sofortige Kontokündigung.</p>",
      ],
    },
    {
      id: "terms-7",
      title: "7. Geistiges Eigentum",
      paragraphs: [
        "<p><strong>7.1 Unser geistiges Eigentum.</strong> Die Dienste, einschließlich aller von uns bereitgestellten Software, Designs, Logos, Marken und Inhalte, sind Eigentum von Ramen Anime oder unseren Lizenzgebern und durch Urheber-, Marken- und andere Rechte des geistigen Eigentums geschützt. Sie dürfen unsere Marken nicht ohne vorherige schriftliche Zustimmung verwenden.</p>",
        "<p><strong>7.2 DMCA / Mitteilung und Entfernung.</strong> Wir halten den Digital Millennium Copyright Act (DMCA) und gleichwertige Mitteilungs- und Entfernungsverfahren in anderen Rechtsordnungen ein. Wenn Sie glauben, dass Inhalte Ihr Urheberrecht verletzen, reichen Sie eine Takedown-Mitteilung an den Kontakt in Abschnitt 16 ein mit: (a) Ihren Kontaktdaten; (b) Identifizierung des urheberrechtlich geschützten Werks; (c) Identifizierung des verletzenden Materials; (d) Erklärung in gutem Glauben; (e) Erklärung unter Strafe des Meineids; (f) Ihrer elektronischen Signatur.</p>",
        "<p><strong>7.3 Gegendarstellung.</strong> Wenn Ihre Inhalte aufgrund einer DMCA-Mitteilung entfernt wurden, können Sie eine Gegendarstellung einreichen. Wir leiten sie an den ursprünglichen Beschwerdeführer weiter und stellen Inhalte nach 10 Werktagen wieder her, sofern keine Klage eingereicht wird.</p>",
      ],
    },
    {
      id: "terms-8",
      title: "8. Zahlungsabwicklung",
      paragraphs: [
        "Zahlungen werden über Drittanbieter-Zahlungsdienstleister (Stripe, PayPal) abgewickelt. Mit einem Kauf stimmen Sie deren Bedingungen zu. Wir speichern keine vollständigen Zahlungskartennummern. PCI-DSS-Konformität wird von unseren Zahlungsdienstleistern aufrechterhalten.",
        "Rückerstattungen erfolgen gemäß unserer Rückerstattungsrichtlinie: (a) digitale Güter: keine Rückerstattung nach Download; (b) physische Waren: 14-tägige Rückgabefrist nach EU-Verbraucherrechterichtlinie; (c) Marktplatzartikel: gemäß Rückgaberichtlinie des Verkäufers mit verfügbarer Plattformmediation.",
      ],
    },
    {
      id: "terms-9",
      title: "9. Verbotenes Verhalten",
      paragraphs: [
        "Sie dürfen nicht: (a) die Dienste für illegale Zwecke nutzen; (b) versuchen, unbefugten Zugang zu Teilen der Dienste zu erlangen; (c) die Dienste stören oder beeinträchtigen; (d) automatisierte Systeme (Bots, Scraper) ohne Genehmigung nutzen; (e) Nutzerdaten ernten; (f) eine Person oder Organisation vortäuschen; (g) Geolokalisierung oder Altersverifizierung umgehen; (h) Geldwäsche oder Terrorismusfinanzierung betreiben; (i) Exportkontrollgesetze verletzen; (j) die Dienste ohne Genehmigung weiterverkaufen oder kommerziell ausnutzen.",
      ],
    },
    {
      id: "terms-10",
      title: "10. Haftungsbeschränkung",
      paragraphs: [
        '<p><strong>10.1 Haftungsausschluss.</strong> DIE DIENSTE WERDEN „WIE BESEHEN“ UND „WIE VERFÜGBAR“ OHNE GEWÄHRLEISTUNGEN JEGLICHER ART, WEDER AUSDRÜCKLICH NOCH STILLSCHWEIGEND, EINSCHLIESSLICH, ABER NICHT BESCHRÄNKT AUF GEWÄHRLEISTUNGEN DER MARKTGÄNGIGKEIT, EIGNUNG FÜR EINEN BESTIMMTEN ZWECK UND NICHTVERLETZUNG, BEREITGESTELLT.</p>',
        "<p><strong>10.2 Haftungsobergrenze.</strong> Soweit gesetzlich zulässig, übersteigt unsere Gesamthaftung nicht den Betrag, den Sie uns in den 12 Monaten vor der Forderung gezahlt haben, oder 100 USD, je nachdem, welcher Betrag höher ist. Diese Beschränkung gilt nicht für: (a) grobe Fahrlässigkeit oder vorsätzliches Fehlverhalten; (b) Tod oder Körperverletzung; (c) Betrug; (d) wo Verbraucherschutzgesetze dies verbieten.</p>",
        "<p><strong>10.3 EU-Verbraucherausnahme.</strong> Wenn Sie Verbraucher in der EU sind, werden gesetzliche Verbraucherrechte nach EU-Recht durch diese Beschränkungen nicht beeinträchtigt, einschließlich Rechte nach der Verbrauchsgüterkauf- und -garantierichtlinie.</p>",
        "<p><strong>10.4 Höhere Gewalt.</strong> Wir haften nicht für Ausfälle durch Umstände außerhalb unserer zumutbaren Kontrolle, einschließlich Naturkatastrophen, Kriege, Terrorismus, Aufstände, Embargos, Handlungen ziviler oder militärischer Behörden, Brände, Überschwemmungen, Unfälle, Streiks oder Engpässe bei Transport, Einrichtungen, Treibstoff, Energie, Arbeitskräften oder Materialien.</p>",
      ],
    },
    {
      id: "terms-11",
      title: "11. Streitbeilegung und anwendbares Recht",
      paragraphs: [
        "<p><strong>11.1 Anwendbares Recht.</strong> Diese Bedingungen unterliegen den Gesetzen des Bundesstaates Kalifornien, USA, ohne Berücksichtigung kollisionsrechtlicher Grundsätze, außer wenn zwingende Verbraucherschutzgesetze Ihres Wohnsitzlandes Vorrang haben.</p>",
        "<p><strong>11.2 EU-Nutzer.</strong> Wenn Sie Verbraucher in der EU sind, profitieren Sie zusätzlich von zwingenden Verbraucherschutzgesetzen Ihres EU-Mitgliedstaats. Streitigkeiten können vor den Gerichten Ihres Wohnsitzes erhoben werden.</p>",
        "<p><strong>11.3 Schiedsgericht (US-Nutzer).</strong> Für Nutzer in den Vereinigten Staaten wird zuerst versucht, Streitigkeiten durch Verhandlung in gutem Glauben beizulegen. Bleibt dies nach 30 Tagen erfolglos, kann jede Partei ein verbindliches Schiedsverfahren nach den Commercial Arbitration Rules der American Arbitration Association (AAA) einleiten. Das Schiedsverfahren findet in Los Angeles, Kalifornien, statt.</p>",
        "<p><strong>11.4 Verzicht auf Sammelklagen.</strong> SOWEIT GESETZLICH ZULÄSSIG, STIMMEN SIE ZU, DASS VERFAHREN NUR AUF INDIVIDUELLER BASIS UND NICHT ALS SAMMEL-, KONSOLIDIERTE ODER REPRÄSENTATIVE KLAGE GEFÜHRT WERDEN. Dieser Verzicht gilt nicht für Ansprüche nach Verbraucherschutzgesetzen, die Verzichte auf Sammelklagen verbieten.</p>",
        "<p><strong>11.5 OS-Plattform.</strong> EU-Verbraucher können die Online-Streitbeilegungsplattform der Europäischen Kommission nutzen: https://ec.europa.eu/odr</p>",
      ],
    },
    {
      id: "terms-12",
      title: "12. Exportkontrollen und Sanktionen",
      paragraphs: [
        "Sie dürfen die Dienste nicht nutzen, um Artikel unter Verletzung anwendbarer Exportkontrollgesetze zu exportieren, wiederzuexportieren oder zu übertragen, einschließlich der US Export Administration Regulations (EAR), der EU-Dual-Use-Verordnung 2021/821 oder UN-Sicherheitsrats-Sanktionen. Verbotene Artikel umfassen Militärgüter, Dual-Use-Artikel und Artikel, die für sanktionierte Länder oder Entitäten bestimmt sind.",
      ],
    },
    {
      id: "terms-13",
      title: "13. Datenschutz von Kindern (COPPA-Konformität)",
      paragraphs: [
        "Wir halten den Children's Online Privacy Protection Act (COPPA) und gleichwertige Gesetze weltweit ein. Wir erheben wissentlich keine personenbezogenen Daten von Kindern unter 13 Jahren ohne nachweisbare elterliche Einwilligung. Wenn wir erfahren, dass wir personenbezogene Daten eines Kindes unter 13 ohne elterliche Einwilligung erhoben haben, löschen wir diese Informationen umgehend.",
        "Eltern oder Erziehungsberechtigte, die glauben, ihr Kind habe uns personenbezogene Daten bereitgestellt, können uns zur Löschung kontaktieren.",
      ],
    },
    {
      id: "terms-14",
      title: "14. Kündigung",
      paragraphs: [
        "Sie können Ihr Konto jederzeit über die Kontoeinstellungen oder durch Kontaktaufnahme mit uns kündigen. Wir können Ihr Konto bei Verstößen gegen diese Bedingungen sofort kündigen oder sperren. Mit der Kündigung endet Ihr Recht zur Nutzung der Dienste sofort. Bestimmungen, die ihrer Natur nach die Kündigung überdauern sollen, bleiben in Kraft.",
        "Nach DSGVO Artikel 17 haben Sie das Recht, die Löschung Ihrer personenbezogenen Daten zu verlangen. Wir erfüllen dies innerhalb von 30 Tagen, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.",
      ],
    },
    {
      id: "terms-15",
      title: "15. Geolokalisierung und Dienstverfügbarkeit",
      paragraphs: [
        "Wir verwenden Geolokalisierungstechnologie, um Ihr Zugangsland zu bestimmen. Die Dienste sind nur in Ländern verfügbar, die wir für den Zugang konfiguriert haben. Dies ist für die rechtliche Compliance erforderlich, einschließlich Exportkontrollen, Altersverifizierungsanforderungen und Steuerpflichten.",
        "Wir können den Zugang aus bestimmten Ländern oder Regionen aufgrund rechtlicher Anforderungen, Sanktionen oder anderer Compliance-Überlegungen einschränken. Der Versuch, Geolokalisierungsbeschränkungen zu umgehen, verstößt gegen diese Bedingungen.",
      ],
    },
    {
      id: "terms-16",
      title: "16. Kontakt",
      paragraphs: [
        "Für rechtliche Mitteilungen, Datenschutzanfragen, DMCA-Entfernungen oder allgemeine Anfragen:",
        "<p><strong>Ramen Anime Rechtsabteilung</strong><br />E-Mail: legal@ramenanime.app<br />Adresse: Ramen Anime, 123 Anime Street, Los Angeles, CA 90001, USA</p>",
        "<p><strong>Datenschutzbeauftragter (EU/UK):</strong><br />E-Mail: dpo@ramenanime.app</p>",
        "<p><strong>Aufsichtsbehörde (EU):</strong><br />Sie haben das Recht, bei Ihrer lokalen Datenschutzbehörde Beschwerde einzureichen.</p>",
      ],
    },
  ],
};

export const legalDe = {
  legalPrivacy: privacy,
  legalTerms: terms,
};
