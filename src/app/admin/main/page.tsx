'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface MainItem {
  id: number;
  itemId: number;
  itemNm: string;
  price: number;
  imgUrl: string;
}

interface Product {
  id: number;
  itemNm: string;
  price: number;
  itemSellStatus: string;
}

export default function AdminMainItemPage() {
  const [mainItems, setMainItems] = useState<MainItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productPage, setProductPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMainItems = async () => {
    try {
      const response = await api.get('/api/main/items');
      setMainItems(response.data);
    } catch (error) {
      console.error(error);
      alert('메인 상품 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (page: number) => {
    try {
      const response = await api.get(`/admin/item/list?page=${page}`);
      setProducts(response.data.content);
      setTotalPages(response.data.totalPages);
      setProductPage(response.data.number);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMainItems();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      fetchProducts(0);
    }
  }, [isModalOpen]);

  const handleAddToMain = async (itemId: number) => {
    try {
      const response = await api.post('/admin/main/items', { itemId });
      if (response.data.success) {
        alert('메인 상품으로 등록되었습니다.');
        setIsModalOpen(false);
        fetchMainItems();
      } else {
        alert(response.data.message);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '등록 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (mainItemId: number) => {
    if (!confirm('정말로 메인 목록에서 삭제하시겠습니까?')) return;

    try {
      const response = await api.delete(`/admin/main/items/${mainItemId}`);
      if (response.data.success) {
        fetchMainItems();
      } else {
        alert(response.data.message);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">메인 상품 관리</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-bold"
        >
          + 상품 추가
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순서</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이미지</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mainItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  메인 페이지에 등록된 상품이 없습니다.
                </td>
              </tr>
            ) : (
              mainItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.imgUrl ? (
                      <img src={`http://localhost:8080${item.imgUrl}`} alt="" className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded"></div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.itemNm}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.price.toLocaleString()}원</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                      목록에서 제거
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 상품 선택 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">상품 추가</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">상품명</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">상태</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">선택</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{product.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.itemNm}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.itemSellStatus === 'SELL' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.itemSellStatus === 'SELL' ? '판매중' : '품절'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleAddToMain(product.id)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-bold"
                        >
                          추가
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => fetchProducts(i)}
                    className={`px-3 py-1 rounded text-sm ${
                      productPage === i 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}