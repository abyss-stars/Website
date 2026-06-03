import React, { useState, useEffect } from 'react';

// 平台跳转配置
const platforms = [
  {
    name: '淘宝',
    color: 'bg-orange-500',
    desc: '官方&同人周边'
  },
  {
    name: '天猫',
    color: 'bg-red-500',
    desc: '官方旗舰店'
  },
  {
    name: '京东',
    color: 'bg-blue-600',
    desc: '自营正品'
  }
];

// 三大游戏商品，一一绑定本地图片
const gameData = [
  {
    key: 'arknights',
    title: '明日方舟',
    color: 'from-blue-600 to-cyan-400',
    links: {
      taobao: 'https://s.taobao.com/search?q=明日方舟 官方周边',
      tmall: 'https://mingrifangzhou.tmall.com',
      jd: 'https://search.jd.com/Search?keyword=明日方舟 周边'
    },
    products: [
      {
        id: 1,
        title: '阿米娅 亚克力立牌',
        price: 50,
        img: new URL('../img/阿米娅.png', import.meta.url).href,
        tip: '官方正版'
      },
      {
        id: 2,
        title: '干员徽章套装',
        price: 35,
        img: new URL('../img/干员徽章.png', import.meta.url).href,
        tip: '多角色可选'
      },
      {
        id: 3,
        title: '罗德岛主题雨伞',
        price: 39,
        img: new URL('../img/雨伞.png', import.meta.url).href,
        tip: '晴雨两用'
      }
    ]
  },
  {
    key: 'wuthering',
    title: '鸣潮',
    color: 'from-teal-600 to-green-400',
    links: {
      taobao: 'https://s.taobao.com/search?q=鸣潮 官方周边',
      tmall: 'https://shop.m.taobao.com/shop/sr.htm?p=CZlbhQR_EeBKS_8_votl5',
      jd: 'https://search.jd.com/Search?keyword=鸣潮 周边'
    },
    products: [
      {
        id: 4,
        title: '漂泊者 亚克力立牌',
        price: 49,
        img: new URL('../img/漂泊者.png', import.meta.url).href,
        tip: '官方正版'
      },
      {
        id: 5,
        title: '爱弥斯 键帽套装',
        price: 155,
        img: new URL('../img/爱弥斯键帽套装.png', import.meta.url).href,
        tip: 'PBT热升华'
      },
      {
        id: 6,
        title: '洛西 毛绒挂件',
        price: 68,
        img: new URL('../img/洛西挂件.png', import.meta.url).href,
        tip: '官方联名'
      }
    ]
  },
  {
    key: 'endfield',
    title: '终末地',
    color: 'from-slate-700 to-gray-500',
    links: {
      taobao: 'https://s.taobao.com/search?q=明日方舟终末地 周边',
      tmall: 'https://store.gryphline.com',
      jd: 'https://search.jd.com/Search?keyword=终末地 周边'
    },
    products: [
      {
        id: 7,
        title: '佩里卡 手办',
        price: 199,
        img: new URL('../img/佩里卡手办.png', import.meta.url).href,
        tip: '3D收藏模型'
      },
      {
        id: 8,
        title: '终末地帆布包',
        price: 89,
        img: new URL('../img/终末地帆布包.png', import.meta.url).href,
        tip: '武陵城印花'
      },
      {
        id: 9,
        title: '组合周边礼盒',
        price: 129,
        img: new URL('../img/download.png', import.meta.url).href,
        tip: '全套周边礼盒'
      }
    ]
  }
];

export default function Shop() {
  const [activeGame, setActiveGame] = useState(gameData[0]);

  useEffect(() => {
    setActiveGame(gameData[0]);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-5 dark:text-white">
      <a href="/" className="text-blue-500 mb-4 inline-block">
        ← 返回首页
      </a>

      <h1 className="text-3xl font-bold mb-2">周边商城</h1>
      <p className="text-gray-500 dark:text-gray-300 mb-6">
        跨平台选购：淘宝 / 天猫 / 京东 · 明日方舟 | 鸣潮 | 终末地
      </p>

      {/* 游戏分类切换按钮 */}
      <div className="flex gap-3 mb-8">
        {gameData.map((game) => (
          <button
            key={game.key}
            onClick={() => setActiveGame(game)}
            className={`px-5 py-2 rounded-full text-white font-bold bg-gradient-to-r ${game.color} ${
              activeGame.key === game.key ? 'ring-2 ring-white' : 'opacity-80'
            }`}
          >
            {game.title}
          </button>
        ))}
      </div>

      {/* 三大电商平台入口 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {platforms.map((p) => (
          <a
            key={p.name}
            href={activeGame.links[p.name === '淘宝' ? 'taobao' : p.name === '天猫' ? 'tmall' : 'jd']}
            target="_blank"
            rel="noopener noreferrer"
            className={`${p.color} p-4 rounded-lg text-white shadow hover:opacity-90 transition`}
          >
            <div className="text-xl font-bold">{p.name}</div>
            <div className="text-sm opacity-80">{activeGame.title} · {p.desc}</div>
          </a>
        ))}
      </div>

      {/* 商品卡片列表 */}
      <h2 className="text-xl font-bold mb-4">{activeGame.title} 热门周边</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {activeGame.products.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg overflow-hidden shadow hover:shadow-md transition bg-white dark:bg-gray-800"
          >
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-48 object-cover"
              onError={(e)=>e.target.src='https://via.placeholder.com/300'}
            />
            <div className="p-4">
              <h3 className="font-bold">{item.title}</h3>
              <div className="text-red-500 font-bold mt-1">¥{item.price}</div>
              <div className="text-xs text-gray-500 mt-2">{item.tip}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}