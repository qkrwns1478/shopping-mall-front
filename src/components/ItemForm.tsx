'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ItemFormInputs } from '@/types/item';
import ImageUploader from '@/components/ImageUploader';

interface ItemFormProps {
  initialValues?: Partial<ItemFormInputs>;
  onSubmit: (data: ItemFormInputs) => Promise<void>;
  title: string;
  submitLabel: string;
}

export default function ItemForm({ initialValues, onSubmit, title, submitLabel }: ItemFormProps) {
  const router = useRouter();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ItemFormInputs>({
    defaultValues: {
      itemSellStatus: 'SELL',
      isDiscount: false,
      discountRate: 0,
      deliveryFee: 0,
      options: [],
      ...initialValues,
    }
  });

  const [imgUrls, setImgUrls] = useState<string[]>(initialValues?.imgUrlList || []);
  const [options, setOptions] = useState<string[]>(initialValues?.options || []);
  const [optionInput, setOptionInput] = useState('');
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);

  const isDiscount = watch('isDiscount');

  useEffect(() => {
    api.get('/api/categories')
      .then(res => {
        setCategories(res.data);
        if (initialValues?.categoryId) {
          setValue('categoryId', initialValues.categoryId);
        }
      })
      .catch(err => console.error('카테고리 로드 실패', err));
  }, [initialValues?.categoryId, setValue]);

  const handleAddOption = () => {
    if (optionInput.trim()) {
      const newOptions = [...options, optionInput.trim()];
      setOptions(newOptions);
      setValue('options', newOptions);
      setOptionInput('');
    }
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    setValue('options', newOptions);
  };

  const onFormSubmit = (data: ItemFormInputs) => {
    const finalData = {
      ...data,
      imgUrlList: imgUrls,
      options: options
    };
    onSubmit(finalData);
  };

  const inputClass = "w-full px-3 py-2 text-gray-700 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150";
  const labelClass = "block mb-1 text-sm font-bold text-gray-700";

  return (
    <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6 sm:p-8">
      <h2 className="mb-8 text-3xl font-bold text-gray-900 text-center">{title}</h2>
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>판매 상태</label>
            <select className={inputClass} {...register('itemSellStatus')}>
              <option value="SELL">판매중</option>
              <option value="SOLD_OUT">품절</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>카테고리</label>
            <select 
              className={inputClass} 
              {...register('categoryId', { required: '카테고리는 필수입니다.' })}
            >
              <option value="">선택하세요</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>상품명</label>
          <input type="text" className={inputClass} {...register('itemNm', { required: '상품명은 필수입니다.' })} />
          {errors.itemNm && <p className="text-red-500 text-xs mt-1">{errors.itemNm.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>브랜드</label>
            <input type="text" className={inputClass} {...register('brand')} />
          </div>
          <div>
            <label className={labelClass}>원산지</label>
            <input type="text" className={inputClass} {...register('origin')} />
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg space-y-4 border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>가격</label>
              <input type="number" className={inputClass} {...register('price', { required: true })} />
            </div>
            <div>
              <label className={labelClass}>재고 수량</label>
              <input type="number" className={inputClass} {...register('stockNumber', { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className={labelClass}>배송비 (0원이면 무료)</label>
              <input type="number" className={inputClass} {...register('deliveryFee', { required: true })} />
            </div>
            <div className="flex items-center h-10">
              <input 
                type="checkbox" 
                id="isDiscount" 
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                {...register('isDiscount')} 
              />
              <label htmlFor="isDiscount" className="ml-2 text-sm font-bold text-gray-700">할인 적용</label>
            </div>
          </div>

          {isDiscount && (
            <div>
              <label className={labelClass}>할인율 (%)</label>
              <input type="number" className={inputClass} {...register('discountRate')} />
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>상품 옵션</label>
          <div className="flex gap-2 mb-2">
            <input 
              type="text" 
              className={inputClass} 
              value={optionInput}
              onChange={(e) => setOptionInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
              placeholder="옵션 입력 후 추가 버튼"
            />
            <button type="button" onClick={handleAddOption} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="11" width="14" height="2" fill="currentColor"/>
                <rect x="11" y="5" width="2" height="14" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {options.map((opt, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {opt}
                <button type="button" onClick={() => handleRemoveOption(index)} className="ml-2 text-blue-600">&times;</button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>상품 상세 설명</label>
          <textarea className={`${inputClass} h-32 resize-none`} {...register('itemDetail', { required: true })} />
        </div>

        <ImageUploader urls={imgUrls} onChange={setImgUrls} />

        <div className="flex justify-between pt-4">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded">취소</button>
          <button type="submit" className="px-6 py-2 font-bold text-white bg-primary rounded shadow hover:bg-primary-dark">{submitLabel}</button>
        </div>
      </form>
    </div>
  );
}