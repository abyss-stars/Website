// src/pages/calendar.jsx
import { useState } from 'react'

// 活动数据源：明日方舟/鸣潮/终末地 近期活动
const eventList = [
  {
    game: "明日方舟",
    color: "border-l-red-500 bg-red-50 dark:bg-red-950/30",
    tagBg: "bg-red-500",
    title: "泡影苍霆 怪物猎人联动",
    time: "2026-06-01 ~ 2026-06-22",
    desc: "SideStory联动限时关卡，通关获取限定干员、猎人主题家具与养成素材"
  },
  {
    game: "明日方舟",
    color: "border-l-red-500 bg-red-50 dark:bg-red-950/30",
    tagBg: "bg-red-500",
    title: "狩猎时光限时签到",
    time: "2026-06-01 ~ 2026-06-15",
    desc: "累计签到领取寻访券、龙门币、高级养成素材"
  },
  {
    game: "鸣潮",
    color: "border-l-sky-500 bg-sky-50 dark:bg-sky-950/30",
    tagBg: "bg-sky-500",
    title: "周年庆盛会赠礼签到",
    time: "2026-04-30 ~ 2026-06-07",
    desc: "周年限时签到，免费领取星声、限定时装、四星自选角色"
  },
  {
    game: "鸣潮",
    color: "border-l-sky-500 bg-sky-50 dark:bg-sky-950/30",
    tagBg: "bg-sky-500",
    title: "黯原寻迹剧情活动",
    time: "2026-04-30 ~ 2026-06-07",
    desc: "限时主线活动，解锁角色支线，兑换武器锻造材料"
  },
  {
    game: "终末地",
    color: "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
    tagBg: "bg-emerald-500",
    title: "寻奇探幽限时签到",
    time: "2026-05-29 ~ 版本更新前",
    desc: "签到3日领取寻访凭证、嵌晶玉、基建耗材"
  },
  {
    game: "终末地",
    color: "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
    tagBg: "bg-emerald-500",
    title: "方舟联动共贺庆典",
    time: "2026-05-01 ~ 2026-06-05",
    desc: "双端互通活动，领取联动头像框、限定名片"
  }
]

export default function Calendar() {
  return (
    <div className="max-w-5xl mx-auto p-5">
      <h2 className="text-[#4CAF50] font-bold text-2xl mb-6">📅 游戏活动日历</h2>
      {/* 3列网格布局，和原图样式对齐 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventList.map((item, idx) => (
          <div 
            key={idx}
            className={`${item.color} border-l-4 rounded-lg p-4 shadow`}
          >
            <span className={`${item.tagBg} text-white px-2 py-0.5 rounded text-xs`}>
              {item.game}
            </span>
            <h3 className="font-bold mt-2 text-lg">{item.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{item.time}</p>
            <p className="text-sm mt-2 dark:text-gray-200">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}