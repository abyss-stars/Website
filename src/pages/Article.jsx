import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getPostById, getPostComments, addComment, toggleLike, isLikedByUser,
  toggleFollow, isFollowing,
  toggleCommentLike, isCommentLikedByUser,
  toggleFavorite, isPostFavoritedByUser,
} from '../utils/storage';
import {
  IconMessageCircle, IconThumbsUp,
  IconGift, IconTool, IconCalendar, IconBookOpen, IconUsers,
  IconMap, IconServer, IconAward, IconShoppingBag,
} from '../components/icons';

// ====================== 小图标 ======================
const IconEye = ({ size = 14, color = '#999' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IconStar = ({ size = 14, color = '#999' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconChevronUp = ({ size = 20, color = '#FFF' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const IconChevronDown = ({ size = 14, color = '#999' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ====================== 工具箱数据 ======================
const TOOLS = [
  { icon: <IconGift size={22} color="#555" />, label: '签到福利' },
  { icon: <IconTool size={22} color="#555" />, label: '工具箱' },
  { icon: <IconCalendar size={22} color="#555" />, label: '活动日历' },
  { icon: <IconBookOpen size={22} color="#555" />, label: '干员图鉴' },
  { icon: <IconUsers size={22} color="#555" />, label: '好友组队' },
  { icon: <IconMap size={22} color="#555" />, label: '地图导航' },
  { icon: <IconServer size={22} color="#555" />, label: '数据查询' },
  { icon: <IconAward size={22} color="#555" />, label: '成就系统' },
  { icon: <IconShoppingBag size={22} color="#555" />, label: '周边商城' },
];

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
              <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentIdx(i); }}
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

// ====================== 评论组件 ======================
function CommentItem({ comment, postId, isLoggedIn, currentUser, expanded, onToggleExpand, allReplies, onReplyAdded }) {
  const navigate = useNavigate();
  const [localLiked, setLocalLiked] = useState(
    isLoggedIn ? isCommentLikedByUser(currentUser.id, comment.id) : false
  );
  const [replyText, setReplyText] = useState('');
  const [replyOpen, setReplyOpen] = useState(false);

  const replies = allReplies.filter(r => r.parentId === comment.id);
  const isChild = !!comment.parentId;
  const repliesVisible = expanded || replies.length <= 2;

  const handleCommentLike = () => {
    if (!isLoggedIn) return;
    const liked = toggleCommentLike(currentUser.id, comment.id, postId);
    setLocalLiked(liked);
  };

  const handleReply = () => {
    if (!isLoggedIn || !replyText.trim()) return;
    const newReply = addComment({
      postId, authorId: currentUser.id,
      authorName: currentUser.nickname, authorAvatar: currentUser.avatar,
      content: replyText.trim(), parentId: comment.id,
    });
    setReplyText('');
    setReplyOpen(false);
    if (onReplyAdded) onReplyAdded(newReply);
    if (onToggleExpand) onToggleExpand();
  };

  return (
    <div className={`${comment.parentId ? 'ml-10 pl-3 border-l-2 border-[#E5E0D5] dark:border-[#444] bg-gray-50 dark:bg-[#1a1a1a] rounded-r-lg' : ''}`}>
      <div className="flex gap-3 py-3 border-b border-[#F0EDE5] dark:border-[#2a2a2a]">
        <img src={comment.authorAvatar} alt="" className="w-7 h-7 rounded-full shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-800 dark:text-white text-xs font-bold">{comment.authorName}</span>
          </div>
          <p className="text-gray-600 dark:text-[#BBB] text-sm leading-relaxed mb-2">{comment.content}</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[#999]">{comment.time}</span>
            {!isChild && (
              <button onClick={() => setReplyOpen(!replyOpen)} className="text-[#999] hover:text-[#4CAF50] transition-colors">
                回复
              </button>
            )}
            <button onClick={handleCommentLike} className="flex items-center gap-1 text-[#999] hover:text-[#4CAF50] transition-colors">
              <IconThumbsUp size={12} color={localLiked ? '#4CAF50' : '#999'} />
              <span>{comment.likes || 0}</span>
            </button>
          </div>

          {replyOpen && (
            <div className="mt-2 flex gap-2">
              <input
                type="text" value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleReply(); }}
                placeholder={`回复 ${comment.authorName}...`}
                className="flex-1 bg-gray-100 dark:bg-[#333] text-gray-700 dark:text-[#CCC] text-xs px-3 py-1.5 rounded-lg outline-none border border-transparent focus:border-[#4CAF50] transition-colors"
              />
              <button onClick={handleReply}
                className="px-2 py-1 text-xs bg-[#4CAF50] text-white rounded hover:bg-[#388E3C] transition-colors">发送</button>
            </div>
          )}
        </div>
      </div>

      {/* 嵌套回复展开按钮 */}
      {!isChild && replies.length > 0 && !repliesVisible && (
        <button onClick={() => onToggleExpand && onToggleExpand()}
          className="ml-10 mt-1 mb-2 px-3 py-1.5 text-xs text-[#4CAF50] bg-[#E8F5E9] dark:bg-[#1a3320] rounded-lg hover:bg-[#C8E6C9] dark:hover:bg-[#234e2a] transition-colors font-medium">
          查看全部 {replies.length} 条回复 <IconChevronDown size={10} color="#4CAF50" />
        </button>
      )}
    </div>
  );
}

// ====================== 主组件 ======================
export default function Article() {
  const { postId } = useParams();
  const { currentUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [localLiked, setLocalLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const [localFollowed, setLocalFollowed] = useState(false);
  const [favored, setFavored] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentSort, setCommentSort] = useState('默认');
  const [showBackTop, setShowBackTop] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => {
    const p = getPostById(postId);
    if (!p) { navigate('/'); return; }
    setPost(p);
    setLocalLiked(isLoggedIn ? isLikedByUser(currentUser?.id, postId) : false);
    setLocalLikeCount(p.likes || 0);
    setLocalFollowed(isLoggedIn ? isFollowing(currentUser?.id, p.authorId) : false);
    setFavored(isLoggedIn ? isPostFavoritedByUser(currentUser?.id, postId) : false);

    const raw = getPostComments(postId);
    setComments(raw);
  }, [postId, isLoggedIn, currentUser]);

  useEffect(() => {
    const handleScroll = () => { setShowBackTop(window.scrollY > 500); };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLike = () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    const liked = toggleLike(currentUser.id, post.id, post.authorId);
    setLocalLiked(liked);
    const updated = getPostById(post.id);
    if (updated) setLocalLikeCount(updated.likes);
  };

  const handleFollow = () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    const following = toggleFollow(currentUser.id, post.authorId);
    setLocalFollowed(following);
  };

  const handleAddComment = () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!commentText.trim()) return;
    const c = addComment({
      postId, authorId: currentUser.id,
      authorName: currentUser.nickname, authorAvatar: currentUser.avatar,
      content: commentText.trim(),
    });
    setComments(prev => [...prev, c]);
    setCommentText('');
  };

  // 评论分组：一级评论 + 子回复
  const { topComments, repliesByParent } = useMemo(() => {
    const top = comments.filter(c => !c.parentId);
    const replies = {};
    comments.filter(c => c.parentId).forEach(c => {
      if (!replies[c.parentId]) replies[c.parentId] = [];
      replies[c.parentId].push(c);
    });
    return { topComments: top, repliesByParent: replies };
  }, [comments]);

  // 排序
  const sortedTopComments = useMemo(() => {
    const sorted = [...topComments];
    if (commentSort === '最早') sorted.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    else if (commentSort === '最新') sorted.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return sorted;
  }, [topComments, commentSort]);

  const handleToggleExpand = (commentId) => {
    setExpandedComments(prev => ({ ...prev, [commentId]: true }));
  };

  const handleReplyAdded = (reply) => {
    setComments(prev => [...prev, reply]);
  };

  if (!post) return null;

  const typeLabel = post.type === 'gallery' ? '图集' : post.type === 'video' ? '视频' : '图文';

  return (
    <div className="min-h-screen bg-[#F5F0E6] dark:bg-[#1a1a1a] pt-[91px] pb-12">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
        <div className="flex gap-6">
          {/* ====================== 左栏 68.3% ====================== */}
          <div className="flex-1 min-w-0" style={{ flex: '0 0 68.3%' }}>
            <div className="bg-white dark:bg-[#252525] border border-[#E5E0D5] dark:border-[#374151] rounded-xl overflow-hidden">

              {/* 图片/视频区域 */}
              {post.images && post.images.length > 0 ? (
                <GalleryImageCarousel images={post.images} inArticle />
              ) : post.videoUrl ? (
                <div className="w-full rounded-lg overflow-hidden" style={{ aspectRatio: '16/9', maxHeight: '450px' }}>
                  <video src={post.videoUrl} controls className="w-full h-full object-contain bg-black" />
                </div>
              ) : post.image && (
                <div className="w-full rounded-lg overflow-hidden" style={{
                  background: post.imageBg,
                  aspectRatio: '16/9',
                  maxHeight: '450px',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}>
                  {(!post.imageBg || post.imageBg.includes('linear-gradient')) && (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* 标题行 + 类型/时间 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[#999] text-xs bg-gray-100 dark:bg-[#333] px-2 py-0.5 rounded">{typeLabel}</span>
                  </div>
                  <span className="text-[#999] text-xs">{post.time}</span>
                </div>
                <h1 className="text-gray-900 dark:text-white text-xl font-bold mb-4">{post.content.split('\n')[0]}</h1>

                {/* 正文 */}
                <p className="text-gray-600 dark:text-[#BBB] text-sm leading-relaxed mb-6 whitespace-pre-line">
                  {post.content.includes('\n') ? post.content.substring(post.content.indexOf('\n') + 1) : post.content}
                </p>

                {/* 互动数据栏 */}
                <div className="flex items-center gap-6 pb-5 border-b border-[#E5E0D5] dark:border-[#374151]">
                  <span className="flex items-center gap-1 text-[#999] text-xs"><IconEye size={14} /> {post.views || 0}</span>
                  <span className="flex items-center gap-1 text-[#999] text-xs"><IconMessageCircle size={14} /> {comments.length}</span>
                  <span className="flex items-center gap-1 text-[#999] text-xs"><IconThumbsUp size={14} /> {localLikeCount}</span>
                </div>

                {/* 主操作栏 */}
                <div className="flex gap-3 py-5 border-b border-[#E5E0D5] dark:border-[#374151]">
                  <button onClick={handleLike}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-[#DDD] dark:border-[#444] rounded-lg text-[#666] dark:text-[#999] hover:border-[#4CAF50] hover:text-[#4CAF50] transition-colors">
                    <IconThumbsUp size={18} color={localLiked ? '#4CAF50' : '#666'} />
                    <span className="text-sm font-medium">{localLiked ? '已赞' : '点赞'} {localLikeCount}</span>
                  </button>
                  <button onClick={() => { if (!isLoggedIn) { navigate('/login'); return; } const f = toggleFavorite(currentUser.id, 'posts', post.id); setFavored(f); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-[#DDD] dark:border-[#444] rounded-lg text-[#666] dark:text-[#999] hover:border-[#4CAF50] hover:text-[#4CAF50] transition-colors">
                    <IconStar size={18} color={favored ? '#4CAF50' : '#666'} />
                    <span className="text-sm font-medium">{favored ? '已收藏' : '收藏'}</span>
                  </button>
                </div>

                {/* 评论区 */}
                <div className="pt-5">
                  {/* 评论输入 */}
                  <div className="flex gap-3 mb-6">
                    {isLoggedIn ? (
                      <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-full shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#444] shrink-0" />
                    )}
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text" value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
                        placeholder="快来发表你的评论吧~"
                        className="flex-1 bg-gray-100 dark:bg-[#333] text-gray-700 dark:text-[#CCC] text-sm pl-4 py-2.5 rounded-lg outline-none border border-transparent focus:border-[#4CAF50] transition-colors"
                      />
                      <button onClick={handleAddComment}
                        className="px-4 py-2.5 text-sm bg-[#4CAF50] text-white font-medium rounded-lg hover:bg-[#388E3C] transition-colors">
                        发送
                      </button>
                    </div>
                  </div>

                  {/* 评论列表头 */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E0D5] dark:border-[#374151]">
                    <h3 className="text-gray-900 dark:text-white text-sm font-bold">全部评论 {comments.length}</h3>
                    <div className="flex items-center gap-3">
                      {['默认', '最早', '最新'].map(s => (
                        <button key={s} onClick={() => setCommentSort(s)}
                          className={`text-xs transition-colors ${commentSort === s ? 'text-[#4CAF50] font-medium' : 'text-[#999] hover:text-gray-700 dark:hover:text-[#CCC]'}`}>{s}</button>
                      ))}
                    </div>
                  </div>

                  {/* 评论列表 */}
                  {sortedTopComments.length === 0 ? (
                    <p className="text-center text-[#999] text-xs py-8">暂无评论，快来抢沙发吧~</p>
                  ) : (
                    <div>
                      {sortedTopComments.map(c => (
                        <div key={c.id}>
                          <CommentItem
                            comment={c}
                            postId={postId}
                            isLoggedIn={isLoggedIn}
                            currentUser={currentUser}
                            allReplies={comments}
                            expanded={!!expandedComments[c.id]}
                            onToggleExpand={() => handleToggleExpand(c.id)}
                            onReplyAdded={handleReplyAdded}
                          />
                          {/* 展开的二级回复 */}
                          {(expandedComments[c.id] || (repliesByParent[c.id] && repliesByParent[c.id].length <= 2)) &&
                            (repliesByParent[c.id] || []).map(reply => (
                              <CommentItem
                                key={reply.id}
                                comment={reply}
                                postId={postId}
                                isLoggedIn={isLoggedIn}
                                currentUser={currentUser}
                                allReplies={comments}
                                onReplyAdded={handleReplyAdded}
                              />
                            ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ====================== 右栏 31.7% ====================== */}
          <aside className="hidden lg:block shrink-0" style={{ width: '31.7%' }}>
            <div className="sticky top-[91px] flex flex-col gap-4">

              {/* 作者信息卡片 */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-4 border border-[#E5E0D5] dark:border-[#333]">
                <div className="flex items-center gap-3">
                  <img src={post.authorAvatar} alt="" className="w-12 h-12 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-900 dark:text-white text-sm font-bold block truncate">{post.authorName}</span>
                    <span className="text-[#999] text-xs">发布了{typeLabel}</span>
                  </div>
                  {(!isLoggedIn || currentUser.id !== post.authorId) && (
                    <button onClick={handleFollow}
                      className={`shrink-0 px-4 py-1.5 text-xs font-medium rounded-full border transition-all ${
                        localFollowed
                          ? 'border-[#4CAF50] bg-[#4CAF50] text-white'
                          : 'border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white'
                      }`}>
                      {localFollowed ? '已关注' : '+ 关注'}
                    </button>
                  )}
                </div>
              </div>

              {/* 分区 & 话题卡片 */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-4 border border-[#E5E0D5] dark:border-[#333]">
                <div className="mb-2">
                  <span className="text-gray-700 dark:text-[#CCC] text-sm font-bold">分区 </span>
                  <span className="text-gray-700 dark:text-[#CCC] text-sm">{post.game || '明日方舟'}</span>
                </div>
                <div>
                  <span className="text-gray-700 dark:text-[#CCC] text-sm font-bold">话题 </span>
                  <span className="text-gray-700 dark:text-[#CCC] text-sm">
                    {post.tags && post.tags.length > 0 ? post.tags.join('、') : '暂无'}
                  </span>
                </div>
              </div>

              {/* 工具箱卡片 */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-3 border border-[#E5E0D5] dark:border-[#333]">
                <h3 className="text-[#4CAF50] font-bold text-sm mb-3">工具箱 GAME TOOLS</h3>
                <div className="grid grid-cols-3 gap-3">
                  {TOOLS.map(({ icon, label }) => (
                    <button key={label}
                      onClick={() => window.open('https://www.skland.com/download?type=akToolbox', '_blank')}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-[#E8F5E9] dark:hover:bg-[#1a3320] transition-all duration-200">
                      <span className="transition-colors duration-200 group-hover:text-[#4CAF50]">{icon}</span>
                      <span className="text-[#666] dark:text-[#999] text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>
        </div>
      </div>

      {/* 回到顶部 FAB */}
      {showBackTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 bg-[#4CAF50] rounded-full shadow-lg flex items-center justify-center hover:bg-[#388E3C] transition-colors z-30">
          <IconChevronUp size={20} />
        </button>
      )}
    </div>
  );
}
