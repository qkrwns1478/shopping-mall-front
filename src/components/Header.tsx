'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { BsCartFill, BsList } from 'react-icons/bs';
import api from '@/lib/api';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

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
          setUserRole('');
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUserRole('');
      }
    };

    checkLoginStatus();
  }, []);

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
    <nav className="bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-800 hover:text-gray-600">
              MUNSIKSA
            </Link>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-200 focus:outline-none"
            >
              <BsList size={24} />
            </button>
          </div>

          {/* 데스크탑 메뉴 */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            <ul className="flex space-x-6 items-center">
              <li><Link href="/" className="text-gray-900 font-semibold hover:text-gray-700">Home</Link></li>
              
              {/* Shop 드롭다운 */}
              <li className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsShopOpen(!isShopOpen)}
                  className="flex items-center text-gray-500 hover:text-gray-900 focus:outline-none"
                >
                  Shop
                  <svg className={`ml-1 h-4 w-4 transition-transform ${isShopOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                
                {isShopOpen && (
                  <div className="absolute left-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu">
                      <Link href="#!" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">All Products</Link>
                      <hr className="border-gray-200 my-1" />
                      <Link href="#!" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Popular Items</Link>
                      <Link href="#!" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">New Arrivals</Link>
                    </div>
                  </div>
                )}
              </li>
            </ul>

            <ul className="flex items-center space-x-4">
              <li>
                <Link href="#!" className="flex items-center px-4 py-2 border border-gray-800 rounded-md text-gray-800 hover:bg-gray-800 hover:text-white transition">
                  <BsCartFill className="mr-2" />
                  Cart
                  <span className="ml-2 bg-gray-800 text-white text-xs font-bold px-2 py-0.5 rounded-full group-hover:bg-white group-hover:text-gray-800">0</span>
                </Link>
              </li>

              {!isLoggedIn ? (
                <>
                  <li><Link href="/login" className="text-gray-500 hover:text-gray-900">로그인</Link></li>
                  <li><Link href="/signup" className="text-gray-500 hover:text-gray-900">회원가입</Link></li>
                </>
              ) : (
                <>
                  {userName && <li className="text-sm text-gray-700 font-medium">{userName}님</li>}
                  {userRole === 'ADMIN' ? (
                    <li><Link href="/admin" className="text-gray-500 hover:text-gray-900 font-bold text-blue-600">관리자</Link></li>
                  ) : (
                    <li><Link href="/mypage" className="text-gray-500 hover:text-gray-900">마이페이지</Link></li>
                  )}
                  <li>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-gray-900">
                      로그아웃
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 bg-gray-50">Home</Link>
            
            {/* 모바일 Shop 드롭다운 */}
            <div>
              <button 
                onClick={() => setIsShopOpen(!isShopOpen)}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 flex justify-between items-center"
              >
                Shop
                <svg className={`h-4 w-4 transition-transform ${isShopOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isShopOpen && (
                <div className="pl-6 space-y-1">
                  <Link href="#!" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50">All Products</Link>
                  <Link href="#!" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50">Popular Items</Link>
                  <Link href="#!" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50">New Arrivals</Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 pb-4 border-t border-gray-200">
            <div className="px-2 space-y-1">
                <Link href="#!" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100">
                  <BsCartFill className="mr-2" /> Cart <span className="ml-2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full">0</span>
                </Link>
                {!isLoggedIn ? (
                  <>
                    <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50">로그인</Link>
                    <Link href="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50">회원가입</Link>
                  </>
                ) : (
                  <>
                    {userName && <span className="block px-3 py-2 text-sm font-bold text-gray-700">{userName}님 환영합니다</span>}
                    {userRole === 'ADMIN' ? (
                      <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-gray-50">관리자 대시보드</Link>
                    ) : (
                      <Link href="/mypage" className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50">마이페이지</Link>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50">로그아웃</button>
                  </>
                )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}