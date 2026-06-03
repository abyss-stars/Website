import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function TeamFriend() {
  const bgArr = [
    new URL('../img/背景1.png', import.meta.url).href,
    new URL('../img/背景2.png', import.meta.url).href,
    new URL('../img/背景3.png', import.meta.url).href
  ]
  const [curBg, setCurBg] = useState(0)

  // 自动轮换背景
  useEffect(() => {
    const timer = setInterval(() => {
      setCurBg(p => (p + 1) % bgArr.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const [friendList, setFriendList] = useState([])
  const [inputName, setInputName] = useState('')
  const [teamInfo, setTeamInfo] = useState({
    isCreate: false,
    teamName: '',
    captain: '我自己',
    member: []
  })

  useEffect(() => {
    const saveFriend = localStorage.getItem('friendData')
    const saveTeam = localStorage.getItem('teamData')
    if (saveFriend) setFriendList(JSON.parse(saveFriend))
    if (saveTeam) setTeamInfo(JSON.parse(saveTeam))
  }, [])

  const saveData = (friends, team) => {
    localStorage.setItem('friendData', JSON.stringify(friends))
    localStorage.setItem('teamData', JSON.stringify(team))
  }

  const addFriend = () => {
    const name = inputName.trim()
    if (!name) return alert('请输入好友昵称')
    if (friendList.find(item => item.name === name)) return alert('该好友已存在')
    const newArr = [...friendList, { name }]
    setFriendList(newArr)
    setInputName('')
    saveData(newArr, teamInfo)
  }

  const delFriend = (name) => {
    const newArr = friendList.filter(item => item.name !== name)
    let newTeam = { ...teamInfo }
    newTeam.member = newTeam.member.filter(n => n !== name)
    setFriendList(newArr)
    setTeamInfo(newTeam)
    saveData(newArr, newTeam)
  }

  const createTeam = () => {
    if (teamInfo.isCreate) return alert('已有队伍，不能重复创建')
    const newTeam = {
      isCreate: true,
      teamName: '临时小队',
      captain: '我自己',
      member: []
    }
    setTeamInfo(newTeam)
    saveData(friendList, newTeam)
  }

  const inviteInTeam = (name) => {
    if (!teamInfo.isCreate) return alert('请先创建队伍')
    if (teamInfo.member.includes(name)) return alert('该好友已在队伍')
    const newTeam = { ...teamInfo, member: [...teamInfo.member, name] }
    setTeamInfo(newTeam)
    saveData(friendList, newTeam)
  }

  const exitTeam = () => {
    const emptyTeam = {
      isCreate: false,
      teamName: '',
      captain: '我自己',
      member: []
    }
    setTeamInfo(emptyTeam)
    saveData(friendList, emptyTeam)
  }

  return (
    <div className="min-h-screen relative bg-green-50">
      {/* 轮播背景 */}
      <div
        className="fixed inset-0 transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${bgArr[curBg]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -2
        }}
      />
      {/* 浅绿色半透明遮罩 */}
      <div className="fixed inset-0 bg-green-50/85 z-[-1]" />

      {/* 内容容器：固定宽度+水平居中 */}
      <div className="w-[90%] max-w-[900px] mx-auto py-10 relative z-10">
        <Link to="/" className="text-green-700 mb-4 inline-block">← 返回首页</Link>
        <h1 className="text-3xl font-bold text-center mb-8 text-green-800">👥 好友&组队系统</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 左侧 */}
          <div className="bg-green-200/85 rounded-xl p-5 shadow">
            <h3 className="text-xl font-bold mb-4 text-green-800">添加好友</h3>
            <div className="flex gap-2 mb-6">
              <input
                value={inputName}
                onChange={e => setInputName(e.target.value)}
                placeholder="输入好友昵称"
                className="flex-1 px-3 py-2 rounded bg-green-50 border border-green-300 text-green-800 outline-none"
              />
              <button onClick={addFriend} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">添加</button>
            </div>
            <h3 className="text-xl font-bold mb-3 text-green-800">好友列表</h3>
            {friendList.length === 0
              ? <p className="text-green-700">暂无好友，快去添加吧</p>
              : friendList.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b border-green-300">
                  <span className="text-green-800">{item.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => inviteInTeam(item.name)} className="px-2 py-1 bg-green-400 rounded text-white text-sm">邀请入队</button>
                    <button onClick={() => delFriend(item.name)} className="px-2 py-1 bg-red-400 rounded text-white text-sm">删除</button>
                  </div>
                </div>
              ))
            }
          </div>

          {/* 右侧 */}
          <div className="bg-green-200/85 rounded-xl p-5 shadow">
            <h3 className="text-xl font-bold mb-4 text-green-800">队伍信息</h3>
            {!teamInfo.isCreate
              ? <button onClick={createTeam} className="px-5 py-3 bg-green-500 text-white rounded font-bold hover:bg-green-600">创建新队伍</button>
              : <>
                <p className="text-green-800 mb-2">队伍名称：{teamInfo.teamName}</p>
                <p className="text-green-800 mb-2">队长：{teamInfo.captain}</p>
                <p className="text-green-800 mb-4">队内成员：{teamInfo.member.length ? teamInfo.member.join('、') : '暂无队员'}</p>
                <button onClick={exitTeam} className="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500">解散退出队伍</button>
              </>
            }
          </div>
        </div>
      </div>
    </div>
  )
}