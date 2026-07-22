// 应用外壳：本单元只渲染一个占位首屏，证明前端能跑通并接上 i18n。
// 真正的三端页面（主管/救生员/管理员）由后续单元在 src/pages/ 下逐个实现。
import { useTranslation } from 'react-i18next';

export default function App() {
  const { t } = useTranslation();

  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 420,
        margin: '15vh auto',
        padding: '0 20px',
        textAlign: 'center',
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ fontSize: 40, margin: 0 }}>{t('app.name')}</h1>
      <p style={{ color: '#555', fontSize: 18 }}>{t('app.tagline')}</p>
      <p style={{ color: '#999', fontSize: 14 }}>{t('app.scaffoldNotice')}</p>
    </main>
  );
}
