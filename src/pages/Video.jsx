import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const IconUpload = ({ size = 48, color = '#999' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const SPECS = [
  { label: '视频大小', value: '最大 2GB' },
  { label: '视频格式', value: 'MP4, AVI, MOV, WMV' },
  { label: '视频时长', value: '最长 30 分钟' },
  { label: '视频分辨率', value: '最高 4K (3840×2160)' },
];

// ====================== 主组件 ======================
export default function Video() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');

  useEffect(() => { if (!isLoggedIn) navigate('/login'); }, [isLoggedIn, navigate]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024 * 1024) {
      alert('视频大小不能超过 2GB');
      return;
    }
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024 * 1024) {
      alert('视频大小不能超过 2GB');
      return;
    }
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-[#F5F0E6] dark:bg-[#1a1a1a] pt-[91px] pb-12">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
      <div className="max-w-[800px] mx-auto">
        <div className="bg-white dark:bg-[#252525] border border-[#E5E0D5] dark:border-[#374151] rounded-xl p-6 md:p-8">

          {/* 标题栏 */}
          <div className="mb-6">
            <h1 className="text-gray-900 dark:text-white text-xl font-bold">发布视频</h1>
          </div>

          {/* 视频上传区域 */}
          <div className="mb-6">
            {videoPreview ? (
              <div className="relative rounded-xl overflow-hidden bg-black">
                <video
                  src={videoPreview}
                  controls
                  className="w-full max-h-[400px] object-contain"
                />
                <button
                  onClick={() => { setVideoFile(null); setVideoPreview(''); }}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-[#4CAF50] text-white text-sm font-medium rounded-full hover:bg-[#388E3C] transition-colors"
                >
                  重新上传
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-[#CCC] dark:border-[#555] rounded-xl p-16 flex flex-col items-center justify-center cursor-pointer hover:border-[#4CAF50] transition-colors bg-gray-50/50 dark:bg-[#1a1a1a]/50"
              >
                <IconUpload size={48} color="#999" />
                <p className="text-[#999] text-sm mt-4 mb-4">点击或拖拽文件到此处上传</p>
                <button type="button"
                  className="px-6 py-2 text-sm text-white bg-[#4CAF50] rounded-full hover:bg-[#388E3C] transition-colors font-medium">
                  上传视频
                </button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
          </div>

          {/* 视频规格说明区 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {SPECS.map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-[#1E1E1E] rounded-lg p-3 text-center border border-[#E5E0D5] dark:border-[#333]">
                <div className="text-[#999] text-xs mb-1">{label}</div>
                <div className="text-gray-700 dark:text-[#CCC] text-xs font-medium">{value}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
      </div>
    </div>
  );
}
