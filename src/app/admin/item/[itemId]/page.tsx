'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { ItemFormInputs } from '@/types/item';
import ImageUploader from '@/components/ImageUploader';

export default function ItemEditPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.itemId;

  const { register, handleSubmit, setValue, watch } = useForm<ItemFormInputs>();
  const [loading, setLoading] = useState(true);
  const [imgUrls, setImgUrls] = useState<string[]>([]);
  const [optionInput, setOptionInput] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  
  const isDiscount = watch('isDiscount');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemRes, catRes] = await Promise.all([
          api.get(`/admin/item/${itemId}`),
          api.get('/api/categories')
        ]);

        setCategories(catRes.data);

        const data = itemRes.data.data;
        setValue('itemNm', data.itemNm);
        setValue('price', data.price);
        setValue('stockNumber', data.stockNumber);
        setValue('itemDetail', data.itemDetail);
        setValue('itemSellStatus', data.itemSellStatus);
        setValue('categoryId', data.categoryId);
        setValue('brand', data.brand);
        setValue('origin', data.origin);
        setValue('deliveryFee', data.deliveryFee);
        setValue('isDiscount', data.isDiscount || false);
        setValue('discountRate', data.discountRate);
        
        if (data.imgUrlList) setImgUrls(data.imgUrlList);
        if (data.options) {
          setOptions(data.options);
          setValue('options', data.options);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        alert('데이터 로드 실패');
        router.push('/admin/item/list');
      }
    };

    if (itemId) fetchData();
  }, [itemId, setValue, router]);

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

  const onSubmit = async (data: ItemFormInputs) => {
    const payload = {
      ...data,
      imgUrlList: imgUrls,
      options: options
    };

    try {
      const response = await api.post(`/admin/item/${itemId}`, payload);
      if (response.data.success) {
        alert('수정되었습니다.');
        router.push('/admin/item/list');
      } else {
        alert(response.data.message);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || '오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;

  const inputClass = "w-full px-3 py-2 text-gray-700 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150";
  const labelClass = "block mb-1 text-sm font-bold text-gray-700";

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">상품 수정</h2>
          <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  <select className={inputClass} {...register('categoryId', { required: true })}>
                    <option value="">선택하세요</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>상품명</label>
                <input type="text" className={inputClass} {...register('itemNm', { required: true })} />
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
                    <label className={labelClass}>배송비</label>
                    <input type="number" className={inputClass} {...register('deliveryFee')} />
                  </div>
                  <div className="flex items-center h-10">
                    <input type="checkbox" id="isDiscount" className="w-4 h-4" {...register('isDiscount')} />
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
                  <input type="text" className={inputClass} value={optionInput} onChange={(e) => setOptionInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())} />
                  <button type="button" onClick={handleAddOption} className="px-4 py-2 bg-gray-200 rounded">추가</button>
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
                <button type="submit" className="px-6 py-2 font-bold text-white bg-blue-600 rounded shadow hover:bg-blue-700">수정하기</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}