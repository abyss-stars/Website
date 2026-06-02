import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconImage, IconGrid, IconVideo, IconEdit, IconX, IconGift, IconTool, IconCalendar, IconBookOpen, IconUsers, IconMap, IconServer, IconAward, IconShoppingBag } from './icons';

const ToolItem = ({ icon, label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all duration-200 group ${
      disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#E8F5E9] dark:hover:bg-[#1a3320]'
    }`}
    title={disabled ? '请先登录' : label}
  >
    <span className="transition-colors duration-200 group-hover:text-[#4CAF50]">{icon}</span>
    <span className="text-[#666] dark:text-[#999] text-xs transition-colors duration-200 group-hover:text-[#4CAF50]">{label}</span>
  </button>
);

export default function RightToolbar({ visible, onClose }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handlePublish = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/publish');
  };

  const handleGallery = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/gallery');
  };

  const handleVideo = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/video');
  };

  const handleToolClick = (tool) => {
    if (!isLoggedIn && ['签到福利', '好友组队', '成就系统'].includes(tool)) {
      navigate('/login');
      return;
    }
    if (tool === '签到福利') {
      navigate('/?checkin=true');
      return;
    }
    window.open('https://www.skland.com/download?type=akToolbox', '_blank');
  };

  const tools = [
    { icon: <IconGift size={22} color="#555" />, label: '签到福利', needsAuth: true },
    { icon: <IconTool size={22} color="#555" />, label: '工具箱', needsAuth: false },
    { icon: <IconCalendar size={22} color="#555" />, label: '活动日历', needsAuth: false },
    { icon: <IconBookOpen size={22} color="#555" />, label: '干员图鉴', needsAuth: false },
    { icon: <IconUsers size={22} color="#555" />, label: '好友组队', needsAuth: true },
    { icon: <IconMap size={22} color="#555" />, label: '地图导航', needsAuth: false },
    { icon: <IconServer size={22} color="#555" />, label: '数据查询', needsAuth: false },
    { icon: <IconAward size={22} color="#555" />, label: '成就系统', needsAuth: true },
    { icon: <IconShoppingBag size={22} color="#555" />, label: '周边商城', needsAuth: false },
  ];

  return (
    <aside className={`${visible ? 'block' : 'hidden'} xl:block w-[300px] shrink-0 rounded-xl p-4 sticky top-[91px] h-[calc(100vh-106px)]`}>
      <button onClick={onClose} className="xl:hidden absolute top-4 right-4 text-[#666] dark:hover:text-white hover:text-gray-800">
        <IconX size={20} color="#666" />
      </button>

      <div className="flex flex-col gap-[15px]">
        {/* Publish Section */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl py-4 px-3 shadow-sm border border-[#E5E0D5] dark:border-[#333]">
          <h3 className="text-[#4CAF50] font-bold text-sm mb-3">作品发布 POST</h3>
          <div className="grid grid-cols-3 gap-3 mb-2">
            <button
              onClick={handlePublish}
              className="flex flex-col items-center gap-1.5 p-2 border border-[#4CAF50] rounded-lg hover:bg-[#E8F5E9] dark:hover:bg-[#1a3320] transition-all duration-200"
            >
              <IconImage size={22} color="#4CAF50" />
              <span className="text-[#4CAF50] text-xs">发图文</span>
            </button>
            <button
              onClick={handleGallery}
              className="flex flex-col items-center gap-1.5 p-2 border border-[#4CAF50] rounded-lg hover:bg-[#E8F5E9] dark:hover:bg-[#1a3320] transition-all duration-200"
            >
              <IconGrid size={22} color="#4CAF50" />
              <span className="text-[#4CAF50] text-xs">发图集</span>
            </button>
            <button
              onClick={handleVideo}
              className="flex flex-col items-center gap-1.5 p-2 border border-[#4CAF50] rounded-lg hover:bg-[#E8F5E9] dark:hover:bg-[#1a3320] transition-all duration-200"
            >
              <IconVideo size={22} color="#4CAF50" />
              <span className="text-[#4CAF50] text-xs">发视频</span>
            </button>
          </div>
          <div className="flex justify-center py-2">
            <button
              onClick={() => {
                if (!isLoggedIn) { navigate('/login'); return; }
                navigate('/publish-manager');
              }}
              className="flex items-center gap-1 text-[#999] hover:text-[#4CAF50] transition-colors"
            >
              <IconEdit size={10} color="#999" />
              <span className="text-xs">草稿箱</span>
            </button>
          </div>
        </div>

        {/* Toolbox Section */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-3 shadow-sm border border-[#E5E0D5] dark:border-[#333]">
          <h3 className="text-[#4CAF50] font-bold text-sm mb-3">工具箱 GAME TOOLS</h3>
          <div className="grid grid-cols-3 gap-3">
            {tools.map(({ icon, label, needsAuth }) => (
              <ToolItem
                key={label}
                icon={icon}
                label={label}
                disabled={needsAuth && !isLoggedIn}
                onClick={() => handleToolClick(label)}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
