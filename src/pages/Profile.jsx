import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { findUserById, updateUser, getUserPosts, getUsers } from '../utils/storage';
import PostItem from '../components/PostItem';

export default function Profile() {
  const { userId } = useParams();
  const { currentUser, isLoggedIn, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isOwnProfile = !userId || userId === currentUser?.id;
  const targetUserId = isOwnProfile ? currentUser?.id : userId;
  const user = isOwnProfile ? currentUser : findUserById(targetUserId);

  const [editing, setEditing] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editBio, setEditBio] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'posts');
  const [userPosts, setUserPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!user) return;
    setUserPosts(getUserPosts(user.id));

    const allUsers = getUsers();
    const followerList = allUsers.filter(u => (u.followings || []).includes(user.id));
    const followingList = (user.followings || []).map(id => findUserById(id)).filter(Boolean);
    setFollowers(followerList);
    setFollowings(followingList);
  }, [user, refreshKey]);

  if (!isLoggedIn) return null;
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F0E6] dark:bg-[#1a1a1a] flex items-center justify-center pt-[80px]">
        <div className="text-center">
          <p className="text-gray-900 dark:text-white text-lg mb-4">用户不存在</p>
          <button onClick={() => navigate('/')} className="text-[#4CAF50] hover:underline">返回首页</button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    if (!editNickname.trim()) {
      setMessage('昵称不能为空');
      return;
    }
    updateUser(user.id, {
      nickname: editNickname.trim(),
      bio: editBio.trim(),
    });
    refreshUser();
    setEditing(false);
    setMessage('保存成功');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleAvatarChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 200;
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width *= ratio;
            height *= ratio;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          let quality = 0.7;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          while (dataUrl.length > 200 * 1024 && quality > 0.1) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          updateUser(user.id, { avatar: dataUrl });
          refreshUser();
          setRefreshKey(k => k + 1);
          setMessage('头像已更新');
          setTimeout(() => setMessage(''), 2000);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handlePostUpdate = () => {
    setRefreshKey(k => k + 1);
    setUserPosts(getUserPosts(user.id));
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] dark:bg-[#1a1a1a] pt-[91px] px-4 pb-8">
      <div className="max-w-[800px] mx-auto">
        {/* Profile header */}
        <div className="bg-white dark:bg-[#252525] border border-[#E5E0D5] dark:border-[#374151] rounded-xl p-6 mb-6">
          {message && (
            <div className="bg-[#E8F5E9] dark:bg-[#1a3320] border border-[#C8E6C9] dark:border-[#2d5a30] text-[#4CAF50] text-sm rounded-lg px-4 py-2 mb-4">
              {message}
            </div>
          )}

          <div className="flex items-start gap-5">
            <div className="relative group">
              <img
                src={user.avatar}
                alt={user.nickname}
                className="w-20 h-20 rounded-full"
              />
              {isOwnProfile && (
                <button
                  onClick={handleAvatarChange}
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="text-white text-xs">更换</span>
                </button>
              )}
            </div>

            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    className="bg-gray-100 dark:bg-[#333] text-gray-800 dark:text-white text-sm px-3 py-1.5 rounded-lg outline-none border border-[#4CAF50] w-48"
                    placeholder="昵称"
                  />
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="bg-gray-100 dark:bg-[#333] text-gray-800 dark:text-white text-sm px-3 py-1.5 rounded-lg outline-none border border-[#4CAF50] w-full resize-none"
                    rows={2}
                    placeholder="个人简介"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveProfile} className="px-4 py-1.5 text-xs text-white bg-[#4CAF50] rounded-lg hover:bg-[#388E3C] transition-colors">
                      保存
                    </button>
                    <button onClick={() => setEditing(false)} className="px-4 py-1.5 text-xs text-[#999] bg-gray-100 dark:bg-[#333] rounded-lg hover:bg-gray-200 dark:hover:bg-[#444] transition-colors">
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-gray-900 dark:text-white font-bold text-xl">{user.nickname}</h1>
                    {isOwnProfile && (
                      <button
                        onClick={() => { setEditNickname(user.nickname); setEditBio(user.bio); setEditing(true); }}
                        className="text-xs text-[#4CAF50] border border-[#4CAF50] px-2 py-0.5 rounded hover:bg-[#4CAF50] hover:text-white transition-colors"
                      >
                        编辑资料
                      </button>
                    )}
                  </div>
                  <p className="text-[#666] text-sm mb-3">@{user.username}</p>
                  <p className="text-gray-500 dark:text-[#AAA] text-sm">{user.bio || '这个人很懒，什么都没写...'}</p>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-5 pt-4 border-t border-[#E5E0D5] dark:border-[#374151]">
            <div className="text-center">
              <div className="text-gray-900 dark:text-white font-bold text-lg">{user.postCount || 0}</div>
              <div className="text-[#666] text-xs">帖子</div>
            </div>
            <div className="text-center">
              <div className="text-gray-900 dark:text-white font-bold text-lg">{user.followerCount || 0}</div>
              <div className="text-[#666] text-xs">粉丝</div>
            </div>
            <div className="text-center">
              <div className="text-gray-900 dark:text-white font-bold text-lg">{(user.followings || []).length}</div>
              <div className="text-[#666] text-xs">关注</div>
            </div>
            <div className="text-center">
              <div className="text-gray-900 dark:text-white font-bold text-lg">{user.points || 0}</div>
              <div className="text-[#666] text-xs">积分</div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 mb-6 border-b border-[#E5E0D5] dark:border-[#374151]">
          {[
            { key: 'posts', label: '发布的帖子' },
            { key: 'followings', label: '关注列表' },
            { key: 'followers', label: '粉丝列表' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === key
                  ? 'text-[#4CAF50] border-[#4CAF50]'
                  : 'text-[#999] border-transparent hover:text-gray-700 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'posts' && (
          <div>
            {userPosts.length === 0 ? (
              <div className="text-center py-12 text-[#666]">
                <p>暂无帖子</p>
              </div>
            ) : (
              userPosts.map(post => (
                <PostItem key={post.id} post={post} onUpdate={handlePostUpdate} />
              ))
            )}
          </div>
        )}

        {activeTab === 'followings' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {followings.length === 0 ? (
              <div className="text-center py-12 text-[#666] col-span-2">暂无关注</div>
            ) : (
              followings.map(u => (
                <div key={u.id} className="bg-white dark:bg-[#252525] border border-[#E5E0D5] dark:border-[#374151] rounded-xl p-4 flex items-center gap-3">
                  <img src={u.avatar} alt={u.nickname} className="w-10 h-10 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-gray-900 dark:text-white font-medium text-sm cursor-pointer hover:text-[#4CAF50]"
                      onClick={() => navigate(`/profile/${u.id}`)}
                    >
                      {u.nickname}
                    </div>
                    <div className="text-[#666] text-xs">@{u.username}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {followers.length === 0 ? (
              <div className="text-center py-12 text-[#666] col-span-2">暂无粉丝</div>
            ) : (
              followers.map(u => (
                <div key={u.id} className="bg-white dark:bg-[#252525] border border-[#E5E0D5] dark:border-[#374151] rounded-xl p-4 flex items-center gap-3">
                  <img src={u.avatar} alt={u.nickname} className="w-10 h-10 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-gray-900 dark:text-white font-medium text-sm cursor-pointer hover:text-[#4CAF50]"
                      onClick={() => navigate(`/profile/${u.id}`)}
                    >
                      {u.nickname}
                    </div>
                    <div className="text-[#666] text-xs">@{u.username}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
