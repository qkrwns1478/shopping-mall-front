'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface ItemFormInputs {
  itemNm: string;
  price: number;
  stockNumber: number;
  itemDetail: string;
  itemSellStatus: 'SELL' | 'SOLD_OUT';
}

export default function ItemNewPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<ItemFormInputs>({
    defaultValues: {
      itemSellStatus: 'SELL'
    }
  });
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (data: ItemFormInputs) => {
    setErrorMsg('');
    
    try {
      const response = await api.post('/admin/item/new', data);
      if (response.data.success) {
        alert('상품이 등록되었습니다.');
        router.push('/');
      } else {
        setErrorMsg(response.data.message || '상품 등록에 실패했습니다.');
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert('관리자 권한이 없습니다.');
        router.push('/');
      } else {
        setErrorMsg(err.response?.data?.message || '서버 오류가 발생했습니다.');
      }
    }
  };

  const inputClass = "w-full px-3 py-2 text-gray-700 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150";
  const labelClass = "block mb-1 text-sm font-bold text-gray-700";

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">상품 등록</h2>

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
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 font-bold text-white bg-blue-600 rounded shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}