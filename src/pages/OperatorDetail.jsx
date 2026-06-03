import { useParams, Link } from "react-router-dom";

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

export default function OperatorDetail() {
  const { id } = useParams()
  const curr = allAgent.find(item=>item.id === Number(id))

  if(!curr){
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-green-200/85 p-8 rounded-xl text-center">
          <p className="text-green-800 text-xl">找不到该角色</p>
          <Link to="/operatorBook" className="inline-block mt-4 px-4 py-2 bg-green-500 text-white rounded">返回图鉴</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50 py-10 px-4">
      <div className="w-[90%] max-w-[700px] mx-auto">
        <Link to="/operatorBook" className="text-green-700 mb-6 inline-block text-lg">← 返回角色图鉴</Link>
        <div className="bg-green-200/85 rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <img 
              src={curr.img} 
              alt={curr.name} 
              className="w-48 h-48 object-cover rounded-lg bg-green-50"
              onError={(e)=>e.target.style.display='none'}
            />
            <div className="text-green-800">
              <h2 className="text-3xl font-bold mb-3">{curr.name}</h2>
              <p className="mb-2"><span className="font-bold">所属作品：</span>{curr.game}</p>
              <p className="mb-2"><span className="font-bold">职业：</span>{curr.job}</p>
              <p className="mb-2"><span className="font-bold">星级：</span>{curr.star} ★</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}