import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllPosts, createPost } from '../utils/storage';
import {
  IconSearch, IconGrid, IconImage, IconVideo, IconEdit,
  IconMessageCircle, IconThumbsUp, IconTrash, IconClock, IconFlame,
} from '../components/icons';

// ====================== 搜索历史管理 ======================
function getSearchHistory() {
  try { return JSON.parse(localStorage.getItem('search_history') || '[]'); }
  catch { return []; }
}
function addSearchHistory(query) {
  let history = getSearchHistory().filter(h => h !== query);
  history.unshift(query);
  if (history.length > 10) history = history.slice(0, 10);
  localStorage.setItem('search_history', JSON.stringify(history));
}
function clearSearchHistory() {
  localStorage.setItem('search_history', '[]');
}

// ====================== 搜索结果卡片 ======================
function SearchPostCard({ post, searchQuery }) {
  const navigate = useNavigate();

  const title = post.content.length > 40 ? post.content.substring(0, 40) + '...' : post.content;
  const desc = post.content.length > 80 ? post.content.substring(0, 80) + '...' : post.content;

  return (
    <article className="bg-white dark:bg-[#252525] rounded-xl p-4 mb-4 transition-shadow duration-300 hover:shadow-md dark:hover:shadow-black/20 cursor-pointer"
      onClick={() => navigate(`/profile/${post.authorId}`)}>
      <div className="flex gap-4">
        {/* 左侧内容 */}
        <div className="flex-1 min-w-0">
          {/* 头部：头像 + 用户名 + 时间 */}
          <div className="flex items-center gap-2 mb-3">
            <img src={post.authorAvatar} alt="" className="w-6 h-6 rounded-full shrink-0" />
            <span className="text-gray-900 dark:text-white text-sm font-medium">{post.authorName}</span>
            <span className="text-[#999] text-xs">{post.time}</span>
          </div>

          {/* 标题 */}
          <h3 className="text-gray-900 dark:text-white font-bold text-base mb-1.5 line-clamp-1">
            {title}
          </h3>

          {/* 描述 */}
          <p className="text-[#888] text-sm leading-relaxed line-clamp-2 mb-3">
            {desc}
          </p>

          {/* 底部：标签 + 互动数据 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 text-xs bg-[#E8F5E9] dark:bg-[#1a3320] text-[#43A047] rounded">
                  {tag}
                </span>
              ))}
              <span className="text-[#999] text-xs">{post.game}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-[#999] text-xs">
                <IconMessageCircle size={14} /> {post.comments || 0}
              </span>
              <span className="flex items-center gap-1 text-[#999] text-xs">
                <IconThumbsUp size={14} /> {post.likes || 0}
              </span>
            </div>
          </div>
        </div>

        {/* 右侧缩略图 */}
        {post.image && (
          <div className="shrink-0 w-[120px] h-[80px] rounded-lg overflow-hidden hidden sm:block"
            style={{ background: post.imageBg || 'linear-gradient(135deg, #2d3a4a, #1a2744, #0f1f3d)' }}>
            <div className="w-full h-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

// ====================== 主页面 ======================
// 版区列表（display 用于下拉展示，gameKey 用于匹配 post.game 字段）
const BOARDS = [
  { name: '明日方舟', icon: '🔷', gameKey: '明日方舟' },
  { name: '来自星尘', icon: '✨', gameKey: '来自星尘' },
  { name: '终末地', icon: '🌌', gameKey: '终末地' },
  { name: '泡姆泡姆', icon: '🎮', gameKey: '泡姆泡姆' },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const initialQuery = searchParams.get('q') || '';
  const initialBoard = searchParams.get('board') || '';
  const [inputValue, setInputValue] = useState(initialQuery);
  const [selectedBoard, setSelectedBoard] = useState(initialBoard);
  const [activeCategory, setActiveCategory] = useState('综合');
  const [sortBy, setSortBy] = useState('最热');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState(getSearchHistory);

  // 版区参数变化时同步状态
  useEffect(() => {
    const b = searchParams.get('board') || '';
    setSelectedBoard(b);
  }, [searchParams]);

  // 当前选中的版区对象
  const currentBoard = BOARDS.find(b => b.gameKey === selectedBoard) || null;

  // 执行搜索
  const doSearch = (query, board) => {
    if (!query.trim() && !board) return;
    const params = {};
    if (query.trim()) {
      params.q = query.trim();
      addSearchHistory(query.trim());
      setSearchHistory(getSearchHistory());
    }
    if (board) {
      params.board = board;
    }
    setSearchParams(params);
  };

  // 切换版区
  const handleBoardChange = (boardKey) => {
    setCategoryOpen(false);
    const newBoard = selectedBoard === boardKey ? '' : boardKey;
    const params = {};
    const q = searchParams.get('q') || inputValue;
    if (q) params.q = q;
    if (newBoard) params.board = newBoard;
    setSearchParams(params);
  };

  // 自动搜索（URL 带 q 参数时）
  useEffect(() => {
    if (initialQuery) {
      setInputValue(initialQuery);
    }
  }, [initialQuery]);

  // 搜索逻辑
  const results = useMemo(() => {
    const query = (searchParams.get('q') || '').toLowerCase().trim();
    const board = searchParams.get('board') || '';

    let posts = getAllPosts();

    // 版区筛选（优先执行，版区可以独立于关键词搜索）
    if (board) {
      posts = posts.filter(p => (p.game || '') === board || (p.game || '').toLowerCase() === board.toLowerCase());
    }

    // 文本搜索：内容、标签、作者名、游戏名
    if (query) {
      posts = posts.filter(p =>
        p.content.toLowerCase().includes(query) ||
        (p.authorName || '').toLowerCase().includes(query) ||
        (p.tags || []).some(t => t.toLowerCase().includes(query)) ||
        (p.game || '').toLowerCase().includes(query)
      );
    }

    // 分类过滤
    if (activeCategory === '攻略') {
      posts = posts.filter(p => (p.tags || []).some(t => t.includes('攻略')));
    } else if (activeCategory === '话题') {
      posts = posts.filter(p => (p.tags || []).length > 0);
    } else if (activeCategory === '用户') {
      posts = posts.filter(p => (p.authorName || '').toLowerCase().includes(query));
    }

    // 排序
    if (sortBy === '最新') {
      posts.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } else {
      posts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    return posts;
  }, [searchParams, activeCategory, sortBy]);

  // 是否有任何搜索条件（关键词或版区）
  const hasAnyFilter = !!(searchParams.get('q') || searchParams.get('board'));

  const hotSearches = [
    { text: '焰狐龙梓兰', tag: 'HOT' },
    { text: '泡影苍霆', tag: 'NEW' },
    { text: '明日方舟', tag: 'HOT' },
    { text: '火山旅梦', tag: null },
    { text: '终末地测试', tag: 'NEW' },
  ];

  const categoryRef = { current: null };

  // 清除输入
  const handleClear = () => {
    setInputValue('');
    const board = searchParams.get('board');
    if (board) {
      setSearchParams({ board });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] dark:bg-[#1a1a1a] pt-[91px]">
      <div className="max-w-[1000px] mx-auto px-4 pb-8 flex gap-6">
        {/* ====================== 左侧主内容区 ====================== */}
        <div className="flex-1 min-w-0">
          {/* 搜索栏 */}
          <div className="flex items-center gap-2 mb-4">
            {/* 版区分类下拉 */}
            <div className="relative" ref={categoryRef}>
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className={`flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#252525] border rounded-lg text-sm shrink-0 transition-colors ${
                  currentBoard
                    ? 'border-[#4CAF50] text-[#4CAF50]'
                    : 'border-[#E5E0D5] dark:border-[#374151] text-gray-700 dark:text-[#CCC]'
                } hover:border-[#4CAF50]`}
              >
                <IconGrid size={16} color={currentBoard ? '#4CAF50' : '#999'} />
                {currentBoard && (
                  <span className="hidden sm:inline">{currentBoard.icon} {currentBoard.name}</span>
                )}
              </button>
              {categoryOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCategoryOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-[#2a2a2a] border border-[#E5E0D5] dark:border-[#374151] rounded-md shadow-lg py-1 w-48 z-20">
                    {/* 全部版区 */}
                    <button
                      onClick={() => handleBoardChange('')}
                      className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors ${
                        !selectedBoard
                          ? 'bg-[#E8F5E9] dark:bg-[#1a3320] text-[#4CAF50] font-medium'
                          : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#374151]'
                      }`}>
                      <span>📋</span>
                      <span>全部版区</span>
                      {!selectedBoard && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="ml-auto">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                    {BOARDS.map(item => (
                      <button key={item.gameKey}
                        onClick={() => handleBoardChange(item.gameKey)}
                        className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors ${
                          selectedBoard === item.gameKey
                            ? 'bg-[#E8F5E9] dark:bg-[#1a3320] text-[#4CAF50] font-medium'
                            : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#374151]'
                        }`}>
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                        {selectedBoard === item.gameKey && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="ml-auto">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 搜索输入框 */}
            <div className="flex-1 flex items-center bg-white dark:bg-[#252525] border border-[#E5E0D5] dark:border-[#374151] rounded-lg px-4 py-2 focus-within:border-[#4CAF50] transition-colors">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const board = searchParams.get('board') || '';
                    doSearch(inputValue, board);
                  }
                }}
                placeholder={currentBoard ? `搜索「${currentBoard.name}」版区内容...` : "搜索帖子、用户、话题..."}
                className="flex-1 bg-transparent text-gray-800 dark:text-white text-sm outline-none placeholder-gray-400 dark:placeholder-gray-500"
              />
              {inputValue && (
                <button onClick={handleClear} className="text-[#999] hover:text-[#666] dark:hover:text-white mr-2 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              )}
              <button onClick={() => {
                  const board = searchParams.get('board') || '';
                  doSearch(inputValue, board);
                }}
                className="w-8 h-8 bg-[#4CAF50] rounded-full flex items-center justify-center hover:bg-[#388E3C] transition-colors shrink-0">
                <IconSearch size={14} color="#FFF" />
              </button>
            </div>
          </div>

          {/* 分类标签栏 */}
          <div className="flex items-center justify-between mb-4 border-b border-[#E5E0D5] dark:border-[#374151]">
            <div className="flex gap-0">
              {['综合', '攻略', '用户', '话题'].map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                    activeCategory === cat
                      ? 'text-[#4CAF50] border-[#4CAF50]'
                      : 'text-[#999] border-transparent hover:text-gray-700 dark:hover:text-white'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 pb-2.5">
              {['最热', '最新'].map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`text-xs transition-colors ${
                    sortBy === s ? 'text-[#4CAF50] font-medium' : 'text-[#999] hover:text-gray-700 dark:hover:text-white'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 搜索结果 */}
          {!hasAnyFilter ? (
            <div className="text-center py-20 text-[#999]">
              <IconSearch size={40} color="#CCC" />
              <p className="mt-4 text-sm">输入关键词或选择版区开始探索</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20 text-[#999]">
              <p className="text-lg mb-2">未找到相关内容</p>
              <p className="text-sm">换个关键词试试吧</p>
            </div>
          ) : (
            <>
              <div className="text-[#999] text-xs mb-4">
                {currentBoard && <span>版区「{currentBoard.name}」 · </span>}
                找到 {results.length} 条相关结果
              </div>
              {results.map(post => (
                <SearchPostCard key={post.id} post={post} searchQuery={searchParams.get('q') || ''} />
              ))}
            </>
          )}
        </div>

        {/* ====================== 右侧侧边栏 ====================== */}
        <aside className="hidden lg:block w-[300px] shrink-0">
          <div className="flex flex-col gap-4 sticky top-[91px]">
            {/* 搜索模块 */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-4 border border-[#E5E0D5] dark:border-[#333]">
              <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-4">搜索 SEARCH.</h3>

              {/* 历史记录 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-gray-900 dark:text-white font-medium text-xs">历史记录</h4>
                  <button onClick={() => { clearSearchHistory(); setSearchHistory([]); }}
                    className="text-[#999] hover:text-red-400 transition-colors">
                    <IconTrash size={14} />
                  </button>
                </div>
                {searchHistory.length === 0 ? (
                  <p className="text-[#999] text-xs">暂无搜索记录</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((h, i) => (
                      <button key={i} onClick={() => { setInputValue(h); doSearch(h, searchParams.get('board') || ''); }}
                        className="px-2.5 py-1 text-xs text-[#666] dark:text-[#999] bg-gray-100 dark:bg-[#333] rounded hover:bg-[#E8F5E9] dark:hover:bg-[#1a3320] hover:text-[#4CAF50] transition-colors">
                        {h}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 热门搜索 */}
              <div>
                <h4 className="text-gray-900 dark:text-white font-medium text-xs mb-2">热门搜索</h4>
                <div className="space-y-2">
                  {hotSearches.map((item, i) => (
                    <button key={i} onClick={() => { setInputValue(item.text); doSearch(item.text, searchParams.get('board') || ''); }}
                      className="flex items-center justify-between w-full px-2 py-1.5 text-xs text-[#666] dark:text-[#999] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors">
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded text-[10px] leading-4 text-center font-bold ${
                          i < 3 ? 'bg-[#4CAF50] text-white' : 'bg-gray-200 dark:bg-[#444] text-[#999]'
                        }`}>{i + 1}</span>
                        <span>{item.text}</span>
                      </div>
                      {item.tag && (
                        <span className={`text-[10px] px-1 rounded ${
                          item.tag === 'HOT'
                            ? 'text-red-500 bg-red-50 dark:bg-red-500/10'
                            : 'text-blue-500 bg-blue-50 dark:bg-blue-500/10'
                        }`}>{item.tag}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 作品发布模块 */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-4 border border-[#E5E0D5] dark:border-[#333]">
              <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-4">作品发布 POST.</h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <button onClick={() => {
                  if (!isLoggedIn) { navigate('/login'); return; }
                  navigate('/publish');
                }} className="flex flex-col items-center gap-1.5 p-2 border border-[#4CAF50] rounded-lg hover:bg-[#E8F5E9] dark:hover:bg-[#1a3320] transition-all duration-200">
                  <IconImage size={22} color="#4CAF50" />
                  <span className="text-[#4CAF50] text-xs">发图文</span>
                </button>
                <button onClick={() => {
                  if (!isLoggedIn) { navigate('/login'); return; }
                  navigate('/publish');
                }} className="flex flex-col items-center gap-1.5 p-2 border border-[#4CAF50] rounded-lg hover:bg-[#E8F5E9] dark:hover:bg-[#1a3320] transition-all duration-200">
                  <IconGrid size={22} color="#4CAF50" />
                  <span className="text-[#4CAF50] text-xs">发图集</span>
                </button>
                <button onClick={() => {
                  if (!isLoggedIn) { navigate('/login'); return; }
                  navigate('/video');
                }} className="flex flex-col items-center gap-1.5 p-2 border border-[#4CAF50] rounded-lg hover:bg-[#E8F5E9] dark:hover:bg-[#1a3320] transition-all duration-200">
                  <IconVideo size={22} color="#4CAF50" />
                  <span className="text-[#4CAF50] text-xs">发视频</span>
                </button>
              </div>
              <div className="flex justify-center">
                <Link to={isLoggedIn ? '/publish-manager' : '/login'}
                  className="flex items-center gap-1 text-[#999] hover:text-[#4CAF50] transition-colors text-xs">
                  <IconEdit size={10} color="#999" />
                  <span>草稿箱</span>
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
