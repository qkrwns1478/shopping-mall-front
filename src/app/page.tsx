'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from 'next/link';
import api from '@/lib/api';
import { BsArrowRight } from "react-icons/bs";

interface MainItem {
  id: number;
  itemId: number;
  itemNm: string;
  price: number;
  imgUrl: string;
  itemDetail: string;
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
        
        if (Array.isArray(response.data)) {
          setMainItems(response.data);
        } else {
          setMainItems([]);
        }
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
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">MUNSIKSA 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (serverStatus === 'down') {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center px-6 py-12 bg-gray-50 rounded-2xl border border-gray-100 max-w-md mx-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">서버 연결 실패</h2>
          <p className="text-gray-500 mb-6">
            현재 서비스 이용이 원활하지 않습니다.<br />
            잠시 후 다시 시도해 주세요.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-12">
      <section className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl mb-16">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative container mx-auto px-6 py-20 sm:py-24 text-center sm:text-left">
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 text-sm font-semibold mb-4 border border-blue-500/30">
              New Collection 2025
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight tracking-tight">
              Discover Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Unique Style
              </span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
              MUNSIKSA에서 제안하는 감각적인 아이템으로<br className="sm:hidden"/> 당신의 일상을 특별하게 만들어보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
              <Link 
                href="/search" 
                className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                쇼핑하기 <BsArrowRight className="text-lg"/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-end justify-between mb-8 px-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Editor's Pick</h2>
            <p className="text-gray-500 mt-2">MUNSIKSA가 엄선한 추천 상품을 만나보세요.</p>
          </div>
        </div>

        {mainItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-lg font-medium">등록된 추천 상품이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {mainItems.map((item) => (
              <Link 
                key={item.id} 
                href={`/item/${item.itemId}`} 
                className="group flex flex-col"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-300 mb-4">
                  {item.imgUrl ? (
                    <img 
                      src={`http://localhost:8080${item.imgUrl}`} 
                      alt={item.itemNm}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      <span className="text-4xl font-thin">NO IMAGE</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center">
                    <button className="w-full py-3 bg-white/90 backdrop-blur-sm text-gray-900 font-semibold rounded-lg shadow-lg hover:bg-white transition-colors">
                      상품 상세보기
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-start gap-2 px-1">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {item.itemNm}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">{item.itemDetail || '상품 설명이 없습니다.'}</p>
                  </div>
                </div>
                <div className="mt-2 px-1">
                  <p className="text-xl font-bold text-gray-900">
                    {item.price.toLocaleString()}
                    <span className="text-sm font-normal text-gray-500 ml-1">원</span>
                  </p>
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
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}