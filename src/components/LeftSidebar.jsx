import { useAuth } from '../context/AuthContext';
import { IconHome, IconStar } from './icons';

export default function LeftSidebar({ activeTab, onTabChange, visible }) {
  const { isLoggedIn } = useAuth();

  const tabs = [
    { key: 'recommend', label: '推荐', Icon: IconHome, color: '#43A047', requiresAuth: false },
    { key: 'follow', label: '关注', Icon: IconStar, color: '#666', requiresAuth: true },
  ];

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
              className={`flex items-center gap-3 px-3 py-2.5 border-l-4 text-sm rounded-r-md transition-colors duration-200 text-left ${
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

      <div className="mt-6 pt-4 border-t border-[#E5E0D5] dark:border-[#333]">
        <h3 className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3 px-3">热门话题</h3>
        <div className="flex flex-col gap-1.5">
          {['#明日方舟', '#泡姆泡姆', '#终末地', '#来自星尘', '#音律联觉'].map(tag => (
            <a key={tag} href="#" className="px-3 py-1.5 text-xs text-[#666] dark:text-[#999] hover:text-[#4CAF50] hover:bg-[#E8F5E9] dark:hover:bg-[#1a3320] rounded transition-colors duration-150">
              {tag}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
