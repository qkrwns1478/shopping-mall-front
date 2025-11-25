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

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ItemFormInputs>();
  const [loading, setLoading] = useState(true);
  const [imgUrls, setImgUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await api.get(`/admin/item/${itemId}`);
        const data = response.data.data;
        
        setValue('itemNm', data.itemNm);
        setValue('price', data.price);
        setValue('stockNumber', data.stockNumber);
        setValue('itemDetail', data.itemDetail);
        setValue('itemSellStatus', data.itemSellStatus);
        
        if (data.imgUrlList) {
          setImgUrls(data.imgUrlList);
        }
        
        setLoading(false);
      } catch (error) {
        console.error(error);
        alert('상품 정보를 불러오는데 실패했습니다.');
        router.push('/admin/item/list');
      }
    };

    if (itemId) fetchItem();
  }, [itemId, setValue, router]);

  const onSubmit = async (data: ItemFormInputs) => {
    const payload = {
      ...data,
      imgUrlList: imgUrls
    };

    try {
      const response = await api.post(`/admin/item/${itemId}`, payload);
      if (response.data.success) {
        alert('상품 정보가 수정되었습니다.');
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
              
              {/* 판매 상태 */}
              <div>
                <label className={labelClass}>판매 상태</label>
                <select className={inputClass} {...register('itemSellStatus')}>
                  <option value="SELL">판매중</option>
                  <option value="SOLD_OUT">품절</option>
                </select>
              </div>

              {/* 상품명 */}
              <div>
                <label className={labelClass}>상품명</label>
                <input type="text" className={inputClass} {...register('itemNm', { required: true })} />
              </div>

              {/* 가격 */}
              <div>
                <label className={labelClass}>가격</label>
                <input type="number" className={inputClass} {...register('price', { required: true })} />
              </div>

              {/* 재고 */}
              <div>
                <label className={labelClass}>재고 수량</label>
                <input type="number" className={inputClass} {...register('stockNumber', { required: true })} />
              </div>

              {/* 상세 설명 */}
              <div>
                <label className={labelClass}>상품 상세 설명</label>
                <textarea className={`${inputClass} h-32 resize-none`} {...register('itemDetail', { required: true })} />
              </div>

              {/* 이미지 업로드 */}
              <ImageUploader 
                urls={imgUrls} 
                onChange={setImgUrls} 
              />

              {/* 버튼 */}
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 font-bold text-white bg-blue-600 rounded shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition"
                >
                  수정하기
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}