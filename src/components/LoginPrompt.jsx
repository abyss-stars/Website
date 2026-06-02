import { useNavigate } from 'react-router-dom';

export default function LoginPrompt({ message = '请先登录后再操作', onClose }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#252525] border border-[#E5E0D5] dark:border-[#374151] rounded-xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">需要登录</h3>
        <p className="text-[#999] text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm text-[#999] border border-[#DDD] dark:border-[#444] rounded-lg hover:bg-gray-100 dark:hover:bg-[#333] transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex-1 px-4 py-2 text-sm text-white bg-[#4CAF50] rounded-lg hover:bg-[#388E3C] transition-colors"
          >
            去登录
          </button>
        </div>
      </div>
    </div>
  );
}
