// i18next 初始化：第一期只做繁体中文（香港）zh-HK 一种语言，作为默认与兜底。
// 后续新增语言时在 resources 里加对应命名空间即可。
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhHK from '../locales/zh-HK/translation.json';

i18n.use(initReactI18next).init({
  resources: {
    'zh-HK': { translation: zhHK },
  },
  lng: 'zh-HK',
  fallbackLng: 'zh-HK',
  interpolation: {
    // React 已自动转义，无需 i18next 再转义。
    escapeValue: false,
  },
});

export default i18n;
