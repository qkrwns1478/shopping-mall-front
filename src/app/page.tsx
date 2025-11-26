'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from 'next/link';
import api from '@/lib/api';

interface MainItem {
  id: number;
  itemId: number;
  itemNm: string;
  price: number;
  imgUrl: string;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [serverStatus, setServerStatus] = useState<'loading' | 'up' | 'down'>('loading');
  const [mainItems, setMainItems] = useState<MainItem[]>([]);

  useEffect(() => {
    const alertType = searchParams.get('alert');
    if (alertType === 'invalid_access') {
      alert("잘못된 접근입니다.");
      router.replace('/');
    } else if (alertType === 'admin_required') {
      alert("관리자 권한이 필요합니다.");
      router.replace('/');
    }
  }, [searchParams, router]);

  useEffect(() => {
    const checkServerAndFetchItems = async () => {
      try {
        await api.get('/api/ping');
        setServerStatus('up');

        const response = await api.get('/api/main/items');
        setMainItems(response.data);
      } catch (error: any) {
        console.error(error);
        if (error.response && error.response.status >= 500) {
          setServerStatus('down');
        } else {
          if (error.code === 'ERR_NETWORK' || !error.response) {
            setServerStatus('down');
          } else {
            setServerStatus('up');
          }
        }
      }
    };

    checkServerAndFetchItems();
  }, []);

  if (serverStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (serverStatus === 'down') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <main className="flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-bold text-red-600 mb-4">
            서버 점검 중입니다
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            현재 서비스 이용이 원활하지 않습니다.<br />
            잠시 후 다시 시도해 주세요.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-16 bg-blue-600 rounded-2xl p-8 sm:p-16 text-center text-white shadow-lg">
        <h1 className="text-3xl sm:text-5xl font-bold mb-4">MUNSIKSA 2025 S/S Collection</h1>
        <p className="text-blue-100 text-lg mb-8">새로운 시즌의 시작, 특별한 아이템을 만나보세요.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">추천 상품</h2>
        {mainItems.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500">등록된 추천 상품이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainItems.map((item) => (
              <Link key={item.id} href={`#`} className="group block bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative">
                  {item.imgUrl ? (
                    <img 
                      src={`http://localhost:8080${item.imgUrl}`} 
                      alt={item.itemNm}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 truncate">{item.itemNm}</h3>
                  <p className="font-bold text-lg text-gray-900">{item.price.toLocaleString()}원</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}