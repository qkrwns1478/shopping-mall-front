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
  
  const [originalImgUrl, setOriginalImgUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [deleteImage, setDeleteImage] = useState(false);

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
        
        if (data.imgUrl) {
          setOriginalImgUrl(data.imgUrl);
        }
        
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDeleteOriginalImage = () => {
    setDeleteImage(true);
    setOriginalImgUrl(null);
  };

  const onSubmit = async (data: ItemFormInputs) => {
    setErrorMsg('');
    
    const formData = new FormData();
    formData.append('itemNm', data.itemNm);
    formData.append('price', data.price.toString());
    formData.append('stockNumber', data.stockNumber.toString());
    formData.append('itemDetail', data.itemDetail);
    formData.append('itemSellStatus', data.itemSellStatus);
    
    if (data.itemImgFile && data.itemImgFile.length > 0) {
      formData.append('itemImgFile', data.itemImgFile[0]);
    }

    formData.append('deleteImage', deleteImage.toString());

    try {
      const response = await api.post(`/admin/item/${itemId}`, formData);
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

              {/* 이미지 처리 영역 */}
              <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <label className={labelClass}>상품 이미지</label>
                {originalImgUrl && !deleteImage && !preview && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">현재 등록된 이미지</p>
                    <div className="relative inline-block">
                      <img 
                        src={`http://localhost:8080${originalImgUrl}`} 
                        alt="Current" 
                        className="w-40 h-40 object-cover rounded border" 
                      />
                      <button
                        type="button"
                        onClick={handleDeleteOriginalImage}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 shadow-md hover:bg-red-600"
                        title="이미지 삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {preview && (
                  <div className="mb-4">
                    <p className="text-xs text-green-600 mb-2">새로 변경될 이미지</p>
                    <img src={preview} alt="New Preview" className="w-40 h-40 object-cover rounded border border-green-500" />
                  </div>
                )}

                {deleteImage && !preview && (
                  <div className="mb-4 text-sm text-red-500 font-medium">
                    * 기존 이미지가 삭제됩니다.
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className={inputClass}
                  {...register('itemImgFile')}
                  onChange={handleImageChange}
                />
              </div>

              {/* 에러 메시지 */}
              {errorMsg && (
                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">{errorMsg}</div>
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