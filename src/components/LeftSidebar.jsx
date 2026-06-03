import { useAuth } from '../context/AuthContext';
import { IconHome, IconStar } from './icons';

// 预设话题列表
const TOPICS = ['#明日方舟', '#泡姆泡姆', '#终末地', '#来自星尘', '#音律联觉'];

// 话题对应的游戏标识颜色
const TOPIC_COLORS = {
  '#明日方舟': { bg: '#4CAF50', text: '#4CAF50', desc: '明日方舟' },
  '#泡姆泡姆': { bg: '#FF9800', text: '#FF9800', desc: '泡姆泡姆' },
  '#终末地': { bg: '#9C27B0', text: '#9C27B0', desc: '终末地' },
  '#来自星尘': { bg: '#2196F3', text: '#2196F3', desc: '来自星尘' },
  '#音律联觉': { bg: '#E91E63', text: '#E91E63', desc: '音律联觉' },
};

export default function LeftSidebar({ activeTab, onTabChange, selectedTopic, onTopicChange, visible }) {
  const { isLoggedIn } = useAuth();

  const tabs = [
    { key: 'recommend', label: '推荐', Icon: IconHome, color: '#43A047', requiresAuth: false },
    { key: 'follow', label: '关注', Icon: IconStar, color: '#666', requiresAuth: true },
  ];

  const handleTopicClick = (topic) => {
    if (selectedTopic === topic) {
      onTopicChange(null);
    } else {
      onTopicChange(topic);
    }
  };

  const handleAllClick = () => {
    onTopicChange(null);
  };

  return (
    <aside className={`${visible ? 'block' : 'hidden'} lg:block w-[200px] shrink-0 bg-white dark:bg-[#1E1E1E] border-r border-[#E5E0D5] dark:border-[#333] rounded-xl p-4 sticky top-[91px] h-[calc(100vh-106px)] overflow-y-auto`}>
      <div className="mb-4">
        <h3 className="text-[#4CAF50] font-bold text-sm">首页 HOMEPAGE</h3>
      </div>

      <nav className="flex flex-col gap-0.5">
        {tabs.map(({ key, label, Icon, color, requiresAuth }) => {
          const isActive = activeTab === key;
          const disabled = requiresAuth && !isLoggedIn;
          return (
            <button
              key={key}
              onClick={() => !disabled && onTabChange(key)}
              className={`flex items-center gap-3 px-3 py-2.5 border-l-4 text-sm rounded-r-md transition-all duration-200 text-left ${
                isActive
                  ? 'border-[#4CAF50] bg-[#E8F5E9] dark:bg-[#1a3320] text-[#43A047] font-semibold'
                  : 'border-transparent text-[#666666] hover:bg-[#E5E0D5] dark:hover:bg-[#2a2a2a]'
              } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              title={disabled ? '登录后可查看关注内容' : label}
            >
              <Icon size={18} color={isActive ? '#43A047' : color} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* 话题筛选区域 */}
      <div className="mt-6 pt-4 border-t border-[#E5E0D5] dark:border-[#333]">
        <div className="flex items-center justify-between mb-3 px-3">
          <h3 className="text-xs font-semibold text-[#999] uppercase tracking-wider flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#999]">
              <path d="M21.527 2.047a.5.5 0 0 1 .227.46L19.45 8.26a.5.5 0 0 1-.124.154l-3.445 2.336a.5.5 0 0 1-.577-.11l-2.162-2.577a.5.5 0 0 0-.498.006l-2.37 2.037a.5.5 0 0 1-.62-.38L5.65 5.5a.5.5 0 0 0-.58.12l-2.42 2.92a.5.5 0 1 1-.829-.624l1.892-2.28a.5.5 0 0 1 .71.29l1.943 2.318 2.07-1.78a.5.5 0 0 1 .67.067l1.803 2.155 3.182-2.127a.5.5 0 0 1 .588.12l2.29 3.23a.5.5 0 0 1-.047.63l-3.23 2.29a.5.5 0 0 1-.588.12l-2.148-1.803-1.98 1.338a.5.5 0 0 1-.666-.111l-1.803-2.155-2.29 3.23a.5.5 0 0 1-.63.047l-3.23-2.29a.5.5 0 1 1 .12-.588l2.155-1.803-1.338-1.98a.5.5 0 0 1 .111-.666l2.155-1.803-2.155-1.803a.5.5 0 0 1-.111-.666l1.803-2.155-2.29-3.23a.5.5 0 1 1 .588-.12l2.148 1.803 1.98-1.338a.5.5 0 0 1 .666.111l1.803 2.155 2.29-3.23a.5.5 0 0 1 .63-.047l3.23 2.29a.5.5 0 0 1 .047.63l-2.155 1.803 1.338 1.98a.5.5 0 0 1-.111.666l-2.155 1.803 2.155 1.803a.5.5 0 0 1 .12.588l-2.29 3.23 3.23 2.29a.5.5 0 0 1 .588.12l2.155-1.803-1.338-1.98a.5.5 0 0 1 .111-.666l1.803-2.155 1.338 1.98a.5.5 0 0 1-.047.63l-2.29 3.23a.5.5 0 0 1-.63.047l-3.23-2.29a.5.5 0 0 1-.12-.588l2.155-1.803-1.98-1.338a.5.5 0 0 1-.111-.666l1.803-2.155-1.338-1.98a.5.5 0 0 1 .047-.63l2.29-3.23a.5.5 0 0 1 .63-.047l3.23 2.29a.5.5 0 0 1 .047.63l-2.155 1.803 1.338 1.98a.5.5 0 0 1-.047.63l-2.29 3.23a.5.5 0 0 1-.63.047l-3.23-2.29a.5.5 0 0 1-.12-.588l2.155-1.803-1.98-1.338a.5.5 0 0 1-.111-.666l1.803-2.155-2.155-1.803a.5.5 0 0 1-.12-.588l2.29-3.23a.5.5 0 0 1 .588-.12l2.155 1.803 1.338-1.98a.5.5 0 0 1 .666.111l1.803 2.155 2.29-3.23a.5.5 0 0 1 .63-.047l3.23 2.29a.5.5 0 0 1 .047.63l-2.155 1.803 1.338 1.98a.5.5 0 0 1-.047.63l-2.29 3.23a.5.5 0 0 1-.63.047l-3.23-2.29a.5.5 0 0 1-.12-.588l2.155-1.803-1.98-1.338a.5.5 0 0 1-.111-.666l1.803-2.155z"/>
            </svg>
            话题筛选
          </h3>
          {selectedTopic && (
            <button
              onClick={handleAllClick}
              className="text-[10px] px-2 py-0.5 bg-[#4CAF50] text-white rounded-full hover:bg-[#388E3C] transition-colors"
            >
              全部
            </button>
          )}
        </div>

        {/* 全部选项 */}
        <div className="mb-2">
          <button
            onClick={handleAllClick}
            className={`w-full px-3 py-2 text-xs rounded-lg transition-all duration-200 text-left flex items-center gap-2 ${
              !selectedTopic
                ? 'bg-gradient-to-r from-[#E8F5E9] to-[#C8E6C9] dark:from-[#1a3320] dark:to-[#2d4a33] text-[#2E7D32] dark:text-[#4CAF50] font-medium border border-[#4CAF50]/30'
                : 'text-[#999] hover:bg-[#F5F5F5] dark:hover:bg-[#2a2a2a]'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>全部帖子</span>
          </button>
        </div>

        {/* 话题列表 */}
        <div className="flex flex-col gap-1.5">
          {TOPICS.map(topic => {
            const isActive = selectedTopic === topic;
            const topicColor = TOPIC_COLORS[topic] || { bg: '#4CAF50', text: '#4CAF50' };
            return (
              <button
                key={topic}
                onClick={() => handleTopicClick(topic)}
                className={`relative px-3 py-2 text-xs rounded-lg transition-all duration-200 text-left flex items-center gap-2 overflow-hidden group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#4CAF50]/10 to-[#4CAF50]/5 dark:from-[#1a3320] dark:to-[#2d4a33] font-medium'
                    : 'hover:bg-[#F5F5F5] dark:hover:bg-[#2a2a2a]'
                }`}
              >
                {/* 左侧彩色指示条 */}
                <div
                  className={`w-1 h-5 rounded-full transition-all duration-200 ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-50'
                  }`}
                  style={{ backgroundColor: topicColor.text }}
                />

                {/* 话题图标 */}
                <span
                  className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-[#999] group-hover:text-[#666]'}`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                  </svg>
                </span>

                {/* 话题名称 */}
                <span className={`flex-1 transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-[#666666] dark:text-[#999]'
                }`}>
                  {topic}
                </span>

                {/* 选中指示器 */}
                {isActive && (
                  <span className="text-white">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}

                {/* 悬停时的彩色背景 */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-200 -z-10`}
                  style={{ backgroundColor: topicColor.text }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
