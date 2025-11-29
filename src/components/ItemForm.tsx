'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ItemFormInputs, ItemOption } from '@/types/item';
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
      itemOptionList: [],
      isPayback: false,
      ...initialValues,
    }
  });

  const [imgUrls, setImgUrls] = useState<string[]>(initialValues?.imgUrlList || []);
  const [options, setOptions] = useState<ItemOption[]>(initialValues?.itemOptionList || []);

  const [optionNameInput, setOptionNameInput] = useState('');
  const [optionPriceInput, setOptionPriceInput] = useState<number>(0);

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
    if (optionNameInput.trim()) {
      const newOption: ItemOption = {
        optionName: optionNameInput.trim(),
        extraPrice: Number(optionPriceInput)
      };
      const newOptions = [...options, newOption];
      setOptions(newOptions);
      setValue('itemOptionList', newOptions);
      
      setOptionNameInput('');
      setOptionPriceInput(0);
    }
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    setValue('itemOptionList', newOptions);
  };

  const onFormSubmit = (data: ItemFormInputs) => {
    const finalData = {
      ...data,
      imgUrlList: imgUrls,
      itemOptionList: options
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
          </div>

          <div className="flex gap-6">
            <div className="flex items-center h-10">
              <input 
                type="checkbox" 
                id="isDiscount" 
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                {...register('isDiscount')} 
              />
              <label htmlFor="isDiscount" className="ml-2 text-sm font-bold text-gray-700">할인 적용</label>
            </div>
            <div className="flex items-center h-10">
              <input 
                type="checkbox" 
                id="isPayback" 
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                {...register('isPayback')} 
              />
              <label htmlFor="isPayback" className="ml-2 text-sm font-bold text-gray-700">페이백 이벤트 (10%)</label>
            </div>
          </div>

          {isDiscount && (
            <div>
              <label className={labelClass}>할인율 (%)</label>
              <input type="number" className={inputClass} {...register('discountRate')} />
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded p-4">
          <label className={labelClass}>상품 옵션</label>
          <div className="flex flex-col sm:flex-row gap-2 mb-2 items-end">
            <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">옵션명</label>
                <input 
                type="text" 
                className={inputClass} 
                value={optionNameInput}
                onChange={(e) => setOptionNameInput(e.target.value)}
                placeholder="예: L 사이즈"
                />
            </div>
            <div className="w-full sm:w-32">
                <label className="text-xs text-gray-500 mb-1 block">추가 금액</label>
                <input 
                type="number" 
                className={inputClass} 
                value={optionPriceInput}
                onChange={(e) => setOptionPriceInput(Number(e.target.value))}
                placeholder="0"
                />
            </div>
            <button type="button" onClick={handleAddOption} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 h-[42px]">
              추가
            </button>
          </div>
          
          <div className="space-y-2 mt-2">
            {options.map((opt, index) => (
              <div key={index} className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded text-sm text-blue-800">
                <span>
                    <span className="font-bold mr-2">{opt.optionName}</span>
                    {opt.extraPrice > 0 && <span className="text-blue-600">(+{opt.extraPrice.toLocaleString()}원)</span>}
                </span>
                <button type="button" onClick={() => handleRemoveOption(index)} className="text-red-500 hover:text-red-700 font-bold px-2">
                    &times;
                </button>
              </div>
            ))}
            {options.length === 0 && <p className="text-gray-400 text-sm">등록된 옵션이 없습니다.</p>}
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