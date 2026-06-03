import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import NavBar from './components/NavBar';
import MobileNav from './components/MobileNav';
import MobileToolbarDrawer from './components/MobileToolbarDrawer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Publish from './pages/Publish';
import Gallery from './pages/Gallery';
import Video from './pages/Video';
import PublishManager from './pages/PublishManager';
import Article from './pages/Article';
import CalendarPage from './pages/calendar';
import OperatorBook from './pages/OperatorBook';
import OperatorDetail from './pages/OperatorDetail';
import Shop from './pages/Shop';
import SignIn from './pages/SignIn';
import Achievement from './pages/Achievement'
import TeamFriend from './pages/TeamFriend'

function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileToolbarOpen, setMobileToolbarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F0E6] dark:bg-[#1a1a1a]">
      <NavBar
        onMenuClick={() => setMobileNavOpen(true)}
      />

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <MobileToolbarDrawer open={mobileToolbarOpen} onClose={() => setMobileToolbarOpen(false)} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/video" element={<Video />} />
        <Route path="/publish-manager" element={<PublishManager />} />
        <Route path="/post/:postId" element={<Article />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/operatorbook" element={<OperatorBook/>}/>
        <Route path="/operator/:id" element={<OperatorDetail/>}/> 
        <Route path="/shop" element={<Shop />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/achievement" element={<Achievement/>}/>
        <Route path="/team" element={<TeamFriend/>}/>
      </Routes>

      {/* Mobile toolbar trigger FAB */}
      <button
        onClick={() => setMobileToolbarOpen(true)}
        className="xl:hidden fixed bottom-6 right-6 z-30 w-12 h-12 bg-[#4CAF50] rounded-full shadow-lg flex items-center justify-center hover:bg-[#388E3C] transition-colors"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </button>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
