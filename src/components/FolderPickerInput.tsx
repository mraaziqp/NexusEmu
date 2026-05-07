import React, { useState } from 'react';
import { FolderOpen, FileText, Loader2 } from 'lucide-react';
import { MobileFolderPicker } from './MobileFolderPicker';

interface FolderPickerInputProps {
  value: string;
  onChange: (path: string) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  required?: boolean;
  mode?: 'folder' | 'file';
  fileFilter?: string;
  fileTitle?: string;
  folderDescription?: string;
  className?: string;
}

const isMobile = typeof navigator !== 'undefined' && /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);

export const FolderPickerInput: React.FC<FolderPickerInputProps> = ({
  value,
  onChange,
  placeholder,
  label,
  hint,
  required,
  mode = 'folder',
  fileFilter = 'Executable files|*.exe|All files|*.*',
  fileTitle = 'Select executable',
  folderDescription = 'Select a folder',
  className = '',
}) => {
  const [picking, setPicking] = useState(false);
  const [err, setErr] = useState('');
  const [mobilePicker, setMobilePicker] = useState(false);

  const browse = async () => {
    setErr('');

    // Mobile: always use web picker (PowerShell not available)
    // File mode: PowerShell only (can't browse files on mobile yet)
    if (isMobile || mode === 'folder') {
      if (isMobile) { setMobilePicker(true); return; }
    }

    // Desktop: try PowerShell native dialog first
    setPicking(true);
    try {
      const url = mode === 'folder'
        ? `/api/system/pick-folder?description=${encodeURIComponent(folderDescription)}`
        : `/api/system/pick-file?filter=${encodeURIComponent(fileFilter)}&title=${encodeURIComponent(fileTitle)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || data.error) {
        // Fallback to web picker for folders
        if (mode === 'folder') { setMobilePicker(true); return; }
        setErr(data.error ?? 'Dialog failed');
        return;
      }
      if (data.path) onChange(data.path);
    } catch {
      // Fallback to web picker for folders
      if (mode === 'folder') { setMobilePicker(true); return; }
      setErr('Could not open dialog');
    } finally {
      setPicking(false);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-nexus-muted">
          {mode === 'folder'
            ? <FolderOpen className="w-3 h-3" />
            : <FileText className="w-3 h-3" />
          }
          {label}
          {required && <span className="text-red-400">*</span>}
          {hint && <span className="text-nexus-muted italic normal-case font-normal ml-1">{hint}</span>}
        </label>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setErr(''); }}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 focus:border-nexus-accent/60 rounded-xl font-mono text-sm text-white placeholder-nexus-muted outline-none transition-colors"
        />
        <button
          type="button"
          onClick={browse}
          disabled={picking}
          title="Browse…"
          className="px-4 py-3 bg-nexus-accent/10 border border-nexus-accent/30 rounded-xl hover:bg-nexus-accent/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 text-nexus-accent text-xs font-bold whitespace-nowrap"
        >
          {picking
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : mode === 'folder' ? <FolderOpen className="w-4 h-4" /> : <FileText className="w-4 h-4" />
          }
          Browse
        </button>
      </div>
      {err && <p className="text-[10px] text-red-400 pl-1">{err}</p>}

      <MobileFolderPicker
        isOpen={mobilePicker}
        onClose={() => setMobilePicker(false)}
        onSelect={onChange}
        title={folderDescription}
      />
    </div>
  );
};

