'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { BsCartFill, BsList } from 'react-icons/bs';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import { useCart } from "@/context/CartContext";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const { cartCount } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await api.get('/members/info');
        
        if (response.data.authenticated) {
          setIsLoggedIn(true);
          setUserName(response.data.name);
          setUserRole(response.data.role);
        } else {
          setIsLoggedIn(false);
          setUserName('');
          setUserRole('');
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUserName('');
        setUserRole('');
      }
    };

    checkLoginStatus();
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsShopOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/members/logout');
      setIsLoggedIn(false);
      setUserName('');
      setUserRole('');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="MUNSIKSA Logo" 
                className="h-16 w-auto"
              />
            </Link>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-stone-500 hover:text-primary hover:bg-stone-100 focus:outline-none"
            >
              <BsList size={24} />
            </button>
          </div>

          {/* 데스크탑 메뉴 */}
          <div className="hidden lg:flex lg:items-center lg:space-x-10">
            <ul className="flex space-x-8 items-center text-sm font-medium text-stone-600">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              
              {/* Shop 드롭다운 */}
              <li className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsShopOpen(!isShopOpen)}
                  className="flex items-center hover:text-primary transition-colors focus:outline-none"
                >
                  Shop
                  <svg className={`ml-1 h-3 w-3 transition-transform ${isShopOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                
                {isShopOpen && (
                  <div className="absolute left-0 mt-3 w-48 rounded-sm shadow-xl bg-white border border-stone-100 z-50 py-2">
                    <Link href="#!" className="block px-5 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-secondary">All Products</Link>
                    <Link href="#!" className="block px-5 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-secondary">Popular Items</Link>
                    <Link href="#!" className="block px-5 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-secondary">New Arrivals</Link>
                  </div>
                )}
              </li>
            </ul>

            <ul className="flex items-center space-x-6">
              <li>
                <Link href="/cart" className="flex items-center text-stone-600 hover:text-primary transition relative">
                  <BsCartFill className="text-lg" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </li>
              <div className="h-4 w-px bg-stone-300"></div>

              {!isLoggedIn ? (
                <div className="flex items-center space-x-4 text-sm font-medium">
                  <li><Link href="/login" className="text-stone-500 hover:text-primary">로그인</Link></li>
                  <li>
                    <Link href="/signup" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition shadow-sm">
                      회원가입
                    </Link>
                  </li>
                </div>
              ) : (
                <div className="flex items-center space-x-4 text-sm">
                  {userName && <li className="text-stone-700"><span className="text-secondary font-bold">{userName}</span>님</li>}
                  {userRole === 'ADMIN' && <li><Link href="/admin" className="text-stone-500 hover:text-primary font-bold">관리자</Link></li>}
                  <li><Link href="/mypage" className="text-stone-500 hover:text-primary">마이페이지</Link></li>
                  <li>
                    <button onClick={handleLogout} className="text-stone-400 hover:text-stone-600 underline decoration-stone-300 underline-offset-4">
                      로그아웃
                    </button>
                  </li>
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-stone-200">
          <div className="px-4 pt-4 pb-6 space-y-2">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-stone-800 hover:bg-stone-50">Home</Link>
            
            <div>
              <button 
                onClick={() => setIsShopOpen(!isShopOpen)}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-stone-800 hover:bg-stone-50 flex justify-between items-center"
              >
                Shop
                <svg className={`h-4 w-4 transition-transform ${isShopOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isShopOpen && (
                <div className="pl-6 space-y-1 mt-1 border-l-2 border-stone-100 ml-3">
                  <Link href="#!" className="block px-3 py-2 text-sm font-medium text-stone-500 hover:text-secondary">All Products</Link>
                  <Link href="#!" className="block px-3 py-2 text-sm font-medium text-stone-500 hover:text-secondary">Popular Items</Link>
                  <Link href="#!" className="block px-3 py-2 text-sm font-medium text-stone-500 hover:text-secondary">New Arrivals</Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 pb-6 border-t border-stone-100 bg-stone-50">
            <div className="px-4 space-y-2">
                {!isLoggedIn ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/login" className="flex justify-center py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-700 bg-white hover:bg-stone-50">로그인</Link>
                    <Link href="/signup" className="flex justify-center py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-opacity-90">회원가입</Link>
                  </div>
                ) : (
                  <>
                    <div className="px-3 py-2 text-sm text-stone-600">
                      {userName && <span className="font-bold text-primary">{userName}</span>}님 환영합니다
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        {userRole === 'ADMIN' ? (
                        <Link href="/admin" className="flex justify-center py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-700 bg-white">관리자 홈</Link>
                        ) : (
                        <Link href="/mypage" className="flex justify-center py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-700 bg-white">마이페이지</Link>
                        )}
                        <button onClick={handleLogout} className="flex justify-center py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-500 bg-white">로그아웃</button>
                    </div>
                  </>
                )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}