import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toggleLike, isLikedByUser, addComment, getPostComments, toggleFollow, isFollowing, getPostById } from '../utils/storage';
import { IconHeart, IconMessageCircle, IconShare } from './icons';
import LoginPrompt from './LoginPrompt';

// ====================== 图集轮播组件 ======================
function GalleryImageCarousel({ images, inArticle }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    setCurrentIdx(0);
  }, [images]);

  const goPrev = (e) => {
    e.stopPropagation();
    setCurrentIdx(prev => prev > 0 ? prev - 1 : images.length - 1);
  };

  const goNext = (e) => {
    e.stopPropagation();
    setCurrentIdx(prev => prev < images.length - 1 ? prev + 1 : 0);
  };

  const selectIdx = (e, i) => {
    e.stopPropagation();
    setCurrentIdx(i);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className={`rounded-lg overflow-hidden relative bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center ${inArticle ? 'w-full' : 'mb-4'}`}
      style={inArticle ? { maxHeight: '600px' } : { minHeight: '200px' }}>
      <img
        src={images[currentIdx]}
        alt=""
        className="w-full h-full object-contain"
        style={inArticle ? { maxHeight: '600px' } : { maxHeight: '500px' }}
      />

      {images.length > 1 && (
        <>
          <button onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors z-10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors z-10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button key={i} onClick={(e) => selectIdx(e, i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === currentIdx ? 'bg-white' : 'bg-white/50 hover:bg-white/70'}`} />
            ))}
          </div>
          <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full z-10">
            {currentIdx + 1}/{images.length}
          </span>
        </>
      )}
    </div>
  );
}

export default function PostItem({ post, onUpdate }) {
  const { currentUser, isLoggedIn, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [localLiked, setLocalLiked] = useState(
    isLoggedIn ? isLikedByUser(currentUser.id, post.id) : false
  );
  const [localLikeCount, setLocalLikeCount] = useState(post.likes);
  const [localFollowed, setLocalFollowed] = useState(
    isLoggedIn ? isFollowing(currentUser.id, post.authorId) : false
  );
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [postComments, setPostComments] = useState([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const videoRef = useRef(null);

  const handleLike = useCallback(() => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    const liked = toggleLike(currentUser.id, post.id, post.authorId);
    setLocalLiked(liked);
    const updated = getPostById(post.id);
    if (updated) setLocalLikeCount(updated.likes);
    if (onUpdate) onUpdate();
  }, [isLoggedIn, currentUser, post.id, post.authorId, onUpdate]);

  const handleFollow = useCallback(() => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    const following = toggleFollow(currentUser.id, post.authorId);
    setLocalFollowed(following);
    refreshUser();
    if (onUpdate) onUpdate();
  }, [isLoggedIn, currentUser, post.authorId, refreshUser, onUpdate]);

  const handleShowComments = useCallback(() => {
    if (!showComments) {
      const comments = getPostComments(post.id);
      setPostComments(comments);
    }
    setShowComments(!showComments);
  }, [showComments, post.id]);

  const handleAddComment = useCallback(() => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    if (!commentText.trim()) return;
    const comment = addComment({
      postId: post.id,
      authorId: currentUser.id,
      authorName: currentUser.nickname,
      authorAvatar: currentUser.avatar,
      content: commentText.trim(),
    });
    setPostComments(prev => [...prev, comment]);
    setCommentCount(prev => prev + 1);
    setCommentText('');
  }, [isLoggedIn, currentUser, post.id, commentText]);

  const handleCommentKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  }, [handleAddComment]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.origin + '/post/' + post.id);
    alert('链接已复制到剪贴板');
  };

  return (
    <>
      {showLoginPrompt && <LoginPrompt onClose={() => setShowLoginPrompt(false)} />}

      <article
        onClick={(e) => { if (!e.target.closest('button')) navigate(`/post/${post.id}`); }}
        className="bg-white dark:bg-[#252525] rounded-xl p-4 md:p-5 mb-6 transition-shadow duration-300 hover:shadow-lg dark:hover:shadow-black/20 cursor-pointer">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-10 h-10 rounded-full shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="text-gray-900 dark:text-white font-semibold text-sm cursor-pointer hover:text-[#4CAF50] transition-colors"
                onClick={() => navigate(`/profile/${post.authorId}`)}
              >
                {post.authorName}
              </span>
              <span className="text-[#888] text-xs">{post.time} · {post.game}</span>
            </div>
          </div>
          {(!isLoggedIn || currentUser.id !== post.authorId) && (
            <button
              onClick={handleFollow}
              className={`shrink-0 px-3 py-1 text-xs font-medium border rounded-full transition-all duration-200 ${
                localFollowed
                  ? 'border-[#4CAF50] bg-[#4CAF50] text-white'
                  : 'border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white'
              }`}
            >
              {localFollowed ? '已关注' : '+ 关注'}
            </button>
          )}
        </div>

        {/* 图片/视频区域 */}
        {post.images && post.images.length > 0 ? (
          <GalleryImageCarousel images={post.images} />
        ) : post.videoUrl ? (
          <div
            className="mb-4 rounded-lg overflow-hidden bg-black"
            style={{ aspectRatio: '16/9', maxHeight: '400px' }}
            onMouseEnter={() => { const v = videoRef.current; if (v) { v.muted = true; v.play().catch(() => {}); } }}
            onMouseLeave={() => { const v = videoRef.current; if (v) { v.pause(); v.currentTime = 0; } }}
          >
            <video ref={videoRef} src={post.videoUrl} className="w-full h-full object-contain" muted playsInline preload="metadata" loop />
          </div>
        ) : post.image && (
          <div
            className="mb-4 rounded-lg overflow-hidden"
            style={{
              background: post.imageBg,
              aspectRatio: '16/9',
              maxHeight: '400px',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {(!post.imageBg || post.imageBg.includes('linear-gradient')) && (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-800 dark:text-white text-lg font-bold leading-relaxed">{post.content.split('\n')[0]}</p>
          {post.content.split('\n').length > 1 && (
            <p className="text-gray-800 dark:text-white text-sm leading-relaxed mt-1 line-clamp-2">{post.content.split('\n').slice(1).join('\n')}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {post.tags.map(tag => (
              <span key={tag} className="px-2.5 py-0.5 text-xs bg-[#E8F5E9] dark:bg-[#1a3320] text-[#43A047] rounded">{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-5">
            <button onClick={handleLike} className="flex items-center gap-1.5 text-[#999] hover:text-[#4CAF50] transition-colors group">
              <IconHeart size={16} color={localLiked ? '#4CAF50' : '#999'} filled={localLiked} />
              <span className={`text-xs ${localLiked ? 'text-[#4CAF50]' : ''}`}>{localLikeCount}</span>
            </button>
            <button onClick={handleShowComments} className="flex items-center gap-1.5 text-[#999] hover:text-[#4CAF50] transition-colors">
              <IconMessageCircle size={16} />
              <span className="text-xs">{commentCount}</span>
            </button>
            <button onClick={handleShare} className="flex items-center gap-1.5 text-[#999] hover:text-[#4CAF50] transition-colors">
              <IconShare size={16} />
              <span className="text-xs">分享</span>
            </button>
          </div>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-[#E5E0D5] dark:border-[#374151]">
            <h4 className="text-gray-900 dark:text-white text-sm font-semibold mb-3">评论 ({postComments.length})</h4>

            {postComments.length === 0 && (
              <p className="text-[#666] text-xs mb-3">暂无评论，抢个沙发吧</p>
            )}

            {postComments.map(c => (
              <div key={c.id} className="flex gap-3 mb-3 pb-3 border-b border-[#E5E0D5] dark:border-[#333] last:border-0">
                <img src={c.authorAvatar} alt={c.authorName} className="w-7 h-7 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-700 dark:text-[#CCC] text-xs font-medium">{c.authorName}</span>
                    <span className="text-[#666] text-xs">{c.time}</span>
                  </div>
                  <p className="text-gray-500 dark:text-[#AAA] text-xs leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))}

            {/* Comment input */}
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleCommentKeyDown}
                placeholder={isLoggedIn ? '写评论...' : '登录后发表评论'}
                disabled={!isLoggedIn}
                className="flex-1 bg-gray-100 dark:bg-[#333] text-gray-800 dark:text-white text-xs px-3 py-2 rounded-lg outline-none border border-transparent focus:border-[#4CAF50] transition-colors placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
              />
              <button
                onClick={handleAddComment}
                disabled={!isLoggedIn || !commentText.trim()}
                className="px-3 py-2 text-xs text-white bg-[#4CAF50] rounded-lg hover:bg-[#388E3C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                发送
              </button>
            </div>
          </div>
        )}
      </article>
    </>
  );
}
