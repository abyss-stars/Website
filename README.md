# 森空岛 (Skadi Community)

基于 React 18 构建的社区网站，支持图文/图集/视频发布、互动（点赞/评论/关注）、签到、暗色模式等功能，数据使用 localStorage 持久化。

## 技术栈

| 技术 | 版本 |
|------|------|
| React | 18.x |
| Vite | 5.x |
| Tailwind CSS | 3.x |
| React Router DOM | 6.x |
| 数据存储 | localStorage（无后端） |

## 快速启动

```bash
cd website/3
npm install
npm run dev      # 开发模式
npm run build    # 生产构建 → dist/
npm run preview  # 预览构建结果
```

### 演示账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员（示例帖子作者） |
| guest | 123456 | 普通用户 |

## 功能概览

### 用户系统
- 注册 / 登录 / 退出，多用户数据隔离（按 `userId` 命名空间）
- 个人中心：头像上传（Canvas 压缩）、昵称/简介编辑
- 统计数据：帖子数、粉丝数、关注数、积分
- 关注 / 取关其他用户，关注 Tab 过滤帖子流

### 发布功能
- **发图文** (`/publish`)：contentEditable 富文本编辑器，支持 undo/redo、加粗/斜体/下划线/删除线/文字颜色/标题、超链接、图片/视频插入
- **发图集** (`/gallery`)：多图上传（最多 30 张，自动压缩至 150KB 以下），@提及用户并发送通知，草稿保存
- **发视频** (`/video`)：视频上传（最大 2GB），支持拖拽上传，格式 MP4/AVI/MOV/WMV，最高 4K
- **发布管理** (`/publish-manager`)：左右分栏后台面板，分别管理图文/图集/视频的已发布内容与草稿，支持编辑、删除

### 内容浏览
- 首页三栏布局：左侧导航 + 中间帖子流 + 右侧工具栏
- 帖子列表无限滚动加载（IntersectionObserver，每批 5 条）
- 推荐 / 关注双 Tab 切换
- 搜索页 (`/search`)：全站搜索（匹配内容/标签/作者/游戏）、分类过滤、排序、搜索历史、热搜榜

### 主题与布局
- 暗色 / 亮色模式，默认跟随系统 `prefers-color-scheme`，支持手动切换并持久化
- 响应式布局：移动端底部导航 + 功能抽屉
- 部分页面（搜索/发布/图集/视频）NavBar 精简模式（隐藏搜索栏和通知铃铛）

### 其他
- 签到系统（连续签到 7 天奖励 20 积分，否则 10 积分）
- 通知系统（@提及通知存入 `notifications_${userId}`，NavBar 铃铛显示未读角标）
- 草稿箱：图文和图集页面支持保存/加载/删除草稿
- 首页轮播横幅

## 路由表

| 路径 | 页面 | 权限 | 说明 |
|------|------|------|------|
| `/` | Home | 公开 | 首页帖子流（三栏布局） |
| `/login` | Login | 公开 | 登录 |
| `/register` | Register | 公开 | 注册 |
| `/profile` | Profile | 需登录 | 当前用户个人中心 |
| `/profile/:userId` | Profile | 需登录 | 指定用户资料页 |
| `/search` | Search | 公开 | 全站搜索 |
| `/publish` | Publish | 需登录 | 发布图文 |
| `/gallery` | Gallery | 需登录 | 发布图集 |
| `/video` | Video | 需登录 | 发布视频 |
| `/publish-manager` | PublishManager | 需登录 | 发布管理后台 |

## 项目结构

```
website/3/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx                       # React 挂载入口
    ├── App.jsx                        # 根组件：路由配置 + 全局布局
    ├── index.css                      # Tailwind 指令 + 全局样式
    ├── context/
    │   ├── AuthContext.jsx            # 认证状态管理
    │   └── ThemeContext.jsx           # 暗色/亮色主题管理
    ├── utils/
    │   └── storage.js                # localStorage 数据层（30+ 导出函数）
    ├── components/
    │   ├── icons.jsx                 # 30+ SVG 图标组件
    │   ├── NavBar.jsx                # 顶部导航栏（含搜索栏、通知铃铛、用户菜单）
    │   ├── LeftSidebar.jsx           # 左侧边栏（推荐/关注 Tab + 热门话题）
    │   ├── ContentArea.jsx           # 主页帖子流（无限滚动 + follow 过滤）
    │   ├── RightToolbar.jsx          # 右侧工具栏（发布入口 + 工具箱）
    │   ├── PostItem.jsx              # 帖子卡片（点赞/评论/关注/分享）
    │   ├── CarouselBanner.jsx        # 首页轮播横幅
    │   ├── MobileNav.jsx             # 移动端导航抽屉
    │   ├── MobileToolbarDrawer.jsx   # 移动端工具栏抽屉
    │   └── LoginPrompt.jsx           # 未登录操作提示弹窗
    └── pages/
        ├── Home.jsx                  # 首页
        ├── Login.jsx                 # 登录页
        ├── Register.jsx              # 注册页
        ├── Profile.jsx               # 个人中心
        ├── Search.jsx                # 搜索页
        ├── Publish.jsx               # 发图文页
        ├── Gallery.jsx               # 发图集页
        ├── Video.jsx                 # 发视频页
        └── PublishManager.jsx        # 发布管理后台
```

## 数据层

所有 CRUD 操作位于 `src/utils/storage.js`（500+ 行），导出 30+ 个函数。

### localStorage 键名

| 键名 | 说明 |
|------|------|
| `users` | 所有注册用户 |
| `current_session` | 当前登录会话 `{ userId }` |
| `all_posts` | 全局帖子列表（含 type 字段区分 post/gallery/video） |
| `all_comments` | 全局评论（按 postId 分组） |
| `likes_${userId}` | 用户点赞记录 |
| `checkin_${userId}` | 用户签到数据 |
| `drafts_${userId}` | 用户草稿（含 type 字段） |
| `favorites_${userId}` | 用户收藏 |
| `notifications_${userId}` | 用户通知（@提及等） |

### 数据隔离

用户数据通过 `${userId}` 后缀命名空间隔离：每个用户的点赞、签到、草稿、收藏、通知都存储在独立的 localStorage 键中。全局帖子通过 `authorId` 关联作者。

## 样式

- **主背景**: `#F5F0E6`（亮色）/ `#1a1a1a`（暗色）
- **卡片**: `#FFFFFF`（亮色）/ `#252525` 或 `#1E1E1E`（暗色）
- **主色调**: `#4CAF50`（绿色）→ hover `#388E3C`
- **绿色背景**: `#E8F5E9`（亮色）/ `#1a3320`（暗色）
- **布局**: 最大宽度 1200px，粘性侧边栏
- **响应式断点**: `md`（768px）、`lg`（1024px）、`xl`（1280px）
- **暗色模式**: Tailwind `class` 策略，由 ThemeContext 统一控制 `<html>` 上的 `dark` class
