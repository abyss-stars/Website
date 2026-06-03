// ====================== localStorage 数据层 ======================

const STORAGE_KEYS = {
  USERS: 'users',
  SESSION: 'current_session',
  ALL_POSTS: 'all_posts',
  ALL_COMMENTS: 'all_comments',
};

// 生成 UUID
function uuid() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 生成默认 SVG 头像
function defaultAvatar(username) {
  const hue = Array.from(username).reduce((h, c) => h + c.charCodeAt(0), 0) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
  <circle cx="40" cy="40" r="40" fill="hsl(${hue},50%,45%)"/>
  <text x="40" y="48" text-anchor="middle" fill="#FFF" font-size="32" font-family="sans-serif">${username[0]?.toUpperCase() || '?'}</text>
</svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// ====================== 通用读写 ======================
function getItem(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ====================== 用户管理 ======================
function getUsers() {
  return getItem(STORAGE_KEYS.USERS) || [];
}

function saveUsers(users) {
  setItem(STORAGE_KEYS.USERS, users);
}

function findUserByUsername(username) {
  return getUsers().find(u => u.username === username);
}

function findUserById(id) {
  return getUsers().find(u => u.id === id) || null;
}

function createUser({ username, password, nickname }) {
  const users = getUsers();
  if (findUserByUsername(username)) {
    return { error: '用户名已存在' };
  }
  const newUser = {
    id: uuid(),
    username,
    password,
    nickname: nickname || username,
    avatar: defaultAvatar(username),
    bio: '',
    createdAt: new Date().toISOString(),
    followings: [],
    postCount: 0,
    followerCount: 0,
    points: 0,
    checkinStreak: 0,
    lastCheckinDate: null,
    checkinHistory: [],
  };
  users.push(newUser);
  saveUsers(users);
  return { user: newUser };
}

function updateUser(userId, updates) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  // 同步更新所有帖子中的作者信息
  syncAuthorInfo(userId, users[idx]);
  return users[idx];
}

function syncAuthorInfo(userId, user) {
  const posts = getAllPosts();
  let changed = false;
  posts.forEach(p => {
    if (p.authorId === userId) {
      p.authorName = user.nickname;
      p.authorAvatar = user.avatar;
      changed = true;
    }
  });
  if (changed) saveAllPosts(posts);

  const comments = getAllComments();
  let commentChanged = false;
  Object.keys(comments).forEach(postId => {
    comments[postId].forEach(c => {
      if (c.authorId === userId) {
        c.authorName = user.nickname;
        c.authorAvatar = user.avatar;
        commentChanged = true;
      }
    });
  });
  if (commentChanged) setItem(STORAGE_KEYS.ALL_COMMENTS, comments);
}

// ====================== 会话管理 ======================
function getSession() {
  return getItem(STORAGE_KEYS.SESSION);
}

function saveSession(userId) {
  setItem(STORAGE_KEYS.SESSION, { userId });
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  return findUserById(session.userId);
}

// ====================== 全局帖子管理 ======================
function getAllPosts() {
  return getItem(STORAGE_KEYS.ALL_POSTS) || [];
}

function saveAllPosts(posts) {
  setItem(STORAGE_KEYS.ALL_POSTS, posts);
}

function getPostById(postId) {
  return getAllPosts().find(p => p.id === postId) || null;
}

function createPost({ authorId, authorName, authorAvatar, content, image, imageBg, tags, game, type, images, videoUrl }) {
  const post = {
    id: uuid(),
    authorId,
    authorName,
    authorAvatar,
    content,
    image: image || null,
    imageBg: imageBg || null,
    images: images || [],
    videoUrl: videoUrl || null,
    tags: tags || [],
    game: game || '明日方舟',
    type: type || 'post',
    likes: 0,
    comments: 0,
    views: 0,
    favorites: 0,
    time: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
    createdAt: new Date().toISOString(),
  };
  const posts = getAllPosts();
  posts.unshift(post);
  saveAllPosts(posts);

  // 更新用户帖子计数
  const user = findUserById(authorId);
  if (user) {
    updateUser(authorId, { postCount: (user.postCount || 0) + 1 });
  }
  return post;
}

function deletePost(postId) {
  const posts = getAllPosts().filter(p => p.id !== postId);
  saveAllPosts(posts);
  // 同时删除相关评论
  const comments = getAllComments();
  delete comments[postId];
  setItem(STORAGE_KEYS.ALL_COMMENTS, comments);
}

function updatePost(postId, updates) {
  const posts = getAllPosts();
  const idx = posts.findIndex(p => p.id === postId);
  if (idx === -1) return null;
  posts[idx] = { ...posts[idx], ...updates };
  saveAllPosts(posts);
  return posts[idx];
}

function getUserPosts(userId) {
  return getAllPosts().filter(p => p.authorId === userId);
}

// ====================== 点赞管理 ======================
function getUserLikes(userId) {
  return getItem(`likes_${userId}`) || [];
}

function saveUserLikes(userId, likes) {
  setItem(`likes_${userId}`, likes);
}

function toggleLike(userId, postId, authorId) {
  const likes = getUserLikes(userId);
  const idx = likes.findIndex(l => l.postId === postId);
  let liked;
  if (idx >= 0) {
    likes.splice(idx, 1);
    liked = false;
  } else {
    likes.push({ postId, authorId });
    liked = true;
  }
  saveUserLikes(userId, likes);

  // 重新计算帖子的总点赞数
  recalcPostLikes(postId);
  return liked;
}

function isLikedByUser(userId, postId) {
  return getUserLikes(userId).some(l => l.postId === postId);
}

function recalcPostLikes(postId) {
  // 遍历所有用户的 likes 来计算某帖子的总点赞数
  const users = getUsers();
  let count = 0;
  users.forEach(u => {
    const likes = getUserLikes(u.id);
    if (likes.some(l => l.postId === postId)) count++;
  });

  const posts = getAllPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.likes = count;
    saveAllPosts(posts);
  }
}

// 获取帖子的点赞数量（从 all_posts 读取冗余字段）
function getPostLikeCount(postId) {
  const post = getPostById(postId);
  return post ? post.likes : 0;
}

// ====================== 评论管理 ======================
function getAllComments() {
  return getItem(STORAGE_KEYS.ALL_COMMENTS) || {};
}

function getPostComments(postId) {
  const all = getAllComments();
  return all[postId] || [];
}

function addComment({ postId, authorId, authorName, authorAvatar, content, parentId }) {
  const comment = {
    id: uuid(),
    authorId,
    authorName,
    authorAvatar,
    content,
    parentId: parentId || null,
    likes: 0,
    time: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
    createdAt: new Date().toISOString(),
  };
  const all = getAllComments();
  if (!all[postId]) all[postId] = [];
  all[postId].push(comment);
  setItem(STORAGE_KEYS.ALL_COMMENTS, all);

  // 更新帖子评论数
  const posts = getAllPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.comments = (post.comments || 0) + 1;
    saveAllPosts(posts);
  }
  return comment;
}

function saveAllComments(comments) {
  setItem(STORAGE_KEYS.ALL_COMMENTS, comments);
}

// ====================== 评论点赞 ======================
function getUserCommentLikes(userId) {
  return getItem(`comment_likes_${userId}`) || [];
}

function toggleCommentLike(userId, commentId, postId) {
  const likes = getUserCommentLikes(userId);
  const idx = likes.indexOf(commentId);
  let liked;
  if (idx >= 0) {
    likes.splice(idx, 1);
    liked = false;
  } else {
    likes.push(commentId);
    liked = true;
  }
  setItem(`comment_likes_${userId}`, likes);
  // 更新评论的赞数
  const all = getAllComments();
  const comments = all[postId] || [];
  const target = comments.find(c => c.id === commentId);
  if (target) {
    let count = 0;
    const users = getUsers();
    users.forEach(u => {
      const cl = getUserCommentLikes(u.id);
      if (cl.includes(commentId)) count++;
    });
    target.likes = count;
    setItem(STORAGE_KEYS.ALL_COMMENTS, all);
  }
  return liked;
}

function isCommentLikedByUser(userId, commentId) {
  return getUserCommentLikes(userId).includes(commentId);
}

// ====================== 关注管理 ======================
function toggleFollow(currentUserId, targetUserId) {
  const currentUser = findUserById(currentUserId);
  const targetUser = findUserById(targetUserId);
  if (!currentUser || !targetUser) return false;

  const followings = currentUser.followings || [];
  const idx = followings.indexOf(targetUserId);
  let following;
  if (idx >= 0) {
    followings.splice(idx, 1);
    following = false;
  } else {
    followings.push(targetUserId);
    following = true;
  }
  updateUser(currentUserId, { followings });

  // 更新目标用户的粉丝数
  const allUsers = getUsers();
  let followerCount = 0;
  allUsers.forEach(u => {
    if ((u.followings || []).includes(targetUserId)) followerCount++;
  });
  updateUser(targetUserId, { followerCount });

  return following;
}

function isFollowing(currentUserId, targetUserId) {
  const user = findUserById(currentUserId);
  if (!user) return false;
  return (user.followings || []).includes(targetUserId);
}

// ====================== 签到管理 ======================
function getUserCheckin(userId) {
  return getItem(`checkin_${userId}`) || { lastDate: null, streak: 0, history: [] };
}

function doCheckin(userId) {
  const user = findUserById(userId);
  if (!user) return { error: '用户不存在' };

  const today = new Date().toISOString().split('T')[0];
  const checkin = getUserCheckin(userId);

  if (checkin.lastDate === today) {
    return { error: '今日已签到' };
  }

  // 检查是否连续签到
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let streak = checkin.lastDate === yesterday ? checkin.streak + 1 : 1;

  checkin.lastDate = today;
  checkin.streak = streak;
  checkin.history.push({ date: today, streak });
  setItem(`checkin_${userId}`, checkin);

  // 更新用户对象
  const points = (user.points || 0) + (streak >= 7 ? 20 : 10);
  updateUser(userId, {
    checkinStreak: streak,
    lastCheckinDate: today,
    checkinHistory: checkin.history,
    points,
  });

  return { streak, points, reward: streak >= 7 ? 20 : 10 };
}

// ====================== 草稿管理 ======================
function getUserDrafts(userId) {
  return getItem(`drafts_${userId}`) || [];
}

function saveDraft(userId, draft) {
  const drafts = getUserDrafts(userId);
  draft.id = draft.id || uuid();
  draft.updatedAt = new Date().toISOString();
  const idx = drafts.findIndex(d => d.id === draft.id);
  if (idx >= 0) drafts[idx] = draft;
  else drafts.push(draft);
  setItem(`drafts_${userId}`, drafts);
  return draft;
}

function deleteDraft(userId, draftId) {
  const drafts = getUserDrafts(userId).filter(d => d.id !== draftId);
  setItem(`drafts_${userId}`, drafts);
}

// ====================== 定时发布管理 ======================
function getScheduledPosts() {
  return getItem('scheduled_posts') || [];
}

function saveScheduledPosts(items) {
  setItem('scheduled_posts', items);
}

function schedulePost(postData) {
  const items = getScheduledPosts();
  items.push({
    id: uuid(),
    ...postData,
  });
  saveScheduledPosts(items);
  return items[items.length - 1];
}

function processScheduledPosts() {
  const now = new Date().toISOString();
  const items = getScheduledPosts();
  const remaining = [];
  let published = 0;
  items.forEach(s => {
    if (s.scheduledAt <= now) {
      createPost({
        authorId: s.authorId,
        authorName: s.authorName,
        authorAvatar: s.authorAvatar,
        content: s.content,
        image: s.image,
        imageBg: s.imageBg,
        images: s.images || [],
        videoUrl: s.videoUrl || null,
        tags: s.tags,
        game: s.game,
        type: s.type,
      });
      published++;
    } else {
      remaining.push(s);
    }
  });
  if (published > 0) saveScheduledPosts(remaining);
}

// ====================== 收藏管理 ======================
function getUserFavorites(userId) {
  return getItem(`favorites_${userId}`) || { operators: [] };
}

function toggleFavorite(userId, type, itemId) {
  const favs = getUserFavorites(userId);
  if (!favs[type]) favs[type] = [];
  const idx = favs[type].indexOf(itemId);
  if (idx >= 0) favs[type].splice(idx, 1);
  else favs[type].push(itemId);
  setItem(`favorites_${userId}`, favs);
  return idx < 0;
}

function getUserFavoritePostIds(userId) {
  const favs = getUserFavorites(userId);
  return favs.posts || [];
}

function isPostFavoritedByUser(userId, postId) {
  return getUserFavoritePostIds(userId).includes(postId);
}

// ====================== 数据初始化 ======================
function initSeedData() {
  const users = getUsers();
  if (users.length > 0) return; // 已有数据，跳过

  // 创建管理员用户
  const adminId = uuid();
  const adminUser = {
    id: adminId,
    username: 'admin',
    password: 'admin123',
    nickname: '云留雨歇',
    avatar: defaultAvatar('admin'),
    bio: '森空岛社区管理员 · 泡姆泡姆资深玩家',
    createdAt: '2025-01-01T00:00:00Z',
    followings: [],
    postCount: 1,
    followerCount: 0,
    points: 100,
    checkinStreak: 5,
    lastCheckinDate: new Date().toISOString().split('T')[0],
    checkinHistory: [],
  };

  // 创建访客用户
  const guestId = uuid();
  const guestUser = {
    id: guestId,
    username: 'guest',
    password: '123456',
    nickname: '旅行者',
    avatar: defaultAvatar('guest'),
    bio: '明日方舟博士',
    createdAt: '2025-01-02T00:00:00Z',
    followings: [adminId],
    postCount: 2,
    followerCount: 0,
    points: 50,
    checkinStreak: 0,
    lastCheckinDate: null,
    checkinHistory: [],
  };

  saveUsers([adminUser, guestUser]);

  // 创建示例帖子
  const samplePosts = [
    {
      id: uuid(),
      authorId: adminId,
      authorName: '云留雨歇',
      authorAvatar: defaultAvatar('admin'),
      content: '这次的泡姆泡姆新版本真的太棒了！关卡设计精妙，新增的联机模式让游戏体验得到了全方位的提升。和朋友一起玩的体验非常流畅，画面也很精致。强烈推荐大家更新体验！',
      image: true,
      imageBg: 'linear-gradient(135deg, #2d3a4a, #1a2744, #0f1f3d)',
      tags: ['#泡姆泡姆'],
      game: '泡姆泡姆',
      likes: 0,
      comments: 0,
      time: '05-11',
      createdAt: '2025-05-11T00:00:00Z',
    },
    {
      id: uuid(),
      authorId: guestId,
      authorName: '旅行者',
      authorAvatar: defaultAvatar('guest'),
      content: 'SideStory「火山旅梦」的剧情真的让我泪目了。鹰角在叙事方面的功力越来越深厚，每个角色的故事都让人感同身受。配乐也是一如既往的高水准，SEVEN GODDESS的曲子百听不厌。',
      image: true,
      imageBg: 'linear-gradient(135deg, #3a2d3a, #441a3a, #3d0f2d)',
      tags: ['#明日方舟', '#火山旅梦'],
      game: '明日方舟',
      likes: 0,
      comments: 0,
      time: '05-10',
      createdAt: '2025-05-10T00:00:00Z',
    },
    {
      id: uuid(),
      authorId: guestId,
      authorName: '旅行者',
      authorAvatar: defaultAvatar('guest'),
      content: '终末地的世界观设定很有深度，废土与科技融合的美术风格独树一帜。这次的测试版本优化了很多内容，期待正式上线的那一天！官方最近放出的新PV里的细节也值得反复品味。',
      image: true,
      imageBg: 'linear-gradient(135deg, #2d3a3a, #1a4444, #0f3d3d)',
      tags: ['#终末地'],
      game: '终末地',
      likes: 0,
      comments: 0,
      time: '05-09',
      createdAt: '2025-05-09T00:00:00Z',
    },
  ];
  saveAllPosts(samplePosts);
  setItem(STORAGE_KEYS.ALL_COMMENTS, {});
}

//===== 成就相关存储 =====
//初始化/读取用户成就数据
export function getAchieveData() {
  const str = localStorage.getItem('userAchieve');
  const defaultData = {
    postCount: 0,    //发帖总数
    signDays: 0,     //累计签到天数
    unlockAch: []    //已解锁成就ID
  }
  return str ? JSON.parse(str) : defaultData;
}

//保存数据到本地
export function setAchieveData(obj) {
  localStorage.setItem('userAchieve', JSON.stringify(obj));
}

//发帖+1，自动校验成就
export function addPostCount() {
  let data = getAchieveData();
  data.postCount += 1;
  checkUnlock(data);
  setAchieveData(data);
}

//签到+1，自动校验成就
export function addSignDay() {
  let data = getAchieveData();
  data.signDays += 1;
  checkUnlock(data);
  setAchieveData(data);
}

//成就解锁规则
function checkUnlock(data) {
  const { postCount, signDays, unlockAch } = data;
  //成就配置
  const ruleList = [
    { id:'post5', type:'post', num:5, name:'萌新博主' },
    { id:'post20', type:'post', num:20, name:'人气创作者' },
    { id:'sign7', type:'sign', num:7, name:'周常旅人' },
    { id:'sign30', type:'sign', num:30, name:'月度常驻' },
  ]
  ruleList.forEach(item=>{
    const currNum = item.type==='post' ? postCount : signDays;
    if(currNum >= item.num && !unlockAch.includes(item.id)){
      unlockAch.push(item.id);
      setTimeout(()=>alert(`✅解锁成就：${item.name}`),100)
    }
  })
}

// 初始化 - 在模块加载时执行
initSeedData();

export {
  uuid,
  defaultAvatar,
  // 用户
  getUsers,
  findUserByUsername,
  findUserById,
  createUser,
  updateUser,
  // 会话
  getSession,
  saveSession,
  clearSession,
  getCurrentUser,
  // 帖子
  getAllPosts,
  getPostById,
  createPost,
  deletePost,
  updatePost,
  getUserPosts,
  // 点赞
  getUserLikes,
  toggleLike,
  isLikedByUser,
  getPostLikeCount,
  recalcPostLikes,
  // 评论
  getAllComments,
  getPostComments,
  addComment,
  // 评论点赞
  toggleCommentLike,
  isCommentLikedByUser,
  // 关注
  toggleFollow,
  isFollowing,
  // 签到
  getUserCheckin,
  doCheckin,
  // 草稿
  getUserDrafts,
  saveDraft,
  deleteDraft,
  // 定时发布
  getScheduledPosts,
  schedulePost,
  processScheduledPosts,
  // 收藏
  getUserFavorites,
  toggleFavorite,
  getUserFavoritePostIds,
  isPostFavoritedByUser,
  // 初始化
  initSeedData,
};
