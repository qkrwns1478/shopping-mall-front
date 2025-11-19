'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // TODO: 실제로는 로그인 성공 시 localStorage나 전역 상태를 업데이트해야 함
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/members/logout');
      setIsLoggedIn(false);
      alert('로그아웃 되었습니다.');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container px-4 px-lg-5">
        <Link className="navbar-brand" href="/">MUNSIKSA</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarSupportedContent" 
          aria-controls="navbarSupportedContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <Link className="nav-link active" aria-current="page" href="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="#!">About</Link>
            </li>
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                id="navbarDropdown" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                Shop
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li><Link className="dropdown-item" href="#!">All Products</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><Link className="dropdown-item" href="#!">Popular Items</Link></li>
                <li><Link className="dropdown-item" href="#!">New Arrivals</Link></li>
              </ul>
            </li>
          </ul>
          
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            <li className="nav-item">
              <a className="nav-link" href="#!">
                <i className="bi-cart-fill me-1"></i>
                Cart
                <span className="badge bg-dark text-white ms-1 rounded-pill">0</span>
              </a>
            </li>

            {!isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/members/login">로그인</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/members/signup">회원가입</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/members/mypage">마이페이지</Link>
                </li>
                <li className="nav-item">
                  <button 
                    onClick={handleLogout} 
                    className="btn nav-link" 
                    style={{ border: 'none', background: 'none', padding: '0.5rem 1rem' }}
                  >
                    로그아웃
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}