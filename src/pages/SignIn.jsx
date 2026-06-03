import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function SignIn() {
  const [signDays, setSignDays] = useState(0);
  const [hasSignedToday, setHasSignedToday] = useState(false);

  const today = new Date().toLocaleDateString();

  // 初始化：读取成就系统 + 今日是否签到
  useEffect(() => {
    const data = getAchieveData();
    setSignDays(data.signDays || 0);

    const last = localStorage.getItem('lastSignDate');
    setHasSignedToday(last === today);
  }, []);

  const rewards = [
    { day: 1, gift: '100金币' },
    { day: 2, gift: '200金币' },
    { day: 3, gift: '50钻石' },
    { day: 4, gift: '300金币' },
    { day: 5, gift: '100钻石' },
    { day: 6, gift: '500金币' },
    { day: 7, gift: '神秘大礼包' }
  ];

  // 签到（同步成就）
  const doSign = () => {
    if (hasSignedToday) {
      alert('今天已经签到过了！');
      return;
    }

    // ✅ 成就系统签到 +1
    addSignDay();

    // 记录签到日期
    localStorage.setItem('lastSignDate', today);
    setHasSignedToday(true);

    // 刷新天数
    const newData = getAchieveData();
    setSignDays(newData.signDays);

    alert(`签到成功！累计签到 ${newData.signDays} 天`);
  };

  return (
    <div className="min-h-screen bg-green-50 relative">
      <div className="fixed inset-0 bg-green-50/80 z-[-1]" />
      <div className="w-[90%] max-w-[900px] mx-auto py-10 relative z-10">
        <Link to="/" className="text-green-700 mb-4 inline-block">
          ← 返回首页
        </Link>
        <h1 className="text-3xl font-bold text-center mb-8 text-green-800">
          🎁 签到福利
        </h1>

        <div className="bg-green-200/85 rounded-xl p-6 shadow mb-6 text-center">
          <div className="text-xl text-green-800 mb-4">
            已连续签到 <span className="font-bold text-green-600">{signDays}</span> 天
          </div>
          <button
            onClick={doSign}
            disabled={hasSignedToday}
            className={`px-6 py-3 rounded-lg font-bold text-white ${
              hasSignedToday
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {hasSignedToday ? '今日已签到' : '立即签到'}
          </button>
        </div>

        <div className="bg-green-200/85 rounded-xl p-6 shadow">
          <h3 className="text-xl font-bold mb-4 text-green-800">7天签到奖励</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rewards.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg text-center ${
                  signDays >= item.day
                    ? 'bg-green-400 text-white'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                <div className="font-bold">第{item.day}天</div>
                <div>{item.gift}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}