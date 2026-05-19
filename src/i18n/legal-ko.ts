import type { LegalDocumentContent } from "./legal-types";

export const privacy: LegalDocumentContent = {
  quickSummaryTitle: "요약",
  quickSummaryBody:
    "당사는 서비스 운영에 필요한 최소한의 데이터만 수집합니다. 귀하의 개인 데이터를 판매하지 않습니다. 업계 표준 암호화를 사용합니다. 데이터에 대한 접근, 정정 및 삭제 권리가 있습니다. 데이터는 최대 {{dataRetentionDays}}일간 보관합니다.",
  lastUpdated: "2025년 5월 2일",
  sections: [
    {
      id: "privacy-1",
      title: "1. 소개 및 적용 범위",
      paragraphs: [
        '본 개인정보 처리방침은 Ramen Anime("당사", "우리")가 웹사이트, 모바일 애플리케이션, 마켓플레이스, 소셜 포럼 및 관련 서비스(총칭하여 "서비스") 이용 시 귀하의 개인정보를 수집, 사용, 저장, 공유 및 보호하는 방법을 설명합니다.',
        "본 방침은 {{privacyLaw}}를 준수하며 전 세계 모든 사용자에게 적용됩니다. 거주 지역에 따라 제10조에 설명된 추가 권리가 적용될 수 있습니다.",
        "서비스를 이용함으로써 본 방침에 설명된 관행에 동의하는 것으로 간주됩니다. 동의하지 않으시면 서비스를 이용하지 마십시오.",
      ],
    },
    {
      id: "privacy-2",
      title: "2. 수집하는 정보",
      paragraphs: [
        "<p><strong>2.1 귀하가 직접 제공하는 정보:</strong></p>",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>계정 정보:</strong> 사용자 이름, 이메일 주소, 비밀번호(비용 계수 12의 bcrypt 해시로 저장)</li><li><strong>프로필 정보:</strong> 표시 이름, 소개, 아바타, 위치, 관심사(모두 선택)</li><li><strong>마켓플레이스 정보:</strong> 배송 주소, 결제 수단 토큰(Stripe/PayPal 처리, 당사는 전체 카드 번호를 저장하지 않음)</li><li><strong>포럼 콘텐츠:</strong> 귀하가 작성하는 게시물, 댓글, 메시지</li><li><strong>커뮤니케이션:</strong> 고객 지원 문의, 피드백</li><li><strong>연령 확인:</strong> 연령 확인, 연령 제한 콘텐츠용 선택적 신원 확인</li></ul>',
        "<p><strong>2.2 자동으로 수집되는 정보:</strong></p>",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>기기 정보:</strong> IP 주소, 브라우저 유형, 운영 체제, 기기 식별자</li><li><strong>이용 데이터:</strong> 방문 페이지, 사용 기능, 체류 시간, 클릭 패턴</li><li><strong>위치 정보:</strong> 규정 준수(VAT 계산, 연령 확인, 수출 통제)를 위해 IP 주소에서 도출된 국가</li><li><strong>쿠키 및 유사 기술:</strong> 제8조(쿠키 정책) 참조</li></ul>',
        "<p><strong>2.3 제3자로부터의 정보:</strong></p>",
        '<ul class="list-disc pl-5 space-y-1"><li>결제 처리업체(Stripe, PayPal): 거래 확인, 카드 마지막 4자리</li><li>인증 서비스(OAuth 사용 시)</li><li>사기 방지 서비스</li></ul>',
      ],
    },
    {
      id: "privacy-3",
      title: "3. 정보 이용 목적",
      paragraphs: [
        "당사는 다음 목적으로 귀하의 개인 데이터를 사용합니다:",
        '<table class="w-full text-xs border-collapse my-4"><thead><tr class="border-b"><th class="text-left py-2">목적</th><th class="text-left py-2">법적 근거(GDPR)</th><th class="text-left py-2">사용 데이터</th></tr></thead><tbody class="space-y-2"><tr class="border-b border-border/50"><td class="py-2">계정 생성 및 관리</td><td>계약 이행</td><td>사용자 이름, 이메일, 비밀번호 해시</td></tr><tr class="border-b border-border/50"><td class="py-2">서비스 제공</td><td>계약 이행</td><td>프로필 데이터, 포럼 게시물, 설정</td></tr><tr class="border-b border-border/50"><td class="py-2">결제 처리</td><td>계약 이행</td><td>결제 토큰, 거래 내역</td></tr><tr class="border-b border-border/50"><td class="py-2">세금 규정 준수</td><td>법적 의무</td><td>거래 데이터, 국가, VAT 기록</td></tr><tr class="border-b border-border/50"><td class="py-2">보안 및 사기 방지</td><td>정당한 이익</td><td>IP 주소, 기기 정보, 이용 패턴</td></tr><tr class="border-b border-border/50"><td class="py-2">연령 확인</td><td>법적 의무</td><td>연령 신고, 선택적 신분 증명</td></tr><tr class="border-b border-border/50"><td class="py-2">법적 준수(수출 통제, 제재)</td><td>법적 의무</td><td>국가, 거래 세부 정보</td></tr><tr class="border-b border-border/50"><td class="py-2">서비스 개선</td><td>정당한 이익</td><td>집계된 이용 분석</td></tr><tr class="border-b border-border/50"><td class="py-2">고객 지원</td><td>계약 이행</td><td>계정 데이터, 커뮤니케이션 내역</td></tr><tr><td class="py-2">마케팅(동의 시에만)</td><td>동의</td><td>이메일, 설정</td></tr></tbody></table>',
      ],
    },
    {
      id: "privacy-4",
      title: "4. 정보 공유",
      paragraphs: [
        "당사는 귀하의 개인 데이터를 판매하지 않습니다. 다음 경우에만 데이터를 공유합니다:",
        '<ul class="list-disc pl-5 space-y-2"><li><strong>서비스 제공업체:</strong> 결제 처리업체(Stripe, PayPal), 호스팅 제공업체(Render), 이메일 서비스, 분석 제공업체. 모두 데이터 처리 계약에 구속됩니다.</li><li><strong>다른 사용자:</strong> 프로필 정보 및 포럼 게시물은 서비스 설계에 따라 다른 사용자에게 표시됩니다.</li><li><strong>법적 요구:</strong> 법률, 법원 명령 또는 정부 기관에 의해 요구되는 경우. 금지되지 않는 한 귀하에게 통지합니다.</li><li><strong>사업 양도:</strong> 합병, 인수 또는 자산 매각과 관련하여 사용자에게 통지합니다.</li><li><strong>귀하의 동의:</strong> 귀하가 명시적으로 승인한 목적.</li></ul>',
      ],
    },
    {
      id: "privacy-5",
      title: "5. 데이터 보관 및 삭제",
      paragraphs: [
        "당사는 본 방침에 설명된 목적을 달성하는 데 필요한 기간 동안 개인 데이터를 보관합니다:",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>계정 데이터:</strong> 계정 삭제 시 또는 {{dataRetentionDays}}일 비활성 시까지</li><li><strong>거래 기록:</strong> {{transactionRetentionDays}}일(세금/법적 요구)</li><li><strong>포럼 게시물:</strong> 사용자 삭제 또는 계정 폐쇄 시까지</li><li><strong>로그 파일:</strong> 90일</li><li><strong>쿠키 동의 기록:</strong> 2년</li></ul>',
        "계정 삭제 요청 시 법률에 의해 보관이 요구되는 경우(세금 목적의 거래 기록)를 제외하고 30일 이내에 개인 데이터를 삭제하거나 익명화합니다.",
      ],
    },
    {
      id: "privacy-6",
      title: "6. 데이터 보안",
      paragraphs: [
        "당사는 업계 표준 보안 조치를 시행합니다:",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>암호화:</strong> 전송 중 모든 데이터에 TLS 1.3, 저장 데이터에 AES-256</li><li><strong>비밀번호:</strong> 비용 계수 12의 bcrypt 해시(64바이트/512비트 출력)</li><li><strong>인증:</strong> httpOnly 쿠키를 사용한 JWT 토큰, 세션 만료 1년</li><li><strong>접근 제어:</strong> 역할 기반 접근(사용자/관리자), 최소 권한 원칙</li><li><strong>모니터링:</strong> 접근 시도 자동 로깅, 이상 탐지</li><li><strong>유출 대응:</strong> 데이터 유출 시 {{privacyLaw}}에서 요구하는 {{breachNotificationHours}}시간 이내에 영향받은 사용자에게 통지합니다.</li></ul>',
      ],
    },
    {
      id: "privacy-7",
      title: "7. 국제 데이터 이전",
      paragraphs: [
        "귀하의 데이터는 미국 서버에 저장됩니다. EU/EEA, 영국 및 데이터 이전 보호를 요구하는 기타 관할권의 사용자:",
        '<ul class="list-disc pl-5 space-y-1"><li>유럽 위원회가 승인한 표준계약조항(SCC)을 사용합니다</li><li>영국 이전의 경우 SCC 영국 부속서를 준수합니다</li><li>적 adequacy 결정 및 이전에 영향을 미치는 법적 발전을 모니터링합니다</li><li>모든 이전은 전송 중 암호화(TLS 1.3)로 보호됩니다</li></ul>',
      ],
    },
    {
      id: "privacy-8",
      title: "8. 쿠키 정책",
      paragraphs: [
        "당사는 다음과 같이 쿠키 및 유사 기술을 사용합니다:",
        '<table class="w-full text-xs border-collapse my-4"><thead><tr class="border-b"><th class="text-left py-2">범주</th><th class="text-left py-2">목적</th><th class="text-left py-2">기간</th><th class="text-left py-2">필수?</th></tr></thead><tbody><tr class="border-b border-border/50"><td class="py-2">필수</td><td>인증, 보안, 세션 관리</td><td>세션~1년</td><td>예(비활성화 불가)</td></tr><tr class="border-b border-border/50"><td class="py-2">환경설정</td><td>언어 선택, 테마, 표시 설정</td><td>1년</td><td>아니오</td></tr><tr class="border-b border-border/50"><td class="py-2">분석</td><td>서비스 개선, 이용 통계</td><td>1년</td><td>아니오</td></tr><tr><td class="py-2">마케팅</td><td>개인화 추천(동의 시)</td><td>1년</td><td>아니오</td></tr></tbody></table>',
        "{{cookieConsentNote}}",
      ],
    },
    {
      id: "privacy-9",
      title: "9. 아동 개인정보",
      paragraphs: [
        "당사는 COPPA(미국), 아동 관련 GDPR 요건(EU) 및 전 세계 동등 법률을 준수합니다. 당사 서비스는 13세 미만 아동을 대상으로 하지 않습니다.",
        "당사는 {{parentalConsentPhrase}} 없이 {{ageOfConsent}}세 미만 아동으로부터 고의로 개인정보를 수집하지 않습니다. 부모님이 자녀가 동의 없이 개인정보를 제공했다고 생각하시면 즉시 연락해 주시면 해당 정보를 삭제합니다.",
        "서비스의 연령 제한 구역(소셜 포럼, 마켓플레이스)은 사용자가 최소 18세임을 확인해야 합니다.",
      ],
    },
    {
      id: "privacy-10",
      title: "10. 귀하의 개인정보 권리",
      paragraphs: [
        "거주 지역에 따라 다음 권리를 가질 수 있습니다:",
        '<table class="w-full text-xs border-collapse my-4"><thead><tr class="border-b"><th class="text-left py-2">권리</th><th class="text-left py-2">설명</th><th class="text-left py-2">적용 지역</th></tr></thead><tbody><tr class="border-b border-border/50"><td class="py-2">접근</td><td>개인 데이터 사본 요청</td><td>모든 관할권</td></tr><tr class="border-b border-border/50"><td class="py-2">정정</td><td>부정확한 데이터 정정 요청</td><td>모든 관할권</td></tr><tr class="border-b border-border/50"><td class="py-2">삭제(잊혀질 권리)</td><td>데이터 삭제 요청</td><td>{{rightToBeForgottenDetail}}</td></tr><tr class="border-b border-border/50"><td class="py-2">이동성</td><td>구조화된 기계 판독 형식으로 데이터 수령</td><td>{{dataPortabilityDetail}}</td></tr><tr class="border-b border-border/50"><td class="py-2">이의</td><td>정당한 이익에 기반한 처리에 이의</td><td>EU, 영국, 브라질, 한국</td></tr><tr class="border-b border-border/50"><td class="py-2">처리 제한</td><td>처리 제한 요청</td><td>EU, 영국, 브라질</td></tr><tr class="border-b border-border/50"><td class="py-2">동의 철회</td><td>언제든지 동의 철회</td><td>모든 관할권(동의가 근거인 경우)</td></tr><tr><td class="py-2">감독 기관에 불만</td><td>감독 당국에 불만 제기</td><td>EU, 영국, 브라질, 한국</td></tr></tbody></table>',
        "권리를 행사하려면 privacy@ramenanime.app으로 이메일을 보내 주십시오. 30일 이내에 응답합니다.",
      ],
    },
    {
      id: "privacy-11",
      title: "11. 자동화된 의사결정 및 프로파일링",
      paragraphs: [
        "당사는 다음을 제외하고 귀하에 관한 법적 효과를 발생시키는 프로파일링 또는 자동화된 의사결정을 하지 않습니다:",
        '<ul class="list-disc pl-5 space-y-1"><li>사기 탐지 및 방지 알고리즘</li><li>포럼 게시물용 스팸/콘텐츠 필터 자동화</li><li>위치 기반 접근 제어 및 세금 계산</li></ul>',
        "이러한 시스템은 귀하의 법적 권리에 중대한 영향을 미치는 자동화된 결정의 결과가 되지 않습니다. 이의가 있는 결정에 대해서는 인간 검토가 가능합니다.",
      ],
    },
    {
      id: "privacy-12",
      title: "12. 본 방침의 변경",
      paragraphs: [
        '당사는 본 개인정보 처리방침을 주기적으로 업데이트할 수 있습니다. 중요한 변경은 발효 최소 30일 전에 이메일 또는 눈에 띄는 공지로 알립니다. 변경 후 계속 이용은 수락을 구성합니다. 상단의 "최종 업데이트" 날짜는 최근 개정을 나타냅니다.',
      ],
    },
    {
      id: "privacy-13",
      title: "13. 문의",
      paragraphs: [
        "<p><strong>데이터 보호 책임자:</strong> dpo@ramenanime.app</p>",
        "<p><strong>개인정보 문의:</strong> privacy@ramenanime.app</p>",
        "<p><strong>우편 주소:</strong><br />Ramen Anime Privacy Office<br />123 Anime Street<br />Los Angeles, CA 90001<br />United States</p>",
        "<p><strong>EU 감독 기관:</strong> 거주 지역의 데이터 보호 당국에 불만을 제기할 권리가 있습니다. 목록: https://edpb.europa.eu/about-edpb/board/members</p>",
      ],
    },
  ],
};

export const terms: LegalDocumentContent = {
  quickSummaryTitle: "",
  quickSummaryBody: "",
  lastUpdated: "2025년 5월 2일",
  sections: [
    {
      id: "terms-1",
      title: "1. 이용약관 동의",
      paragraphs: [
        '라멘애니메("Ramen Anime", "당사", "우리")의 웹사이트, 모바일 애플리케이션, 마켓플레이스, 소셜 포럼 및 관련 서비스(총칭하여 "서비스")에 접근하거나 이용함으로써 귀하는 본 서비스 이용약관("약관")에 구속되는 것에 동의합니다. 본 약관에 동의하지 않으시면 서비스에 접근하거나 이용해서는 안 됩니다.',
        "본 약관은 귀하와 Ramen Anime 간의 법적 구속력 있는 계약을 구성합니다. 당사는 본 약관을 언제든지 수정할 권리를 보유합니다. 변경은 게시 즉시 효력이 발생합니다. 변경 후 계속 이용은 개정된 약관에 대한 동의를 구성합니다. 적용 소비자 보호법에서 요구하는 경우 중요한 변경은 발효 최소 30일 전에 이메일 또는 서비스상 눈에 띄는 공지로 알립니다.",
        "유럽연합에서 서비스에 접근하는 경우 본 약관은 EU 특별 조항으로 보완됩니다. 캘리포니아 거주자인 경우 캘리포니아 소비자 개인정보 보호법(CCPA) 및 캘리포니아 개인정보 권리법(CPRA)에 따른 권리가 보존되며 본 약관에 의해 제한되지 않습니다.",
      ],
    },
    {
      id: "terms-2",
      title: "2. 이용 자격 및 계정 등록",
      paragraphs: [
        "<p><strong>2.1 연령 요건.</strong> 계정을 생성하고 Ramen Anime 마켓플레이스 및 소셜 포럼을 포함한 전체 서비스를 이용하려면 최소 18세 이상이어야 합니다. 18세 미만인 경우 부모 또는 법정 후견인의 참여와 동의가 있는 경우에만 사용자 간 상호작용이 없는 일반 상점 기능을 이용할 수 있습니다. 계정을 생성함으로써 귀하는 이러한 연령 요건을 충족함을 진술하고 보증합니다.</p>",
        "<p><strong>2.2 부모 동의.</strong> {{privacyLaw}}에 따라 {{ageOfConsent}}세 미만인 경우 개인정보를 수집, 사용 또는 공개하기 전에 검증 가능한 부모 동의가 필요합니다. 당사는 미국인 경우 COPPA 및 동등 프레임워크에 부합하는 후속 확인이 있는 이메일 인증을 부모 동의 수단으로 사용합니다.</p>",
        "<p><strong>2.3 계정 보안.</strong> 귀하는 계정 자격 증명의 기밀 유지 및 계정에서 발생하는 모든 활동에 책임이 있습니다. 무단 사용이 있으면 즉시 당사에 알려야 합니다. 당사는 비용 계수 12의 bcrypt 비밀번호 해싱, 모든 전송 데이터에 대한 HTTPS/TLS 1.3 암호화, httpOnly 쿠키를 사용한 JWT 기반 세션 관리를 포함한 업계 표준 보안 조치를 시행합니다.</p>",
        "<p><strong>2.4 계정 종료.</strong> 당사는 본 약관 위반, 불법 활동 또는 커뮤니티 보호를 위해 단독 재량으로 계정을 정지하거나 종료할 권리를 보유합니다. EU에서는 GDPR 제17조에 따라 언제든지 계정을 종료하고 데이터 삭제를 요청할 권리가 있습니다.</p>",
      ],
    },
    {
      id: "terms-3",
      title: "3. 개인정보 및 데이터 보호",
      paragraphs: [
        "귀하의 개인정보는 참조로 본 약관에 포함된 개인정보 처리방침에 의해 관리됩니다. 당사의 데이터 관행은 {{privacyLaw}}를 준수합니다.",
        "<p><strong>3.1 데이터 수집.</strong> 당사는 다음을 수집합니다: (a) 계정 정보(사용자 이름, 이메일, 비밀번호 해시); (b) 귀하가 자발적으로 제공하는 프로필 정보; (c) 마켓플레이스 구매 거래 데이터; (d) 포럼 게시물 및 댓글; (e) 보안 및 위치 정보 규정 준수를 위한 IP 주소 및 기기 정보; (f) 쿠키 정책에 상세히 기술된 쿠키 및 유사 기술.</p>",
        "<p><strong>3.2 처리의 법적 근거(GDPR/LGPD).</strong> 법적 근거를 요구하는 관할권의 사용자에 대해 당사는 다음 근거로 개인 데이터를 처리합니다: (a) 계약 이행(서비스 제공); (b) 정당한 이익(보안, 사기 방지); (c) 법적 의무(세금 보고, 법 집행 요청); (d) 동의(마케팅 커뮤니케이션, 선택 기능).</p>",
        "<p><strong>3.3 귀하의 권리.</strong> 관할권에 따라 데이터 접근, 부정확성 정정, 계정 및 데이터 삭제(잊혀질 권리), 처리 이의, 데이터 이동성, 동의 철회, 감독 기관에 불만 제기 권리가 있을 수 있습니다. 이러한 권리를 행사하려면 제16조의 연락처로 문의하십시오.</p>",
        "<p><strong>3.4 데이터 보관.</strong> 당사는 귀하의 개인 데이터를 {{dataRetentionDays}}일간 또는 수집 목적 달성, 법적 의무 준수, 분쟁 해결 및 계약 집행에 필요한 기간 동안 보관합니다. 이 기간 후 데이터는 안전하게 삭제되거나 익명화됩니다.</p>",
        "<p><strong>3.5 국제 이전.</strong> 귀하의 데이터는 미국에 있는 당사 서버를 포함하여 거주 국가 이외의 국가로 이전되어 처리될 수 있습니다. EU/EEA, 영국 또는 adequacy 보호를 요구하는 기타 관할권에서의 이전에 대해 유럽 위원회가 승인한 표준계약조항(SCC)을 시행합니다.</p>",
      ],
    },
    {
      id: "terms-4",
      title: "4. 마켓플레이스 약관",
      paragraphs: [
        "<p><strong>4.1 마켓플레이스의 성격.</strong> Ramen Anime 마켓플레이스는 애니메이션 상품의 구매자와 판매자를 연결하는 플랫폼입니다. 당사는 사용자 간 거래의 당사자가 아닙니다. 판매 품목의 소유권을 취득하지 않으며 등록 품목의 품질, 안전 또는 합법성을 보장하지 않습니다.</p>",
        "<p><strong>4.2 판매자 의무.</strong> 판매자는 다음을 수행해야 합니다: (a) 품목을 정확히 기술; (b) 상품 판매에 관한 모든 적용 법률 준수; (c) 위조품, 무기, 규제 물질 또는 지적재산권을 침해하는 품목 등 금지 품목 판매 금지; (d) 지정 기간 내 발송; (e) 관할권에서 요구하는 모든 세금 징수 및 납부.</p>",
        "<p><strong>4.3 구매자 의무.</strong> 구매자는 다음을 수행해야 합니다: (a) 신속한 대금 지불; (b) 사기성 차지백 금지; (c) 배송 후 30일 이내 문제 보고. 구매자는 자국 수입 제한 및 관세를 이해할 책임이 있습니다.</p>",
        "<p><strong>4.4 금지 품목.</strong> 다음은 판매할 수 없습니다: 위조 상품, 무기 또는 복제 무기, 성인 콘텐츠, 혐오 발언 또는 폭력을 조장하는 품목, 도난품, 수출 통제 대상(군사/이중용도), 구매자 또는 판매자 현지 법률로 금지된 품목.</p>",
        "<p><strong>4.5 분쟁 해결.</strong> 구매자와 판매자 간 분쟁의 경우 양 당사자는 먼저 당사 내부 분쟁 절차를 통해 해결을 시도해야 합니다. 14일 이내 미해결 시 조정으로 이관할 수 있습니다. EU 사용자는 유럽 온라인 분쟁 해결(ODR) 플랫폼도 이용할 수 있습니다.</p>",
        "<p><strong>4.6 세금 규정 준수.</strong> Ramen Anime에 표시된 가격은 위치에 따라 VAT/세금 포함 또는 제외일 수 있습니다. 당사 세금 엔진으로 구매자 국가에 따라 적용 세금을 자동 계산 및 표시합니다. 판매자는 징수한 세금을 현지 세무 당국에 납부할 책임이 있습니다. 당사는 세금 보고를 지원하는 거래 기록을 제공합니다.</p>",
        "<p><strong>4.7 플랫폼 수수료.</strong> 완료된 거래에 플랫폼 수수료를 부과합니다. 현재 수수료: 일반 판매자 품목 가격의 8%, 인증 판매자 5%. 수수료는 30일 전 통지로 변경될 수 있습니다.</p>",
      ],
    },
    {
      id: "terms-5",
      title: "5. VAT, GST 및 세금 규정 준수",
      paragraphs: [
        "<p><strong>5.1 세금 징수.</strong> Ramen Anime는 마켓플레이스 세금 징수가 요구되는 관할권에서 마켓플레이스 중개자로 운영됩니다. 법률에서 요구하는 경우 VAT(EU/영국), GST(호주, 캐나다, 싱가포르), 소비세(일본), 주 판매세(미국)를 포함한 적용 세금을 자동 계산, 징수 및 납부합니다.</p>",
        "<p><strong>5.2 EU VAT.</strong> EU 회원국 구매자에게는 거주국에 적용되는 세율로 VAT를 부과합니다. 이는 EU VAT 전자상거래 규칙(이사회 지침 2017/2455 및 2019/1995)을 따릅니다. 판매자는 EU 내 마켓플레이스 판매에 대해 별도 VAT 등록이 필요하지 않습니다.</p>",
        "<p><strong>5.3 영국 VAT.</strong> 영국 구매자에게는 디지털 서비스 및 해당 상품에 20% 영국 VAT가 적용됩니다. 이는 Brexit 이후 영국 VAT 전자상거래 규정을 따릅니다.</p>",
        "<p><strong>5.4 미국 판매세.</strong> 당사는 경제적 넥서스가 있거나 마켓플레이스 중개자 법이 적용되는 미국 주에서 판매세를 징수합니다. 판매세가 없는 주의 구매자에게는 부과하지 않습니다.</p>",
        "<p><strong>5.5 디지털 서비스세.</strong> 디지털 서비스세(DST)가 있는 관할권에서는 적용 세금이 플랫폼 수수료 계산에 포함되며 요구에 따라 납부됩니다.</p>",
        "<p><strong>5.6 세금 기록.</strong> 당사는 판매자에게 거래 수준 세금 보고서를 제공합니다. 구매자에게는 필요 시 세금 인보이스를 발행합니다. 적용 세법에서 요구하는 {{taxRecordRetentionYears}}년간 세금 기록을 보관합니다.</p>",
        "<p><strong>5.7 수출 관세.</strong> 국제 배송의 경우 구매자는 자국에서 부과되는 수입 관세, 통관 수수료 또는 관세에 책임이 있습니다. 명시적으로 명시되지 않는 한 구매 가격에 포함되지 않습니다.</p>",
      ],
    },
    {
      id: "terms-6",
      title: "6. 소셜 포럼 및 사용자 콘텐츠",
      paragraphs: [
        "<p><strong>6.1 콘텐츠 소유권.</strong> 귀하는 포럼, 프로필 및 댓글에 게시한 콘텐츠의 소유권을 유지합니다. 게시함으로써 서비스 운영 및 홍보 목적으로 해당 콘텐츠를 사용, 복제, 수정, 적응, 게시 및 표시하는 전 세계적, 비독점적, 로열티 없는 라이선스를 당사에 부여합니다.</p>",
        "<p><strong>6.2 콘텐츠 기준.</strong> 다음 콘텐츠는 게시할 수 없습니다: (a) 불법, 유해, 위협, 학대, 괴롭힘, 명예훼손, 사생활 침해; (b) 지적재산권 침해; (c) 맬웨어 또는 유해 코드; (d) 불법 활동 조장; (e) 노골적인 성적 콘텐츠(본 플랫폼은 애니메이션 관련 일반 대상 콘텐츠용); (f) 스팸 또는 무단 광고.</p>",
        "<p><strong>6.3 콘텐츠 검열.</strong> 당사는 본 약관을 위반하는 콘텐츠를 삭제할 권리를 보유합니다. 자동 시스템과 인간 검열자를 모두 사용합니다. 검열 결정은 최종적입니다. EU 디지털 서비스법(DSA)에 따라 검열 결정에 이의를 제기할 권리가 있습니다.</p>",
        "<p><strong>6.4 연령 제한 콘텐츠.</strong> 특정 포럼 구역은 연령 확인이 필요합니다. 연령 확인 시스템 우회를 시도해서는 안 됩니다. 허위 연령 정보 제공은 즉시 계정 종료 사유입니다.</p>",
      ],
    },
    {
      id: "terms-7",
      title: "7. 지적재산",
      paragraphs: [
        "<p><strong>7.1 당사 IP.</strong> 당사가 제공하는 모든 소프트웨어, 디자인, 로고, 상표 및 콘텐츠를 포함한 서비스는 Ramen Anime 또는 당사 라이선서가 소유하며 저작권, 상표 및 기타 지적재산법으로 보호됩니다. 사전 서면 동의 없이 상표를 사용할 수 없습니다.</p>",
        "<p><strong>7.2 DMCA / 통지 및 삭제.</strong> 당사는 디지털 밀레니엄 저작권법(DMCA) 및 기타 관할권의 동등 통지·삭제 절차를 준수합니다. 콘텐츠가 저작권을 침해한다고 생각되면 제16조 연락처로 다음을 포함한 삭제 통지를 제출하십시오: (a) 연락처; (b) 저작물 식별; (c) 침해 자료 식별; (d) 선의 신념 진술; (e) 위증 시 처벌 진술; (f) 전자 서명.</p>",
        "<p><strong>7.3 반박 통지.</strong> DMCA 통지로 콘텐츠가 삭제된 경우 반박 통지를 제출할 수 있습니다. 당사는 원 신고인에게 전달하고 소송이 제기되지 않으면 10영업일 후 콘텐츠를 복원합니다.</p>",
      ],
    },
    {
      id: "terms-8",
      title: "8. 결제 처리",
      paragraphs: [
        "결제는 제3자 결제 처리업체(Stripe, PayPal)를 통해 처리됩니다. 구매함으로써 해당 약관에 동의하는 것으로 간주됩니다. 당사는 전체 결제 카드 번호를 저장하지 않습니다. PCI DSS 준수는 결제 처리업체가 유지합니다.",
        "환불은 환불 정책에 따라 처리됩니다: (a) 디지털 상품: 다운로드 후 환불 불가; (b) 실물 상품: EU 소비자 권리 지침에 따른 14일 반품 기간; (c) 마켓플레이스 품목: 판매자 반품 정책 적용, 플랫폼 중재 이용 가능.",
      ],
    },
    {
      id: "terms-9",
      title: "9. 금지 행위",
      paragraphs: [
        "귀하는 다음을 해서는 안 됩니다: (a) 불법 목적으로 서비스 이용; (b) 서비스 일부에 대한 무단 접근 시도; (c) 서비스 방해 또는 중단; (d) 무단 자동화 시스템(봇, 스크래퍼) 사용; (e) 사용자 데이터 수집; (f) 개인 또는 단체 사칭; (g) 위치 정보 또는 연령 확인 우회; (h) 자금 세탁 또는 테러 자금 조달; (i) 수출 통제 법률 위반; (j) 무단 서비스 재판매 또는 상업적 이용.",
      ],
    },
    {
      id: "terms-10",
      title: "10. 책임 제한",
      paragraphs: [
        '<p><strong>10.1 면책.</strong> 서비스는 "있는 그대로" 및 "이용 가능한 범위"로 제공되며 상품성, 특정 목적 적합성 및 비침해를 포함한 명시적 또는 묵시적 보증이 없습니다.</p>',
        "<p><strong>10.2 책임 상한.</strong> 법률이 허용하는 최대 범위에서 당사의 총 책임은 청구 전 12개월간 귀하가 당사에 지불한 금액 또는 100미국 달러 중 큰 금액을 초과하지 않습니다. 이 제한은 다음에 적용되지 않습니다: (a) 중과실 또는 고의적 불법행위; (b) 사망 또는 신체 상해; (c) 사기; (d) 소비자 보호법에서 금지된 경우.</p>",
        "<p><strong>10.3 EU 소비자 예외.</strong> EU 소비자인 경우 EU 법에 따른 법정 소비자 권리(소비자 판매 및 보증 지침에 따른 권리 포함)는 이러한 제한의 영향을 받지 않습니다.</p>",
        "<p><strong>10.4 불가항력.</strong> 당사는 천재지변, 전쟁, 테러, 폭동, 금수 조치, 민간 또는 군사 당국 행위, 화재, 홍수, 사고, 파업, 운송, 시설, 연료, 에너지, 노동 또는 자재 부족 등 합리적 통제를 벗어난 사정으로 인한 장애에 대해 책임지지 않습니다.</p>",
      ],
    },
    {
      id: "terms-11",
      title: "11. 분쟁 해결 및 준거법",
      paragraphs: [
        "<p><strong>11.1 준거법.</strong> 본 약관은 거주 국가의 강행 소비자 보호법에 의해 대체되지 않는 한 법 충돌 원칙을 제외하고 미국 캘리포니아주 법에 따릅니다.</p>",
        "<p><strong>11.2 EU 사용자.</strong> EU 소비자인 경우 EU 회원국 강행 소비자 보호법의 혜택을 추가로 받습니다. 분쟁은 거주지 법원에 제기할 수 있습니다.</p>",
        "<p><strong>11.3 중재(미국 사용자).</strong> 미국 사용자의 경우 분쟁은 먼저 성실한 협상으로 해결을 시도해야 합니다. 30일 이내 미해결 시 어느 당사자든 미국중재협회(AAA) 상사중재 규칙에 따른 구속력 있는 중재를 시작할 수 있습니다. 중재는 캘리포니아주 로스앤젤레스에서 진행됩니다.</p>",
        "<p><strong>11.4 집단 소송 포기.</strong> 법률이 허용하는 범위에서 귀하는 절차가 개별적으로만 진행되며 집단, 통합 또는 대표 소송으로 진행되지 않음에 동의합니다. 이 포기는 집단 소송 포기를 금지하는 소비자 보호법에 따른 청구에는 적용되지 않습니다.</p>",
        "<p><strong>11.5 ODR 플랫폼.</strong> EU 소비자는 유럽 위원회 온라인 분쟁 해결 플랫폼을 이용할 수 있습니다: https://ec.europa.eu/odr</p>",
      ],
    },
    {
      id: "terms-12",
      title: "12. 수출 통제 및 제재",
      paragraphs: [
        "귀하는 미국 수출관리규정(EAR), EU 이중용도 규정 2021/821 또는 UN 안전보장이사회 제재를 포함한 적용 수출 통제 법률을 위반하여 품목을 수출, 재수출 또는 이전하는 데 서비스를 사용해서는 안 됩니다. 금지 품목에는 군사품, 이중용도 품목 및 제재 국가 또는 단체 대상 품목이 포함됩니다.",
      ],
    },
    {
      id: "terms-13",
      title: "13. 아동 개인정보(COPPA 준수)",
      paragraphs: [
        "당사는 아동 온라인 개인정보 보호법(COPPA) 및 전 세계 동등 법률을 준수합니다. 당사는 검증 가능한 부모 동의 없이 13세 미만 아동으로부터 고의로 개인정보를 수집하지 않습니다. 부모 동의 없이 13세 미만 아동으로부터 개인정보를 수집한 사실을 알게 되면 즉시 해당 정보를 삭제합니다.",
        "자녀가 개인정보를 제공했다고 생각하는 부모 또는 후견인은 삭제를 요청하기 위해 당사에 연락할 수 있습니다.",
      ],
    },
    {
      id: "terms-14",
      title: "14. 종료",
      paragraphs: [
        "귀하는 계정 설정 또는 당사 연락을 통해 언제든지 계정을 종료할 수 있습니다. 당사는 본 약관 위반 시 즉시 계정을 종료하거나 정지할 수 있습니다. 종료 시 서비스 이용 권리는 즉시 소멸합니다. 성격상 종료 후에도 존속해야 하는 조항은 존속합니다.",
        "GDPR 제17조에 따라 개인 데이터 삭제를 요청할 권리가 있습니다. 법적 의무로 보관이 필요한 경우를 제외하고 30일 이내에 준수합니다.",
      ],
    },
    {
      id: "terms-15",
      title: "15. 위치 정보 및 서비스 가용성",
      paragraphs: [
        "당사는 위치 정보 기술을 사용하여 접근 국가를 확인합니다. 서비스는 접근을 구성한 국가에서만 이용 가능합니다. 이는 수출 통제, 연령 확인 요건 및 세금 의무를 포함한 법적 준수에 필요합니다.",
        "당사는 법적 요건, 제재 또는 기타 규정 준수 고려에 따라 특정 국가 또는 지역에서의 접근을 제한할 수 있습니다. 위치 정보 제한 우회 시도는 본 약관 위반입니다.",
      ],
    },
    {
      id: "terms-16",
      title: "16. 연락처",
      paragraphs: [
        "법적 통지, 개인정보 요청, DMCA 삭제 또는 일반 문의:",
        "<p><strong>Ramen Anime 법무팀</strong><br />이메일: legal@ramenanime.app<br />주소: Ramen Anime, 123 Anime Street, Los Angeles, CA 90001, USA</p>",
        "<p><strong>데이터 보호 책임자(EU/영국):</strong><br />이메일: dpo@ramenanime.app</p>",
        "<p><strong>감독 기관(EU):</strong><br />거주 지역의 데이터 보호 당국에 불만을 제기할 권리가 있습니다.</p>",
      ],
    },
  ],
};

export const legalKo = {
  legalPrivacy: privacy,
  legalTerms: terms,
};
