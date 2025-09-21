import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, children }) => {
  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => onImageSelect(e as any);
    input.click();
  };

  return (
    <Button type="button" variant="outline" onClick={handleClick}>
      {children || (
        <>
          <Upload className="h-4 w-4 mr-2" />
          Upload Photo
        </>
      )}
    </Button>
  );
};

export default ImageUpload;