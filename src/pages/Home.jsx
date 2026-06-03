import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doCheckin } from '../utils/storage';
import LeftSidebar from '../components/LeftSidebar';
import ContentArea from '../components/ContentArea';
import RightToolbar from '../components/RightToolbar';

export default function Home() {
  const { isLoggedIn, currentUser, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('recommend');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [checkinResult, setCheckinResult] = useState(null);

  useEffect(() => {
    if (searchParams.get('checkin') === 'true' && isLoggedIn) {
      const result = doCheckin(currentUser.id);
      setCheckinResult(result);
      refreshUser();
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('checkin');
      setSearchParams(newParams, { replace: true });
      setTimeout(() => setCheckinResult(null), 3000);
    }
  }, [searchParams, isLoggedIn, currentUser, refreshUser, setSearchParams]);

  const handleTabChange = useCallback((tab) => {
    if (tab === 'follow' && !isLoggedIn) return;
    setActiveTab(tab);
    // 切换 Tab 时重置话题筛选
    setSelectedTopic(null);
  }, [isLoggedIn]);

  const handleTopicChange = useCallback((topic) => {
    setSelectedTopic(topic);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E6] dark:bg-[#1a1a1a]">
      {checkinResult && !checkinResult.error && (
        <div className="fixed top-[80px] left-1/2 -translate-x-1/2 z-[60] bg-[#E8F5E9] dark:bg-[#1a3320] border border-[#4CAF50] text-[#4CAF50] px-6 py-3 rounded-lg shadow-lg">
          <p className="text-sm font-bold">签到成功！</p>
          <p className="text-xs mt-1">
            连续签到 {checkinResult.streak} 天 · 获得 {checkinResult.reward} 积分
            {checkinResult.streak >= 7 && ' (连续签到加成!)'}
          </p>
        </div>
      )}

      {checkinResult && checkinResult.error && (
        <div className="fixed top-[80px] left-1/2 -translate-x-1/2 z-[60] bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 px-6 py-3 rounded-lg shadow-lg">
          <p className="text-sm">{checkinResult.error}</p>
        </div>
      )}

      <div className="flex max-w-[1200px] mx-auto">
        <LeftSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          selectedTopic={selectedTopic}
          onTopicChange={handleTopicChange}
        />
        <ContentArea activeTab={activeTab} selectedTopic={selectedTopic} />
        <RightToolbar />
      </div>
    </div>
  );
}
