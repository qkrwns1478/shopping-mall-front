'use client';

import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ItemFormInputs } from '@/types/item';
import ItemForm from '@/components/ItemForm';

export default function ItemNewPage() {
  const router = useRouter();

  const handleCreate = async (data: ItemFormInputs) => {
    try {
      const response = await api.post('/admin/item/new', data);
      if (response.data.success) {
        alert('상품이 등록되었습니다.');
        router.push('/admin/item/list');
      } else {
        alert(response.data.message);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || '오류가 발생했습니다.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <ItemForm 
            title="상품 등록" 
            submitLabel="등록하기" 
            onSubmit={handleCreate} 
          />
        </div>
      </div>
    </div>
  );
}