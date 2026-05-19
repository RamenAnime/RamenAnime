import type { LegalDocumentContent } from "./legal-types";

export const privacy: LegalDocumentContent = {
  quickSummaryTitle: "简要摘要",
  quickSummaryBody:
    "我们仅收集运营服务所必需的最少数据。我们不出售您的个人数据。我们采用行业标准加密。您有权访问、更正和删除您的数据。我们最多保留数据 {{dataRetentionDays}} 天。",
  lastUpdated: "2025年5月2日",
  sections: [
    {
      id: "privacy-1",
      title: "1. 引言与适用范围",
      paragraphs: [
        '本隐私政策说明 Ramen Anime（"我们"或"我方"）在您使用我们的网站、移动应用程序、市场、社交论坛及相关服务（统称"服务"）时，如何收集、使用、存储、共享和保护您的个人信息。',
        "本政策符合 {{privacyLaw}}，适用于全球所有用户。根据您所在地区，您可能享有第 10 条所述的额外权利。",
        "使用我们的服务即表示您同意本政策所述的做法。如不同意，请勿使用服务。",
      ],
    },
    {
      id: "privacy-2",
      title: "2. 我们收集的信息",
      paragraphs: [
        "<p><strong>2.1 您直接提供的信息：</strong></p>",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>账户信息：</strong> 用户名、电子邮箱、密码（以成本因子 12 的 bcrypt 哈希存储）</li><li><strong>个人资料信息：</strong> 显示名称、简介、头像、所在地、兴趣（均为可选）</li><li><strong>市场信息：</strong> 收货地址、支付方式令牌（由 Stripe/PayPal 处理，我们从不存储完整卡号）</li><li><strong>论坛内容：</strong> 您创建的帖子、评论和消息</li><li><strong>通信记录：</strong> 客户支持咨询、反馈</li><li><strong>年龄验证：</strong> 年龄确认、针对年龄限制内容的可选身份验证</li></ul>',
        "<p><strong>2.2 自动收集的信息：</strong></p>",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>设备信息：</strong> IP 地址、浏览器类型、操作系统、设备标识符</li><li><strong>使用数据：</strong> 访问页面、使用功能、停留时间、点击模式</li><li><strong>地理位置：</strong> 根据 IP 地址推导的国家/地区，用于合规（增值税计算、年龄验证、出口管制）</li><li><strong>Cookie 及类似技术：</strong> 见第 8 条（Cookie 政策）</li></ul>',
        "<p><strong>2.3 来自第三方的信息：</strong></p>",
        '<ul class="list-disc pl-5 space-y-1"><li>支付处理商（Stripe、PayPal）：交易确认、卡号后四位</li><li>身份验证服务（如使用 OAuth）</li><li>反欺诈服务</li></ul>',
      ],
    },
    {
      id: "privacy-3",
      title: "3. 我们如何使用您的信息",
      paragraphs: [
        "我们将您的个人数据用于以下目的：",
        '<table class="w-full text-xs border-collapse my-4"><thead><tr class="border-b"><th class="text-left py-2">目的</th><th class="text-left py-2">法律依据（GDPR）</th><th class="text-left py-2">使用的数据</th></tr></thead><tbody class="space-y-2"><tr class="border-b border-border/50"><td class="py-2">账户创建与管理</td><td>合同履行</td><td>用户名、邮箱、密码哈希</td></tr><tr class="border-b border-border/50"><td class="py-2">服务提供</td><td>合同履行</td><td>个人资料、论坛帖子、偏好设置</td></tr><tr class="border-b border-border/50"><td class="py-2">支付处理</td><td>合同履行</td><td>支付令牌、交易记录</td></tr><tr class="border-b border-border/50"><td class="py-2">税务合规</td><td>法定义务</td><td>交易数据、国家/地区、增值税记录</td></tr><tr class="border-b border-border/50"><td class="py-2">安全与反欺诈</td><td>合法利益</td><td>IP 地址、设备信息、使用模式</td></tr><tr class="border-b border-border/50"><td class="py-2">年龄验证</td><td>法定义务</td><td>年龄声明、可选身份证件</td></tr><tr class="border-b border-border/50"><td class="py-2">法律合规（出口管制、制裁）</td><td>法定义务</td><td>国家/地区、交易详情</td></tr><tr class="border-b border-border/50"><td class="py-2">服务改进</td><td>合法利益</td><td>汇总的使用分析</td></tr><tr class="border-b border-border/50"><td class="py-2">客户支持</td><td>合同履行</td><td>账户数据、通信记录</td></tr><tr><td class="py-2">营销（仅经同意）</td><td>同意</td><td>邮箱、偏好设置</td></tr></tbody></table>',
      ],
    },
    {
      id: "privacy-4",
      title: "4. 我们如何共享您的信息",
      paragraphs: [
        "我们不出售您的个人数据。我们仅在以下情况下共享数据：",
        '<ul class="list-disc pl-5 space-y-2"><li><strong>服务提供商：</strong> 支付处理商（Stripe、PayPal）、托管提供商（Render）、电子邮件服务、分析提供商。均受数据处理协议约束。</li><li><strong>其他用户：</strong> 根据服务设计，您的个人资料信息和论坛帖子对其他用户可见。</li><li><strong>法律要求：</strong> 法律、法院命令或政府机构要求时。除非法律禁止，我们将通知您。</li><li><strong>业务转让：</strong> 与合并、收购或资产出售相关，并会通知用户。</li><li><strong>经您同意：</strong> 用于您明确授权的任何目的。</li></ul>',
      ],
    },
    {
      id: "privacy-5",
      title: "5. 数据保留与删除",
      paragraphs: [
        "我们在实现本政策所述目的所需的期限内保留个人数据：",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>账户数据：</strong> 直至账户删除，或连续 {{dataRetentionDays}} 天未活动</li><li><strong>交易记录：</strong> {{transactionRetentionDays}} 天（税务/法律要求）</li><li><strong>论坛帖子：</strong> 直至用户删除或账户关闭</li><li><strong>日志文件：</strong> 90 天</li><li><strong>Cookie 同意记录：</strong> 2 年</li></ul>',
        "收到账户删除请求后，我们将在 30 天内删除或匿名化您的个人数据，法律要求保留的除外（如税务目的的交易记录）。",
      ],
    },
    {
      id: "privacy-6",
      title: "6. 数据安全",
      paragraphs: [
        "我们实施行业标准的安全措施：",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>加密：</strong> 传输中所有数据采用 TLS 1.3；静态数据采用 AES-256</li><li><strong>密码：</strong> bcrypt 哈希，成本因子 12（64 字节/512 位输出）</li><li><strong>身份验证：</strong> 使用 httpOnly Cookie 的 JWT 令牌；会话有效期 1 年</li><li><strong>访问控制：</strong> 基于角色的访问（用户/管理员）；最小权限原则</li><li><strong>监控：</strong> 自动记录访问尝试；异常检测</li><li><strong>泄露响应：</strong> 如发生数据泄露，我们将在 {{privacyLaw}} 要求的 {{breachNotificationHours}} 小时内通知受影响用户。</li></ul>',
      ],
    },
    {
      id: "privacy-7",
      title: "7. 国际数据传输",
      paragraphs: [
        "您的数据存储于美国服务器。对于欧盟/欧洲经济区、英国及其他要求数据传输保护的司法管辖区的用户：",
        '<ul class="list-disc pl-5 space-y-1"><li>我们使用欧盟委员会批准的标准合同条款（SCC）</li><li>对于向英国传输，我们遵守 SCC 英国附录</li><li>我们持续关注充分性决定及影响传输的法律动态</li><li>所有传输均通过传输加密（TLS 1.3）保护</li></ul>',
      ],
    },
    {
      id: "privacy-8",
      title: "8. Cookie 政策",
      paragraphs: [
        "我们按以下方式使用 Cookie 及类似技术：",
        '<table class="w-full text-xs border-collapse my-4"><thead><tr class="border-b"><th class="text-left py-2">类别</th><th class="text-left py-2">目的</th><th class="text-left py-2">期限</th><th class="text-left py-2">是否必需？</th></tr></thead><tbody><tr class="border-b border-border/50"><td class="py-2">必需</td><td>身份验证、安全、会话管理</td><td>会话至 1 年</td><td>是（不可禁用）</td></tr><tr class="border-b border-border/50"><td class="py-2">偏好</td><td>语言选择、主题、显示设置</td><td>1 年</td><td>否</td></tr><tr class="border-b border-border/50"><td class="py-2">分析</td><td>服务改进、使用统计</td><td>1 年</td><td>否</td></tr><tr><td class="py-2">营销</td><td>个性化推荐（经同意时）</td><td>1 年</td><td>否</td></tr></tbody></table>',
        "{{cookieConsentNote}}",
      ],
    },
    {
      id: "privacy-9",
      title: "9. 儿童隐私",
      paragraphs: [
        "我们遵守 COPPA（美国）、GDPR 关于儿童的要求（欧盟）及全球同等法律。我们的服务不面向 13 岁以下儿童。",
        "未经 {{parentalConsentPhrase}}，我们不会故意收集 {{ageOfConsent}} 岁以下儿童的个人信息。如您为家长或监护人，认为孩子在未经同意的情况下提供了个人信息，请立即联系我们，我们将删除相关信息。",
        "我们服务中设有年龄限制的部分（社交论坛、市场）要求用户确认年满 18 周岁。",
      ],
    },
    {
      id: "privacy-10",
      title: "10. 您的隐私权利",
      paragraphs: [
        "根据您所在地区，您可能享有以下权利：",
        '<table class="w-full text-xs border-collapse my-4"><thead><tr class="border-b"><th class="text-left py-2">权利</th><th class="text-left py-2">说明</th><th class="text-left py-2">适用地区</th></tr></thead><tbody><tr class="border-b border-border/50"><td class="py-2">访问</td><td>请求获取个人数据副本</td><td>所有司法管辖区</td></tr><tr class="border-b border-border/50"><td class="py-2">更正</td><td>请求更正不准确的数据</td><td>所有司法管辖区</td></tr><tr class="border-b border-border/50"><td class="py-2">删除（被遗忘权）</td><td>请求删除您的数据</td><td>{{rightToBeForgottenDetail}}</td></tr><tr class="border-b border-border/50"><td class="py-2">可携带性</td><td>以结构化、机器可读格式接收数据</td><td>{{dataPortabilityDetail}}</td></tr><tr class="border-b border-border/50"><td class="py-2">反对</td><td>反对基于合法利益的处理</td><td>欧盟、英国、巴西、韩国</td></tr><tr class="border-b border-border/50"><td class="py-2">限制处理</td><td>请求限制处理</td><td>欧盟、英国、巴西</td></tr><tr class="border-b border-border/50"><td class="py-2">撤回同意</td><td>随时撤回同意</td><td>所有司法管辖区（以同意为法律依据时）</td></tr><tr><td class="py-2">投诉</td><td>向监管机构投诉</td><td>欧盟、英国、巴西、韩国</td></tr></tbody></table>',
        "如需行使任何权利，请发送邮件至 privacy@ramenanime.app。我们将在 30 天内回复。",
      ],
    },
    {
      id: "privacy-11",
      title: "11. 自动化决策与画像分析",
      paragraphs: [
        "除以下情形外，我们不进行会对您产生法律效力的画像分析或自动化决策：",
        '<ul class="list-disc pl-5 space-y-1"><li>欺诈检测与防范算法</li><li>论坛帖子的垃圾信息/内容过滤自动化</li><li>基于地理位置的访问控制与税费计算</li></ul>',
        "这些系统不会导致对您法律权利产生重大影响的自动化决策。对争议决定可进行人工复核。",
      ],
    },
    {
      id: "privacy-12",
      title: "12. 本政策的变更",
      paragraphs: [
        '我们可能定期更新本隐私政策。重大变更将至少在生效前 30 天通过电子邮件或显著通知告知您。变更后继续使用即视为接受。顶部的"最后更新"日期表示最近修订日期。',
      ],
    },
    {
      id: "privacy-13",
      title: "13. 联系我们",
      paragraphs: [
        "<p><strong>数据保护官：</strong> dpo@ramenanime.app</p>",
        "<p><strong>隐私咨询：</strong> privacy@ramenanime.app</p>",
        "<p><strong>邮寄地址：</strong><br />Ramen Anime Privacy Office<br />123 Anime Street<br />Los Angeles, CA 90001<br />United States</p>",
        "<p><strong>欧盟监管机构：</strong> 您有权向当地数据保护机构投诉。名单见：https://edpb.europa.eu/about-edpb/board/members</p>",
      ],
    },
  ],
};

export const terms: LegalDocumentContent = {
  quickSummaryTitle: "",
  quickSummaryBody: "",
  lastUpdated: "2025年5月2日",
  sections: [
    {
      id: "terms-1",
      title: "1. 接受条款",
      paragraphs: [
        '访问或使用 Ramen Anime（"Ramen Anime"、"我们"或"我方"），包括我们的网站、移动应用程序、市场、社交论坛及任何相关服务（统称"服务"），即表示您同意受本服务条款（"条款"）约束。如不同意本条款，不得访问或使用服务。',
        "本条款构成您与 Ramen Anime 之间具有法律约束力的协议。我们保留随时修改本条款的权利。变更自发布之日起立即生效。变更后继续使用服务即视为接受修订后的条款。根据适用的消费者保护法，重大变更将至少在生效前 30 天通过电子邮件或服务上的显著通知告知您。",
        "如您从欧盟访问服务，本条款由我们的欧盟专用条款补充。如您为加利福尼亚州居民，您在《加州消费者隐私法》（CCPA）及《加州隐私权法》（CPRA）项下的权利不受影响，本条款不限制该等权利。",
      ],
    },
    {
      id: "terms-2",
      title: "2. 资格与账户注册",
      paragraphs: [
        "<p><strong>2.1 年龄要求。</strong> 您须年满 18 周岁方可创建账户并使用全部服务，包括 Ramen Anime 市场及社交论坛。如未满 18 周岁，仅在父母或法定监护人参与并同意的情况下，方可使用不涉及用户间互动的一般商店功能。创建账户即表示您声明并保证符合上述年龄要求。</p>",
        "<p><strong>2.2 家长同意。</strong> 根据 {{privacyLaw}}，如未满 {{ageOfConsent}} 周岁，我们在收集、使用或披露您的个人信息前须获得可验证的家长同意。我们采用电子邮件验证及后续确认作为家长同意机制，符合 COPPA（如在美国）及同等框架。</p>",
        "<p><strong>2.3 账户安全。</strong> 您有责任对账户凭证保密，并对账户下发生的所有活动负责。如发现未经授权的使用，须立即通知我们。我们实施行业标准安全措施，包括成本因子 12 的 bcrypt 密码哈希、所有传输数据的 HTTPS/TLS 1.3 加密，以及基于 httpOnly Cookie 的 JWT 会话管理。</p>",
        "<p><strong>2.4 账户终止。</strong> 我们保留自行决定因违反本条款、非法活动或为保护社区而暂停或终止您账户的权利。在欧盟，您有权随时终止账户并根据 GDPR 第 17 条请求删除数据。</p>",
      ],
    },
    {
      id: "terms-3",
      title: "3. 隐私与数据保护",
      paragraphs: [
        "您的隐私受我们的隐私政策管辖，该政策通过引用纳入本条款。我们的数据处理符合 {{privacyLaw}}。",
        "<p><strong>3.1 数据收集。</strong> 我们收集：(a) 账户信息（用户名、邮箱、密码哈希）；(b) 您自愿提供的个人资料信息；(c) 市场购买的交易数据；(d) 论坛帖子与评论；(e) 用于安全与地理位置合规的 IP 地址及设备信息；(f) Cookie 政策详述的 Cookie 及类似技术。</p>",
        "<p><strong>3.2 处理的法律依据（GDPR/LGPD）。</strong> 对于要求法律依据的司法管辖区的用户，我们基于以下依据处理个人数据：(a) 合同履行（提供服务）；(b) 合法利益（安全、反欺诈）；(c) 法定义务（税务申报、执法请求）；(d) 同意（营销通信、可选功能）。</p>",
        "<p><strong>3.3 您的权利。</strong> 根据您所在司法管辖区，您可能有权：访问数据、更正不准确信息、删除账户及数据（被遗忘权）、反对处理、数据可携带性、撤回同意，以及向监管机构投诉。行使上述权利请联系第 16 条所列联系方式。</p>",
        "<p><strong>3.4 数据保留。</strong> 我们保留您的个人数据 {{dataRetentionDays}} 天，或在实现收集目的、履行法定义务、解决争议及执行协议所需的期限内保留。期满后，数据将被安全删除或匿名化。</p>",
        "<p><strong>3.5 国际传输。</strong> 您的数据可能被传输至您居住国以外的国家/地区并在当地处理，包括我们服务器所在的美国。对于来自欧盟/欧洲经济区、英国或其他要求充分性保护的司法管辖区的传输，我们实施欧盟委员会批准的标准合同条款（SCC）。</p>",
      ],
    },
    {
      id: "terms-4",
      title: "4. 市场条款",
      paragraphs: [
        "<p><strong>4.1 市场性质。</strong> Ramen Anime 市场是连接动漫商品买卖双方的平台。我们不是用户间交易的当事方。我们不取得所售商品的所有权，也不保证所列商品的质量、安全性或合法性。</p>",
        "<p><strong>4.2 卖家义务。</strong> 卖家须：(a) 准确描述商品；(b) 遵守商品销售相关的所有适用法律；(c) 不得销售违禁商品，包括假冒商品、武器、受管制物质或侵犯知识产权的商品；(d) 在指定期限内发货；(e) 按所在司法管辖区要求收取并缴纳所有适用税费。</p>",
        "<p><strong>4.3 买家义务。</strong> 买家须：(a) 及时付款；(b) 不得进行欺诈性拒付；(c) 在收货后 30 天内报告问题。买家有责任了解其所在国家/地区的进口限制及关税。</p>",
        "<p><strong>4.4 违禁商品。</strong> 不得销售：假冒商品、武器或武器仿制品、成人内容材料、宣扬仇恨或暴力的商品、赃物、受出口管制的商品（军事/军民两用），以及买方或卖方当地法律禁止的任何商品。</p>",
        "<p><strong>4.5 争议解决。</strong> 买卖双方争议须首先通过我们的内部争议程序解决。如 14 日内未解决，可提交调解。欧盟用户亦可使用欧洲在线争议解决（ODR）平台。</p>",
        "<p><strong>4.6 税务合规。</strong> Ramen Anime 上显示的价格根据您所在地区可能含或不含增值税/税费。我们通过税务引擎根据买方国家/地区自动计算并显示适用税费。卖家有责任将收取的税费缴纳至当地税务机关。我们提供交易记录以协助税务申报。</p>",
        "<p><strong>4.7 平台费用。</strong> 我们对已完成交易收取平台费用。当前费率：标准卖家为商品价格的 8%，认证卖家为 5%。费用变更须提前 30 天通知。</p>",
      ],
    },
    {
      id: "terms-5",
      title: "5. 增值税、商品服务税与税务合规",
      paragraphs: [
        "<p><strong>5.1 税费征收。</strong> 在要求市场平台代征税费的司法管辖区，Ramen Anime 作为市场促进者运营。我们按法律要求自动计算、收取并缴纳适用税费，包括增值税（欧盟/英国）、商品服务税（澳大利亚、加拿大、新加坡）、消费税（日本）及美国州销售税。</p>",
        "<p><strong>5.2 欧盟增值税。</strong> 对于欧盟成员国的买家，按买方居住国适用税率征收增值税。这遵循欧盟增值税电子商务规则（理事会指令 2017/2455 及 2019/1995）。卖家无需就欧盟市场销售单独进行增值税登记。</p>",
        "<p><strong>5.3 英国增值税。</strong> 对于英国买家，数字服务及适用商品适用 20% 英国增值税。这遵循脱欧后英国增值税电子商务规定。</p>",
        "<p><strong>5.4 美国销售税。</strong> 我们在具有经济关联或适用市场促进者法的美国各州征收销售税。无销售税的州的买家不会被收取。</p>",
        "<p><strong>5.5 数字服务税。</strong> 在设有数字服务税（DST）的司法管辖区，适用税费计入平台费用计算并按要求缴纳。</p>",
        "<p><strong>5.6 税务记录。</strong> 我们向卖家提供交易级税务报告。买家在需要时收到税务发票。我们按适用税法要求保留税务记录 {{taxRecordRetentionYears}} 年。</p>",
        "<p><strong>5.7 出口关税。</strong> 对于国际运输，买方须承担其国家/地区征收的进口关税、海关费用或关税。除非明确说明，这些费用不包含在购买价格中。</p>",
      ],
    },
    {
      id: "terms-6",
      title: "6. 社交论坛与用户内容",
      paragraphs: [
        "<p><strong>6.1 内容所有权。</strong> 您保留对论坛、个人资料及评论中所发布内容的所有权。发布即授予我们全球性、非独占、免版税许可，以运营及推广服务为目的使用、复制、修改、改编、发布和展示该等内容。</p>",
        "<p><strong>6.2 内容标准。</strong> 您不得发布以下内容：(a) 违法、有害、威胁、辱骂、骚扰、诽谤或侵犯隐私；(b) 侵犯知识产权；(c) 包含恶意软件或有害代码；(d) 促进非法活动；(e) 包含露骨性内容（本平台面向一般受众，提供动漫相关内容）；(f) 构成垃圾信息或未经授权的广告。</p>",
        "<p><strong>6.3 内容审核。</strong> 我们保留删除违反本条款内容的权利。我们采用自动化系统及人工审核员。我们的审核决定为最终决定。根据欧盟《数字服务法》（DSA），您有权对审核决定提出申诉。</p>",
        "<p><strong>6.4 年龄限制内容。</strong> 部分论坛版块需要年龄验证。您不得试图规避年龄验证系统。提供虚假年龄信息将导致账户立即终止。</p>",
      ],
    },
    {
      id: "terms-7",
      title: "7. 知识产权",
      paragraphs: [
        "<p><strong>7.1 我们的知识产权。</strong> 服务，包括我们提供的所有软件、设计、标识、商标及内容，归 Ramen Anime 或我们的许可方所有，受版权、商标及其他知识产权法保护。未经事先书面同意，您不得使用我们的商标。</p>",
        "<p><strong>7.2 DMCA / 通知与删除。</strong> 我们遵守《数字千年版权法》（DMCA）及其他司法管辖区的同等通知与删除程序。如您认为内容侵犯您的版权，请向第 16 条联系方式提交删除通知，包括：(a) 您的联系信息；(b) 受版权保护作品的标识；(c) 侵权材料的标识；(d) 善意信念声明；(e) 伪证处罚下的声明；(f) 您的电子签名。</p>",
        "<p><strong>7.3 反通知。</strong> 如因 DMCA 通知导致内容被删除，您可提交反通知。我们将转交原投诉人，除非提起诉讼，否则将在 10 个工作日后恢复内容。</p>",
      ],
    },
    {
      id: "terms-8",
      title: "8. 支付处理",
      paragraphs: [
        "支付通过第三方支付处理商（Stripe、PayPal）处理。购买即表示您同意其条款。我们不存储完整支付卡号。PCI DSS 合规由我们的支付处理商维护。",
        "退款按我们的退款政策处理：(a) 数字商品：下载后不可退款；(b) 实物商品：根据欧盟消费者权利指令享有 14 天退货期；(c) 市场商品：适用卖家退货政策，平台可提供调解。",
      ],
    },
    {
      id: "terms-9",
      title: "9. 禁止行为",
      paragraphs: [
        "您不得：(a) 将服务用于任何非法目的；(b) 试图未经授权访问服务的任何部分；(c) 干扰或破坏服务；(d) 未经授权使用自动化系统（机器人、爬虫）；(e) 收集用户数据；(f) 冒充任何个人或实体；(g) 规避地理位置或年龄验证；(h) 从事洗钱或恐怖主义融资；(i) 违反出口管制法律；(j) 未经授权转售或商业利用服务。",
      ],
    },
    {
      id: "terms-10",
      title: "10. 责任限制",
      paragraphs: [
        '<p><strong>10.1 免责声明。</strong> 服务按"现状"和"可用"基础提供，不作任何明示或暗示保证，包括但不限于适销性、特定用途适用性及不侵权保证。</p>',
        "<p><strong>10.2 责任上限。</strong> 在法律允许的最大范围内，我们的总责任不超过您在提出索赔前 12 个月内向我们支付的金额或 100 美元（以较高者为准）。此限制不适用于：(a) 重大过失或故意不当行为；(b) 死亡或人身伤害；(c) 欺诈；(d) 消费者保护法禁止的情形。</p>",
        "<p><strong>10.3 欧盟消费者例外。</strong> 如您为欧盟消费者，欧盟法律规定的法定消费者权利（包括《消费者销售及担保指令》项下的权利）不受上述限制影响。</p>",
        "<p><strong>10.4 不可抗力。</strong> 对于超出我们合理控制范围的情况导致的故障，我们不承担责任，包括自然灾害、战争、恐怖主义、骚乱、禁运、民政或军事当局行为、火灾、洪水、事故、罢工，或运输、设施、燃料、能源、劳动力或材料短缺。</p>",
      ],
    },
    {
      id: "terms-11",
      title: "11. 争议解决与适用法律",
      paragraphs: [
        "<p><strong>11.1 适用法律。</strong> 本条款受美国加利福尼亚州法律管辖，不适用法律冲突原则，但您居住国强制性消费者保护法另有规定的除外。</p>",
        "<p><strong>11.2 欧盟用户。</strong> 如您为欧盟消费者，您额外享有欧盟成员国强制性消费者保护法的利益。任何争议可在您居住地法院提起。</p>",
        "<p><strong>11.3 仲裁（美国用户）。</strong> 对于美国用户，任何争议应首先通过善意协商解决。如 30 日内未解决，任何一方可根据美国仲裁协会（AAA）商事仲裁规则提起具有约束力的仲裁。仲裁在加利福尼亚州洛杉矶进行。</p>",
        "<p><strong>11.4 集体诉讼弃权。</strong> 在法律允许的范围内，您同意任何程序仅以个人名义进行，不得作为集体、合并或代表诉讼进行。此弃权不适用于禁止集体诉讼弃权的消费者保护法项下的索赔。</p>",
        "<p><strong>11.5 ODR 平台。</strong> 欧盟消费者可使用欧盟委员会在线争议解决平台：https://ec.europa.eu/odr</p>",
      ],
    },
    {
      id: "terms-12",
      title: "12. 出口管制与制裁",
      paragraphs: [
        "您不得违反适用的出口管制法律使用服务出口、再出口或转让物品，包括美国《出口管理条例》（EAR）、欧盟军民两用物项条例 2021/821 或联合国安理会制裁。违禁物品包括军事物资、军民两用物品以及运往受制裁国家/地区或实体的物品。",
      ],
    },
    {
      id: "terms-13",
      title: "13. 儿童隐私（COPPA 合规）",
      paragraphs: [
        "我们遵守《儿童在线隐私保护法》（COPPA）及全球同等法律。未经可验证的家长同意，我们不会故意收集 13 岁以下儿童的个人信息。如我们发现未经家长同意收集了 13 岁以下儿童的个人信息，将立即删除。",
        "认为子女向我们提供了个人信息的家长或监护人可联系我们请求删除。",
      ],
    },
    {
      id: "terms-14",
      title: "14. 终止",
      paragraphs: [
        "您可随时通过账户设置或联系我们终止账户。我们可因违反本条款立即终止或暂停您的账户。终止后，您使用服务的权利立即停止。依其性质应在终止后继续有效的条款继续有效。",
        "根据 GDPR 第 17 条，您有权请求删除个人数据。除非法律义务要求保留，我们将在 30 天内予以配合。",
      ],
    },
    {
      id: "terms-15",
      title: "15. 地理位置与服务可用性",
      paragraphs: [
        "我们使用地理位置技术确定您的访问国家/地区。服务仅在我们已配置允许访问的国家/地区提供。这对于出口管制、年龄验证要求及税务义务等法律合规是必要的。",
        "我们可基于法律要求、制裁或其他合规考虑限制来自特定国家/地区的访问。试图规避地理位置限制违反本条款。",
      ],
    },
    {
      id: "terms-16",
      title: "16. 联系信息",
      paragraphs: [
        "法律通知、隐私请求、DMCA 删除或一般咨询：",
        "<p><strong>Ramen Anime 法务部</strong><br />电子邮件：legal@ramenanime.app<br />地址：Ramen Anime, 123 Anime Street, Los Angeles, CA 90001, USA</p>",
        "<p><strong>数据保护官（欧盟/英国）：</strong><br />电子邮件：dpo@ramenanime.app</p>",
        "<p><strong>监管机构（欧盟）：</strong><br />您有权向当地数据保护机构投诉。</p>",
      ],
    },
  ],
};

export const legalZh = {
  legalPrivacy: privacy,
  legalTerms: terms,
};
