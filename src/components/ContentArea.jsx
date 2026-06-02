import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllPosts } from '../utils/storage';
import CarouselBanner from './CarouselBanner';
import PostItem from './PostItem';

const BATCH_SIZE = 5;

export default function ContentArea({ activeTab }) {
  const { currentUser } = useAuth();
  const [allPosts, setAllPosts] = useState([]);
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const sentinelRef = useRef(null);

  const loadPosts = useCallback(() => {
    let all = getAllPosts();
    all.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    if (activeTab === 'follow' && currentUser) {
      const followings = currentUser.followings || [];
      all = all.filter(post => followings.includes(post.authorId));
    }

    setAllPosts(all);
    setDisplayCount(BATCH_SIZE);
  }, [activeTab, currentUser]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts, refreshKey]);

  // 无限滚动：监听底部哨兵元素
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || displayCount >= allPosts.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoading(true);
          setTimeout(() => {
            setDisplayCount(prev => Math.min(prev + BATCH_SIZE, allPosts.length));
            setLoading(false);
          }, 200);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [displayCount, allPosts.length]);

  // 监听来自其他组件的发布事件(保留兼容)
  useEffect(() => {
    const handlePublish = () => {
      if (!currentUser) return;
      // 新创建的帖子会在用户从发布页返回并刷新后出现
      setRefreshKey(k => k + 1);
    };
    window.addEventListener('postCreated', handlePublish);
    return () => window.removeEventListener('postCreated', handlePublish);
  }, [currentUser]);

  const handlePostUpdate = () => {
    setRefreshKey(k => k + 1);
  };

  const visiblePosts = allPosts.slice(0, displayCount);
  const hasMore = displayCount < allPosts.length;

  return (
    <main className="flex-1 min-w-0 pt-[91px] px-4 lg:px-6 pb-8">
      <CarouselBanner />

      <div className="mb-4">
        <h2 className="text-gray-900 dark:text-white font-bold text-lg">
          {activeTab === 'recommend' ? '推荐帖子' : '关注的帖子'}
        </h2>
      </div>

      {allPosts.length === 0 ? (
        <div className="text-center py-12 text-[#666]">
          <p className="text-lg mb-2">暂无帖子</p>
          <p className="text-sm">成为第一个发帖的人吧！</p>
        </div>
      ) : (
        <>
          {visiblePosts.map(post => (
            <PostItem key={post.id + refreshKey} post={post} onUpdate={handlePostUpdate} />
          ))}

          {/* 无限滚动哨兵 */}
          <div ref={sentinelRef} className="flex justify-center py-6">
            {loading && (
              <div className="flex items-center gap-2 text-[#999] text-sm">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="50" strokeDashoffset="35" strokeLinecap="round" />
                </svg>
                加载中...
              </div>
            )}
            {!loading && hasMore && (
              <span className="text-[#666] text-xs">向下滚动加载更多</span>
            )}
          </div>
        </>
      )}
    </main>
  );
}
