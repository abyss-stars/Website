import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPost, saveDraft, getUserDrafts, deleteDraft, getUsers, schedulePost, getPostById, updatePost, getAllPosts } from '../utils/storage';
import { uploadFile, generateFilename } from '../utils/upload';
import { IconSearch } from '../components/icons';

// ====================== 工具栏图标 ======================
const IconAt = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
  </svg>
);
const IconChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CATEGORIES = ['明日方舟', '来自星尘', '泡姆泡姆', '明日方舟:终末地'];
const TOPICS = ['#明日方舟', '#泡姆泡姆', '#终末地', '#来自星尘', '#音律联觉', '#火山旅梦', '#攻略', '#同人', '#考据', '#周边'];

// ====================== 通知存储 ======================
function addMentionNotification(mentionedUsername, postId) {
  const users = getUsers();
  const target = users.find(u => u.username === mentionedUsername);
  if (!target) return;
  const key = `notifications_${target.id}`;
  const notifs = JSON.parse(localStorage.getItem(key) || '[]');
  notifs.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    type: 'mention',
    postId,
    from: mentionedUsername,
    read: false,
    time: new Date().toISOString(),
  });
  if (notifs.length > 50) notifs.length = 50;
  localStorage.setItem(key, JSON.stringify(notifs));
}

// ====================== 主组件 ======================
export default function Gallery() {
  const { currentUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]); // base64 images
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [topicSearch, setTopicSearch] = useState('');
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isOriginal, setIsOriginal] = useState(false);
  const [isAI, setIsAI] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const [showDrafts, setShowDrafts] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);

  // @提及状态
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionPos, setMentionPos] = useState({ top: 0, left: 0 });

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
    const body = lines.slice(1).join('\n');
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerText = body;
    }, 0);

    setCategory(post.game || '');
    setSelectedTopics(post.tags || []);
    setImages(post.images || []);
  }, [location.search, isLoggedIn, currentUser, navigate]);

  const drafts = isLoggedIn ? getUserDrafts(currentUser.id) : [];
  const allUsers = getUsers();

  // 图片上传
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 30) { alert('最多可同时上传30张图片'); return; }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > 800) { height = height * 800 / width; width = 800; }
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          let dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          while (dataUrl.length > 150 * 1024) { dataUrl = canvas.toDataURL('image/jpeg', 0.3); break; }
          setImages(prev => [...prev, dataUrl]);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  // @提及处理
  const handleEditorInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;

    // 获取光标位置
    const sel = window.getSelection();
    if (!sel.rangeCount) { setMentionOpen(false); return; }

    const node = sel.anchorNode;
    const offset = sel.anchorOffset;
    if (!node || node.nodeType !== 3) { setMentionOpen(false); return; }

    // 向前查找 @
    const text = node.textContent || '';
    const beforeCursor = text.slice(0, offset);
    const atIdx = beforeCursor.lastIndexOf('@');

    if (atIdx >= 0) {
      const afterAt = beforeCursor.slice(atIdx + 1);
      // @ 后面没有空格说明正在输入用户名
      if (!/\s/.test(afterAt)) {
        setMentionFilter(afterAt.toLowerCase());
        const range = sel.getRangeAt(0).cloneRange();
        range.setStart(node, atIdx);
        const rect = range.getBoundingClientRect();
        const editorRect = el.getBoundingClientRect();
        setMentionPos({
          top: rect.bottom - editorRect.top + 4,
          left: rect.left - editorRect.left,
        });
        setMentionOpen(true);
        return;
      }
    }
    setMentionOpen(false);
  }, []);

  const insertMention = (username) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const node = sel.anchorNode;
    const offset = sel.anchorOffset;
    if (!node || node.nodeType !== 3) return;
    const text = node.textContent || '';
    const atIdx = text.slice(0, offset).lastIndexOf('@');
    if (atIdx < 0) return;
    const range = document.createRange();
    range.setStart(node, atIdx);
    range.setEnd(node, offset);
    range.deleteContents();
    const mentionSpan = document.createElement('span');
    mentionSpan.contentEditable = 'false';
    mentionSpan.className = 'text-[#4CAF50] font-medium';
    mentionSpan.textContent = '@' + username;
    range.insertNode(mentionSpan);
    range.setStartAfter(mentionSpan);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    setMentionOpen(false);
  };

  const filteredUsers = allUsers.filter(u =>
    u.username.toLowerCase().includes(mentionFilter) &&
    u.id !== currentUser?.id
  );

  // 获取正文
  const getContent = () => {
    const el = editorRef.current;
    return el ? (el.innerText || el.textContent || '').trim() : '';
  };

  // 提取 @提及的用户名
  const extractMentions = () => {
    const el = editorRef.current;
    if (!el) return [];
    const spans = el.querySelectorAll('span[contenteditable="false"]');
    return Array.from(spans)
      .map(s => s.textContent)
      .filter(t => t && t.startsWith('@'))
      .map(t => t.slice(1));
  };

  // 发表
  const handlePublish = async () => {
    if (!title.trim()) { alert('请输入标题'); return; }
    if (!category) { alert('请选择分区'); return; }
    if (images.length === 0) { alert('请至少上传一张图片'); return; }
    const content = getContent();
    const mentions = extractMentions();

    // 上传图片：跳过已是服务器路径的图片
    const uploadedPaths = [];
    for (let i = 0; i < images.length; i++) {
      if (images[i].startsWith('/img/user/')) {
        uploadedPaths.push(images[i]);
      } else {
        const filename = generateFilename('gallery', 'jpg');
        const path = await uploadFile(currentUser.username, 'pic', images[i], filename);
        uploadedPaths.push(path || images[i]);
      }
    }

    const postData = {
      content: title.trim() + '\n' + content,
      image: true,
      imageBg: uploadedPaths[0] ? `url(${uploadedPaths[0]}) center/cover` : 'linear-gradient(135deg, #2d3a4a, #1a2744, #0f1f3d)',
      images: uploadedPaths,
      tags: selectedTopics,
      game: category,
      type: 'gallery',
    };

    // 编辑模式
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
      const scheduledPost = schedulePost({
        ...postData,
        authorId: currentUser.id,
        authorName: currentUser.nickname,
        authorAvatar: currentUser.avatar,
        scheduledAt: selected.toISOString(),
      });
      mentions.forEach(username => addMentionNotification(username, scheduledPost.id));
      alert('定时发布已设置');
      navigate('/');
      return;
    }

    const post = createPost({
      ...postData,
      authorId: currentUser.id,
      authorName: currentUser.nickname,
      authorAvatar: currentUser.avatar,
    });
    mentions.forEach(username => addMentionNotification(username, post.id));
    navigate('/');
  };

  // 草稿
  const handleSaveDraft = () => {
    saveDraft(currentUser.id, {
      type: 'gallery',
      title, category, topics: selectedTopics,
      images,
      contentHTML: editorRef.current?.innerHTML || '',
      isOriginal, isAI, scheduled, scheduledTime,
    });
    setSavedMsg('草稿已保存');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  const loadDraft = (draft) => {
    setTitle(draft.title || '');
    setCategory(draft.category || '');
    setSelectedTopics(draft.topics || []);
    setImages(draft.images || []);
    setIsOriginal(draft.isOriginal || false);
    setIsAI(draft.isAI || false);
    setScheduled(draft.scheduled || false);
    setScheduledTime(draft.scheduledTime || '');
    if (editorRef.current && draft.contentHTML) editorRef.current.innerHTML = draft.contentHTML;
    setShowDrafts(false);
  };

  if (!isLoggedIn) return null;

  const charCount = getContent().length;

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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-gray-900 dark:text-white text-xl font-bold">{editingPostId ? '编辑图集' : '发布图集'}</h1>
            <div className="flex items-center gap-3">
              {savedMsg && <span className="text-[#4CAF50] text-xs">{savedMsg}</span>}
              <button onClick={() => navigate('/publish-manager')}
                className="flex items-center gap-1 text-[#999] hover:text-[#4CAF50] transition-colors text-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                <span>草稿箱</span>
              </button>
            </div>
          </div>

          {/* 图片上传区域 */}
          <div className="mb-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#CCC] dark:border-[#555] rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#4CAF50] transition-colors"
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <button type="button"
                className="mt-3 px-4 py-1.5 text-sm text-[#4CAF50] border border-[#4CAF50] rounded-full hover:bg-[#E8F5E9] dark:hover:bg-[#1a3320] transition-colors">
                上传图片
              </button>
              <p className="text-[#999] text-xs mt-3 text-center leading-relaxed">
                最多可同时上传30张（支持格式jpg, png, jpeg, gif，宽高比尺寸推荐大于420像素）
              </p>
            </div>

            {/* 已上传图片预览 */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                {images.map((img, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-200 dark:bg-[#333]">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                ))}
                {images.length < 30 && (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-[#CCC] dark:border-[#555] flex items-center justify-center hover:border-[#4CAF50] transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </button>
                )}
              </div>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />

          {/* 标题输入 */}
          <div className="mb-4">
            <input type="text" value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 40))}
              placeholder="请输入标题哦（必填）"
              className="w-full bg-transparent text-gray-900 dark:text-white text-lg font-medium px-0 py-2 outline-none placeholder-gray-400 dark:placeholder-gray-500 border-b border-[#E5E0D5] dark:border-[#333] focus:border-[#4CAF50] transition-colors" />
            <div className="text-right text-[#999] text-xs mt-1">{title.length}/40</div>
          </div>

          {/* 简易工具栏 */}
          <div className="flex items-center gap-1 mb-3 pb-3 border-b border-[#E5E0D5] dark:border-[#333]">
            <div className="relative group">
              <button type="button"
                onClick={() => {
                  const el = editorRef.current;
                  if (!el) return;
                  el.focus();
                  const sel = window.getSelection();
                  // 在光标处插入 @
                  if (sel.rangeCount) {
                    const range = sel.getRangeAt(0);
                    range.deleteContents();
                    const atNode = document.createTextNode('@');
                    range.insertNode(atNode);
                    range.setStartAfter(atNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                  }
                  // 触发展示下拉
                  setMentionFilter('');
                  setMentionOpen(true);
                  const rect = el.getBoundingClientRect();
                  setMentionPos({ top: 24, left: 0 });
                }}
                className="w-8 h-8 flex items-center justify-center rounded text-[#999] hover:bg-gray-100 dark:hover:bg-[#333] hover:text-gray-700 dark:hover:text-[#CCC] transition-colors"
                title="@提及用户">
                <IconAt />
              </button>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#333] text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-10">
                @提及用户
              </div>
            </div>
          </div>

          {/* 正文区 + @提及下拉 */}
          <div className="mb-6 relative" ref={editorRef ? null : null}>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="介绍一下你的创作吧（建议500字以内）"
              onInput={handleEditorInput}
              onKeyUp={handleEditorInput}
              onClick={handleEditorInput}
              className="min-h-[200px] text-gray-800 dark:text-[#CCC] text-sm leading-relaxed outline-none
                [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400 dark:[&:empty]:before:text-gray-500
                [&_span]:text-[#4CAF50] [&_span]:font-medium"
            />
            {/* @提及下拉 */}
            {mentionOpen && filteredUsers.length > 0 && (
              <div className="absolute z-20 bg-white dark:bg-[#2a2a2a] border border-[#E5E0D5] dark:border-[#374151] rounded-lg shadow-lg py-1 w-48 max-h-48 overflow-y-auto"
                style={{ top: mentionPos.top, left: mentionPos.left }}>
                {filteredUsers.slice(0, 8).map(u => (
                  <button key={u.id} onClick={() => insertMention(u.username)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-[#CCC] hover:bg-gray-100 dark:hover:bg-[#374151] transition-colors flex items-center gap-2">
                    <img src={u.avatar} alt="" className="w-5 h-5 rounded-full" />
                    <span>@{u.username}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="text-right text-[#999] text-xs mt-1">{charCount}/500</div>
          </div>

          {/* 设置选项区 */}
          <div className="space-y-4 border-t border-[#E5E0D5] dark:border-[#333] pt-4">

            {/* 选择分区 */}
            <div className="flex items-center justify-between">
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
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-700 dark:text-[#CCC] text-sm">添加话题</label>
                <span className="text-[#999] text-xs">请选择与发布内容相关的话题，容易获得更多浏览哦</span>
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

            {/* 原创 */}
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

            {/* AI */}
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

            {/* 定时发布 */}
            <div className="flex items-center justify-between">
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
          <div className="mt-6 pt-4 border-t border-[#E5E0D5] dark:border-[#333]">
            <button onClick={handlePublish}
              className="px-10 py-2.5 bg-[#4CAF50] text-white font-medium rounded-lg hover:bg-[#388E3C] transition-colors">
              {editingPostId ? '保存修改' : '发布'}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
