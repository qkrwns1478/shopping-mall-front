'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Item } from '@/types/item';
import { useModal } from "@/context/ModalContext";

export default function ItemListPage() {
  const { showAlert, showConfirm } = useModal();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchItems = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/item/list?page=${pageNum}`);
      setItems(response.data.content);
      setTotalPages(response.data.totalPages);
      setPage(response.data.number);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      showAlert("상품 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(0);
  }, []);

  const handleDelete = async (id: number) => {
    showConfirm('정말로 삭제하시겠습니까?', async () => {
      try {
        const response = await api.delete(`/admin/item/${id}`);
        if (response.data.success) {
          showAlert('삭제되었습니다.', "성공");
          fetchItems(page);
        } else {
          showAlert(response.data.message, "실패");
        }
      } catch (error: any) {
        showAlert(error.response?.data?.message || '삭제 중 오류가 발생했습니다.', "오류");
      }
    });
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">상품 관리</h2>
        <Link 
          href="/admin/item/new" 
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition font-bold"
        >
          + 상품 등록
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">재고</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등록일</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">등록된 상품이 없습니다.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link href={`/admin/item/${item.id}`} className="hover:text-blue-600 hover:underline">
                      {item.itemNm}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.itemSellStatus === 'SELL' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.itemSellStatus === 'SELL' ? '판매중' : '품절'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.price.toLocaleString()}원</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.stockNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.regTime.split('T')[0]}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/item/${item.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">수정</Link>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">삭제</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => fetchItems(i)}
              className={`px-3 py-1 rounded ${
                page === i 
                  ? 'bg-primary text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}