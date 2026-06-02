import RightToolbar from './RightToolbar';

export default function MobileToolbarDrawer({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 xl:hidden" onClick={onClose} />}
      <div className={`fixed top-0 right-0 bottom-0 w-72 bg-[#F5F0E6] dark:bg-[#1a1a1a] z-50 xl:hidden transition-transform duration-300 overflow-y-auto ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <RightToolbar visible={true} onClose={onClose} />
      </div>
    </>
  );
}
