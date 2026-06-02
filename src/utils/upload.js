// ====================== 文件上传工具 ======================
// 将 base64 图片或视频保存到 Vite 开发服务器的 img/user/{username}/{type}/ 目录
// 生产环境下仅返回 base64 data URL

export async function uploadFile(username, type, base64Data, filename) {
  // 提取纯 base64 数据（去掉 data:xxx;base64, 前缀）
  const base64 = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, type, filename, data: base64 }),
    });
    const result = await res.json();
    if (result.success) {
      return result.path; // e.g. /img/user/admin/pic/abc123.jpg
    }
  } catch {
    // 服务器不可用时静默失败，base64 仍可用
  }
  return null;
}

// 生成唯一文件名
export function generateFilename(prefix, ext) {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).substr(2, 6);
  return `${prefix}_${ts}_${rnd}.${ext}`;
}
