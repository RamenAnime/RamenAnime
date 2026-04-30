import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: { home: 'Home', shop: 'Shop', prints3d: '3D Prints', cards: 'Trading Cards', contact: 'Contact', social: 'Social Forum', login: 'Join / Login', terms: 'Terms', friends: 'Friends', profile: 'Profile', marketplace: 'Marketplace' },
      hero: { title: 'Ramen Anime', subtitle: 'Your one-stop shop for custom 3D printed anime goods and trading cards. Handcrafted with passion. Shipped with care.', shopNow: 'Shop Now', joinCommunity: 'Join Community' },
      features: { prints: 'Custom 3D Prints', printsDesc: 'Made to order anime-themed prints with premium PLA and resin', cards: 'Trading Cards', cardsDesc: 'Pokemon, One Piece, Naruto, Dragon Ball, Yu-Gi-Oh & more', shipping: 'Fast Shipping', shippingDesc: 'Quick dispatch on all orders with tracking', verified: 'eBay Verified', verifiedDesc: 'Trusted seller with 100+ positive reviews' },
      products: { title: 'Our Products', subtitle: 'Shop Collection', viewAll: 'View All Products', orderNow: 'Order Now', viewOnEbay: 'View on eBay' },
      about: { title: 'About Us', subtitle: 'Passion for Anime & Gaming', desc: 'Ramen Anime is an online game shop run by a fellow anime fan and gamer. We create custom 3D printed anime merchandise and sell curated trading card collections on eBay. Every product is made and shipped with care by someone who genuinely loves this culture.', customers: 'Happy Customers', designs: '3D Print Designs', cardsListed: 'Cards Listed' },
      contact: { title: 'Contact Us', subtitle: 'Get In Touch', desc: 'Questions about an order? Custom 3D print request? Want to know what trading cards we have in stock? Reach out anytime.', email: 'Email', responseTime: 'Response Time', shippingFrom: 'Shipping', sendMessage: 'Send Message', name: 'Name', subject: 'Subject', message: 'Message' },
      footer: { shop: 'Shop', community: 'Community', getInTouch: 'Get in Touch', rights: 'All rights reserved.' },
      ageGate: { title: 'Age Verification Required', subtitle: 'You must be 18 or older to enter this site', desc: 'This website contains content related to collectible trading cards and anime merchandise. By entering, you confirm you are of legal age in your jurisdiction.', confirm: 'I am 18 or older', exit: 'Leave Site', readTerms: 'Read Terms of Service', readPrivacy: 'Read Privacy Policy', notice: 'By clicking "I am 18 or older", you agree to our Terms of Service and Privacy Policy.' },
      marketplace: { title: 'User Marketplace', subtitle: 'Buy & Sell Anime Goods', sellItem: 'Sell an Item', condition: 'Condition', price: 'Price', seller: 'Seller', contactSeller: 'Contact Seller', new: 'New', used: 'Used', likeNew: 'Like New' },
      forum: { title: 'Social Forum', subtitle: 'Connect with fellow anime fans', newPost: 'New Post', search: 'Search posts...', category: 'Category', noPosts: 'No posts yet', beFirst: 'Be the first to start a conversation!', comments: 'Comments', likes: 'Likes', views: 'Views', addComment: 'Add a Comment', postComment: 'Post Comment' },
      profile: { aboutMe: 'About Me', interests: 'Interests', profileSong: 'Profile Song', favAnime: 'Favorite Anime', favGames: 'Favorite Games', editProfile: 'Edit Profile', addFriend: 'Add Friend', friends: 'Friends', mood: 'Mood', location: 'Location', website: 'Website' },
      terms: { title: 'Terms of Service', acceptRequired: 'Terms of Service Required', acceptDesc: 'Before you can access the Ramen Anime Social Forum, you must read and accept our Terms of Service.', acceptBtn: 'I Accept the Terms', readFull: 'Read Full Terms' },
    }
  },
  ja: {
    translation: {
      nav: { home: 'ホーム', shop: 'ショップ', prints3d: '3Dプリント', cards: 'トレカ', contact: 'お問い合わせ', social: '掲示板', login: 'ログイン', terms: '規約', friends: '友達', profile: 'プロフィール', marketplace: 'マーケット' },
      hero: { title: 'ラーメンアニメ', subtitle: 'カスタム3Dプリントのアニメグッズとトレーディングカードの専門店。情熱を込めて作り、丁寧に発送します。', shopNow: '今すぐ購入', joinCommunity: 'コミュニティに参加' },
      features: { prints: 'カスタム3Dプリント', printsDesc: '高品質PLAとレジンで作るアニメテーマのプリント', cards: 'トレーディングカード', cardsDesc: 'ポケモン、ワンピース、ナルト、ドラゴンボール、遊戯王など', shipping: '速達配送', shippingDesc: 'すべての注文を追跡付きで迅速発送', verified: 'eBay認証', verifiedDesc: '100件以上の好評価を持つ信頼できる出品者' },
      products: { title: '商品一覧', subtitle: 'ショップコレクション', viewAll: 'すべての商品を見る', orderNow: '注文する', viewOnEbay: 'eBayで見る' },
      about: { title: '私たちについて', subtitle: 'アニメとゲームへの情熱', desc: 'ラーメンアニメは、アニメファン兼ゲーマーが運営するオンラインゲームショップです。カスタム3Dプリントのアニメグッズを制作し、eBayで厳選されたトレーディングカードコレクションを販売しています。', customers: '幸せなお客様', designs: '3Dプリントデザイン', cardsListed: '出品カード数' },
      contact: { title: 'お問い合わせ', subtitle: '連絡先', desc: '注文についての質問？カスタム3Dプリントの依頼？在庫のあるトレーディングカードを知りたい？いつでもお問い合わせください。', email: 'メール', responseTime: '返信時間', shippingFrom: '発送元', sendMessage: '送信', name: 'お名前', subject: '件名', message: 'メッセージ' },
      footer: { shop: 'ショップ', community: 'コミュニティ', getInTouch: 'お問い合わせ', rights: 'All rights reserved.' },
      ageGate: { title: '年齢確認が必要です', subtitle: '18歳以上であることを確認してください', desc: 'このウェブサイトには、トレーディングカードやアニメ関連商品に関するコンテンツが含まれています。入ることで、お住まいの地域で法的に成人であることを確認します。', confirm: '18歳以上です', exit: 'サイトを離れる', readTerms: '利用規約を読む', readPrivacy: 'プライバシーポリシーを読む', notice: '「18歳以上です」をクリックすることで、利用規約とプライバシーポリシーに同意したものとみなされます。' },
      marketplace: { title: 'ユーザーマーケット', subtitle: 'アニメグッズの売買', sellItem: '出品する', condition: '状態', price: '価格', seller: '出品者', contactSeller: '出品者に連絡', new: '新品', used: '中古', likeNew: 'ほぼ新品' },
      forum: { title: '掲示板', subtitle: '仲間のアニメファンとつながる', newPost: '新規投稿', search: '投稿を検索...', category: 'カテゴリ', noPosts: 'まだ投稿がありません', beFirst: '最初の投稿者になりましょう！', comments: 'コメント', likes: 'いいね', views: '閲覧数', addComment: 'コメントを追加', postComment: 'コメントを投稿' },
      profile: { aboutMe: '自己紹介', interests: '興味', profileSong: 'プロフィール曲', favAnime: '好きなアニメ', favGames: '好きなゲーム', editProfile: 'プロフィール編集', addFriend: '友達追加', friends: '友達', mood: '気分', location: '場所', website: 'ウェブサイト' },
      terms: { title: '利用規約', acceptRequired: '利用規約の同意が必要です', acceptDesc: 'ラーメンアニメの掲示板にアクセスする前に、利用規約を読んで同意してください。', acceptBtn: '規約に同意します', readFull: '規約全文を読む' },
    }
  },
  'zh-TW': {
    translation: {
      nav: { home: '首頁', shop: '商店', prints3d: '3D列印', cards: '交易卡', contact: '聯繫我們', social: '社交論壇', login: '加入/登入', terms: '條款', friends: '好友', profile: '個人檔案', marketplace: '市集' },
      hero: { title: '拉麵動漫', subtitle: '您的一站式客製化3D列印動漫商品與交易卡商店。用心製作，細心出貨。', shopNow: '立即購買', joinCommunity: '加入社群' },
      features: { prints: '客製化3D列印', printsDesc: '使用優質PLA和樹脂訂製動漫主題列印', cards: '交易卡', cardsDesc: '寶可夢、航海王、火影忍者、七龍珠、遊戲王等', shipping: '快速出貨', shippingDesc: '所有訂單快速出貨並附追蹤號碼', verified: 'eBay認證', verifiedDesc: '擁有100+正面評價的值得信賴賣家' },
      products: { title: '我們的商品', subtitle: '商店精選', viewAll: '查看所有商品', orderNow: '立即訂購', viewOnEbay: '在eBay查看' },
      about: { title: '關於我們', subtitle: '對動漫與遊戲的熱情', desc: '拉麵動漫是由動漫迷兼玩家經營的線上遊戲商店。我們製作客製化3D列印動漫商品，並在eBay上銷售精選交易卡系列。每件產品都由真正熱愛這種文化的人用心製作和出貨。', customers: '滿意顧客', designs: '3D列印設計', cardsListed: '上架卡片' },
      contact: { title: '聯繫我們', subtitle: '保持聯繫', desc: '有訂單問題？客製化3D列印需求？想了解我們有哪些交易卡庫存？隨時聯繫我們。', email: '電子郵件', responseTime: '回覆時間', shippingFrom: '出貨地', sendMessage: '發送訊息', name: '姓名', subject: '主旨', message: '訊息' },
      footer: { shop: '商店', community: '社群', getInTouch: '聯繫我們', rights: '版權所有。' },
      ageGate: { title: '需要年齡驗證', subtitle: '您必須年滿18歲才能進入本網站', desc: '本網站包含與收藏交易卡和動漫商品相關的內容。進入即表示您確認在您的司法管轄區已達法定年齡。', confirm: '我已年滿18歲', exit: '離開網站', readTerms: '閱讀服務條款', readPrivacy: '閱讀隱私政策', notice: '點擊「我已年滿18歲」即表示您同意我們的服務條款和隱私政策。' },
      marketplace: { title: '用戶市集', subtitle: '買賣動漫商品', sellItem: '出售商品', condition: '狀況', price: '價格', seller: '賣家', contactSeller: '聯繫賣家', new: '全新', used: '二手', likeNew: '近全新' },
      forum: { title: '社交論壇', subtitle: '與動漫愛好者交流', newPost: '發表新文章', search: '搜尋文章...', category: '分類', noPosts: '尚無文章', beFirst: '成為第一個發文的人！', comments: '留言', likes: '讚', views: '瀏覽次數', addComment: '新增留言', postComment: '發表留言' },
      profile: { aboutMe: '關於我', interests: '興趣', profileSong: '個人檔案歌曲', favAnime: '最愛動漫', favGames: '最愛遊戲', editProfile: '編輯個人檔案', addFriend: '加好友', friends: '好友', mood: '心情', location: '地點', website: '網站' },
      terms: { title: '服務條款', acceptRequired: '需要同意服務條款', acceptDesc: '在存取拉麵動漫社交論壇之前，您必須閱讀並同意我們的服務條款。', acceptBtn: '我同意條款', readFull: '閱讀完整條款' },
    }
  },
  'zh-CN': {
    translation: {
      nav: { home: '首页', shop: '商店', prints3d: '3D打印', cards: '集换卡', contact: '联系我们', social: '社交论坛', login: '加入/登录', terms: '条款', friends: '好友', profile: '个人资料', marketplace: '集市' },
      hero: { title: '拉面动漫', subtitle: '您的一站式定制3D打印动漫商品与集换卡商店。用心制作，细心发货。', shopNow: '立即购买', joinCommunity: '加入社区' },
      features: { prints: '定制3D打印', printsDesc: '使用优质PLA和树脂定制动漫主题打印', cards: '集换卡', cardsDesc: '宝可梦、海贼王、火影忍者、七龙珠、游戏王等', shipping: '快速发货', shippingDesc: '所有订单快速发货并附追踪号码', verified: 'eBay认证', verifiedDesc: '拥有100+正面评价的值得信赖卖家' },
      products: { title: '我们的商品', subtitle: '商店精选', viewAll: '查看所有商品', orderNow: '立即订购', viewOnEbay: '在eBay查看' },
      about: { title: '关于我们', subtitle: '对动漫与游戏的热情', desc: '拉面动漫是由动漫迷兼玩家经营的线上游戏商店。我们制作定制3D打印动漫商品，并在eBay上销售精选集换卡系列。每件产品都由真正热爱这种文化的人用心制作和发货。', customers: '满意顾客', designs: '3D打印设计', cardsListed: '上架卡片' },
      contact: { title: '联系我们', subtitle: '保持联系', desc: '有订单问题？定制3D打印需求？想了解我们有哪些集换卡库存？随时联系我们。', email: '电子邮件', responseTime: '回复时间', shippingFrom: '发货地', sendMessage: '发送消息', name: '姓名', subject: '主题', message: '消息' },
      footer: { shop: '商店', community: '社区', getInTouch: '联系我们', rights: '版权所有。' },
      ageGate: { title: '需要年龄验证', subtitle: '您必须年满18岁才能进入本网站', desc: '本网站包含与收藏集换卡和动漫商品相关的内容。进入即表示您确认在您的司法管辖区已达法定年龄。', confirm: '我已年满18岁', exit: '离开网站', readTerms: '阅读服务条款', readPrivacy: '阅读隐私政策', notice: '点击"我已年满18岁"即表示您同意我们的服务条款和隐私政策。' },
      marketplace: { title: '用户集市', subtitle: '买卖动漫商品', sellItem: '出售商品', condition: '状况', price: '价格', seller: '卖家', contactSeller: '联系卖家', new: '全新', used: '二手', likeNew: '近全新' },
      forum: { title: '社交论坛', subtitle: '与动漫爱好者交流', newPost: '发表新文章', search: '搜索文章...', category: '分类', noPosts: '暂无文章', beFirst: '成为第一个发帖的人！', comments: '评论', likes: '赞', views: '浏览次数', addComment: '添加评论', postComment: '发表评论' },
      profile: { aboutMe: '关于我', interests: '兴趣', profileSong: '个人资料歌曲', favAnime: '最爱动漫', favGames: '最爱游戏', editProfile: '编辑个人资料', addFriend: '加好友', friends: '好友', mood: '心情', location: '地点', website: '网站' },
      terms: { title: '服务条款', acceptRequired: '需要同意服务条款', acceptDesc: '在访问拉面动漫社交论坛之前，您必须阅读并同意我们的服务条款。', acceptBtn: '我同意条款', readFull: '阅读完整条款' },
    }
  },
  ko: {
    translation: {
      nav: { home: '홈', shop: '상점', prints3d: '3D프린트', cards: '트레이딩카드', contact: '문의', social: '소셜 포럼', login: '가입/로그인', terms: '약관', friends: '친구', profile: '프로필', marketplace: '마켓' },
      hero: { title: '라멘 애니메', subtitle: '맞춤형 3D 프린팅 애니메이션 굿즈와 트레이딩 카드 원스톱 샵. 열정으로 제작하고 정성껏 배송합니다.', shopNow: '지금 쇼핑', joinCommunity: '커뮤니티 참여' },
      features: { prints: '맞춤 3D 프린트', printsDesc: '프리미엄 PLA와 레진으로 제작하는 애니메이션 테마 프린트', cards: '트레이딩 카드', cardsDesc: '포켓몬, 원피스, 나루토, 드래곤볼, 유희왕 등', shipping: '빠른 배송', shippingDesc: '모든 주문 추적 가능한 빠른 발송', verified: 'eBay 인증', verifiedDesc: '100개 이상 긍정적 리뷰의 신뢰할 수 있는 판매자' },
      products: { title: '상품 목록', subtitle: '샵 컬렉션', viewAll: '모든 상품 보기', orderNow: '주문하기', viewOnEbay: 'eBay에서 보기' },
      about: { title: '회사 소개', subtitle: '애니메이션과 게임에 대한 열정', desc: '라멘 애니메는 애니메이션 팬이자 게이머가 운영하는 온라인 게임 샵입니다. 맞춤형 3D 프린팅 애니메이션 굿즈를 제작하고 eBay에서 엄선된 트레이딩 카드 컬렉션을 판매합니다.', customers: '행복한 고객', designs: '3D 프린트 디자인', cardsListed: '등록된 카드' },
      contact: { title: '문의하기', subtitle: '연락처', desc: '주문에 대한 질문? 맞춤 3D 프린트 요청? 재고 있는 트레이딩 카드가 궁금하신가요? 언제든지 문의해 주세요.', email: '이메일', responseTime: '응답 시간', shippingFrom: '배송지', sendMessage: '보내기', name: '이름', subject: '제목', message: '메시지' },
      footer: { shop: '상점', community: '커뮤니티', getInTouch: '문의하기', rights: 'All rights reserved.' },
      ageGate: { title: '연령 확인 필요', subtitle: '18세 이상이어야 사이트에 입장할 수 있습니다', desc: '이 웹사이트에는 수집용 트레이딩 카드 및 애니메이션 관련 상품 콘텐츠가 포함되어 있습니다. 입장함으로써 귀하의 관할권에서 법적으로 성인임을 확인합니다.', confirm: '18세 이상입니다', exit: '사이트 나가기', readTerms: '이용약관 읽기', readPrivacy: '개인정보처리방침 읽기', notice: '"18세 이상입니다"를 클릭하면 이용약관 및 개인정보처리방침에 동의하는 것입니다.' },
      marketplace: { title: '사용자 마켓', subtitle: '애니메 굿즈 사고팔기', sellItem: '상품 판매', condition: '상태', price: '가격', seller: '판매자', contactSeller: '판매자에게 연락', new: '새제품', used: '중고', likeNew: '거의 새제품' },
      forum: { title: '소셜 포럼', subtitle: '애니메이션 팬들과 연결', newPost: '새 글', search: '글 검색...', category: '카테고리', noPosts: '아직 글이 없습니다', beFirst: '첫 번째 작성자가 되세요!', comments: '댓글', likes: '좋아요', views: '조회수', addComment: '댓글 추가', postComment: '댓글 등록' },
      profile: { aboutMe: '자기소개', interests: '관심사', profileSong: '프로필 노래', favAnime: '좋아하는 애니', favGames: '좋아하는 게임', editProfile: '프로필 수정', addFriend: '친구 추가', friends: '친구', mood: '기분', location: '위치', website: '웹사이트' },
      terms: { title: '이용약관', acceptRequired: '이용약관 동의 필요', acceptDesc: '라멘 애니메 소셜 포럼에 접근하기 전에 이용약관을 읽고 동의해야 합니다.', acceptBtn: '약관에 동의합니다', readFull: '전체 약관 읽기' },
    }
  },
  fr: {
    translation: {
      nav: { home: 'Accueil', shop: 'Boutique', prints3d: 'Impressions 3D', cards: 'Cartes', contact: 'Contact', social: 'Forum Social', login: 'Rejoindre / Connexion', terms: 'CGU', friends: 'Amis', profile: 'Profil', marketplace: 'Marché' },
      hero: { title: 'Ramen Anime', subtitle: 'Votre boutique unique pour les articles anime imprimés en 3D et les cartes à collectionner. Fabriqués avec passion. Expédiés avec soin.', shopNow: 'Acheter', joinCommunity: 'Rejoindre' },
      features: { prints: 'Impressions 3D', printsDesc: 'Impressions sur thème anime en PLA et résine premium', cards: 'Cartes à Collectionner', cardsDesc: 'Pokemon, One Piece, Naruto, Dragon Ball, Yu-Gi-Oh et plus', shipping: 'Expédition Rapide', shippingDesc: 'Expédition rapide avec suivi pour toutes les commandes', verified: 'eBay Vérifié', verifiedDesc: 'Vendeur de confiance avec 100+ avis positifs' },
      products: { title: 'Nos Produits', subtitle: 'Collection Boutique', viewAll: 'Voir Tout', orderNow: 'Commander', viewOnEbay: 'Voir sur eBay' },
      about: { title: 'À Propos', subtitle: 'Passion pour l\'Anime et le Gaming', desc: 'Ramen Anime est une boutique en ligne dirigée par un fan d\'anime et gamer. Nous créons des articles anime imprimés en 3D et vendons des collections de cartes sur eBay.', customers: 'Clients Satisfaits', designs: 'Designs 3D', cardsListed: 'Cartes Listées' },
      contact: { title: 'Contactez-Nous', subtitle: 'Restez en Contact', desc: 'Questions sur une commande ? Demande d\'impression 3D personnalisée ? Contactez-nous à tout moment.', email: 'Email', responseTime: 'Temps de Réponse', shippingFrom: 'Expédition', sendMessage: 'Envoyer', name: 'Nom', subject: 'Sujet', message: 'Message' },
      footer: { shop: 'Boutique', community: 'Communauté', getInTouch: 'Contact', rights: 'Tous droits réservés.' },
      ageGate: { title: 'Vérification d\'Âge Requise', subtitle: 'Vous devez avoir 18 ans ou plus', desc: 'Ce site contient du contenu lié aux cartes à collectionner et articles anime. En entrant, vous confirmez être majeur dans votre juridiction.', confirm: 'J\'ai 18 ans ou plus', exit: 'Quitter', readTerms: 'Lire les CGU', readPrivacy: 'Lire la Politique', notice: 'En cliquant sur "J\'ai 18 ans ou plus", vous acceptez nos CGU et notre Politique de Confidentialité.' },
      marketplace: { title: 'Marché Utilisateur', subtitle: 'Achetez & Vendez', sellItem: 'Vendre', condition: 'État', price: 'Prix', seller: 'Vendeur', contactSeller: 'Contacter', new: 'Neuf', used: 'Occasion', likeNew: 'Comme Neuf' },
      forum: { title: 'Forum Social', subtitle: 'Connectez-vous avec les fans', newPost: 'Nouveau Post', search: 'Rechercher...', category: 'Catégorie', noPosts: 'Aucun post', beFirst: 'Soyez le premier !', comments: 'Commentaires', likes: 'J\'aime', views: 'Vues', addComment: 'Ajouter', postComment: 'Publier' },
      profile: { aboutMe: 'À Propos', interests: 'Intérêts', profileSong: 'Musique Profil', favAnime: 'Anime Préféré', favGames: 'Jeux Préférés', editProfile: 'Modifier', addFriend: 'Ajouter', friends: 'Amis', mood: 'Humeur', location: 'Lieu', website: 'Site Web' },
      terms: { title: 'Conditions d\'Utilisation', acceptRequired: 'Acceptation Requise', acceptDesc: 'Avant d\'accéder au forum, vous devez lire et accepter nos CGU.', acceptBtn: 'J\'accepte', readFull: 'Lire en Entier' },
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
