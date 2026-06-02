import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllPosts, deletePost, getUserDrafts, deleteDraft } from '../utils/storage';

// ====================== 图标 ======================
const IconEye = ({ size = 14, color = '#999' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconMessageCircle = ({ size = 14, color = '#999' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconThumbsUp = ({ size = 14, color = '#999' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const IconStar = ({ size = 14, color = '#999' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ====================== 卡片组件 ======================
function ContentCard({ item, onEdit, onDelete, showDraftLabel }) {
  const title = item.content ? (item.content.length > 30 ? item.content.substring(0, 30) + '...' : item.content) : (item.title || '无标题');

  const dateStr = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' + new Date(item.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#252525] rounded-lg border border-[#E5E0D5] dark:border-[#333] hover:border-[#4CAF50] transition-colors">
      {/* 缩略图 */}
      <div className="shrink-0 w-[100px] h-[65px] rounded-md overflow-hidden bg-gray-200 dark:bg-[#333] flex items-center justify-center"
        style={item.imageBg ? { background: item.imageBg } : undefined}>
        {item.imageBg ? null : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(153,153,153,0.5)" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        )}
      </div>

      {/* 信息区 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          {showDraftLabel && (
            <span className="shrink-0 px-1.5 py-0.5 text-[10px] bg-[#FFF3E0] dark:bg-[#3e2723] text-[#FF9800] rounded">草稿</span>
          )}
          <h3 className="text-gray-900 dark:text-white text-sm font-bold truncate">{title}</h3>
        </div>
        {dateStr && (
          <p className="text-[#999] text-xs mb-2">{dateStr}</p>
        )}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-[#999] text-xs">
            <IconEye size={14} /> {item.views || 0}
          </span>
          <span className="flex items-center gap-1 text-[#999] text-xs">
            <IconMessageCircle size={14} /> {item.comments || 0}
          </span>
          <span className="flex items-center gap-1 text-[#999] text-xs">
            <IconThumbsUp size={14} /> {item.likes || 0}
          </span>
          <span className="flex items-center gap-1 text-[#999] text-xs">
            <IconStar size={14} /> {item.favorites || 0}
          </span>
        </div>
      </div>

      {/* 操作区 */}
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => onEdit(item)}
          className="px-3 py-1 text-xs text-[#4CAF50] border border-[#4CAF50] rounded hover:bg-[#E8F5E9] dark:hover:bg-[#1a3320] transition-colors">
          编辑
        </button>
        <button onClick={() => onDelete(item)}
          className="px-3 py-1 text-xs text-red-400 border border-red-400/50 rounded hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
          删除
        </button>
      </div>
    </div>
  );
}

// ====================== 空白状态 ======================
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E5E0D5] dark:border-[#333] min-h-[400px]">
      <img
        src="/src/img/download.png"
        alt="empty"
        className="w-48 h-48 object-contain mb-4 opacity-80"
      />
      <p className="text-[#999] text-sm">这里空空如也</p>
    </div>
  );
}

// ====================== 主组件 ======================
const MENU_ITEMS = [
  { key: 'post', label: '管理图文' },
  { key: 'gallery', label: '管理图集' },
  { key: 'video', label: '管理视频' },
];

export default function PublishManager() {
  const { currentUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('post');
  const [activeTab, setActiveTab] = useState('published');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => { if (!isLoggedIn) navigate('/login'); }, [isLoggedIn, navigate]);

  if (!isLoggedIn || !currentUser) return null;

  const allPosts = getAllPosts();
  const userPosts = allPosts.filter(p => p.authorId === currentUser.id && p.type === activeMenu);
  const userDrafts = getUserDrafts(currentUser.id).filter(d => d.type === activeMenu);

  const handleEdit = (item) => {
    if (activeMenu === 'post') {
      navigate(`/publish?edit=${item.id}`);
    } else if (activeMenu === 'gallery') {
      navigate(`/gallery?edit=${item.id}`);
    }
  };

  const handleDelete = (item) => {
    if (!window.confirm('确定要删除吗？')) return;
    if (activeTab === 'draft') {
      deleteDraft(currentUser.id, item.id);
    } else {
      deletePost(item.id);
    }
    setRefresh(c => c + 1);
  };

  const tabs = activeMenu === 'video'
    ? [{ key: 'published', label: '已发布', count: userPosts.length }]
    : [
        { key: 'published', label: '已发布', count: userPosts.length },
        { key: 'draft', label: '草稿', count: userDrafts.length },
      ];

  const displayedItems = activeTab === 'draft' ? userDrafts : userPosts;
  const showEmpty = displayedItems.length === 0;

  return (
    <div className="min-h-screen bg-[#F5F0E6] dark:bg-[#1a1a1a] pt-[91px] pb-12">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
        <div className="flex gap-6">
          {/* ====================== 左侧侧边栏 ====================== */}
          <aside className="w-[200px] shrink-0">
            <div className="sticky top-[91px]">
              <div className="mb-6">
                <h1 className="text-gray-900 dark:text-white text-lg font-bold">发布管理</h1>
                <p className="text-[#999] text-[10px] tracking-wider">MANAGE</p>
              </div>
              <nav className="flex flex-col">
                {MENU_ITEMS.map(item => (
                  <button
                    key={item.key}
                    onClick={() => { setActiveMenu(item.key); setActiveTab('published'); }}
                    className={`relative text-left px-4 py-3 text-sm transition-colors rounded-r-md ${
                      activeMenu === item.key
                        ? 'text-[#4CAF50] font-medium bg-[#E8F5E9] dark:bg-[#1a3320] border-l-[3px] border-l-[#4CAF50]'
                        : 'text-[#999] hover:text-gray-700 dark:hover:text-[#CCC] border-l-[3px] border-l-transparent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* ====================== 右侧主内容区 ====================== */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex items-center gap-0 mb-6 border-b border-[#E5E0D5] dark:border-[#374151]">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 text-sm transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? 'text-[#4CAF50] font-bold border-[#4CAF50]'
                      : 'text-[#999] border-transparent hover:text-gray-700 dark:hover:text-[#CCC]'
                  }`}
                >
                  {tab.label} <span className={activeTab === tab.key ? '' : 'text-[#999]'}>{tab.count}</span>
                </button>
              ))}
            </div>

            {/* 内容区 */}
            <div key={refresh}>
            {showEmpty ? (
              <EmptyState />
            ) : (
              <div className="flex flex-col gap-3">
                {displayedItems.map(item => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    showDraftLabel={activeTab === 'draft'}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
