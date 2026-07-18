'use strict';

/**
 * @fileoverview Main coordinator, state management, and navigation for FIFA FanConnect.
 * Manages active persona, language selector, UI localization, and route visualizers.
 * @module public/js/app
 */

/**
 * Global application state object.
 * @type {{ currentPersona: string, stadiumId: string, language: string }}
 */
const CONFIG = {
  TOAST_FADE_DELAY: 3000,
  TOAST_REMOVE_DELAY: 300,
};

// --- NEW DOM CACHE ---
// Centralizing DOM references avoids redundant document lookups and improves rendering performance.
const DOM = {
  sendBtn: document.getElementById('send-btn'),
  langPickerBtn: document.getElementById('lang-picker-btn'),
  langPickerPanel: document.getElementById('lang-picker-panel'),
  mobileMenuBtn: document.getElementById('mobile-menu-btn'),
  calculateRouteBtn: document.getElementById('calculate-route-btn'),
  fanStadium: document.getElementById('fan-stadium'),
  fanLanguage: document.getElementById('fan-language'),
  toastContainer: document.getElementById('toast-container'),
  sidebar: document.getElementById('sidebar'),
  langOptionsList: document.getElementById('lang-options-list'),
};

const savedStadium = localStorage.getItem('fc_stadium');
const AppState = {
  currentPersona: 'fan',
  stadiumId:
    savedStadium && ['metlife', 'atandt', 'sofi'].includes(savedStadium) ? savedStadium : 'metlife',
  language: localStorage.getItem('fc_lang') || 'en',
};

/**
 * Supported language definitions with flag, native name, and language code.
 */
const LANGUAGES = [
  { code: 'en', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', label: 'English', native: 'English', country: 'Default' },
  { code: 'ja', flag: '🇯🇵', label: 'Japanese', native: '日本語', country: 'Japan' },
  { code: 'es', flag: '🇲🇽', label: 'Mexican', native: 'Español (MX)', country: 'Mexico' },
  { code: 'it', flag: '🇮🇹', label: 'Italian', native: 'Italiano', country: 'Italy' },
  { code: 'pt', flag: '🇧🇷', label: 'Brazilian', native: 'Português', country: 'Brazil' },
  { code: 'es', flag: '🇪🇸', label: 'Spain', native: 'Español (ES)', country: 'Spain' },
  { code: 'ar', flag: '🇪🇬', label: 'Egypt', native: 'العربية', country: 'Egypt' },
  { code: 'ko', flag: '🇰🇷', label: 'Korean', native: '한국어', country: 'South Korea' },
  { code: 'fr', flag: '🇫🇷', label: 'France', native: 'Français', country: 'France' },
  { code: 'pt', flag: '🇵🇹', label: 'Portugal', native: 'Português', country: 'Portugal' },
  { code: 'es', flag: '🇦🇷', label: 'Argentina', native: 'Español (AR)', country: 'Argentina' },
];

/**
 * UI strings for each language code. Used to translate static labels.
 */
const UI_STRINGS = {
  en: {
    navAllStadiums: 'All Stadiums',
    navLiveHeatmaps: 'Live Heatmaps',
    navGlobalChat: 'Global Chat',
    crowdLabel: 'Crowd:',
    crowdStatus: 'Crowd Status',
    pitchFeed: 'Pitch Feed',
    squadStats: 'Squad Stats',
    stadiumMap: 'Stadium Map',
    fanZone: 'Fan Zone',
    matchDay: 'Match Day',
    liveMatchCenter: 'Live Match Center',
    heroTitle: 'FIFA FanConnect',
    heroSubtitle: 'Immerse yourself in the live stadium pulse.\nAsk FAN Ai for real-time routing.',
    fanAiName: 'FAN Ai',
    fanAiOnline: 'Online',
    fanAiGreeting: 'Hello! I am your FIFA FanConnect Coach. How can I help you today?',
    reportIncident: 'Report Incident',
    askFanAi: 'Ask FAN Ai...',
    matchDetails: 'Match Details',
    sectorControl: 'Sector Control',
    activeAlerts: 'Active Alerts Feed',
    highActivity: 'High Activity',
    historicFinal: 'HISTORIC FINAL',
    selectLang: 'Select Language',
    langUpdated: 'Language updated',
    stadiumUpdated: 'Stadium updated',
    sendBtn: 'Send',
    volunteerTitle: 'Volunteer Hub',
    staffTitle: 'Operations Dashboard',
    ecoHub: 'Eco & Transport',
  },
  ja: {
    navAllStadiums: '全スタジアム',
    navLiveHeatmaps: 'ライヒートマップ',
    navGlobalChat: 'グローバルチャット',
    crowdLabel: '混雑:',
    crowdStatus: '混雑状況',
    pitchFeed: 'ピッチフィード',
    squadStats: 'チーム統計',
    stadiumMap: 'スタジアムマップ',
    fanZone: 'ファンゾーン',
    matchDay: 'マッチデー',
    liveMatchCenter: 'ライブマッチセンター',
    heroTitle: 'FIFA FanConnect',
    heroSubtitle:
      'スタジアムのライブパルスに没入してください。\nリアルタイムルーティングはFAN Aiにお尋ねください。',
    fanAiName: 'FAN Ai',
    fanAiOnline: 'オンライン',
    fanAiGreeting: 'こんにちは！FIFA FanConnectコーチです。今日はどのようにお手伝いできますか？',
    reportIncident: 'インシデント報告',
    askFanAi: 'FAN Aiに聞く...',
    matchDetails: '試合詳細',
    sectorControl: 'セクター管理',
    activeAlerts: 'アクティブアラートフィード',
    highActivity: '高活動',
    historicFinal: '歴史的決勝',
    selectLang: '言語を選択',
    langUpdated: '言語が更新されました',
    stadiumUpdated: 'スタジアムが更新されました',
    sendBtn: '送信',
    volunteerTitle: 'ボランティアハブ',
    staffTitle: '運営ダッシュボード',
    ecoHub: '環境と交通',
  },
  es: {
    navAllStadiums: 'Todos los Estadios',
    navLiveHeatmaps: 'Mapas de Calor',
    navGlobalChat: 'Chat Global',
    crowdLabel: 'Multitud:',
    crowdStatus: 'Estado de Multitud',
    pitchFeed: 'Transmisión del Campo',
    squadStats: 'Estadísticas del Equipo',
    stadiumMap: 'Mapa del Estadio',
    fanZone: 'Zona de Fanáticos',
    matchDay: 'Día del Partido',
    liveMatchCenter: 'Centro de Partido en Vivo',
    heroTitle: 'FIFA FanConnect',
    heroSubtitle: 'Sumérgete en el pulso del estadio en vivo.\nPide a FAN Ai rutas en tiempo real.',
    fanAiName: 'FAN Ai',
    fanAiOnline: 'En línea',
    fanAiGreeting: '¡Hola! Soy tu entrenador FIFA FanConnect. ¿Cómo puedo ayudarte hoy?',
    reportIncident: 'Reportar Incidente',
    askFanAi: 'Pregunta a FAN Ai...',
    matchDetails: 'Detalles del Partido',
    sectorControl: 'Control de Sector',
    activeAlerts: 'Feed de Alertas Activas',
    highActivity: 'Alta Actividad',
    historicFinal: 'FINAL HISTÓRICA',
    selectLang: 'Seleccionar Idioma',
    langUpdated: 'Idioma actualizado',
    stadiumUpdated: 'Estadio actualizado',
    sendBtn: 'Enviar',
    volunteerTitle: 'Centro de Voluntarios',
    staffTitle: 'Panel de Operaciones',
    ecoHub: 'Eco y Transporte',
  },
  it: {
    navAllStadiums: 'Tutti gli Stadi',
    navLiveHeatmaps: 'Mappe di Calore',
    navGlobalChat: 'Chat Globale',
    crowdLabel: 'Folla:',
    crowdStatus: 'Stato Folla',
    pitchFeed: 'Feed del Campo',
    squadStats: 'Statistiche Squadra',
    stadiumMap: 'Mappa Stadio',
    fanZone: 'Zona Tifosi',
    matchDay: 'Giorno della Partita',
    liveMatchCenter: 'Centro Partita in Diretta',
    heroTitle: 'FIFA FanConnect',
    heroSubtitle:
      'Immergiti nel pulse dello stadio live.\nChiedi a FAN Ai il percorso in tempo reale.',
    fanAiName: 'FAN Ai',
    fanAiOnline: 'Online',
    fanAiGreeting: 'Ciao! Sono il tuo assistente FIFA FanConnect. Come posso aiutarti oggi?',
    reportIncident: 'Segnala Incidente',
    askFanAi: 'Chiedi a FAN Ai...',
    matchDetails: 'Dettagli Partita',
    sectorControl: 'Controllo Settore',
    activeAlerts: 'Feed Avvisi Attivi',
    highActivity: 'Alta Attività',
    historicFinal: 'FINALE STORICA',
    selectLang: 'Seleziona Lingua',
    langUpdated: 'Lingua aggiornata',
    stadiumUpdated: 'Stadio aggiornato',
    sendBtn: 'Invia',
    volunteerTitle: 'Hub Volontari',
    staffTitle: 'Pannello Operativo',
    ecoHub: 'Eco e Trasporti',
  },
  pt: {
    navAllStadiums: 'Todos os Estádios',
    navLiveHeatmaps: 'Mapas de Calor',
    navGlobalChat: 'Chat Global',
    crowdLabel: 'Multidão:',
    crowdStatus: 'Status da Multidão',
    pitchFeed: 'Feed do Campo',
    squadStats: 'Estatísticas do Time',
    stadiumMap: 'Mapa do Estádio',
    fanZone: 'Zona dos Fãs',
    matchDay: 'Dia do Jogo',
    liveMatchCenter: 'Centro de Jogo ao Vivo',
    heroTitle: 'FIFA FanConnect',
    heroSubtitle:
      'Mergulhe no pulso ao vivo do estádio.\nPergunte ao FAN Ai para rotas em tempo real.',
    fanAiName: 'FAN Ai',
    fanAiOnline: 'Online',
    fanAiGreeting: 'Olá! Sou seu assistente FIFA FanConnect. Como posso ajudá-lo hoje?',
    reportIncident: 'Reportar Incidente',
    askFanAi: 'Pergunte ao FAN Ai...',
    matchDetails: 'Detalhes da Partida',
    sectorControl: 'Controle de Setor',
    activeAlerts: 'Feed de Alertas Ativos',
    highActivity: 'Alta Atividade',
    historicFinal: 'FINAL HISTÓRICA',
    selectLang: 'Selecionar Idioma',
    langUpdated: 'Idioma atualizado',
    stadiumUpdated: 'Estádio atualizado',
    sendBtn: 'Enviar',
    volunteerTitle: 'Hub de Voluntários',
    staffTitle: 'Painel de Operações',
    ecoHub: 'Eco e Transporte',
  },
  ar: {
    navAllStadiums: 'جميع الملاعب',
    navLiveHeatmaps: 'خرائط الكثافة',
    navGlobalChat: 'الدردشة العالمية',
    crowdLabel: 'الحشود:',
    crowdStatus: 'حالة الحشود',
    pitchFeed: 'بث الملعب',
    squadStats: 'إحصائيات الفريق',
    stadiumMap: 'خريطة الملعب',
    fanZone: 'منطقة المشجعين',
    matchDay: 'يوم المباراة',
    liveMatchCenter: 'مركز المباراة المباشرة',
    heroTitle: 'FIFA FanConnect',
    heroSubtitle: 'انغمس في نبض الملعب المباشر.\nاسأل FAN Ai عن التوجيه في الوقت الفعلي.',
    fanAiName: 'FAN Ai',
    fanAiOnline: 'متصل',
    fanAiGreeting: 'مرحباً! أنا مساعد FIFA FanConnect. كيف يمكنني مساعدتك اليوم؟',
    reportIncident: 'الإبلاغ عن حادثة',
    askFanAi: 'اسأل FAN Ai...',
    matchDetails: 'تفاصيل المباراة',
    sectorControl: 'التحكم في القطاع',
    activeAlerts: 'تغذية التنبيهات النشطة',
    highActivity: 'نشاط عالٍ',
    historicFinal: 'نهائي تاريخي',
    selectLang: 'اختر اللغة',
    langUpdated: 'تم تحديث اللغة',
    stadiumUpdated: 'تم تحديث الملعب',
    sendBtn: 'إرسال',
    volunteerTitle: 'مركز المتطوعين',
    staffTitle: 'لوحة العمليات',
    ecoHub: 'البيئة والنقل',
  },
  ko: {
    navAllStadiums: '모든 경기장',
    navLiveHeatmaps: '실시간 히트맵',
    navGlobalChat: '글로벌 채팅',
    crowdLabel: '군중:',
    crowdStatus: '군중 상태',
    pitchFeed: '피치 피드',
    squadStats: '팀 통계',
    stadiumMap: '경기장 지도',
    fanZone: '팬 존',
    matchDay: '경기 당일',
    liveMatchCenter: '실시간 경기 센터',
    heroTitle: 'FIFA FanConnect',
    heroSubtitle: '라이브 경기장의 맥박을 느껴보세요.\n실시간 안내는 FAN Ai에게 물어보세요.',
    fanAiName: 'FAN Ai',
    fanAiOnline: '온라인',
    fanAiGreeting: '안녕하세요! FIFA FanConnect 코치입니다. 오늘 어떻게 도와드릴까요?',
    reportIncident: '사건 신고',
    askFanAi: 'FAN Ai에게 묻기...',
    matchDetails: '경기 세부사항',
    sectorControl: '섹터 제어',
    activeAlerts: '활성 알림 피드',
    highActivity: '높은 활동',
    historicFinal: '역사적 결승',
    selectLang: '언어 선택',
    langUpdated: '언어가 업데이트되었습니다',
    stadiumUpdated: '경기장이 업데이트되었습니다',
    sendBtn: '전송',
    volunteerTitle: '자원봉사자 허브',
    staffTitle: '운영 대시보드',
    ecoHub: '에코 및 교통',
  },
  fr: {
    navAllStadiums: 'Tous les Stades',
    navLiveHeatmaps: 'Cartes de Chaleur',
    navGlobalChat: 'Chat Mondial',
    crowdLabel: 'Foule:',
    crowdStatus: 'État de la Foule',
    pitchFeed: 'Flux du Terrain',
    squadStats: "Statistiques d'Équipe",
    stadiumMap: 'Plan du Stade',
    fanZone: 'Zone Supporters',
    matchDay: 'Jour de Match',
    liveMatchCenter: 'Centre Match en Direct',
    heroTitle: 'FIFA FanConnect',
    heroSubtitle:
      'Plongez dans le pouls du stade en direct.\nDemandez à FAN Ai pour le routage en temps réel.',
    fanAiName: 'FAN Ai',
    fanAiOnline: 'En ligne',
    fanAiGreeting:
      "Bonjour! Je suis votre assistant FIFA FanConnect. Comment puis-je vous aider aujourd'hui?",
    reportIncident: 'Signaler un Incident',
    askFanAi: 'Demandez à FAN Ai...',
    matchDetails: 'Détails du Match',
    sectorControl: 'Contrôle de Secteur',
    activeAlerts: "Fil d'Alertes Actives",
    highActivity: 'Haute Activité',
    historicFinal: 'FINALE HISTORIQUE',
    selectLang: 'Choisir la Langue',
    langUpdated: 'Langue mise à jour',
    stadiumUpdated: 'Stade mis à jour',
    sendBtn: 'Envoyer',
    volunteerTitle: 'Hub des Bénévoles',
    staffTitle: 'Tableau de Bord Opérationnel',
    ecoHub: 'Éco & Transport',
  },
  de: {
    navAllStadiums: 'Alle Stadien',
    navLiveHeatmaps: 'Live-Heatmaps',
    navGlobalChat: 'Globaler Chat',
    crowdLabel: 'Menge:',
    crowdStatus: 'Mengenstatus',
    pitchFeed: 'Platz-Feed',
    squadStats: 'Mannschaftsstatistiken',
    stadiumMap: 'Stadionkarte',
    fanZone: 'Fan-Zone',
    matchDay: 'Spieltag',
    liveMatchCenter: 'Live-Spielzentrum',
    heroTitle: 'FIFA FanConnect',
    heroSubtitle:
      'Tauchen Sie in den Live-Puls des Stadions ein.\nFragen Sie FAN Ai nach Echtzeit-Navigation.',
    fanAiName: 'FAN Ai',
    fanAiOnline: 'Online',
    fanAiGreeting: 'Hallo! Ich bin Ihr FIFA FanConnect Assistent. Wie kann ich Ihnen heute helfen?',
    reportIncident: 'Vorfall melden',
    askFanAi: 'FAN Ai fragen...',
    matchDetails: 'Spieldetails',
    sectorControl: 'Sektorsteuerung',
    activeAlerts: 'Aktiver Alarm-Feed',
    highActivity: 'Hohe Aktivität',
    historicFinal: 'HISTORISCHES FINALE',
    selectLang: 'Sprache auswählen',
    langUpdated: 'Sprache aktualisiert',
    stadiumUpdated: 'Stadion aktualisiert',
    sendBtn: 'Senden',
    volunteerTitle: 'Freiwilligen-Hub',
    staffTitle: 'Betriebsdashboard',
    ecoHub: 'Öko & Transport',
  },
};

/**
 * Apply UI strings for a given language code to all tagged elements.
 * @param {string} langCode - The language code to apply.
 */
function applyUILanguage(langCode) {
  const strings = UI_STRINGS[langCode] || UI_STRINGS['en'];
  const dir = langCode === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('lang', langCode);
  document.documentElement.setAttribute('dir', dir);

  const map = {
    'nav-all-stadiums': 'navAllStadiums',
    'nav-live-heatmaps': 'navLiveHeatmaps',
    'nav-global-chat': 'navGlobalChat',
    'crowd-label-text': 'crowdLabel',
    'crowd-status-btn': 'crowdStatus',
    'sidebar-pitch-feed': 'pitchFeed',
    'sidebar-squad-stats': 'squadStats',
    'sidebar-stadium-map': 'stadiumMap',
    'sidebar-fan-zone': 'fanZone',
    'sidebar-match-day': 'matchDay',
    'sidebar-live-match': 'liveMatchCenter',
    'hero-title': 'heroTitle',
    'hero-subtitle': 'heroSubtitle',
    'fan-ai-name': 'fanAiName',
    'fan-ai-status': 'fanAiOnline',
    'fan-ai-greeting': 'fanAiGreeting',
    'report-incident-btn': null, // keep backward compat
    'report-incident-text': 'reportIncident',
    'fan-ai-input': null, // placeholder handled separately
    'match-details-label': 'matchDetails',
    'sector-control-label': 'sectorControl',
    'active-alerts-label': 'activeAlerts',
    'sector-activity-label': 'highActivity',
    'match-historic-badge': 'historicFinal',
    'lang-panel-heading': 'selectLang',
    'send-fan-ai-btn': 'sendBtn',
    'volunteer-hub-title': 'volunteerTitle',
    'staff-dashboard-title': 'staffTitle',
    'sidebar-eco-hub': 'ecoHub',
  };

  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el || !key) {
      return;
    }
    el.textContent = strings[key];
  });

  // Placeholder for chat input
  const input = document.getElementById('chat-input');
  if (input) {
    input.setAttribute('placeholder', strings.askFanAi || 'Ask FAN Ai...');
  }

  // Update lang picker button display
  const selectedLang = LANGUAGES.find((l) => l.code === langCode);
  const flagEl = document.getElementById('lang-flag-display');
  const labelEl = document.getElementById('lang-label-display');
  if (selectedLang && flagEl) {
    flagEl.textContent = selectedLang.flag;
  }
  if (labelEl) {
    labelEl.textContent = langCode.toUpperCase();
  }
}

/**
 * Toast Notification System
 * @param {string} msg - Message
 * @param {string} type - 'info' | 'success' | 'error'
 * @param {string} severity - 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
 */
function showToast(msg, type = 'info', severity = 'LOW') {
  const container = DOM.toastContainer || document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  // Dynamic Accessibility: Escalate ARIA live region based on severity
  if (severity === 'CRITICAL' || severity === 'HIGH') {
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('role', 'alert');
  } else {
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('role', 'status');
  }

  // Safe insertion using DOMPurify
  toast.innerHTML = DOMPurify.sanitize(msg);

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, CONFIG.TOAST_REMOVE_DELAY);
  }, CONFIG.TOAST_FADE_DELAY);
}

/**
 * Switch active persona screen and update navigation button state.
 * @param {string} targetId - ID of the target screen element to display (e.g. 'fan-screen').
 */
function switchScreen(targetId) {
  // Update UI screens
  document.querySelectorAll('.screen').forEach((s) => {
    s.classList.add('hidden');
    s.classList.remove('active-screen'); // if we use it
  });
  const targetScreen = document.getElementById(targetId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }

  // Update UI nav buttons (Desktop and Mobile)
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    if (btn.dataset.target === targetId) {
      if (btn.tagName === 'A') {
        btn.classList.add('text-secondary-fixed-dim');
        btn.classList.remove('text-on-surface-variant', 'text-on-surface-variant/70');
        if (btn.closest('#nav-tabs-container')) {
          // Desktop styles
          btn.classList.add(
            'bg-secondary-container/10',
            'border-r-4',
            'border-secondary-fixed-dim',
            'font-bold',
          );
        }
      }
      btn.setAttribute('aria-selected', 'true');
    } else {
      if (btn.tagName === 'A') {
        btn.classList.remove('text-secondary-fixed-dim');
        if (btn.closest('#nav-tabs-container')) {
          // Desktop styles
          btn.classList.remove(
            'bg-secondary-container/10',
            'border-r-4',
            'border-secondary-fixed-dim',
            'font-bold',
          );
          btn.classList.add('text-on-surface-variant/70');
        } else {
          btn.classList.add('text-on-surface-variant');
        }
      }
      btn.setAttribute('aria-selected', 'false');
    }
  });

  AppState.currentPersona = targetId.split('-')[0];
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Navigation binding (Desktop + Mobile)
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      switchScreen(e.currentTarget.dataset.target);
      const sidebar = DOM.sidebar || document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.add('-translate-x-full'); // Close on mobile after click
      }
    });
  });

  // Global settings change
  const stadiumSelect = DOM.fanStadium || document.getElementById('fan-stadium');
  const langSelect = DOM.fanLanguage || document.getElementById('fan-language');

  if (stadiumSelect) {
    stadiumSelect.value = AppState.stadiumId;
    stadiumSelect.addEventListener('change', (e) => {
      AppState.stadiumId = e.target.value;
      localStorage.setItem('fc_stadium', e.target.value);
      const strings = UI_STRINGS[AppState.language] || UI_STRINGS['en'];
      showToast(strings.stadiumUpdated || 'Stadium updated', 'success');
    });
  }

  if (langSelect) {
    langSelect.value = AppState.language;
    langSelect.addEventListener('change', (e) => {
      AppState.language = e.target.value;
      localStorage.setItem('fc_lang', e.target.value);
    });
  }

  // ── Language Picker Panel ──────────────────────────────────────────────
  const langPickerBtn = DOM.langPickerBtn || document.getElementById('lang-picker-btn');
  const langPickerPanel = DOM.langPickerPanel || document.getElementById('lang-picker-panel');
  const langOptionsList = DOM.langOptionsList || document.getElementById('lang-options-list');

  // Build radio-style language options from LANGUAGES config
  if (langOptionsList) {
    LANGUAGES.forEach((lang, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.role = 'option';
      btn.dataset.langCode = lang.code;
      btn.dataset.langIdx = idx;
      btn.setAttribute('aria-selected', String(AppState.language === lang.code && idx === 0));
      btn.className = [
        'lang-option-btn',
        'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-150',
        'hover:bg-secondary-container/30 group border border-transparent',
        AppState.language === lang.code
          ? 'bg-secondary-container/20 border-secondary-container/50'
          : '',
      ].join(' ');
      btn.innerHTML = `
        <span class="text-xl w-7 text-center">${lang.flag}</span>
        <div class="flex-1 min-w-0">
          <div class="font-label-md text-sm text-on-surface leading-tight">${lang.label}</div>
          <div class="text-xs text-on-surface-variant/60 leading-none mt-0.5">${lang.native}</div>
        </div>
        <span class="lang-radio-dot w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${AppState.language === lang.code ? 'border-secondary-fixed-dim bg-secondary-fixed-dim/40' : 'border-secondary-container/40'}"></span>
      `;

      btn.addEventListener('click', () => {
        const newCode = lang.code;

        // Update radio dots
        document.querySelectorAll('.lang-option-btn').forEach((b) => {
          b.classList.remove('bg-secondary-container/20', 'border-secondary-container/50');
          b.classList.add('border-transparent');
          const dot = b.querySelector('.lang-radio-dot');
          if (dot) {
            dot.classList.remove('border-secondary-fixed-dim', 'bg-secondary-fixed-dim/40');
            dot.classList.add('border-secondary-container/40');
          }
        });
        btn.classList.add('bg-secondary-container/20', 'border-secondary-container/50');
        btn.classList.remove('border-transparent');
        const myDot = btn.querySelector('.lang-radio-dot');
        if (myDot) {
          myDot.classList.add('border-secondary-fixed-dim', 'bg-secondary-fixed-dim/40');
          myDot.classList.remove('border-secondary-container/40');
        }

        // Apply state
        AppState.language = newCode;
        localStorage.setItem('fc_lang', newCode);
        if (langSelect) {
          langSelect.value = newCode;
        }

        // Update flag/label in button
        const flagEl = document.getElementById('lang-flag-display');
        const labelEl = document.getElementById('lang-label-display');
        if (flagEl) {
          flagEl.textContent = lang.flag;
        }
        if (labelEl) {
          labelEl.textContent = lang.label.substring(0, 3).toUpperCase();
        }

        // Apply full UI translation
        applyUILanguage(newCode);

        // Close panel
        langPickerPanel.classList.add('hidden');
        langPickerBtn.setAttribute('aria-expanded', 'false');

        // Show toast
        const strings = UI_STRINGS[newCode] || UI_STRINGS['en'];
        showToast(`${lang.flag} ${strings.langUpdated || 'Language updated'}`, 'success');
      });

      langOptionsList.appendChild(btn);
    });
  }

  // Toggle picker panel open/close
  if (langPickerBtn && langPickerPanel) {
    langPickerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !langPickerPanel.classList.contains('hidden');
      langPickerPanel.classList.toggle('hidden', isOpen);
      langPickerBtn.setAttribute('aria-expanded', String(!isOpen));
    });
    langPickerBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        langPickerPanel.classList.add('hidden');
        langPickerBtn.setAttribute('aria-expanded', 'false');
        langPickerBtn.focus();
      }
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!langPickerBtn.contains(e.target) && !langPickerPanel.contains(e.target)) {
        langPickerPanel.classList.add('hidden');
        langPickerBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Apply saved language on page load
  applyUILanguage(AppState.language);

  // Mobile sidebar toggle
  const mobileBtn = DOM.mobileMenuBtn || document.getElementById('mobile-menu-btn');
  const sidebar = DOM.sidebar || document.getElementById('sidebar');
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });
  }

  // Map Interaction Logic
  const MAP_COORDINATES = {
    'Gate A1': { x: 200, y: 220 },
    'Gate B1': { x: 600, y: 220 },
    'Gate C1': { x: 600, y: 580 },
    'Gate D1': { x: 200, y: 580 },
    'Gate E1': { x: 400, y: 170 },
    'Sector 1': { x: 590, y: 480 },
    'Sector 2': { x: 400, y: 580 },
    'Sector 3': { x: 210, y: 480 },
    'Sector 4': { x: 210, y: 320 },
    'Sector 5': { x: 400, y: 220 },
    'Sector 6': { x: 590, y: 320 },
  };

  let activeStartRing = null;
  let activeEndRing = null;

  /**
   * Resets and clears all visual route highlights, rings, and paths on the SVG map.
   */
  function clearMapHighlights() {
    if (activeStartRing) {
      activeStartRing.style.stroke = '';
      activeStartRing.style.strokeWidth = '';
      activeStartRing.style.filter = '';
      activeStartRing = null;
    }
    if (activeEndRing) {
      activeEndRing.style.stroke = '';
      activeEndRing.style.strokeWidth = '';
      activeEndRing.style.filter = '';
      activeEndRing = null;
    }
    const dynamicPath = document.getElementById('wayfinding-path-dynamic');
    if (dynamicPath) {
      dynamicPath.classList.add('opacity-0');
    }
  }

  // Sector Control Card redirect
  const sectorControl = document.getElementById('sector-control-card');
  if (sectorControl) {
    sectorControl.addEventListener('click', () => {
      switchScreen('map-screen');
    });
  }

  // Calculate Route button click handler
  const calcBtn = DOM.calculateRouteBtn || document.getElementById('calculate-route-btn');
  if (calcBtn) {
    calcBtn.addEventListener('click', async () => {
      const fromNode = document.getElementById('route-start').value;
      const toNode = document.getElementById('route-end').value;
      const accessibility = document.getElementById('route-accessible').checked;

      if (fromNode === toNode) {
        showToast('Start and destination nodes must be different.', 'error');
        return;
      }

      // Draw the skyblue dotted line
      const startCoords = MAP_COORDINATES[fromNode];
      const endCoords = MAP_COORDINATES[toNode];
      const dynamicPath = document.getElementById('wayfinding-path-dynamic');

      if (startCoords && endCoords && dynamicPath) {
        const dx = endCoords.x - startCoords.x;
        const dy = endCoords.y - startCoords.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const midX = (startCoords.x + endCoords.x) / 2;
        const midY = (startCoords.y + endCoords.y) / 2;
        const offset = 40; // curve offset
        const ctrlX = midX - (dy / len) * offset;
        const ctrlY = midY + (dx / len) * offset;
        const pathD = `M ${startCoords.x} ${startCoords.y} Q ${ctrlX} ${ctrlY} ${endCoords.x} ${endCoords.y}`;

        dynamicPath.setAttribute('d', pathD);
        dynamicPath.classList.remove('opacity-0');

        // Clear previous highlights
        clearMapHighlights();

        // Highlight rings if they are gates
        const startKey = fromNode.toLowerCase().replace(' ', '-');
        const startRing = document.getElementById(`${startKey}-ring`);
        if (startRing) {
          startRing.style.stroke = '#28a745'; // Green for start
          startRing.style.strokeWidth = '6px';
          startRing.style.filter = 'drop-shadow(0 0 8px #28a745)';
          activeStartRing = startRing;
        }

        const endKey = toNode.toLowerCase().replace(' ', '-');
        const endRing = document.getElementById(`${endKey}-ring`);
        if (endRing) {
          endRing.style.stroke = '#00daf3'; // Cyan for end
          endRing.style.strokeWidth = '6px';
          endRing.style.filter = 'drop-shadow(0 0 8px #00daf3)';
          activeEndRing = endRing;
        }
      }

      showToast(`Navigating from ${fromNode} to ${toNode}...`, 'success');

      try {
        const res = await fetch('/api/navigate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stadiumId: AppState.stadiumId,
            from: fromNode,
            to: toNode,
            accessibility,
            language: AppState.language,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          const instructionsEl = document.getElementById('route-instructions');
          const estTimeEl = document.getElementById('route-est-time');
          const stepsContainer = document.getElementById('route-steps-container');

          if (instructionsEl && estTimeEl && stepsContainer) {
            estTimeEl.textContent = data.estimatedTime || `${data.estimatedMinutes.join('–')} min`;
            stepsContainer.innerHTML = '';

            data.steps.forEach((step) => {
              const stepRow = document.createElement('div');
              stepRow.className =
                'flex items-start gap-2 bg-white/5 p-2 rounded border border-white/5';
              const iconSpan = document.createElement('span');
              iconSpan.className = 'text-sm';
              iconSpan.textContent = step.icon || '📍';
              const innerDiv = document.createElement('div');
              const titleDiv = document.createElement('div');
              titleDiv.className = 'font-bold text-white';
              titleDiv.textContent = `Step ${step.step}`;
              const instrDiv = document.createElement('div');
              instrDiv.className = 'text-on-surface-variant text-xs mt-0.5';
              instrDiv.textContent = step.instruction;
              innerDiv.appendChild(titleDiv);
              innerDiv.appendChild(instrDiv);
              stepRow.appendChild(iconSpan);
              stepRow.appendChild(innerDiv);
              stepsContainer.appendChild(stepRow);
            });

            instructionsEl.classList.remove('hidden');
          }
        } else {
          showToast(data.message || 'Routing failed', 'error');
        }
      } catch (err) {
        showToast('Network error during routing', 'error');
      }
    });
  }

  // Interactive Node clicks update drop-downs
  const mapNodes = document.querySelectorAll('.map-interactable');
  if (mapNodes.length > 0) {
    mapNodes.forEach((node) => {
      node.addEventListener('click', (e) => {
        const targetName = e.target.dataset.name || 'Location';

        let normalizedNode = '';
        if (targetName.startsWith('Gate ')) {
          normalizedNode = targetName;
        } else if (targetName.startsWith('Sector ')) {
          // e.g. "Sector 1 (Heavy Crowd)" -> "Sector 1"
          const parts = targetName.split(' ');
          normalizedNode = parts[0] + ' ' + parts[1];
        }

        if (normalizedNode) {
          const startSelect = document.getElementById('route-start');
          const endSelect = document.getElementById('route-end');
          if (startSelect && endSelect) {
            if (startSelect.value !== normalizedNode) {
              startSelect.value = normalizedNode;
              showToast(`Selected starting point: ${normalizedNode}`, 'info');
            } else {
              endSelect.value = normalizedNode;
              showToast(`Selected destination: ${normalizedNode}`, 'info');
            }
            if (startSelect.value !== endSelect.value) {
              calcBtn.click();
            }
          }
        }
      });
    });
  }

  // Ensure DOMPurify is loaded
  if (typeof DOMPurify === 'undefined') {
    console.error('DOMPurify not loaded!');
  }
});

// Expose utilities
window.showToast = showToast;
window.AppState = AppState;
window.switchScreen = switchScreen;
