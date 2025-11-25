'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface ImageCardProps {
  url: string;
  index: number;
  onRemove?: (index: number) => void;
  onSetRep?: (index: number) => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}

function ImageCard({ url, index, onRemove, onSetRep, isDragging, isOverlay }: ImageCardProps) {
  return (
    <div
      className={`relative w-full h-full rounded-lg overflow-hidden border-2 bg-white touch-none ${
        !isOverlay && index === 0
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-400'
      } ${isDragging ? 'opacity-30' : 'opacity-100'} ${isOverlay ? 'shadow-2xl scale-105 border-blue-400 cursor-grabbing' : ''}`}
    >
      <img
        src={`http://localhost:8080${url}`}
        alt="product-img"
        className="w-full h-full object-cover pointer-events-none"
      />

      {!isOverlay && index === 0 && (
        <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs px-2 py-1 font-bold z-10 rounded-br">
          대표
        </div>
      )}

      {!isOverlay && !isDragging && onRemove && onSetRep && (
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          {index !== 0 && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onSetRep(index)}
              className="bg-white/90 backdrop-blur-sm text-yellow-500 p-1.5 rounded shadow-sm hover:bg-white hover:scale-105 transition-all border border-gray-200 cursor-pointer"
              title="대표 이미지로 설정"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onRemove(index)}
            className="bg-white/90 backdrop-blur-sm text-gray-500 p-1.5 rounded shadow-sm hover:bg-white hover:text-red-500 hover:scale-105 transition-all border border-gray-200 cursor-pointer"
            title="삭제"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

interface SortableItemProps {
  url: string;
  index: number;
  onRemove: (index: number) => void;
  onSetRep: (index: number) => void;
  isSorting: boolean;
}

function SortableItem({ url, index, onRemove, onSetRep, isSorting }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="aspect-square group relative">
      <motion.div
        layout={!isSorting} 
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full h-full"
      >
        <ImageCard
          url={url}
          index={index}
          onRemove={onRemove}
          onSetRep={onSetRep}
          isDragging={isDragging}
        />
      </motion.div>
    </div>
  );
}

interface ImageUploaderProps {
  urls: string[];
  onChange: (newUrls: string[]) => void;
}

export default function ImageUploader({ urls, onChange }: ImageUploaderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = urls.indexOf(active.id as string);
      const newIndex = urls.indexOf(over.id as string);
      onChange(arrayMove(urls, oldIndex, newIndex));
    }
    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const formData = new FormData();
    const newUploadedUrls: string[] = [];

    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('file', e.target.files[i]);
      try {
        const response = await api.post('/admin/item/image/upload', formData);
        if (response.data.success) {
          newUploadedUrls.push(response.data.url);
        }
      } catch (error) {
        console.error('Image upload failed:', error);
        alert('일부 이미지를 업로드하는데 실패했습니다.');
      }
      formData.delete('file');
    }
    onChange([...urls, ...newUploadedUrls]);
    e.target.value = ''; 
  };

  const handleDeleteImage = (index: number) => {
    onChange(urls.filter((_, i) => i !== index));
  };

  const handleSetRepresentative = (index: number) => {
    if (index === 0) return;
    const newUrls = [...urls];
    const [target] = newUrls.splice(index, 1);
    newUrls.unshift(target);
    onChange(newUrls);
  };

  return (
    <div className="p-4 bg-gray-50 rounded border border-gray-200">
      <label className="block mb-2 text-sm font-bold text-gray-700">
        상품 이미지
      </label>
      
      <input
        type="file"
        multiple
        accept="image/*"
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4 cursor-pointer"
        onChange={handleImageUpload}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={urls} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {urls.map((url, index) => (
              <SortableItem
                key={url}
                url={url}
                index={index}
                onRemove={handleDeleteImage}
                onSetRep={handleSetRepresentative}
                isSorting={!!activeId}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay adjustScale={true}>
          {activeId ? (
            <div className="aspect-square">
              <ImageCard url={activeId} index={-1} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      {urls.length === 0 && (
        <div className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg mt-2 bg-white">
          <div className="flex flex-col items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span>등록된 이미지가 없습니다.</span>
          </div>
        </div>
      )}
    </div>
  );
}