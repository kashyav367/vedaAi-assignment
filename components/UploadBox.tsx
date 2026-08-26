'use client';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText } from 'lucide-react';

interface Props {
  label: string;
  file: File | null;
  pages?: number;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function UploadBox({ label, file, pages, onFileSelect, onRemove }: Props) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) onFileSelect(acceptedFiles[0]);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  if (file) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 bg-white flex items-center justify-center min-h-[110px]">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 relative w-full max-w-sm">
          <button
            onClick={onRemove}
            className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700"
          >
            <X size={14} />
          </button>
          <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">{file.name}</p>
           <p className="text-xs text-gray-400">
  {formatFileSize(file.size)} {pages ? `• ${pages} Pages` : ''}
</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer bg-white transition min-h-[110px] flex flex-col items-center justify-center ${
        isDragActive ? 'border-orange-400 bg-orange-50' : 'border-gray-200'
      }`}
    >
      <input {...getInputProps()} />
      <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
        <Upload size={18} className="text-gray-600" />
      </div>
      <p className="font-semibold text-gray-900">
        Upload <span className="text-orange-500">{label}</span>
      </p>
      <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
    </div>
  );
}