import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPost, saveDraft, getUserDrafts, deleteDraft, schedulePost } from '../utils/storage';
import { IconSearch } from '../components/icons';

// ====================== 工具栏图标 ======================
const ToolbarIcon = ({ children, label, onClick, active }) => (
  <div className="relative group">
    <button type="button" onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
        active ? 'bg-[#1a3320] text-[#4CAF50]' : 'text-[#999] hover:bg-gray-100 dark:hover:bg-[#333] hover:text-gray-700 dark:hover:text-[#CCC]'
      }`}>
      {children}
    </button>
    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#333] text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-10">
      {label}
    </div>
  </div>
);

const IconUndo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);
const IconRedo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);
const IconLink = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const IconImageSm = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);
const IconVideoSm = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);
const IconBold = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
);
const IconItalic = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);
const IconUnderline = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" />
  </svg>
);
const IconStrikethrough = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7.1-4.3 1.3-4.3 3.2 0 3.3 5.2 2.3 5.2 5.8 0 2.1-1.4 3.1-4.2 3-1.7-.1-3.4-.5-5-1.1" /><line x1="4" y1="12" x2="20" y2="12" />
  </svg>
);
const IconFontColor = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 12 18 20 7" /><line x1="4" y1="12" x2="20" y2="12" />
    <line x1="6" y1="20" x2="18" y2="20" strokeWidth="1.5" />
  </svg>
);
const IconHeading = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4v16M18 4v16M6 12h12" />
  </svg>
);
const IconChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CATEGORIES = ['明日方舟', '来自星尘', '泡姆泡姆', '明日方舟:终末地'];
const TOPICS = ['#明日方舟', '#泡姆泡姆', '#终末地', '#来自星尘', '#音律联觉', '#火山旅梦', '#攻略', '#同人', '#考据', '#周边'];

// ====================== 主组件 ======================
export default function Publish() {
  const { currentUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [topicSearch, setTopicSearch] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isOriginal, setIsOriginal] = useState(false);
  const [isAI, setIsAI] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [showDrafts, setShowDrafts] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  // 路由守卫
  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); }
  }, [isLoggedIn, navigate]);

  // 草稿
  const drafts = isLoggedIn ? getUserDrafts(currentUser.id) : [];

  // 格式化状态追踪
  const getFormatState = () => {
    try {
      return {
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        heading: document.queryCommandState('formatBlock'),
      };
    } catch { return {}; }
  };
  const [formatState, setFormatState] = useState({});

  const execCommand = useCallback((cmd, val) => {
    editorRef.current?.focus();
    if (cmd === 'createLink') {
      const url = prompt('输入链接地址：');
      if (url) document.execCommand(cmd, false, url);
    } else if (cmd === 'insertImage') {
      fileInputRef.current?.click();
    } else if (cmd === 'insertVideo') {
      const url = prompt('输入视频链接：');
      if (url) {
        const html = `<div contenteditable="false" style="background:#333;border-radius:8px;padding:40px;text-align:center;margin:8px 0;color:#999;font-size:13px;">▶ 视频: ${url}</div>`;
        document.execCommand('insertHTML', false, html);
      }
    } else if (cmd === 'foreColor') {
      const color = prompt('输入颜色值 (如 #4CAF50, red, blue)：', '#4CAF50');
      if (color) document.execCommand(cmd, false, color);
    } else if (cmd === 'formatBlock') {
      const isH2 = formatState.heading;
      document.execCommand('formatBlock', false, isH2 ? '<p>' : '<h2>');
    } else {
      document.execCommand(cmd, false, val);
    }
    setFormatState(getFormatState());
  }, [formatState]);

  // 图片上传处理
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      // 压缩图片
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > 600) { height = height * 600 / width; width = 600; }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        let dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        while (dataUrl.length > 150 * 1024) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.3);
          break;
        }
        document.execCommand('insertImage', false, dataUrl);
        setFormatState(getFormatState());
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 获取正文内容
  const getContent = () => {
    const el = editorRef.current;
    if (!el) return '';
    // 处理换行：将 div/br 转为 \n
    let html = el.innerHTML;
    html = html.replace(/<div><br><\/div>/gi, '\n');
    html = html.replace(/<div>/gi, '\n').replace(/<\/div>/gi, '');
    html = html.replace(/<br\s*\/?>/gi, '\n');
    // 移除 contenteditable="false" 的占位块
    html = html.replace(/<div[^>]*contenteditable="false"[^>]*>.*?<\/div>/gi, '');
    const text = el.innerText || el.textContent || '';
    return text.trim();
  };

  const getContentHTML = () => {
    return editorRef.current?.innerHTML || '';
  };

  // 发表
  const handlePublish = () => {
    if (!title.trim()) { alert('请输入标题'); return; }
    if (!category) { alert('请选择分区'); return; }
    const content = getContent();
    if (!content) { alert('请输入正文内容'); return; }

    if (scheduled) {
      if (!scheduledTime) { alert('请选择定时发布时间'); return; }
      const now = new Date();
      const minTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const maxTime = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
      const selected = new Date(scheduledTime);
      if (selected < minTime) { alert('定时发布时间需在当前时间 + 2 小时之后'); return; }
      if (selected > maxTime) { alert('定时发布时间需在当前时间 + 15 天之内'); return; }
      schedulePost({
        authorId: currentUser.id,
        authorName: currentUser.nickname,
        authorAvatar: currentUser.avatar,
        content: title.trim() + '\n' + content,
        image: true,
        imageBg: 'linear-gradient(135deg, #2d3a4a, #1a2744, #0f1f3d)',
        tags: selectedTopics,
        game: category,
        type: 'post',
        scheduledAt: selected.toISOString(),
      });
      alert('定时发布已设置');
      navigate('/');
      return;
    }

    createPost({
      authorId: currentUser.id,
      authorName: currentUser.nickname,
      authorAvatar: currentUser.avatar,
      content: title.trim() + '\n' + content,
      image: true,
      imageBg: 'linear-gradient(135deg, #2d3a4a, #1a2744, #0f1f3d)',
      tags: selectedTopics,
      game: category,
    });
    navigate('/');
  };

  // 存草稿
  const handleSaveDraft = () => {
    saveDraft(currentUser.id, {
      title,
      category,
      topics: selectedTopics,
      contentHTML: getContentHTML(),
      isOriginal,
      isAI,
      scheduled,
      scheduledTime,
    });
    setSavedMsg('草稿已保存');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  // 加载草稿
  const loadDraft = (draft) => {
    setTitle(draft.title || '');
    setCategory(draft.category || '');
    setSelectedTopics(draft.topics || []);
    setIsOriginal(draft.isOriginal || false);
    setIsAI(draft.isAI || false);
    setScheduled(draft.scheduled || false);
    setScheduledTime(draft.scheduledTime || '');
    if (editorRef.current && draft.contentHTML) {
      editorRef.current.innerHTML = draft.contentHTML;
    }
    setShowDrafts(false);
  };

  const getCharCount = () => {
    const el = editorRef.current;
    return el ? (el.innerText || el.textContent || '').length : 0;
  };

  const filteredTopics = TOPICS.filter(t =>
    t.toLowerCase().includes(topicSearch.toLowerCase()) && !selectedTopics.includes(t)
  );

  if (!isLoggedIn) return null;

  const charCount = getCharCount();

  return (
    <div className="min-h-screen bg-[#F5F0E6] dark:bg-[#1a1a1a] pt-[91px] pb-12">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
      <div className="max-w-[800px] mx-auto">
        {/* 主卡片 */}
        <div className="bg-white dark:bg-[#252525] border border-[#E5E0D5] dark:border-[#374151] rounded-xl p-6 md:p-8">

          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-gray-900 dark:text-white text-xl font-bold">发布图文</h1>
            <div className="flex items-center gap-3">
              {savedMsg && <span className="text-[#4CAF50] text-xs">{savedMsg}</span>}
              <button onClick={() => navigate('/publish-manager')}
                className="flex items-center gap-1 text-[#999] hover:text-[#4CAF50] transition-colors text-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>草稿箱</span>
              </button>
            </div>
          </div>

          {/* 标题输入框 */}
          <div className="mb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 40))}
              placeholder="请输入标题哦（必填）"
              className="w-full bg-transparent text-gray-900 dark:text-white text-lg font-medium px-0 py-2 outline-none placeholder-gray-400 dark:placeholder-gray-500 border-b border-[#E5E0D5] dark:border-[#333] focus:border-[#4CAF50] transition-colors"
            />
            <div className="text-right text-[#999] text-xs mt-1">{title.length}/40</div>
          </div>

          {/* 工具栏 */}
          <div className="flex items-center gap-1 mb-3 pb-3 border-b border-[#E5E0D5] dark:border-[#333] flex-wrap">
            <ToolbarIcon label="撤销" onClick={() => execCommand('undo')}><IconUndo /></ToolbarIcon>
            <ToolbarIcon label="重做" onClick={() => execCommand('redo')}><IconRedo /></ToolbarIcon>
            <div className="w-px h-5 bg-[#E5E0D5] dark:bg-[#444] mx-1" />
            <ToolbarIcon label="链接" onClick={() => execCommand('createLink')}><IconLink /></ToolbarIcon>
            <ToolbarIcon label="图片" onClick={() => execCommand('insertImage')}><IconImageSm /></ToolbarIcon>
            <ToolbarIcon label="视频/GIF" onClick={() => execCommand('insertVideo')}><IconVideoSm /></ToolbarIcon>
            <div className="w-px h-5 bg-[#E5E0D5] dark:bg-[#444] mx-1" />
            <ToolbarIcon label="加粗" active={formatState.bold} onClick={() => execCommand('bold')}><IconBold /></ToolbarIcon>
            <ToolbarIcon label="斜体" active={formatState.italic} onClick={() => execCommand('italic')}><IconItalic /></ToolbarIcon>
            <ToolbarIcon label="下划线" active={formatState.underline} onClick={() => execCommand('underline')}><IconUnderline /></ToolbarIcon>
            <ToolbarIcon label="删除线" active={formatState.strikeThrough} onClick={() => execCommand('strikeThrough')}><IconStrikethrough /></ToolbarIcon>
            <div className="w-px h-5 bg-[#E5E0D5] dark:bg-[#444] mx-1" />
            <ToolbarIcon label="字体颜色" onClick={() => execCommand('foreColor')}><IconFontColor /></ToolbarIcon>
            <ToolbarIcon label="标题" active={formatState.heading} onClick={() => execCommand('formatBlock')}><IconHeading /></ToolbarIcon>
          </div>

          {/* 正文编辑区 */}
          <div className="mb-6">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="畅所欲言，笔递给你（建议1-20000字）"
              onKeyUp={() => setFormatState(getFormatState())}
              onMouseUp={() => setFormatState(getFormatState())}
              onInput={() => setFormatState(getFormatState())}
              className="min-h-[280px] text-gray-800 dark:text-[#CCC] text-sm leading-relaxed outline-none
                [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400 dark:[&:empty]:before:text-gray-500
                [&_h2]:text-lg [&_h2]:font-bold [&_h2]:my-2
                [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2
                [&_a]:text-[#4CAF50] [&_a]:underline
                [&_b]:font-bold [&_i]:italic [&_u]:underline [&_s]:line-through"
            />
            <div className="text-right text-[#999] text-xs mt-1">{charCount}/20000</div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

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
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-[#CCC] hover:bg-gray-100 dark:hover:bg-[#374151] transition-colors">
                          {c}
                        </button>
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
              {/* 已选话题 */}
              {selectedTopics.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTopics.map(t => (
                    <span key={t} className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#E8F5E9] dark:bg-[#1a3320] text-[#43A047] rounded-full">
                      {t}
                      <button onClick={() => setSelectedTopics(prev => prev.filter(x => x !== t))}
                        className="hover:text-red-400">
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
                <input
                  type="text"
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  placeholder="搜索话题"
                  className="w-full bg-gray-100 dark:bg-[#333] text-gray-700 dark:text-[#CCC] text-sm pl-8 pr-3 py-2 rounded-lg outline-none border border-transparent focus:border-[#4CAF50] transition-colors"
                />
                {topicSearch && filteredTopics.length > 0 && (
                  <div className="absolute top-full mt-1 left-0 w-full bg-white dark:bg-[#2a2a2a] border border-[#E5E0D5] dark:border-[#374151] rounded-lg shadow-lg py-1 z-20 max-h-40 overflow-y-auto">
                    {filteredTopics.map(t => (
                      <button key={t} onClick={() => { setSelectedTopics(prev => [...prev, t]); setTopicSearch(''); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-[#CCC] hover:bg-gray-100 dark:hover:bg-[#374151] transition-colors">
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 原创声明 */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-gray-700 dark:text-[#CCC] text-sm">原创内容</label>
                <p className="text-[#999] text-xs">声明该内容为本人原创</p>
              </div>
              <button onClick={() => setIsOriginal(!isOriginal)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isOriginal ? 'bg-[#4CAF50]' : 'bg-gray-300 dark:bg-[#555]'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isOriginal ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {/* AI 声明 */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-gray-700 dark:text-[#CCC] text-sm">AI生成内容</label>
                <p className="text-[#999] text-xs">声明该内容含AI生成部分</p>
              </div>
              <button onClick={() => setIsAI(!isAI)}
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
              发布
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
