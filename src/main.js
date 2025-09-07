const isProd = import.meta.env.PROD;
const enableAntiDebugging = import.meta.env.VITE_DEBUGGING === "true";

(async () => {
  try {
    // 反调试逻辑 - 使用动态导入
    if (isProd && enableAntiDebugging) {
      try {
        const { default: disableDevtool } = await import("disable-devtool");
        disableDevtool();
      } catch (error) {
        console.warn("Failed to load disable-devtool:", error);
      }
    }
    
    // 直接初始化应用，配置现在通过环境变量管理
    await import('./appInit.js');
  } catch (error) {
    console.error(error);
  }
})();