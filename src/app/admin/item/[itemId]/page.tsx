'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { ItemFormInputs } from '@/types/item';
import ItemForm from '@/components/ItemForm';
import { useModal } from "@/context/ModalContext";

export default function ItemEditPage() {
  const router = useRouter();
  const params = useParams();
  const { showAlert } = useModal();
  const itemId = params.itemId;

  const [initialData, setInitialData] = useState<ItemFormInputs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await api.get(`/admin/item/${itemId}`);
        const data = response.data.data;
        
        setInitialData({
          ...data,
          categoryId: data.categoryId,
          isDiscount: data.isDiscount || false,
        });
      } catch (error) {
        console.error(error);
        showAlert('상품 정보를 불러오는데 실패했습니다.');
        router.push('/admin/item/list');
      } finally {
        setLoading(false);
      }
    };

    if (itemId) fetchItem();
  }, [itemId, router]);

  const handleUpdate = async (data: ItemFormInputs) => {
    try {
      const response = await api.post(`/admin/item/${itemId}`, data);
      if (response.data.success) {
        showAlert('상품 정보가 수정되었습니다.');
        router.push('/admin/item/list');
      } else {
        showAlert(response.data.message);
      }
    } catch (err: any) {
      showAlert(err.response?.data?.message || '오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;
  if (!initialData) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <ItemForm 
            title="상품 수정" 
            submitLabel="수정하기" 
            initialValues={initialData}
            onSubmit={handleUpdate} 
          />
        </div>
      </div>
    </div>
  );
}