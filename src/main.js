import disableDevtool from "disable-devtool";

const isProd = import.meta.env.MODE === "production";
const enableConfigJS = import.meta.env.VITE_APP_CONFIGJS == "true";
const enableAntiDebugging = import.meta.env.VITE_APP_DEBUGGING == "true";

(async () => {
  try {
    if (!isProd || !enableConfigJS) {
      const res = await import('./config/index.js');
      if (typeof window !== 'undefined') {
        window.EZ_CONFIG = res.config || res.default || res;
      }
    }
    
    // 反调试逻辑
    if (isProd && enableAntiDebugging) {
      disableDevtool()
    }
    
    // ⚠️ 确保在 config 加载后再初始化应用
    await import('./appInit.js');
  } catch (error) {
    console.error(error);
  }
})();

