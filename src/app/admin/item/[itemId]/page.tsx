'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { ItemFormInputs } from '@/types/item';

export default function ItemEditPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.itemId;

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ItemFormInputs>();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

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
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch item:', error);
        alert('상품 정보를 불러오는데 실패했습니다.');
        router.push('/admin/item/list');
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId, setValue, router]);

  const onSubmit = async (data: ItemFormInputs) => {
    setErrorMsg('');
    
    try {
      const response = await api.post(`/admin/item/${itemId}`, data);
      if (response.data.success) {
        alert('상품 정보가 수정되었습니다.');
        router.push('/admin/item/list');
      } else {
        setErrorMsg(response.data.message || '상품 수정에 실패했습니다.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || '서버 오류가 발생했습니다.');
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
                <input
                  type="text"
                  className={inputClass}
                  placeholder="상품명을 입력하세요"
                  {...register('itemNm', { required: '상품명은 필수입니다.' })}
                />
                {errors.itemNm && <p className="mt-1 text-xs text-red-500">{errors.itemNm.message}</p>}
              </div>

              {/* 가격 */}
              <div>
                <label className={labelClass}>가격</label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="가격을 입력하세요"
                  {...register('price', { required: '가격은 필수입니다.', min: { value: 0, message: '가격은 0원 이상이어야 합니다.' } })}
                />
                {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
              </div>

              {/* 재고 */}
              <div>
                <label className={labelClass}>재고 수량</label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="재고 수량을 입력하세요"
                  {...register('stockNumber', { required: '재고 수량은 필수입니다.', min: { value: 0, message: '재고는 0개 이상이어야 합니다.' } })}
                />
                {errors.stockNumber && <p className="mt-1 text-xs text-red-500">{errors.stockNumber.message}</p>}
              </div>

              {/* 상세 설명 */}
              <div>
                <label className={labelClass}>상품 상세 설명</label>
                <textarea
                  className={`${inputClass} h-32 resize-none`}
                  placeholder="상품 상세 설명을 입력하세요"
                  {...register('itemDetail', { required: '상세 설명은 필수입니다.' })}
                />
                {errors.itemDetail && <p className="mt-1 text-xs text-red-500">{errors.itemDetail.message}</p>}
              </div>

              {/* 에러 메시지 */}
              {errorMsg && (
                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                  {errorMsg}
                </div>
              )}

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