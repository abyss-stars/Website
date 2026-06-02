import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPost, schedulePost, getPostById, updatePost, getAllPosts } from '../utils/storage';
import { uploadFile, generateFilename } from '../utils/upload';
import { IconSearch } from '../components/icons';

const IconUpload = ({ size = 48, color = '#999' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SPECS = [
  { label: '视频大小', value: '最大 2GB' },
  { label: '视频格式', value: 'MP4, AVI, MOV, WMV' },
  { label: '视频时长', value: '最长 30 分钟' },
  { label: '视频分辨率', value: '最高 4K (3840×2160)' },
];

const CATEGORIES = ['明日方舟', '来自星尘', '泡姆泡姆', '明日方舟:终末地'];
const TOPICS = ['#明日方舟', '#泡姆泡姆', '#终末地', '#来自星尘', '#音律联觉', '#火山旅梦', '#攻略', '#同人', '#考据', '#周边'];

export default function Video() {
  const { currentUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fileInputRef = useRef(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [topicSearch, setTopicSearch] = useState('');
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isOriginal, setIsOriginal] = useState(false);
  const [isAI, setIsAI] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);

  useEffect(() => { if (!isLoggedIn) navigate('/login'); }, [isLoggedIn, navigate]);

  // 编辑模式：加载已有帖子
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    if (!editId || !isLoggedIn) return;
    const post = getPostById(editId);
    if (!post || post.authorId !== currentUser.id) { navigate('/'); return; }
    setEditingPostId(post.id);

    const lines = (post.content || '').split('\n');
    setTitle(lines[0] || '');
    setContent(lines.slice(1).join('\n'));
    setCategory(post.game || '');
    setSelectedTopics(post.tags || []);

    if (post.videoUrl) {
      setVideoPreview(post.videoUrl);
    }
  }, [location.search, isLoggedIn, currentUser, navigate]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024 * 1024) {
      alert('视频大小不能超过 2GB');
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024 * 1024) {
      alert('视频大小不能超过 2GB');
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePublish = async () => {
    if (!editingPostId && !videoFile) { alert('请先上传视频'); return; }
    if (!title.trim()) { alert('请输入标题'); return; }
    if (!category) { alert('请选择分区'); return; }

    setPublishing(true);
    try {
      let videoUrl = editingPostId ? videoPreview : '';

      if (videoFile) {
        const base64 = await readFileAsBase64(videoFile);
        const ext = videoFile.name.split('.').pop() || 'mp4';
        const filename = generateFilename('video', ext);
        videoUrl = await uploadFile(currentUser.username, 'video', base64, filename);
      }

      const postData = {
        content: title.trim() + (content.trim() ? '\n' + content.trim() : ''),
        image: false,
        imageBg: null,
        videoUrl: videoUrl,
        tags: selectedTopics,
        game: category,
        type: 'video',
      };

      if (editingPostId) {
        updatePost(editingPostId, postData);
        navigate('/');
        return;
      }

      if (scheduled) {
        if (!scheduledTime) { alert('请选择定时发布时间'); return; }
        const now = new Date();
        const minTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const maxTime = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
        const selected = new Date(scheduledTime);
        if (selected < minTime) { alert('定时发布时间需在当前时间 + 2 小时之后'); return; }
        if (selected > maxTime) { alert('定时发布时间需在当前时间 + 15 天之内'); return; }
        schedulePost({
          ...postData,
          authorId: currentUser.id,
          authorName: currentUser.nickname,
          authorAvatar: currentUser.avatar,
          scheduledAt: selected.toISOString(),
        });
        alert('定时发布已设置');
        navigate('/');
        return;
      }

      createPost({
        ...postData,
        authorId: currentUser.id,
        authorName: currentUser.nickname,
        authorAvatar: currentUser.avatar,
      });
      navigate('/');
    } catch (err) {
      alert('发布失败：' + (err.message || '上传出错'));
    } finally {
      setPublishing(false);
    }
  };

  if (!isLoggedIn) return null;

  const filteredTopics = TOPICS.filter(t =>
    t.toLowerCase().includes(topicSearch.toLowerCase()) && !selectedTopics.includes(t)
  );

  const trendingTopics = (() => {
    const posts = getAllPosts();
    const sorted = [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    const top3 = sorted.slice(0, 3);
    const tags = new Set();
    top3.forEach(p => (p.tags || []).forEach(t => tags.add(t)));
    return [...tags].filter(t => !selectedTopics.includes(t) && !TOPICS.includes(t));
  })();

  const dropdownItems = topicSearch ? filteredTopics : trendingTopics;

  return (
    <div className="min-h-screen bg-[#F5F0E6] dark:bg-[#1a1a1a] pt-[91px] pb-12">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
      <div className="max-w-[800px] mx-auto">
        <div className="bg-white dark:bg-[#252525] border border-[#E5E0D5] dark:border-[#374151] rounded-xl p-6 md:p-8">

          {/* 标题栏 */}
          <div className="mb-6">
            <h1 className="text-gray-900 dark:text-white text-xl font-bold">{editingPostId ? '编辑视频' : '发布视频'}</h1>
          </div>

          {/* 视频上传区域 */}
          <div className="mb-6">
            {videoPreview ? (
              <div className="relative rounded-xl overflow-hidden bg-black">
                <video
                  src={videoPreview}
                  controls
                  className="w-full max-h-[400px] object-contain"
                />
                <button
                  onClick={() => { setVideoFile(null); setVideoPreview(''); }}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-[#4CAF50] text-white text-sm font-medium rounded-full hover:bg-[#388E3C] transition-colors"
                >
                  重新上传
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-[#CCC] dark:border-[#555] rounded-xl p-16 flex flex-col items-center justify-center cursor-pointer hover:border-[#4CAF50] transition-colors bg-gray-50/50 dark:bg-[#1a1a1a]/50"
              >
                <IconUpload size={48} color="#999" />
                <p className="text-[#999] text-sm mt-4 mb-4">点击或拖拽文件到此处上传</p>
                <button type="button"
                  className="px-6 py-2 text-sm text-white bg-[#4CAF50] rounded-full hover:bg-[#388E3C] transition-colors font-medium">
                  上传视频
                </button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
          </div>

          {/* 视频规格说明区 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {SPECS.map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-[#1E1E1E] rounded-lg p-3 text-center border border-[#E5E0D5] dark:border-[#333]">
                <div className="text-[#999] text-xs mb-1">{label}</div>
                <div className="text-gray-700 dark:text-[#CCC] text-xs font-medium">{value}</div>
              </div>
            ))}
          </div>

          {/* 视频描述 */}
          <h2 className="text-gray-900 dark:text-white text-base font-bold mb-6">视频描述</h2>

          {/* 标题输入区 */}
          <div className="mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 40))}
              placeholder="请输入标题哦（必填）"
              className="w-full bg-transparent text-gray-900 dark:text-white text-sm px-0 py-2 outline-none border-b border-[#E5E0D5] dark:border-[#374151] focus:border-[#4CAF50] transition-colors placeholder-gray-400 dark:placeholder-gray-500"
            />
            <div className="text-right text-[#999] text-xs mt-1">{title.length}/40</div>
          </div>

          {/* 内容描述区 */}
          <div className="mb-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 500))}
              placeholder="介绍一下你的创作吧（建议500字以内）"
              rows={6}
              className="w-full bg-gray-50 dark:bg-[#1a1a1a] text-gray-700 dark:text-[#CCC] text-sm leading-relaxed p-4 rounded-lg outline-none border border-[#E5E0D5] dark:border-[#374151] focus:border-[#4CAF50] transition-colors resize-none placeholder-gray-400 dark:placeholder-gray-500"
            />
            <div className="text-right text-[#999] text-xs mt-1">{content.length}/500</div>
          </div>

          {/* 选择分区 */}
          <div className="flex items-center justify-between mb-6">
            <label className="text-gray-700 dark:text-[#CCC] text-sm shrink-0">选择分区</label>
            <div className="relative w-48">
              <button onClick={() => setCategoryOpen(!categoryOpen)}
                className="w-full flex items-center justify-between bg-gray-100 dark:bg-[#333] text-gray-700 dark:text-[#CCC] text-sm px-3 py-2 rounded-lg hover:border-[#4CAF50] transition-colors border border-transparent">
                <span className={category ? '' : 'text-gray-400'}>{category || '请选择版区'}</span>
                <IconChevronDown />
              </button>
              {categoryOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCategoryOpen(false)} />
                  <div className="absolute top-full mt-1 left-0 w-full bg-white dark:bg-[#2a2a2a] border border-[#E5E0D5] dark:border-[#374151] rounded-lg shadow-lg py-1 z-20">
                    {CATEGORIES.map(c => (
                      <button key={c} onClick={() => { setCategory(c); setCategoryOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-[#CCC] hover:bg-gray-100 dark:hover:bg-[#374151] transition-colors">{c}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 添加话题 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-700 dark:text-[#CCC] text-sm">添加话题</label>
              <span className="text-[#999] text-xs">请选择与发布内容相关的话题</span>
            </div>
            {selectedTopics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTopics.map(t => (
                  <span key={t} className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#E8F5E9] dark:bg-[#1a3320] text-[#43A047] rounded-full">
                    {t}
                    <button onClick={() => setSelectedTopics(prev => prev.filter(x => x !== t))} className="hover:text-red-400">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <IconSearch size={14} color="#999" />
              </span>
              <input type="text" value={topicSearch}
                onChange={(e) => { setTopicSearch(e.target.value); setShowTopicDropdown(true); }}
                onFocus={() => setShowTopicDropdown(true)}
                onBlur={() => setTimeout(() => setShowTopicDropdown(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && topicSearch.trim()) {
                    e.preventDefault();
                    const t = topicSearch.trim();
                    if (!selectedTopics.includes(t)) {
                      setSelectedTopics(prev => [...prev, t]);
                    }
                    setTopicSearch('');
                    setShowTopicDropdown(false);
                  }
                }}
                placeholder="搜索话题"
                className="w-full bg-gray-100 dark:bg-[#333] text-gray-700 dark:text-[#CCC] text-sm pl-8 pr-3 py-2 rounded-lg outline-none border border-transparent focus:border-[#4CAF50] transition-colors" />
              {showTopicDropdown && (
                <div className="absolute top-full mt-1 left-0 w-full bg-white dark:bg-[#2a2a2a] border border-[#E5E0D5] dark:border-[#374151] rounded-lg shadow-lg py-1 z-20 max-h-40 overflow-y-auto">
                  {topicSearch && !selectedTopics.includes(topicSearch.trim()) && (
                    <button onClick={() => { setSelectedTopics(prev => [...prev, topicSearch.trim()]); setTopicSearch(''); setShowTopicDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-[#4CAF50] hover:bg-gray-100 dark:hover:bg-[#374151] transition-colors border-b border-[#E5E0D5] dark:border-[#374151]">
                      添加 "{topicSearch.trim()}"
                    </button>
                  )}
                  {dropdownItems.length > 0 ? (
                    dropdownItems.map(t => (
                      <button key={t} onClick={() => { setSelectedTopics(prev => [...prev, t]); setTopicSearch(''); setShowTopicDropdown(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-[#CCC] hover:bg-gray-100 dark:hover:bg-[#374151] transition-colors">{t}</button>
                    ))
                  ) : (
                    !topicSearch && <div className="px-3 py-2 text-sm text-[#999]">无</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 声明选项区 */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-gray-700 dark:text-[#CCC] text-sm">原创内容</label>
                <p className="text-[#999] text-xs">声明该内容为本人原创</p>
              </div>
              <button onClick={() => { setIsOriginal(!isOriginal); if (!isOriginal) setIsAI(false); }}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isOriginal ? 'bg-[#4CAF50]' : 'bg-gray-300 dark:bg-[#555]'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isOriginal ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-gray-700 dark:text-[#CCC] text-sm">AI生成内容</label>
                <p className="text-[#999] text-xs">声明该内容含AI生成部分</p>
              </div>
              <button onClick={() => { setIsAI(!isAI); if (!isAI) setIsOriginal(false); }}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isAI ? 'bg-[#4CAF50]' : 'bg-gray-300 dark:bg-[#555]'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isAI ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>

          {/* 定时发布 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-gray-700 dark:text-[#CCC] text-sm">定时发布</label>
                <p className="text-[#999] text-xs">(当前+2小时 ≤ 可选时间 ≤ 当前+15天)</p>
              </div>
              <button onClick={() => { setScheduled(!scheduled); setScheduledTime(''); }}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${scheduled ? 'bg-[#4CAF50]' : 'bg-gray-300 dark:bg-[#555]'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${scheduled ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            {scheduled && (
              <div className="flex items-center justify-between">
                <label className="text-gray-700 dark:text-[#CCC] text-sm">发布时间</label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                  max={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                  className="bg-gray-100 dark:bg-[#333] text-gray-700 dark:text-[#CCC] text-sm px-3 py-2 rounded-lg border border-transparent focus:border-[#4CAF50] outline-none transition-colors"
                />
              </div>
            )}
          </div>

          {/* 发布按钮 */}
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-10 py-2.5 bg-[#4CAF50] text-white font-medium rounded-lg hover:bg-[#388E3C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {publishing ? '发布中...' : editingPostId ? '保存修改' : '发布'}
          </button>

        </div>
      </div>
      </div>
    </div>
  );
}
