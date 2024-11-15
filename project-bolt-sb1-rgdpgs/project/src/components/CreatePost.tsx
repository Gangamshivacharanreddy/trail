import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postSchema } from '../lib/validation';
import { ImagePlus, X } from 'lucide-react';

export default function CreatePost() {
  const [preview, setPreview] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(postSchema),
  });

  const onSubmit = async (data: any) => {
    // In a real app, this would:
    // 1. Upload image to storage
    // 2. Run content moderation on the image
    // 3. Check caption for inappropriate content
    // 4. Save post if everything passes
    console.log(data);
    reset();
    setPreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create Post</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-96 mx-auto rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <input
                  type="file"
                  {...register('image')}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <div className="flex flex-col items-center">
                  <ImagePlus className="h-12 w-12 text-gray-400 mb-3" />
                  <span className="text-gray-600">Click to upload image</span>
                </div>
              </label>
            )}
          </div>
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">
              {errors.image.message as string}
            </p>
          )}
        </div>

        <div>
          <textarea
            {...register('caption')}
            placeholder="Write a caption..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-32"
          />
          {errors.caption && (
            <p className="mt-1 text-sm text-red-600">
              {errors.caption.message as string}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
        >
          Share Post
        </button>
      </form>
    </div>
  );
}