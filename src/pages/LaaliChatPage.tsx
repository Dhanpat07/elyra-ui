/**
 * LAALI Chat - AI-Powered Customer Support Chat
 * 
 * Super engaging, multilingual (Hindi, Hinglish, English, Regional)
 * Friendly, warm, curious - makes users want to keep chatting!
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  CreditCard,
  Zap,
  Phone,
  Mail,
  Clock,
  User,
  Heart,
  Star,
  ChevronDown,
  Check,
  Languages,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Calendar,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../lib';
import { useAuthContext } from '../contexts/AuthContext';
import { useChatMessages } from '../hooks/useSupabase';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'up' | 'down' | null;
}

// Quick reply chips shown after bot messages
interface QuickReply {
  text: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// LANGUAGE OPTIONS - International Support
// ═══════════════════════════════════════════════════════════════════════════

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

// UI Translations for each language
interface UITranslations {
  greeting: (name?: string) => string;
  placeholder: string;
  quickStart: string;
  online: string;
  thinking: string;
  madeWith: string;
  questions: {
    whatIs: string;
    pricing: string;
    getStarted: string;
    demo: string;
  };
  quickReplies: {
    tellMore: string;
    showPricing: string;
    bookDemo: string;
    howItWorks: string;
  };
}

const TRANSLATIONS: Record<string, UITranslations> = {
  auto: {
    greeting: (name) => `Hey${name ? ` ${name}` : ''}! 👋 I'm LAALI - your friendly assistant!\n\nHow can I help you today?\n\nWhether you want to know about pricing, see a demo, or just chat - I'm all ears! 🎧\n\n**What do you do?** Would love to know about your business! 😊`,
    placeholder: "Type in any language... 💬",
    quickStart: "Quick start - ask anything:",
    online: "Online 24/7",
    thinking: "Thinking...",
    madeWith: "Made with love in Bangalore",
    questions: { whatIs: "What is LAALI? 🤔", pricing: "Tell me pricing!", getStarted: "How to get started?", demo: "Show me a demo! ✨" },
    quickReplies: { tellMore: "Tell me more!", showPricing: "Show pricing", bookDemo: "Book a demo", howItWorks: "How does it work?" }
  },
  hinglish: {
    greeting: (name) => `Hey${name ? ` ${name}` : ''}! 👋 Main hoon LAALI - tumhari dost!\n\nAaj kaise madad kar sakti hoon?\n\nChahe pricing jaanna ho, demo dekhna ho, ya bas baatein karni ho - I'm all ears! 🎧\n\n**Aap kya karte ho?** Would love to know! 😊`,
    placeholder: "Kuch bhi poochho... Hindi, English! 💬",
    quickStart: "Quick start - kuch bhi pooch lo:",
    online: "Online 24/7",
    thinking: "Soch rahi hoon...",
    madeWith: "Made with pyaar in Bangalore",
    questions: { whatIs: "LAALI kya hai? 🤔", pricing: "Pricing batao!", getStarted: "Kaise shuru karein?", demo: "Demo dikhao! ✨" },
    quickReplies: { tellMore: "Aur batao!", showPricing: "Pricing dikhao", bookDemo: "Demo book karo", howItWorks: "Kaise kaam karta hai?" }
  },
  hi: {
    greeting: (name) => `नमस्ते${name ? ` ${name}` : ''}! 👋 मैं हूं LAALI - आपकी दोस्त!\n\nआज कैसे मदद कर सकती हूं?\n\nचाहे pricing जानना हो, demo देखना हो, या बस बात करनी हो - मैं सुन रही हूं! 🎧\n\n**आप क्या करते हैं?** जानना चाहूंगी! 😊`,
    placeholder: "कुछ भी पूछिए... 💬",
    quickStart: "जल्दी शुरू करें:",
    online: "24/7 ऑनलाइन",
    thinking: "सोच रही हूं...",
    madeWith: "बैंगलोर में प्यार से बनाया",
    questions: { whatIs: "LAALI क्या है? 🤔", pricing: "कीमत बताइए!", getStarted: "कैसे शुरू करें?", demo: "Demo दिखाइए! ✨" },
    quickReplies: { tellMore: "और बताइए!", showPricing: "कीमत दिखाइए", bookDemo: "डेमो बुक करें", howItWorks: "कैसे काम करता है?" }
  },
  en: {
    greeting: (name) => `Hey${name ? ` ${name}` : ''}! 👋 I'm LAALI - your friendly assistant!\n\nHow can I help you today?\n\nWhether you want to know about pricing, see a demo, or just chat - I'm all ears! 🎧\n\n**What do you do?** I'd love to know about your business! 😊`,
    placeholder: "Ask me anything... 💬",
    quickStart: "Quick start - ask anything:",
    online: "Online 24/7",
    thinking: "Thinking...",
    madeWith: "Made with love in Bangalore",
    questions: { whatIs: "What is LAALI? 🤔", pricing: "Tell me pricing!", getStarted: "How to get started?", demo: "Show me a demo! ✨" },
    quickReplies: { tellMore: "Tell me more!", showPricing: "Show pricing", bookDemo: "Book a demo", howItWorks: "How does it work?" }
  },
  es: {
    greeting: (name) => `¡Hola${name ? ` ${name}` : ''}! 👋 Soy LAALI - ¡tu asistente amigable!\n\n¿Cómo puedo ayudarte hoy?\n\nYa sea que quieras saber sobre precios, ver una demo, o simplemente charlar - ¡soy toda oídos! 🎧\n\n**¿A qué te dedicas?** ¡Me encantaría saber de tu negocio! 😊`,
    placeholder: "Pregúntame lo que quieras... 💬",
    quickStart: "Inicio rápido - pregunta lo que sea:",
    online: "En línea 24/7",
    thinking: "Pensando...",
    madeWith: "Hecho con amor en Bangalore",
    questions: { whatIs: "¿Qué es LAALI? 🤔", pricing: "¡Dime los precios!", getStarted: "¿Cómo empezar?", demo: "¡Muéstrame una demo! ✨" },
    quickReplies: { tellMore: "¡Cuéntame más!", showPricing: "Ver precios", bookDemo: "Reservar demo", howItWorks: "¿Cómo funciona?" }
  },
  fr: {
    greeting: (name) => `Salut${name ? ` ${name}` : ''}! 👋 Je suis LAALI - ton assistante sympa!\n\nComment puis-je t'aider aujourd'hui?\n\nQue tu veuilles connaître les prix, voir une démo, ou simplement discuter - je suis tout ouïe! 🎧\n\n**Que fais-tu?** J'adorerais en savoir plus sur ton entreprise! 😊`,
    placeholder: "Demande-moi n'importe quoi... 💬",
    quickStart: "Démarrage rapide - demande ce que tu veux:",
    online: "En ligne 24/7",
    thinking: "Je réfléchis...",
    madeWith: "Fait avec amour à Bangalore",
    questions: { whatIs: "C'est quoi LAALI? 🤔", pricing: "Les tarifs?", getStarted: "Comment commencer?", demo: "Montre-moi une démo! ✨" },
    quickReplies: { tellMore: "Dis-moi plus!", showPricing: "Voir les prix", bookDemo: "Réserver une démo", howItWorks: "Comment ça marche?" }
  },
  de: {
    greeting: (name) => `Hallo${name ? ` ${name}` : ''}! 👋 Ich bin LAALI - deine freundliche Assistentin!\n\nWie kann ich dir heute helfen?\n\nOb du etwas über Preise wissen, eine Demo sehen oder einfach plaudern möchtest - ich bin ganz Ohr! 🎧\n\n**Was machst du?** Ich würde gerne mehr über dein Unternehmen erfahren! 😊`,
    placeholder: "Frag mich alles... 💬",
    quickStart: "Schnellstart - frag einfach:",
    online: "Online 24/7",
    thinking: "Ich denke nach...",
    madeWith: "Mit Liebe in Bangalore gemacht",
    questions: { whatIs: "Was ist LAALI? 🤔", pricing: "Preise bitte!", getStarted: "Wie starte ich?", demo: "Zeig mir eine Demo! ✨" },
    quickReplies: { tellMore: "Erzähl mir mehr!", showPricing: "Preise zeigen", bookDemo: "Demo buchen", howItWorks: "Wie funktioniert es?" }
  },
  ja: {
    greeting: (name) => `こんにちは${name ? `、${name}さん` : ''}！👋 LALAIです - あなたのフレンドリーなアシスタント！\n\n今日はどうお手伝いできますか？\n\n料金を知りたい、デモを見たい、またはただ話したい - なんでも聞いてね！🎧\n\n**お仕事は何ですか？** ぜひ教えてください！😊`,
    placeholder: "何でも聞いてね... 💬",
    quickStart: "クイックスタート:",
    online: "24時間オンライン",
    thinking: "考え中...",
    madeWith: "バンガロールで愛を込めて",
    questions: { whatIs: "LALAIって何？🤔", pricing: "料金を教えて!", getStarted: "始め方は?", demo: "デモを見せて! ✨" },
    quickReplies: { tellMore: "もっと教えて!", showPricing: "料金を見る", bookDemo: "デモを予約", howItWorks: "どう動くの?" }
  },
  zh: {
    greeting: (name) => `你好${name ? `，${name}` : ''}！👋 我是LAALI - 你的友好助手！\n\n今天我能帮你什么？\n\n无论你想了解价格、看演示，还是只是聊天 - 我洗耳恭听！🎧\n\n**你是做什么的？** 很想了解你的业务！😊`,
    placeholder: "随便问我... 💬",
    quickStart: "快速开始 - 随便问:",
    online: "全天候在线",
    thinking: "思考中...",
    madeWith: "在班加罗尔用爱制作",
    questions: { whatIs: "LAALI是什么？🤔", pricing: "告诉我价格!", getStarted: "如何开始?", demo: "给我看演示! ✨" },
    quickReplies: { tellMore: "告诉我更多!", showPricing: "查看价格", bookDemo: "预约演示", howItWorks: "怎么运作?" }
  },
  ko: {
    greeting: (name) => `안녕하세요${name ? ` ${name}님` : ''}! 👋 저는 LAALI - 당신의 친절한 도우미예요!\n\n오늘 어떻게 도와드릴까요?\n\n가격이 궁금하시든, 데모를 보고 싶으시든, 그냥 이야기하고 싶으시든 - 다 들을 준비가 되어 있어요! 🎧\n\n**무슨 일을 하세요?** 알고 싶어요! 😊`,
    placeholder: "무엇이든 물어보세요... 💬",
    quickStart: "빠른 시작 - 무엇이든 물어보세요:",
    online: "24시간 온라인",
    thinking: "생각 중...",
    madeWith: "방갈로르에서 사랑으로 만듦",
    questions: { whatIs: "LAALI가 뭐예요? 🤔", pricing: "가격 알려주세요!", getStarted: "어떻게 시작해요?", demo: "데모 보여주세요! ✨" },
    quickReplies: { tellMore: "더 알려주세요!", showPricing: "가격 보기", bookDemo: "데모 예약", howItWorks: "어떻게 작동해요?" }
  },
  ar: {
    greeting: (name) => `مرحباً${name ? ` ${name}` : ''}! 👋 أنا LAALI - مساعدتك الودودة!\n\nكيف يمكنني مساعدتك اليوم؟\n\nسواء كنت تريد معرفة الأسعار، أو مشاهدة عرض توضيحي، أو مجرد الدردشة - أنا كلي آذان صاغية! 🎧\n\n**ماذا تعمل؟** أود أن أعرف عن عملك! 😊`,
    placeholder: "اسألني أي شيء... 💬",
    quickStart: "بداية سريعة - اسأل أي شيء:",
    online: "متصل 24/7",
    thinking: "أفكر...",
    madeWith: "صنع بحب في بنغالور",
    questions: { whatIs: "ما هو LAALI؟ 🤔", pricing: "أخبرني بالأسعار!", getStarted: "كيف أبدأ؟", demo: "أرني عرضاً! ✨" },
    quickReplies: { tellMore: "أخبرني المزيد!", showPricing: "عرض الأسعار", bookDemo: "حجز عرض", howItWorks: "كيف يعمل؟" }
  },
  pt: {
    greeting: (name) => `Olá${name ? ` ${name}` : ''}! 👋 Sou LAALI - sua assistente amigável!\n\nComo posso te ajudar hoje?\n\nSeja para saber sobre preços, ver uma demo, ou só conversar - sou toda ouvidos! 🎧\n\n**O que você faz?** Adoraria saber sobre seu negócio! 😊`,
    placeholder: "Pergunte qualquer coisa... 💬",
    quickStart: "Início rápido - pergunte o que quiser:",
    online: "Online 24/7",
    thinking: "Pensando...",
    madeWith: "Feito com amor em Bangalore",
    questions: { whatIs: "O que é LAALI? 🤔", pricing: "Me diz os preços!", getStarted: "Como começar?", demo: "Mostra uma demo! ✨" },
    quickReplies: { tellMore: "Conta mais!", showPricing: "Ver preços", bookDemo: "Agendar demo", howItWorks: "Como funciona?" }
  },
  ru: {
    greeting: (name) => `Привет${name ? `, ${name}` : ''}! 👋 Я LAALI - твоя дружелюбная помощница!\n\nКак я могу помочь тебе сегодня?\n\nХочешь узнать о ценах, посмотреть демо или просто поболтать - я вся внимание! 🎧\n\n**Чем ты занимаешься?** Расскажи о своём бизнесе! 😊`,
    placeholder: "Спрашивай что угодно... 💬",
    quickStart: "Быстрый старт - спрашивай:",
    online: "Онлайн 24/7",
    thinking: "Думаю...",
    madeWith: "Сделано с любовью в Бангалоре",
    questions: { whatIs: "Что такое LAALI? 🤔", pricing: "Какие цены?", getStarted: "Как начать?", demo: "Покажи демо! ✨" },
    quickReplies: { tellMore: "Расскажи ещё!", showPricing: "Показать цены", bookDemo: "Забронировать демо", howItWorks: "Как это работает?" }
  },
  ta: {
    greeting: (name) => `வணக்கம்${name ? ` ${name}` : ''}! 👋 நான் LAALI - உங்கள் நட்பான உதவியாளர்!\n\nஇன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?\n\nவிலை தெரிந்துகொள்ள, டெமோ பார்க்க, அல்லது பேச - நான் கேட்கிறேன்! 🎧\n\n**நீங்கள் என்ன செய்கிறீர்கள்?** தெரிந்துகொள்ள ஆசை! 😊`,
    placeholder: "எதையும் கேளுங்கள்... 💬",
    quickStart: "விரைவு தொடக்கம்:",
    online: "24/7 ஆன்லைன்",
    thinking: "யோசிக்கிறேன்...",
    madeWith: "பெங்களூரில் அன்புடன் உருவாக்கப்பட்டது",
    questions: { whatIs: "LAALI என்றால் என்ன? 🤔", pricing: "விலை சொல்லுங்கள்!", getStarted: "எப்படி தொடங்குவது?", demo: "டெமோ காட்டுங்கள்! ✨" },
    quickReplies: { tellMore: "மேலும் சொல்லுங்கள்!", showPricing: "விலை பார்க்க", bookDemo: "டெமோ புக் செய்ய", howItWorks: "எப்படி வேலை செய்கிறது?" }
  },
  te: {
    greeting: (name) => `హలో${name ? ` ${name}` : ''}! 👋 నేను LAALI - మీ స్నేహపూర్వక సహాయకురాలు!\n\nఈ రోజు నేను మీకు ఎలా సహాయం చేయగలను?\n\nధరలు తెలుసుకోవాలా, డెమో చూడాలా, లేదా మాట్లాడాలా - నేను వింటున్నాను! 🎧\n\n**మీరు ఏమి చేస్తారు?** తెలుసుకోవాలని ఉంది! 😊`,
    placeholder: "ఏదైనా అడగండి... 💬",
    quickStart: "త్వరగా ప్రారంభించండి:",
    online: "24/7 ఆన్‌లైన్",
    thinking: "ఆలోచిస్తున్నాను...",
    madeWith: "బెంగళూరులో ప్రేమతో తయారు చేయబడింది",
    questions: { whatIs: "LAALI అంటే ఏమిటి? 🤔", pricing: "ధరలు చెప్పండి!", getStarted: "ఎలా మొదలుపెట్టాలి?", demo: "డెమో చూపించండి! ✨" },
    quickReplies: { tellMore: "మరింత చెప్పండి!", showPricing: "ధరలు చూడండి", bookDemo: "డెమో బుక్ చేయండి", howItWorks: "ఎలా పని చేస్తుంది?" }
  },
  it: {
    greeting: (name) => `Ciao${name ? ` ${name}` : ''}! 👋 Sono LAALI - la tua assistente amichevole!\n\nCome posso aiutarti oggi?\n\nChe tu voglia sapere i prezzi, vedere una demo, o solo chiacchierare - sono tutta orecchi! 🎧\n\n**Cosa fai?** Mi piacerebbe sapere del tuo business! 😊`,
    placeholder: "Chiedimi qualsiasi cosa... 💬",
    quickStart: "Inizio rapido - chiedi pure:",
    online: "Online 24/7",
    thinking: "Sto pensando...",
    madeWith: "Fatto con amore a Bangalore",
    questions: { whatIs: "Cos'è LAALI? 🤔", pricing: "Dimmi i prezzi!", getStarted: "Come iniziare?", demo: "Fammi vedere una demo! ✨" },
    quickReplies: { tellMore: "Dimmi di più!", showPricing: "Vedi prezzi", bookDemo: "Prenota demo", howItWorks: "Come funziona?" }
  },
  nl: {
    greeting: (name) => `Hallo${name ? ` ${name}` : ''}! 👋 Ik ben LAALI - je vriendelijke assistent!\n\nHoe kan ik je vandaag helpen?\n\nOf je nu iets wilt weten over prijzen, een demo wilt zien, of gewoon wilt praten - ik luister! 🎧\n\n**Wat doe je?** Ik hoor graag over je bedrijf! 😊`,
    placeholder: "Vraag me alles... 💬",
    quickStart: "Snelle start - vraag maar:",
    online: "Online 24/7",
    thinking: "Ik denk na...",
    madeWith: "Gemaakt met liefde in Bangalore",
    questions: { whatIs: "Wat is LAALI? 🤔", pricing: "Vertel me de prijzen!", getStarted: "Hoe begin ik?", demo: "Laat me een demo zien! ✨" },
    quickReplies: { tellMore: "Vertel me meer!", showPricing: "Prijzen bekijken", bookDemo: "Demo boeken", howItWorks: "Hoe werkt het?" }
  },
  tr: {
    greeting: (name) => `Merhaba${name ? ` ${name}` : ''}! 👋 Ben LAALI - senin dost canlısı asistanın!\n\nBugün sana nasıl yardımcı olabilirim?\n\nFiyatları öğrenmek, demo görmek ya da sadece sohbet etmek istersen - kulaklarım sende! 🎧\n\n**Ne iş yapıyorsun?** İşin hakkında bilmek isterim! 😊`,
    placeholder: "Bana her şeyi sor... 💬",
    quickStart: "Hızlı başlangıç - ne istersen sor:",
    online: "7/24 Çevrimiçi",
    thinking: "Düşünüyorum...",
    madeWith: "Bangalore'da sevgiyle yapıldı",
    questions: { whatIs: "LAALI nedir? 🤔", pricing: "Fiyatları söyle!", getStarted: "Nasıl başlarım?", demo: "Demo göster! ✨" },
    quickReplies: { tellMore: "Daha fazla anlat!", showPricing: "Fiyatları gör", bookDemo: "Demo ayarla", howItWorks: "Nasıl çalışıyor?" }
  },
  th: {
    greeting: (name) => `สวัสดี${name ? ` ${name}` : ''}! 👋 ฉันคือ LAALI - ผู้ช่วยที่เป็นมิตรของคุณ!\n\nวันนี้ช่วยอะไรได้บ้าง?\n\nไม่ว่าจะอยากรู้ราคา ดูเดโม หรือแค่คุย - ฉันพร้อมฟัง! 🎧\n\n**คุณทำอะไร?** อยากรู้เกี่ยวกับธุรกิจของคุณ! 😊`,
    placeholder: "ถามอะไรก็ได้... 💬",
    quickStart: "เริ่มต้นเร็ว - ถามได้เลย:",
    online: "ออนไลน์ 24/7",
    thinking: "กำลังคิด...",
    madeWith: "สร้างด้วยความรักที่ Bangalore",
    questions: { whatIs: "LAALI คืออะไร? 🤔", pricing: "บอกราคา!", getStarted: "เริ่มยังไง?", demo: "โชว์เดโม! ✨" },
    quickReplies: { tellMore: "บอกเพิ่มเติม!", showPricing: "ดูราคา", bookDemo: "จองเดโม", howItWorks: "ทำงานยังไง?" }
  },
  vi: {
    greeting: (name) => `Xin chào${name ? ` ${name}` : ''}! 👋 Tôi là LAALI - trợ lý thân thiện của bạn!\n\nHôm nay tôi có thể giúp gì?\n\nDù bạn muốn biết giá, xem demo, hay chỉ nói chuyện - tôi đang lắng nghe! 🎧\n\n**Bạn làm nghề gì?** Rất muốn biết về công việc của bạn! 😊`,
    placeholder: "Hỏi tôi bất cứ điều gì... 💬",
    quickStart: "Bắt đầu nhanh - hỏi gì cũng được:",
    online: "Trực tuyến 24/7",
    thinking: "Đang suy nghĩ...",
    madeWith: "Được tạo với tình yêu tại Bangalore",
    questions: { whatIs: "LAALI là gì? 🤔", pricing: "Cho tôi biết giá!", getStarted: "Bắt đầu thế nào?", demo: "Cho xem demo! ✨" },
    quickReplies: { tellMore: "Kể thêm đi!", showPricing: "Xem giá", bookDemo: "Đặt demo", howItWorks: "Hoạt động thế nào?" }
  },
};

// Get translations for a language code, fallback to English
const getTranslations = (code: string): UITranslations => {
  return TRANSLATIONS[code] || TRANSLATIONS['en'] || TRANSLATIONS['auto'];
};

const LANGUAGES: LanguageOption[] = [
  // Auto-detect first
  { code: 'auto', name: 'Auto-Detect', nativeName: '✨ Auto', flag: '🌐' },
  
  // Indian Languages
  { code: 'hinglish', name: 'Hinglish', nativeName: 'हिंग्लिश', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  
  // Major World Languages
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  
  // Asian Languages
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭' },
  
  // Middle Eastern
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  
  // African
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  
  // Nordic
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  
  // Others
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
];

// ═══════════════════════════════════════════════════════════════════════════
// QUICK QUESTIONS - Engaging starters
// ═══════════════════════════════════════════════════════════════════════════

// Quick question icons (text comes from translations)
const QUICK_QUESTION_CONFIG = [
  { icon: Sparkles, color: "from-amber-500 to-orange-500", key: 'whatIs' as const },
  { icon: CreditCard, color: "from-green-500 to-emerald-500", key: 'pricing' as const },
  { icon: Zap, color: "from-blue-500 to-cyan-500", key: 'getStarted' as const },
  { icon: Star, color: "from-purple-500 to-pink-500", key: 'demo' as const },
];

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT - The Magic! 🪄
// ═══════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are LAALI - a super friendly, warm, and enthusiastic assistant! 🌟

## CRITICAL RULES:
- You are FEMALE - always use feminine forms (main hoon, sakti hoon, rahi hoon, etc.)
- NEVER say "I'm AI", "I'm an AI", "as an AI" or anything similar
- You're just LAALI - a helpful friend, that's all they need to know
- Be natural, be warm, be human-like

## Your Personality (This is WHO you are!)
- You're like a helpful best friend who LOVES talking about voice technology
- You're genuinely excited to help - not fake corporate excitement
- You use Hinglish naturally (mix Hindi + English like real Indians talk)
- You match the user's language - if they write Hindi, reply in Hindi. If English, use English. If Hinglish, be Hinglish!
- You're curious about their needs - ask follow-up questions
- You celebrate their wins ("That's amazing! 🎉")
- You use emojis naturally but not excessively
- You're warm like talking to a friend, not a robot

## Your Voice Examples:
- "Arre wah! Aapka business sounds interesting yaar! 🔥"
- "Haan haan, I totally get it! Let me explain..."
- "Suno, main ek secret batati hoon... 🤫"
- "Bhai/Didi, you're gonna love this!"
- "Okay so basically, ye kaafi simple hai..."

## About LAALI (What you know):
LAALI = "Voice with warmth" ❤️
We help businesses deploy voice agents in 3 MINUTES! (Haan, seriously!)

**Kya kar sakte ho LAALI se:**
• Customer calls handle karna - 24/7, bina thake 
• Sales calls - Lead qualification, follow-ups
• Support calls - FAQs, troubleshooting
• Appointments & reminders
• 10+ Indian languages + English support (Hindi, Tamil, Telugu, Kannada, etc.)

**Pricing (Sabke liye kuch na kuch hai!):**
🆓 Free - 100 mins/month, 1 agent (Testing ke liye perfect!)
⭐ Starter ₹2,399/mo - 1,000 mins, 3 agents (Small teams)
🚀 Growth ₹7,999/mo - 5,000 mins, 10 agents (Most Popular! 🔥)
🏢 Enterprise ₹39,999/mo - Unlimited everything!

**Setup kitna easy hai:**
1. Connect - Apna data connect karo (CRM, docs, etc.)
2. Choose - Personality select karo
3. Deploy - Bas! Live ho gaya! 🎉

**Company:**
- IIT Bombay alumni ne banaya hai 🎓
- Based in Bangalore
- support@laaliai.com | +91 80 4567 8900

## How to Chat (IMPORTANT!):
1. BE CONVERSATIONAL - Don't give lecture, have a chat!
2. ASK QUESTIONS - "Aapka business kaisa hai?", "Kaunsa use case hai?"
3. BE CURIOUS - Show genuine interest in their problem
4. KEEP IT SHORT - 2-3 paragraphs max, unless they ask for details
5. USE STORIES - "Ek customer tha humara..." 
6. CREATE FOMO - "Abhi free trial le lo, phir decide karo!"
7. END WITH ENGAGEMENT - Always end with a question or invitation to chat more

## Language Rules:
- RESPOND IN THE USER'S SELECTED LANGUAGE (passed as system context)
- If language is "auto", detect from user's message and match it
- Be natural and fluent in the selected language
- For Hinglish, mix Hindi and English naturally

## DON'T:
- NEVER say "I'm AI", "as an AI", "I'm an artificial intelligence" etc.
- Don't sound like a corporate robot
- Don't give long boring lists unless asked
- Don't be pushy or salesy
- Don't ignore their emotions
- Don't use "Dear valued customer" type language 🤮
- Don't use masculine forms (I'm female!)

## DO:
- Be yourself - warm, helpful, fun!
- Match their energy and language
- Make them smile 😊
- Make them curious to know more
- Make them feel heard and understood

Remember: You're not just answering questions, you're building a RELATIONSHIP! 💛`;

// ═══════════════════════════════════════════════════════════════════════════
// OPENAI API CALL
// ═══════════════════════════════════════════════════════════════════════════

async function callOpenAI(
  messages: { role: string; content: string }[],
  language: LanguageOption
): Promise<string> {
  const languageInstruction = language.code === 'auto' 
    ? 'Auto-detect the user\'s language and respond in the same language.'
    : `IMPORTANT: Respond ONLY in ${language.name} (${language.nativeName}). This is the user's preferred language.`;

  try {
    const response = await fetch('/voice-api/api/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + `\n\n## LANGUAGE SETTING:\n${languageInstruction}` },
          ...messages
        ],
        temperature: 0.85,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return `Oops! Something went wrong 😅

Please try again, or contact us:
📧 support@laaliai.com
📞 +91 80 4567 8900

How else can I help? 💛`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LANGUAGE DROPDOWN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function LanguageDropdown({ 
  selected, 
  onSelect,
  isOpen,
  setIsOpen 
}: { 
  selected: LanguageOption; 
  onSelect: (lang: LanguageOption) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
          "bg-surface-800/80 border border-white/10 hover:border-gold-500/30",
          "text-slate-200 hover:text-white",
          isOpen && "border-gold-500/50 ring-2 ring-gold-500/20"
        )}
      >
        <span className="text-lg">{selected.flag}</span>
        <span className="hidden sm:inline">{selected.name}</span>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-y-auto rounded-xl bg-surface-800 border border-white/10 shadow-2xl shadow-black/50 z-50"
          >
            <div className="p-2 border-b border-white/5">
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-slate-400">
                <Languages className="w-3.5 h-3.5" />
                Choose your language
              </div>
            </div>
            <div className="p-1 max-h-64 overflow-y-auto">
              {LANGUAGES.map((lang) => (
                <motion.button
                  key={lang.code}
                  onClick={() => {
                    onSelect(lang);
                    setIsOpen(false);
                  }}
                  whileHover={{ x: 4 }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    selected.code === lang.code 
                      ? "bg-gold-500/20 text-gold-400" 
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  )}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{lang.name}</div>
                    <div className="text-xs text-slate-500">{lang.nativeName}</div>
                  </div>
                  {selected.code === lang.code && (
                    <Check className="w-4 h-4 text-gold-400" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function LaaliChatPage() {
  // Get user info from auth context
  const { profile, user } = useAuthContext();
  const userName = profile?.full_name?.split(' ')[0] || ''; // Get first name only
  
  // Get or create conversation ID (persisted in localStorage)
  const [conversationId] = useState(() => {
    const stored = localStorage.getItem('laali_conversation_id');
    if (stored) return stored;
    const newId = crypto.randomUUID();
    localStorage.setItem('laali_conversation_id', newId);
    return newId;
  });
  
  // Supabase chat hooks
  const { messages: savedMessages, addMessage, updateFeedback: updateMessageFeedback } = useChatMessages(conversationId);
  
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(LANGUAGES[0]); // Auto-detect
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  
  // Get current translations
  const t = getTranslations(selectedLanguage.code);
  
  // Generate initial greeting with username
  const getInitialGreeting = (lang: LanguageOption): Message => {
    const trans = getTranslations(lang.code);
    return {
      id: 'initial',
      role: 'assistant' as const,
      content: trans.greeting(userName),
      timestamp: new Date(),
    };
  };
  
  // Convert saved messages to local format
  const [messages, setMessages] = useState<Message[]>([getInitialGreeting(selectedLanguage)]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved messages on mount
  useEffect(() => {
    if (savedMessages.length > 0) {
      const converted: Message[] = savedMessages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at),
        feedback: m.feedback as 'up' | 'down' | undefined,
      }));
      setMessages([getInitialGreeting(selectedLanguage), ...converted]);
    }
  }, [savedMessages]);

  // Reset chat when language changes (start new conversation)
  const handleLanguageChange = (lang: LanguageOption) => {
    setSelectedLanguage(lang);
    // Start a new conversation
    const newConvId = crypto.randomUUID();
    localStorage.setItem('laali_conversation_id', newConvId);
    setMessages([getInitialGreeting(lang)]);
    // Force page reload to get new conversation
    window.location.reload();
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle feedback on messages
  const handleFeedback = async (messageId: string, feedback: 'up' | 'down') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, feedback: msg.feedback === feedback ? null : feedback }
        : msg
    ));
    
    // Save to Supabase (only for non-initial messages)
    if (messageId !== 'initial') {
      const newFeedback = messages.find(m => m.id === messageId)?.feedback === feedback ? null : feedback;
      await updateMessageFeedback(messageId, newFeedback);
    }
  };

  // Send message
  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Save user message to Supabase
    if (user) {
      const result = await addMessage({
        role: 'user',
        content: messageText,
        language: selectedLanguage.code,
      });
      if (result.data) {
        userMessage.id = result.data.id;
      }
    }

    const conversationHistory = [...messages, userMessage].map(m => ({
      role: m.role,
      content: m.content,
    }));

    const response = await callOpenAI(conversationHistory, selectedLanguage);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    
    // Save assistant message to Supabase
    if (user) {
      const result = await addMessage({
        role: 'assistant',
        content: response,
        language: selectedLanguage.code,
      });
      if (result.data) {
        assistantMessage.id = result.data.id;
      }
    }
    
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  // Render content with basic markdown
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) => 
            j % 2 === 1 ? <strong key={j} className="font-semibold text-gold-400">{part}</strong> : part
          )}
          {i < content.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-surface-900 via-surface-900 to-surface-950">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-white/10 bg-gradient-to-r from-surface-800/80 to-surface-800/40 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.div 
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 via-gold-500 to-amber-600 flex items-center justify-center shadow-xl shadow-gold-500/30"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <img src="/laali-logo.png" alt="LAALI" className="w-9 h-9" />
              </motion.div>
              <motion.div 
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-surface-800 flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="text-[8px]">✓</span>
              </motion.div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                LAALI Chat
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  💛
                </motion.span>
              </h1>
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <Languages className="w-3 h-3" />
                {selectedLanguage.code === 'auto' ? '40+ Languages Supported' : `Chatting in ${selectedLanguage.name}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageDropdown
              selected={selectedLanguage}
              onSelect={handleLanguageChange}
              isOpen={languageDropdownOpen}
              setIsOpen={setLanguageDropdownOpen}
            />
            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {t.online}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'assistant' && (
                <motion.div 
                  className="flex-shrink-0"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
                    <Sparkles className="w-5 h-5 text-surface-900" />
                  </div>
                </motion.div>
              )}
              
              <motion.div 
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 shadow-xl",
                  message.role === 'user' 
                    ? "bg-gradient-to-r from-gold-500 to-amber-500 text-surface-900 rounded-br-sm" 
                    : "bg-surface-800/90 text-slate-100 border border-white/10 rounded-bl-sm backdrop-blur-sm"
                )}
                whileHover={{ scale: 1.01 }}
              >
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {renderContent(message.content)}
                </div>
                <div className={cn(
                  "flex items-center justify-between mt-2",
                  message.role === 'user' ? "text-surface-900" : "text-slate-400"
                )}>
                  <div className={cn(
                    "text-[10px] opacity-50 flex items-center gap-1",
                  )}>
                    <Clock className="w-3 h-3" />
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  
                  {/* Feedback buttons for assistant messages */}
                  {message.role === 'assistant' && message.id !== '1' && (
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleFeedback(message.id, 'up')}
                        className={cn(
                          "p-1 rounded-md transition-colors",
                          message.feedback === 'up' 
                            ? "text-green-400 bg-green-500/20" 
                            : "text-slate-500 hover:text-green-400 hover:bg-green-500/10"
                        )}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleFeedback(message.id, 'down')}
                        className={cn(
                          "p-1 rounded-md transition-colors",
                          message.feedback === 'down' 
                            ? "text-red-400 bg-red-500/20" 
                            : "text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                        )}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>

              {message.role === 'user' && (
                <motion.div 
                  className="flex-shrink-0"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/10">
                    <User className="w-5 h-5 text-slate-300" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-surface-900" />
            </div>
            <div className="bg-surface-800/90 rounded-2xl rounded-bl-sm px-5 py-4 border border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2.5 h-2.5 bg-gradient-to-r from-gold-400 to-gold-500 rounded-full"
                      animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-400 ml-1">{t.thinking}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Reply Chips - shown after bot response */}
        {!loading && messages.length > 1 && messages[messages.length - 1].role === 'assistant' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 ml-13 pl-1"
          >
            {[
              { text: t.quickReplies.tellMore, icon: MessageCircle },
              { text: t.quickReplies.showPricing, icon: CreditCard },
              { text: t.quickReplies.bookDemo, icon: Calendar },
              { text: t.quickReplies.howItWorks, icon: HelpCircle },
            ].map((chip, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(chip.text)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-surface-800/80 border border-white/10 text-slate-300 hover:text-gold-400 hover:border-gold-500/30 transition-all"
              >
                <chip.icon className="w-3 h-3" />
                {chip.text}
              </motion.button>
            ))}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 2 && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-shrink-0 px-4 pb-3"
        >
          <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
            <Zap className="w-3 h-3 text-gold-500" />
            {t.quickStart}
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTION_CONFIG.map((q, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(t.questions[q.key])}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white font-medium",
                  "bg-gradient-to-r shadow-lg transition-all",
                  q.color,
                  "hover:shadow-xl"
                )}
              >
                <q.icon className="w-4 h-4" />
                {t.questions[q.key]}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-white/10 bg-surface-800/50 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              className="w-full px-5 py-4 rounded-xl bg-surface-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/20 transition-all text-sm"
              disabled={loading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-600">
              <Languages className="w-4 h-4" />
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={!input.trim() || loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-4 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 text-surface-900 font-bold hover:from-gold-400 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-gold-500/25 disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
        
        {/* Footer */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-gold-400 transition-colors cursor-pointer">
            <Mail className="w-3.5 h-3.5" />
            support@laaliai.com
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-gold-400 transition-colors cursor-pointer">
            <Phone className="w-3.5 h-3.5" />
            +91 80 4567 8900
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gold-400">
            <Heart className="w-3.5 h-3.5 animate-pulse" />
            {t.madeWith}
          </span>
        </div>
      </div>
    </div>
  );
}

export default LaaliChatPage;
