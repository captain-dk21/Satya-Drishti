import React, { useCallback, useState } from 'react';
import { Upload, X, FileVideo, FileImage } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit for demo responsiveness

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateAndSetFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 20MB limit.");
      return;
    }
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError("Only image and video files are supported.");
      return;
    }
    setError(null);
    onFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    onFileSelect(null);
    setError(null);
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-300 ease-in-out ${
          isDragging
            ? 'border-tech bg-tech/10'
            : selectedFile
            ? 'border-success/50 bg-success/5'
            : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="image/*,video/*"
          onChange={handleFileInput}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-full bg-surface border border-zinc-700 shadow-lg relative group">
                {selectedFile.type.startsWith('video') ? (
                    <FileVideo className="w-12 h-12 text-blue-400" />
                ) : (
                    <FileImage className="w-12 h-12 text-purple-400" />
                )}
                <button 
                    onClick={(e) => { e.stopPropagation(); clearFile(); }}
                    className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                    <X size={14} />
                </button>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-200 truncate max-w-[200px]">{selectedFile.name}</p>
              <p className="text-xs text-zinc-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        ) : (
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer space-y-3">
            <div className="p-3 rounded-full bg-surface border border-zinc-800">
              <Upload className="w-8 h-8 text-zinc-400" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-zinc-300">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-zinc-500">
                MP4, MOV, JPG, PNG (Max 20MB)
              </p>
            </div>
          </label>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-danger font-mono">{error}</p>}
    </div>
  );
};
