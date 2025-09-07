/**
 * 基础配置文件 - 使用环境变量管理
 */

import {getAvailableApiUrl} from '@/utils/apiAvailabilityChecker';

// 辅助函数：解析布尔值
const parseBoolean = (value, defaultValue = false) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }
    return defaultValue;
};

// 辅助函数：解析数字
const parseNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

// 辅助函数：解析数组（逗号分隔）
const parseArray = (value, defaultValue = []) => {
    if (!value || value.trim() === '') return defaultValue;
    return value.split(',').map(item => item.trim()).filter(item => item);
};

// 辅助函数：解析JSON
const parseJSON = (value, defaultValue = {}) => {
    if (!value || value.trim() === '') return defaultValue;
    try {
        return JSON.parse(value);
    } catch (error) {
        console.warn('Failed to parse JSON:', value, error);
        return defaultValue;
    }
};

// 获取面板类型的常量
export const PANEL_TYPE = import.meta.env.VITE_PANEL_TYPE || 'V2board';

// 判断是否为Xiao-V2board面板
export const isXiaoV2board = () => {
    return PANEL_TYPE === 'Xiao-V2board';
};

// 判断是否为Xboard面板
export const isXboard = () => {
    return PANEL_TYPE === 'Xboard';
};

// 获取API基础URL的函数
export const getApiBaseUrl = () => {
    // 首先检查是否启用中间件代理
    if (parseBoolean(import.meta.env.VITE_API_MIDDLEWARE_ENABLED) && import.meta.env.VITE_API_MIDDLEWARE_URL) {
        const middlewareUrl = import.meta.env.VITE_API_MIDDLEWARE_URL.trim();
        const middlewarePath = import.meta.env.VITE_API_MIDDLEWARE_PATH || '/ez/ez';
        
        // 确保URL末尾没有斜杠，且路径开头有斜杠
        const formattedUrl = middlewareUrl.endsWith('/') ? middlewareUrl.slice(0, -1) : middlewareUrl;
        const formattedPath = middlewarePath.startsWith('/') ? middlewarePath : `/${middlewarePath}`;
        
        const middlewareKey = import.meta.env.VITE_API_MIDDLEWARE_KEY;
        
        if (middlewareKey) {
            return formattedUrl;
        }
        return formattedUrl + formattedPath;
    }

    // API配置
    const urlMode = import.meta.env.VITE_API_URL_MODE || 'static';
    
    // 静态URL模式
    if (urlMode === 'static' && import.meta.env.VITE_STATIC_API_URLS) {
        const staticUrls = parseArray(import.meta.env.VITE_STATIC_API_URLS);
        
        if (staticUrls.length > 1) {
            // 使用API可用性检测器获取可用的URL
            const availableUrl = getAvailableApiUrl();
            if (availableUrl) {
                return availableUrl;
            }
            // 如果没有可用URL，返回数组中的第一个URL
            return staticUrls[0];
        } else if (staticUrls.length === 1) {
            return staticUrls[0];
        }
    }

    // 自动获取模式
    if (urlMode === 'auto') {
        try {
            const currentUrl = new URL(window.location.href);
            let apiBaseUrl = '';

            // 协议
            const protocol = parseBoolean(import.meta.env.VITE_AUTO_USE_SAME_PROTOCOL, true)
                ? currentUrl.protocol
                : 'https:';

            // 域名
            apiBaseUrl = `${protocol}//${currentUrl.host}`;

            // API路径
            if (parseBoolean(import.meta.env.VITE_AUTO_APPEND_API_PATH, true)) {
                const apiPath = import.meta.env.VITE_AUTO_API_PATH || '/api/v1';
                apiBaseUrl += apiPath;
            }

            return apiBaseUrl;
        } catch (error) {
            console.error('自动获取API URL失败:', error);
            // 回退到静态URL
            const staticUrls = parseArray(import.meta.env.VITE_STATIC_API_URLS);
            return staticUrls[0] || '';
        }
    }

    return '';
};

// 直接导出API基础URL
export const API_BASE_URL = getApiBaseUrl();

/**
 * 安全配置选项
 */
export const SECURITY_CONFIG = {
    enableFrontendDomainCheck: parseBoolean(import.meta.env.VITE_SECURITY_ENABLE_FRONTEND_DOMAIN_CHECK, false),
    enableLicenseCheck: true, // 保持原有逻辑
};

// 授权的前端域名列表
export const AUTHORIZED_DOMAINS = parseArray(import.meta.env.VITE_AUTHORIZED_DOMAINS, ['panghu.com']);

/**
 * 验证码配置
 */
export const CAPTCHA_CONFIG = {
    captchaType: import.meta.env.VITE_CAPTCHA_TYPE || 'google',
    google: {
        verifyUrl: import.meta.env.VITE_CAPTCHA_GOOGLE_VERIFY_URL || 'https://www.google.com/recaptcha/api/siteverify'
    },
    cloudflare: {
        verifyUrl: import.meta.env.VITE_CAPTCHA_CLOUDFLARE_VERIFY_URL || 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
    }
};

/**
 * 自定义请求标头配置
 */
export const CUSTOM_HEADERS_CONFIG = {
    enabled: parseBoolean(import.meta.env.VITE_CUSTOM_HEADERS_ENABLED, false),
    headers: parseJSON(import.meta.env.VITE_CUSTOM_HEADERS, {})
};

// 网站名称配置
export const SITE_CONFIG = {
    siteName: import.meta.env.VITE_SITE_NAME || 'EZ THEME',
    siteDescription: import.meta.env.VITE_SITE_DESCRIPTION || 'EZ UI',
    copyright: `© ${new Date().getFullYear()} ${import.meta.env.VITE_SITE_NAME || 'EZ THEME'}. All Rights Reserved.`,
    showLogo: parseBoolean(import.meta.env.VITE_SHOW_LOGO, true),
    landingText: parseJSON(import.meta.env.VITE_LANDING_TEXT, {
        'zh-CN': '探索全球网络无限可能',
        'vi-VN': 'Khám phá khả năng vô hạn của mạng toàn cầu',
        'en-US': 'Explore Unlimited Possibilities of Global Network',
        'zh-TW': '探索全球網絡無限可能',
        'ja-JP': 'グローバルネットワークの無限の可能性',
        'ko-KR': '글로벌 네트워크의 무한한 가능성을 탐색하세요',
        'ru-RU': 'Исследуйте безграничные возможности глобальной сети',
        'fa-IR': 'امکانات نامحدود شبکه جهانی را کاوش کنید'
    }),
    customLandingPage: import.meta.env.VITE_CUSTOM_LANDING_PAGE || ''
};

// 默认语言和主题配置
export const DEFAULT_CONFIG = {
    defaultLanguage: import.meta.env.VITE_DEFAULT_LANGUAGE || 'zh-CN',
    defaultTheme: import.meta.env.VITE_DEFAULT_THEME || 'light',
    primaryColor: import.meta.env.VITE_PRIMARY_COLOR || '#355cc2',
    enableLandingPage: parseBoolean(import.meta.env.VITE_ENABLE_LANDING_PAGE, true)
};

/**
 * 支付相关配置
 */
export const PAYMENT_CONFIG = {
    openPaymentInNewTab: parseBoolean(import.meta.env.VITE_PAYMENT_OPEN_IN_NEW_TAB, true),
    qrcodeSize: parseNumber(import.meta.env.VITE_PAYMENT_QRCODE_SIZE, 200),
    qrcodeColor: import.meta.env.VITE_PAYMENT_QRCODE_COLOR || '#000000',
    qrcodeBackground: import.meta.env.VITE_PAYMENT_QRCODE_BACKGROUND || '#ffffff',
    autoCheckPayment: parseBoolean(import.meta.env.VITE_PAYMENT_AUTO_CHECK, true),
    autoCheckInterval: parseNumber(import.meta.env.VITE_PAYMENT_AUTO_CHECK_INTERVAL, 5000),
    autoCheckMaxTimes: parseNumber(import.meta.env.VITE_PAYMENT_AUTO_CHECK_MAX_TIMES, 60),
    useSafariPaymentModal: parseBoolean(import.meta.env.VITE_PAYMENT_USE_SAFARI_MODAL, true),
    autoSelectFirstMethod: parseBoolean(import.meta.env.VITE_PAYMENT_AUTO_SELECT_FIRST_METHOD, true)
};

/**
 * 用户中心页面配置
 */
export const PROFILE_CONFIG = {
    showGiftCardRedeem: parseBoolean(import.meta.env.VITE_PROFILE_SHOW_GIFT_CARD_REDEEM, false),
    showRecentDevices: parseBoolean(import.meta.env.VITE_PROFILE_SHOW_RECENT_DEVICES, true)
};

/**
 * 工单配置
 */
export const TICKET_CONFIG = {
    includeUserInfoInTicket: parseBoolean(import.meta.env.VITE_TICKET_INCLUDE_USER_INFO, true),
    popup: {
        enabled: parseBoolean(import.meta.env.VITE_TICKET_POPUP_ENABLED, true),
        title: import.meta.env.VITE_TICKET_POPUP_TITLE || '工单须知',
        content: import.meta.env.VITE_TICKET_POPUP_CONTENT || '<p>请您准确描述您的问题，再提交工单，以便我们更快帮助您。</p>',
        cooldownHours: parseNumber(import.meta.env.VITE_TICKET_POPUP_COOLDOWN_HOURS, 24),
        closeWaitSeconds: parseNumber(import.meta.env.VITE_TICKET_POPUP_CLOSE_WAIT_SECONDS, 0)
    }
};

/**
 * 流量明细配置
 */
export const TRAFFICLOG_CONFIG = {
    enableTrafficLog: parseBoolean(import.meta.env.VITE_TRAFFICLOG_ENABLE, true),
    daysToShow: parseNumber(import.meta.env.VITE_TRAFFICLOG_DAYS_TO_SHOW, 30),
    sumDailyTraffic: parseBoolean(import.meta.env.VITE_TRAFFICLOG_SUM_DAILY_TRAFFIC, false)
};

/**
 * 客户端下载配置
 */
export const CLIENT_CONFIG = {
    showDownloadCard: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_DOWNLOAD_CARD, true),
    
    // 平台显示控制
    showIOS: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_IOS, true),
    showAndroid: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_ANDROID, true),
    showMacOS: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_MACOS, true),
    showWindows: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_WINDOWS, true),
    showLinux: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_LINUX, true),
    showOpenWrt: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_OPENWRT, true),

    // 客户端下载链接
    clientLinks: {
        ios: import.meta.env.VITE_CLIENT_LINK_IOS || 'https://apps.apple.com/app/xxx',
        android: import.meta.env.VITE_CLIENT_LINK_ANDROID || 'https://play.google.com/store/apps/xxx',
        macos: import.meta.env.VITE_CLIENT_LINK_MACOS || 'https://github.com/xxx/releases/latest',
        windows: import.meta.env.VITE_CLIENT_LINK_WINDOWS || 'https://github.com/xxx/releases/latest',
        linux: import.meta.env.VITE_CLIENT_LINK_LINUX || 'https://github.com/xxx/releases/latest',
        openwrt: import.meta.env.VITE_CLIENT_LINK_OPENWRT || 'https://github.com/xxx/releases/latest'
    },

    // iOS平台客户端
    showShadowrocket: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_SHADOWROCKET, true),
    showSurge: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_SURGE, true),
    showStash: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_STASH, true),
    showQuantumultX: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_QUANTUMULTX, true),
    showHiddifyIOS: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_HIDDIFY_IOS, true),
    showSingboxIOS: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_SINGBOX_IOS, true),
    showLoon: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_LOON, true),

    // Android平台客户端
    showFlClashAndroid: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_FLCLASH_ANDROID, true),
    showV2rayNG: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_V2RAYNG, true),
    showClashAndroid: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_CLASH_ANDROID, true),
    showSurfboard: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_SURFBOARD, true),
    showClashMetaAndroid: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_CLASH_META_ANDROID, true),
    showNekobox: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_NEKOBOX, true),
    showSingboxAndroid: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_SINGBOX_ANDROID, true),
    showHiddifyAndroid: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_HIDDIFY_ANDROID, true),

    // Windows平台客户端
    showFlClashWindows: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_FLCLASH_WINDOWS, true),
    showClashVergeWindows: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_CLASH_VERGE_WINDOWS, true),
    showClashWindows: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_CLASH_WINDOWS, true),
    showNekoray: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_NEKORAY, true),
    showSingboxWindows: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_SINGBOX_WINDOWS, true),
    showHiddifyWindows: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_HIDDIFY_WINDOWS, true),

    // MacOS平台客户端
    showFlClashMac: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_FLCLASH_MAC, true),
    showClashVergeMac: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_CLASH_VERGE_MAC, true),
    showClashX: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_CLASHX, true),
    showClashMetaX: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_CLASH_METAX, true),
    showSurgeMac: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_SURGE_MAC, true),
    showStashMac: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_STASH_MAC, true),
    showQuantumultXMac: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_QUANTUMULTX_MAC, true),
    showSingboxMac: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_SINGBOX_MAC, true),
    showHiddifyMac: parseBoolean(import.meta.env.VITE_CLIENT_SHOW_HIDDIFY_MAC, true)
};

/**
 * 商店页面配置
 */
export const SHOP_CONFIG = {
    showHotSaleBadge: parseBoolean(import.meta.env.VITE_SHOP_SHOW_HOT_SALE_BADGE, false),
    showPlanFeatureCards: parseBoolean(import.meta.env.VITE_SHOP_SHOW_PLAN_FEATURE_CARDS, true),
    autoSelectMaxPeriod: parseBoolean(import.meta.env.VITE_SHOP_AUTO_SELECT_MAX_PERIOD, false),
    hidePeriodTabs: parseBoolean(import.meta.env.VITE_SHOP_HIDE_PERIOD_TABS, false),
    lowStockThreshold: parseNumber(import.meta.env.VITE_SHOP_LOW_STOCK_THRESHOLD, 5),
    enableDiscountCalculation: parseBoolean(import.meta.env.VITE_SHOP_ENABLE_DISCOUNT_CALCULATION, true),
    
    // 价格周期的显示顺序（从大到小）
    periodOrder: [
        'three_year_price', 'two_year_price', 'year_price', 'half_year_price',
        'quarter_price', 'month_price', 'onetime_price'
    ],

    popup: {
        enabled: parseBoolean(import.meta.env.VITE_SHOP_POPUP_ENABLED, false),
        title: import.meta.env.VITE_SHOP_POPUP_TITLE || '',
        content: import.meta.env.VITE_SHOP_POPUP_CONTENT || '',
        cooldownHours: parseNumber(import.meta.env.VITE_SHOP_POPUP_COOLDOWN_HOURS, 0),
        closeWaitSeconds: parseNumber(import.meta.env.VITE_SHOP_POPUP_CLOSE_WAIT_SECONDS, 0)
    }
};

/**
 * 订单配置
 */
export const ORDER_CONFIG = {
    confirmOrder: parseBoolean(import.meta.env.VITE_ORDER_CONFIRM_ORDER, true),
    confirmOrderContent: import.meta.env.VITE_ORDER_CONFIRM_CONTENT || '<p>您确定要购买该套餐吗？</p>'
};

/**
 * 仪表盘页面配置
 */
export const DASHBOARD_CONFIG = {
    showUserEmail: parseBoolean(import.meta.env.VITE_DASHBOARD_SHOW_USER_EMAIL, true),
    importButtonHighlightBtnbgcolor: parseBoolean(import.meta.env.VITE_DASHBOARD_IMPORT_BUTTON_HIGHLIGHT, false),
    enableResetTraffic: parseBoolean(import.meta.env.VITE_DASHBOARD_ENABLE_RESET_TRAFFIC, true),
    resetTrafficDisplayMode: import.meta.env.VITE_DASHBOARD_RESET_TRAFFIC_DISPLAY_MODE || 'low',
    lowTrafficThreshold: parseNumber(import.meta.env.VITE_DASHBOARD_LOW_TRAFFIC_THRESHOLD, 10),
    enableRenewPlan: parseBoolean(import.meta.env.VITE_DASHBOARD_ENABLE_RENEW_PLAN, true),
    renewPlanDisplayMode: import.meta.env.VITE_DASHBOARD_RENEW_PLAN_DISPLAY_MODE || 'always',
    expiringThreshold: parseNumber(import.meta.env.VITE_DASHBOARD_EXPIRING_THRESHOLD, 7),
    showOnlineDevicesLimit: parseBoolean(import.meta.env.VITE_DASHBOARD_SHOW_ONLINE_DEVICES_LIMIT, true),
    showImportSubscription: parseBoolean(import.meta.env.VITE_DASHBOARD_SHOW_IMPORT_SUBSCRIPTION, true)
};

/**
 * 将16进制颜色转换为RGB数组
 */
const hexToRgb = (hex) => {
    if (typeof hex !== 'string') {
        hex = String(hex);
    }

    hex = hex.trim();
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (result) {
        return [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ];
    }
};

/**
 * 计算主题相关的颜色
 */
const calculateThemeColors = (primaryColor) => {
    const rgb = hexToRgb(primaryColor);
    return {
        primaryColor: primaryColor,
        primaryColorRgb: rgb.join(', '),
        primaryColorLight: `rgba(${rgb.join(', ')}, 0.1)`,
        primaryColorDark: primaryColor,
        primaryColorHover: `rgba(${rgb.join(', ')}, 0.9)`,
        primaryColorActive: `rgba(${rgb.join(', ')}, 0.8)`,
        primaryColorFocus: `rgba(${rgb.join(', ')}, 0.25)`
    };
};

// 主题配置
export const THEME_CONFIG = {
    defaultTheme: DEFAULT_CONFIG.defaultTheme,
    light: {
        ...calculateThemeColors(DEFAULT_CONFIG.primaryColor),
        backgroundColor: '#f5f7fa',
        cardBackground: '#ffffff',
        textColor: '#333333',
        secondaryTextColor: '#666666',
        borderColor: '#e8e8e8',
        shadowColor: 'rgba(0, 0, 0, 0.1)'
    },
    dark: {
        ...calculateThemeColors(DEFAULT_CONFIG.primaryColor),
        backgroundColor: '#171A1D',
        cardBackground: 'rgba(30, 30, 30, 0.8)',
        textColor: 'rgba(255, 255, 255, 0.9)',
        secondaryTextColor: 'rgba(255, 255, 255, 0.6)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: 'rgba(0, 0, 0, 0.3)'
    }
};

// 背景装饰球配置
export const BACKGROUND_BALLS_CONFIG = [
    {
        size: '600px',
        background: 'var(--theme-color)',
        position: {top: '-10%', left: '-10%'},
        animationDuration: '25s'
    },
    {
        size: '500px',
        background: '#A747FE',
        position: {top: '40%', right: '-5%'},
        animationDuration: '30s'
    },
    {
        size: '450px',
        background: '#37DEC9',
        position: {bottom: '-10%', left: '20%'},
        animationDuration: '35s'
    }
];

/**
 * 浏览器访问限制配置
 */
export const BROWSER_RESTRICT_CONFIG = {
    enabled: parseBoolean(import.meta.env.VITE_BROWSER_RESTRICT_ENABLED, false),
    restrictBrowsers: {
        '360': parseBoolean(import.meta.env.VITE_BROWSER_RESTRICT_360, true),
        'QQ': parseBoolean(import.meta.env.VITE_BROWSER_RESTRICT_QQ, true),
        'WeChat': parseBoolean(import.meta.env.VITE_BROWSER_RESTRICT_WECHAT, true),
        'Baidu': parseBoolean(import.meta.env.VITE_BROWSER_RESTRICT_BAIDU, true),
        'Sogou': parseBoolean(import.meta.env.VITE_BROWSER_RESTRICT_SOGOU, true),
        'UC': parseBoolean(import.meta.env.VITE_BROWSER_RESTRICT_UC, false),
        'Maxthon': parseBoolean(import.meta.env.VITE_BROWSER_RESTRICT_MAXTHON, false)
    },
    recommendedBrowsers: {
        'Chrome': import.meta.env.VITE_BROWSER_RECOMMEND_CHROME || 'https://www.google.cn/chrome/',
        'Edge': import.meta.env.VITE_BROWSER_RECOMMEND_EDGE || 'https://www.microsoft.com/zh-cn/edge'
    }
};

/**
 * 检测当前浏览器类型
 */
export const detectBrowser = () => {
    const ua = navigator.userAgent.toLowerCase();

    if (ua.indexOf('micromessenger') !== -1) return 'WeChat';
    if (ua.indexOf('qqbrowser') !== -1 || ua.indexOf(' qq') !== -1 && ua.indexOf('mqqbrowser') !== -1) return 'QQ';
    if (ua.indexOf('qihu') !== -1 || ua.indexOf('360ee') !== -1 || ua.indexOf('360se') !== -1 ||
        (ua.indexOf('chrome') !== -1 && (navigator.connection?.saveData === undefined) && (navigator.connection?.rtt === undefined))) return '360';
    if (ua.indexOf('bidubrowser') !== -1 || ua.indexOf('baidubrowser') !== -1) return 'Baidu';
    if (ua.indexOf('metasr') !== -1 || ua.indexOf('sogou') !== -1) return 'Sogou';
    if (ua.indexOf('ucbrowser') !== -1 || ua.indexOf('ucweb') !== -1) return 'UC';
    if (ua.indexOf('maxthon') !== -1) return 'Maxthon';
    if (ua.indexOf('edg') !== -1) return 'Edge';
    if (ua.indexOf('chrome') !== -1) return 'Chrome';
    if (ua.indexOf('safari') !== -1) return 'Safari';
    if (ua.indexOf('firefox') !== -1) return 'Firefox';

    return 'Unknown';
};

/**
 * 检查当前浏览器是否被限制访问
 */
export const isBrowserRestricted = () => {
    if (!BROWSER_RESTRICT_CONFIG.enabled) return false;
    const browserType = detectBrowser();
    return BROWSER_RESTRICT_CONFIG.restrictBrowsers[browserType] || false;
};

/**
 * 充值相关配置
 */
export const WALLET_CONFIG = {
    presetAmounts: parseArray(import.meta.env.VITE_WALLET_PRESET_AMOUNTS, [6, 30, 68, 128, 256, 328, 648, 1280]).map(Number),
    defaultSelectedAmount: import.meta.env.VITE_WALLET_DEFAULT_SELECTED_AMOUNT ? parseNumber(import.meta.env.VITE_WALLET_DEFAULT_SELECTED_AMOUNT) : null,
    minimumDepositAmount: parseNumber(import.meta.env.VITE_WALLET_MINIMUM_DEPOSIT_AMOUNT, 1)
};

/**
 * 邀请页面配置
 */
export const INVITE_CONFIG = {
    showCommissionBadge: parseBoolean(import.meta.env.VITE_INVITE_SHOW_COMMISSION_BADGE, false),
    recordsPerPage: parseNumber(import.meta.env.VITE_INVITE_RECORDS_PER_PAGE, 10),
    inviteLinkConfig: {
        linkMode: import.meta.env.VITE_INVITE_LINK_MODE || 'auto',
        customDomain: import.meta.env.VITE_INVITE_CUSTOM_DOMAIN || 'https://example.com'
    }
};

/**
 * 节点列表配置
 */
export const NODES_CONFIG = {
    showNodeRate: parseBoolean(import.meta.env.VITE_NODES_SHOW_NODE_RATE, true),
    showNodeDetails: parseBoolean(import.meta.env.VITE_NODES_SHOW_NODE_DETAILS, false),
    allowViewNodeInfo: parseBoolean(import.meta.env.VITE_NODES_ALLOW_VIEW_NODE_INFO, true)
};

/**
 * 客服系统配置
 */
export const CUSTOMER_SERVICE_CONFIG = {
    enabled: parseBoolean(import.meta.env.VITE_CUSTOMER_SERVICE_ENABLED, false),
    type: import.meta.env.VITE_CUSTOMER_SERVICE_TYPE || 'crisp',
    customHtml: import.meta.env.VITE_CUSTOMER_SERVICE_CUSTOM_HTML || '',
    showWhenNotLoggedIn: parseBoolean(import.meta.env.VITE_CUSTOMER_SERVICE_SHOW_WHEN_NOT_LOGGED_IN, true),
    embedMode: import.meta.env.VITE_CUSTOMER_SERVICE_EMBED_MODE || 'embed',
    iconPosition: {
        desktop: {
            left: import.meta.env.VITE_CUSTOMER_SERVICE_DESKTOP_LEFT || '20px',
            bottom: import.meta.env.VITE_CUSTOMER_SERVICE_DESKTOP_BOTTOM || '20px'
        },
        mobile: {
            right: import.meta.env.VITE_CUSTOMER_SERVICE_MOBILE_RIGHT || '20px',
            bottom: import.meta.env.VITE_CUSTOMER_SERVICE_MOBILE_BOTTOM || '100px'
        }
    }
};

/**
 * More页面自定义卡片配置
 */
export const MORE_PAGE_CONFIG = {
    enableCustomCards: parseBoolean(import.meta.env.VITE_MORE_PAGE_ENABLE_CUSTOM_CARDS, false),
    customCards: parseJSON(import.meta.env.VITE_MORE_PAGE_CUSTOM_CARDS, [])
};

/**
 * 认证页面布局配置
 */
export const AUTH_LAYOUT_CONFIG = {
    layoutType: import.meta.env.VITE_AUTH_LAYOUT_TYPE || 'center',
    splitLayout: {
        leftContent: {
            backgroundImage: import.meta.env.VITE_AUTH_SPLIT_BACKGROUND_IMAGE || '',
            siteName: {
                show: parseBoolean(import.meta.env.VITE_AUTH_SPLIT_SHOW_SITE_NAME, true),
                color: import.meta.env.VITE_AUTH_SPLIT_SITE_NAME_COLOR || 'white'
            },
            greeting: {
                show: parseBoolean(import.meta.env.VITE_AUTH_SPLIT_SHOW_GREETING, true),
                color: import.meta.env.VITE_AUTH_SPLIT_GREETING_COLOR || 'white'
            }
        }
    }
};

/**
 * 认证页面功能配置
 */
export const AUTH_CONFIG = {
    autoAgreeTerms: parseBoolean(import.meta.env.VITE_AUTO_AGREE_TERMS, false),
    verificationCode: {
        showCheckSpamTip: parseBoolean(import.meta.env.VITE_SHOW_CHECK_SPAM_TIP, true),
        checkSpamTipDelay: parseNumber(import.meta.env.VITE_CHECK_SPAM_TIP_DELAY, 1000)
    },
    popup: {
        enabled: parseBoolean(import.meta.env.VITE_AUTH_POPUP_ENABLED, false),
        title: import.meta.env.VITE_AUTH_POPUP_TITLE || '用户须知 (可自定义开启)',
        content: import.meta.env.VITE_AUTH_POPUP_CONTENT || '<p><strong>欢迎使用我们的服务！</strong></p><p>请注意以下事项：</p><ul><li>请妥善保管您的账号信息</li><li>如有问题请联系客服</li></ul>',
        cooldownHours: parseNumber(import.meta.env.VITE_AUTH_POPUP_COOLDOWN_HOURS, 0),
        closeWaitSeconds: parseNumber(import.meta.env.VITE_AUTH_POPUP_CLOSE_WAIT_SECONDS, 3)
    }
};

// API中间件配置导出
export const API_MIDDLEWARE_ENABLED = parseBoolean(import.meta.env.VITE_API_MIDDLEWARE_ENABLED, false);
export const API_MIDDLEWARE_KEY = import.meta.env.VITE_API_MIDDLEWARE_KEY || '';
export const API_MIDDLEWARE_PATH = import.meta.env.VITE_API_MIDDLEWARE_PATH || '/api';
export const API_BASE_URLS = parseArray(import.meta.env.VITE_API_BASE_URLS);