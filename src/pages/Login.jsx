import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请填写用户名和密码');
      return;
    }

    setLoading(true);
    const result = login(username.trim(), password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] dark:bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#252525] border border-[#E5E0D5] dark:border-[#374151] rounded-xl p-8 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="#4CAF50" />
            <path d="M14 34V14l10 10 10-10v20" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="24" cy="20" r="3" fill="#FFF" />
          </svg>
          <div>
            <div className="text-gray-900 dark:text-white font-bold text-lg leading-tight">森空岛</div>
            <div className="text-gray-400 dark:text-[#AAA] text-xs">鹰角网络官方社区</div>
          </div>
        </div>

        <h2 className="text-gray-900 dark:text-white text-xl font-bold text-center mb-6">登录账号</h2>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 text-red-500 dark:text-red-400 text-sm rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-600 dark:text-[#CCC] text-sm mb-2">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              className="w-full bg-gray-100 dark:bg-[#333] text-gray-800 dark:text-white text-sm px-4 py-2.5 rounded-lg outline-none border border-transparent focus:border-[#4CAF50] transition-colors placeholder-gray-400 dark:placeholder-gray-500"
              autoComplete="username"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-600 dark:text-[#CCC] text-sm mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full bg-gray-100 dark:bg-[#333] text-gray-800 dark:text-white text-sm px-4 py-2.5 rounded-lg outline-none border border-transparent focus:border-[#4CAF50] transition-colors placeholder-gray-400 dark:placeholder-gray-500"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4CAF50] text-white py-2.5 rounded-lg font-medium hover:bg-[#388E3C] transition-colors disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-[#666] text-sm">还没有账号？</span>
          <Link to="/register" className="text-[#4CAF50] text-sm ml-1 hover:underline">立即注册</Link>
        </div>

        <div className="mt-4 p-3 bg-[#E8F5E9] dark:bg-[#1a3320] rounded-lg border border-[#C8E6C9] dark:border-[#2d5a30]">
          <p className="text-gray-600 dark:text-[#999] text-xs text-center">
            演示账号：admin / admin123 或 guest / 123456
          </p>
        </div>
      </div>
    </div>
  );
}
