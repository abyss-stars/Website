import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { IconSearch, IconBell, IconChevronDown, IconMenu, IconUser, IconLogout, IconGift, IconSettings, IconSun, IconMoon, IconEdit, IconImage, IconGrid, IconVideo, IconClock, IconFlame, IconTrash } from './icons';

const Logo = () => (
  <Link to="/" className="flex items-center gap-3 shrink-0">
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#4CAF50" />
      <path d="M14 34V14l10 10 10-10v20" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="24" cy="20" r="3" fill="#FFF" />
    </svg>
    <div className="hidden sm:block">
      <div className="text-white font-bold text-base leading-tight">森空岛</div>
      <div className="text-[#AAAAAA] text-xs leading-tight">鹰角网络官方社区</div>
    </div>
  </Link>
);

const SearchBar = () => {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const hotSearches = ['焰狐龙梓兰', '泡影苍霆', '火山旅梦', '终末地测试', '音律联觉'];

  const history = (() => {
    try { return JSON.parse(localStorage.getItem('search_history') || '[]').slice(0, 8); }
    catch { return []; }
  })();

  const clearHistory = () => {
    localStorage.setItem('search_history', '[]');
    // trigger re-render by losing and regaining focus
    setShowDropdown(false);
    setTimeout(() => setShowDropdown(true), 0);
  };

  const doSearch = (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    // save to history
    let h = history.filter(h => h !== trimmed);
    h.unshift(trimmed);
    if (h.length > 10) h = h.slice(0, 10);
    localStorage.setItem('search_history', JSON.stringify(h));
    setShowDropdown(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doSearch(query);
  };

  // 点击外部关闭下拉
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const expanded = focused || showDropdown;

  return (
    <div className="hidden md:block relative" ref={containerRef}>
      <form onSubmit={handleSubmit}
        className={`flex items-center bg-gray-100 dark:bg-[#333333] rounded-md px-3 py-1.5 transition-all duration-300 border ${
          expanded ? 'border-[#4CAF50] w-[380px]' : 'border-transparent w-48 lg:w-56'
        }`}>
        <IconSearch size={16} color="#999" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索你感兴趣的内容"
          className="bg-transparent text-gray-800 dark:text-white text-sm ml-2 outline-none flex-1 placeholder-gray-400 dark:placeholder-gray-500"
          onFocus={() => { setFocused(true); setShowDropdown(true); }}
          onBlur={() => setFocused(false)}
        />
      </form>

      {/* 搜索下拉菜单 */}
      {showDropdown && (
        <div className="absolute top-full mt-2 left-0 w-full bg-[#1E1E1E]/95 dark:bg-[#1E1E1E]/95 backdrop-blur-md border border-[#374151] rounded-xl shadow-2xl py-4 px-5 z-30">

          {/* 历史搜索 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <IconClock size={14} color="#999" />
                <span className="text-[#CCC] text-xs font-medium">历史搜索</span>
              </div>
              {history.length > 0 && (
                <button onClick={clearHistory}
                  className="flex items-center gap-1 text-[#666] hover:text-red-400 transition-colors">
                  <IconTrash size={12} color="currentColor" />
                  <span className="text-xs">清空</span>
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-[#666] text-xs">暂无搜索记录</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {history.map((h, i) => (
                  <button key={i} onClick={() => { setQuery(h); doSearch(h); }}
                    className="px-3 py-1.5 text-xs text-[#CCC] bg-[#2a2a2a] rounded-full hover:bg-[#374151] hover:text-white transition-colors">
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 热门搜索 */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <IconFlame size={14} color="#FF6B35" />
              <span className="text-[#CCC] text-xs font-medium">热门搜索</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hotSearches.map((h, i) => (
                <button key={i} onClick={() => { setQuery(h); doSearch(h); }}
                  className="px-3 py-1.5 text-xs text-[#CCC] bg-[#2a2a2a] rounded-full hover:bg-[#374151] hover:text-white transition-colors">
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PublishDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handlePublish = () => {
    setOpen(false);
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/publish');
  };

  const handleGallery = () => {
    setOpen(false);
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/gallery');
  };

  const handleVideo = () => {
    setOpen(false);
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/video');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onMouseEnter={() => setOpen(true)}
        className="text-[#CCC] hover:text-white transition-colors p-1"
        title="发布作品"
      >
        <IconEdit size={18} color="#CCC" />
      </button>
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute top-full right-0 mt-2 bg-[#2a2a2a] dark:bg-[#2a2a2a] border border-[#374151] rounded-md shadow-lg py-2 w-36 z-20"
        >
          <button onClick={handlePublish} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white hover:bg-[#374151] transition-colors">
            <IconImage size={16} color="#4CAF50" />
            <span>发图文</span>
          </button>
          <button onClick={handleGallery} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white hover:bg-[#374151] transition-colors">
            <IconGrid size={16} color="#4CAF50" />
            <span>发图集</span>
          </button>
          <button onClick={handleVideo} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white hover:bg-[#374151] transition-colors">
            <IconVideo size={16} color="#4CAF50" />
            <span>发视频</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default function NavBar({ onMenuClick }) {
  const { currentUser, isLoggedIn, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMinimalNav = location.pathname === '/search' || location.pathname === '/publish' || location.pathname === '/gallery' || location.pathname === '/video';
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 未读通知数
  const unreadCount = (() => {
    if (!currentUser) return 0;
    try {
      const notifs = JSON.parse(localStorage.getItem(`notifications_${currentUser.id}`) || '[]');
      return notifs.filter(n => !n.read).length;
    } catch { return 0; }
  })();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-[15px] left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[60px] bg-[#222222] dark:bg-[#222222] border-b border-[#374151] rounded-xl flex items-center px-4 lg:px-6 z-50">
      <Logo />

      <div className="hidden md:flex items-center gap-1 ml-8">
        <Link to="/" className="px-4 py-1.5 text-white text-sm font-medium rounded-md hover:bg-[#374151] transition-colors duration-200">
          首页
        </Link>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-1 ${dropdownOpen ? 'bg-[#374151] text-white' : 'text-white hover:bg-[#374151]'}`}
          >
            版区
            <IconChevronDown size={14} />
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute top-full mt-1 left-0 bg-[#2a2a2a] dark:bg-[#2a2a2a] border border-[#374151] rounded-md shadow-lg py-1 w-40 z-20">
                {['明日方舟', '来自星尘', '泡姆泡姆', '终末地'].map(item => (
                  <button key={item} className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#374151] transition-colors duration-150">
                    {item}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {!isMinimalNav && <SearchBar />}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="text-[#CCC] hover:text-white transition-colors p-1"
          title={theme === 'dark' ? '切换到白天模式' : '切换到黑夜模式'}
        >
          {theme === 'dark' ? <IconSun size={18} color="#CCC" /> : <IconMoon size={18} color="#555" />}
        </button>

        {!isMinimalNav && (
          <button className="md:hidden text-[#CCC] hover:text-white transition-colors">
            <IconSearch size={20} />
          </button>
        )}

        {/* Publish dropdown */}
        <PublishDropdown />

        {!isMinimalNav && (
          <button className="relative text-[#CCC] hover:text-white transition-colors">
            <IconBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 border-2 border-[#222222]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}

        {isLoggedIn ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 hover:ring-2 hover:ring-[#4CAF50] rounded-full transition-all duration-200"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.nickname}
                className="w-8 h-8 rounded-full shadow-md"
              />
            </button>
            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-[#2a2a2a] dark:bg-[#2a2a2a] border border-[#374151] rounded-md shadow-lg py-1 w-48 z-20">
                <div className="px-4 py-2 border-b border-[#374151]">
                  <div className="text-white font-medium text-sm">{currentUser.nickname}</div>
                  <div className="text-[#999] text-xs">@{currentUser.username}</div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-[#374151] transition-colors"
                >
                  <IconUser size={16} /> 个人中心
                </Link>
                <Link
                  to="/profile?tab=posts"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-[#374151] transition-colors"
                >
                  <IconSettings size={16} /> 我的帖子
                </Link>
                <Link
                  to="/publish-manager"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-[#374151] transition-colors"
                >
                  <IconGrid size={16} color="#999" /> 发布管理
                </Link>
                <button
                  onClick={() => { setUserMenuOpen(false); navigate('/?checkin=true'); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-[#374151] transition-colors w-full text-left"
                >
                  <IconGift size={16} /> 签到
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[#374151] transition-colors w-full text-left"
                >
                  <IconLogout size={16} /> 退出登录
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 text-sm text-[#4CAF50] border border-[#4CAF50] rounded-md hover:bg-[#4CAF50] hover:text-white transition-colors"
            >
              登录
            </Link>
            <Link
              to="/register"
              className="hidden sm:block px-3 py-1.5 text-sm text-white bg-[#4CAF50] rounded-md hover:bg-[#388E3C] transition-colors"
            >
              注册
            </Link>
          </div>
        )}

        <button onClick={onMenuClick} className="md:hidden text-white">
          <IconMenu size={22} />
        </button>
      </div>
    </nav>
  );
}
