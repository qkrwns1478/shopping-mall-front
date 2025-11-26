'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useModal } from "@/context/ModalContext";

interface Category {
  id: number;
  name: string;
}

export default function CategoryManagePage() {
  const { showAlert, showConfirm } = useModal();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error(error);
      showAlert('카테고리 목록 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await api.post('/api/categories', { name: newCategoryName });
      if (res.data.success) {
        showAlert('카테고리가 추가되었습니다.', "성공");
        setNewCategoryName('');
        fetchCategories();
      }
    } catch (err: any) {
      showAlert(err.response?.data?.message || '추가 실패', "오류");
    }
  };

  const handleDelete = async (id: number) => {
    showConfirm('정말 삭제하시겠습니까?\n사용 중인 상품이 있다면 삭제되지 않을 수 있습니다.', async () => {
      try {
        const res = await api.delete(`/api/categories/${id}`);
        if (res.data.success) {
          showAlert('삭제되었습니다.', "성공");
          fetchCategories();
        }
      } catch (err: any) {
        showAlert('삭제 실패: 사용 중인 카테고리일 수 있습니다.', "오류");
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">카테고리 관리</h2>
      
      <div className="flex gap-2 mb-8 max-w-md">
        <input 
          type="text" 
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          placeholder="새 카테고리 이름"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          추가
        </button>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-200 max-w-2xl">
        <ul className="divide-y divide-gray-200">
          {categories.map((cat) => (
            <li key={cat.id} className="px-6 py-4 flex justify-between items-center">
              <span className="text-gray-800 font-medium">{cat.name}</span>
              <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700 text-sm">
                삭제
              </button>
            </li>
          ))}
          {categories.length === 0 && !loading && (
            <li className="px-6 py-8 text-center text-gray-500">등록된 카테고리가 없습니다.</li>
          )}
        </ul>
      </div>
    </div>
  );
}