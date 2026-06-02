import { Link } from 'react-router-dom';
import { IconX } from './icons';

const Logo = () => (
  <div className="flex items-center gap-3 shrink-0">
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#4CAF50" />
      <path d="M14 34V14l10 10 10-10v20" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="24" cy="20" r="3" fill="#FFF" />
    </svg>
    <div>
      <div className="text-white font-bold text-base leading-tight">森空岛</div>
      <div className="text-[#AAAAAA] text-xs leading-tight">鹰角网络官方社区</div>
    </div>
  </div>
);

export default function MobileNav({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}
      <div className={`fixed top-0 left-0 bottom-0 w-64 bg-[#222222] dark:bg-[#222222] z-50 md:hidden transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-[#374151]">
          <Logo />
          <button onClick={onClose}><IconX size={20} /></button>
        </div>
        <div className="p-4">
          <Link to="/" onClick={onClose} className="block px-4 py-3 text-white font-medium rounded-lg bg-[#374151] mb-1">首页</Link>
          <span className="block px-4 py-3 text-[#CCC] font-medium rounded-lg mb-1">版区</span>
          <div className="ml-4 border-l border-[#374151]">
            {['明日方舟', '来自星尘', '泡姆泡姆', '终末地'].map(item => (
              <span key={item} className="block px-4 py-2 text-sm text-[#AAA]">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
