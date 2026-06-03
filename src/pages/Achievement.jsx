import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// 成就配置
const achieveConfig = [
  { id:1, type:'login',  target:7,  name:'周常旅人',   point:20, desc:'累计登录7天' },
  { id:2, type:'login',  target:30, name:'月度常驻',   point:60, desc:'累计登录30天' },
  { id:3, type:'post',   target:5,  name:'萌新博主',   point:15, desc:'发布5条帖子' },
  { id:4, type:'post',   target:20, name:'人气创作者', point:50, desc:'发布20条帖子' },
  { id:5, type:'post',   target:50, name:'论坛活宝',   point:45, desc:'发表50条评论/帖子' },
];

export default function Achievement() {
  const [userData, setUserData] = useState({
    loginDays: 0,
    postCount: 0,
    totalAchPoint: 0,
    unlockIdArr: []
  });

  // 一进来就读取全局的签到/发帖数据
  useEffect(() => {
    const signData = localStorage.getItem('signData');
    const postData = localStorage.getItem('postData');
    
    let loginDays = 0;
    let postCount = 0;

    if (signData) loginDays = JSON.parse(signData).totalDays || 0;
    if (postData) postCount = JSON.parse(postData).count || 0;

    const newData = {
      ...userData,
      loginDays,
      postCount
    };
    
    const finalData = checkAchieve(newData);
    setUserData(finalData);
    localStorage.setItem('achieveUserData', JSON.stringify(finalData));
  }, []);

  // 成就自动检测逻辑
  function checkAchieve(ud) {
    let newPoint = ud.totalAchPoint;
    let newUnlock = [...ud.unlockIdArr];

    achieveConfig.forEach(ach => {
      if (newUnlock.includes(ach.id)) return;

      let ok = false;
      if (ach.type === 'login' && ud.loginDays >= ach.target) ok = true;
      if (ach.type === 'post' && ud.postCount >= ach.target) ok = true;

      if (ok) {
        newUnlock.push(ach.id);
        newPoint += ach.point;
        alert('✅ 成就解锁：' + ach.name);
      }
    });

    return { ...ud, totalAchPoint: newPoint, unlockIdArr: newUnlock };
  }

  // 手动刷新（同步签到发帖最新数据）
  const refreshFromGlobal = () => {
    const signData = localStorage.getItem('signData');
    const postData = localStorage.getItem('postData');

    let loginDays = 0;
    let postCount = 0;
    if (signData) loginDays = JSON.parse(signData).totalDays || 0;
    if (postData) postCount = JSON.parse(postData).count || 0;

    const newData = { ...userData, loginDays, postCount };
    const finalData = checkAchieve(newData);
    setUserData(finalData);
    localStorage.setItem('achieveUserData', JSON.stringify(finalData));
  };

  return (
    <div className="min-h-screen bg-green-50 relative">
      <div className="fixed inset-0 bg-green-50/85 z-[-1]" />
      <div className="w-[90%] max-w-[900px] mx-auto py-10 relative z-10">
        
        <Link to="/" className="text-green-700 mb-4 inline-block">← 返回首页</Link>
        <h1 className="text-3xl font-bold text-center mb-6 text-green-800">🏆 成就系统</h1>

        <div className="bg-green-200/85 rounded-xl p-5 shadow mb-6 grid grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-green-700">累计登录</div>
            <div className="text-xl font-bold text-green-600">{userData.loginDays}天</div>
          </div>
          <div>
            <div className="text-green-700">发帖数量</div>
            <div className="text-xl font-bold text-green-600">{userData.postCount}条</div>
          </div>
          <div>
            <div className="text-green-700">总成就点</div>
            <div className="text-xl font-bold text-green-600">{userData.totalAchPoint}</div>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <button onClick={refreshFromGlobal} className="px-4 py-2 bg-green-500 text-white rounded">
            🔄 同步签到/发帖数据
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-200/85 rounded-xl p-5 shadow">
            <h3 className="text-xl font-bold mb-3 text-green-800">📜 成就列表</h3>
            {achieveConfig.map(item => {
              const unlock = userData.unlockIdArr.includes(item.id);
              return (
                <div key={item.id} className={`p-3 mb-2 rounded ${unlock ? 'bg-green-400 text-white' : 'bg-green-100 text-green-800'}`}>
                  <div className="flex justify-between font-bold">
                    <span>{item.name}</span>
                    <span>+{item.point}点</span>
                  </div>
                  <div className="text-sm">{item.desc}</div>
                  <div className="text-xs mt-1">{unlock ? '✅ 已解锁' : '🔒 未达成'}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}