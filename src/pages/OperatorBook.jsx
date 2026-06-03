import { Link } from "react-router-dom"

const allAgent = [
  { id:1,name:"优诺",job:"臂铠",game:"鸣潮",star:5,img:new URL('../img/1.png',import.meta.url).href },
  { id:2,name:"千咲",job:"大剑",game:"鸣潮",star:6,img:new URL('../img/2.png',import.meta.url).href },
  { id:3,name:"绯雪",job:"讯刀",game:"鸣潮",star:5,img:new URL('../img/3.png',import.meta.url).href },
  { id:4,name:"卡提希娅",job:"讯刀",game:"终末地",star:6,img:new URL('../img/4.png',import.meta.url).href },
  { id:5,name:"莱万汀",job:"术士",game:"终末地",star:5,img:new URL('../img/5.png',import.meta.url).href },
  { id:6,name:"阿尔黛拉",job:"术士",game:"终末地",star:4,img:new URL('../img/6.png',import.meta.url).href },
  { id:7,name:"洛西",job:"先锋",game:"明日方舟",star:5,img:new URL('../img/7.png',import.meta.url).href },
  { id:8,name:"阿米娅",job:"先锋",game:"明日方舟",star:5,img:new URL('../img/头像_赤刃明霄陈.png',import.meta.url).href },
  { id:9,name:"能天使",job:"狙击",game:"明日方舟",star:6,img:new URL('../img/头像_圣聆初雪.png',import.meta.url).href },
]

export default function OperatorBook(){
  return(
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="w-[90%] max-w-[900px] mx-auto">
        <h2 className="text-center text-3xl text-green-800 font-bold mb-8">角色图鉴</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {allAgent.map(agent=>(
            <Link 
              to={`/detail/${agent.id}`} 
              key={agent.id} 
              className="bg-green-100 p-3 rounded-lg text-center block hover:bg-green-200 transition"
            >
              <img 
                src={agent.img} 
                alt={agent.name} 
                className="w-28 h-28 object-cover rounded mx-auto mb-2 bg-green-50"
                onError={(e)=>e.target.style.display="none"}
              />
              <div className="font-bold text-green-800 text-lg">{agent.name}</div>
              <div className="text-sm text-green-700">作品：{agent.game}</div>
              <div className="text-sm text-green-700">职业：{agent.job}</div>
              <div className="text-sm text-green-600">星级：{agent.star}★</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}