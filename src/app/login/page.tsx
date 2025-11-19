'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const [loginError, setLoginError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormInputs) => {
    setLoginError(null);

    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);

      const response = await api.post('/members/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.success) {
        window.location.href = '/'; 
      } else {
        setLoginError(response.data.message || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      if (error.response && error.response.data) {
        setLoginError(error.response.data.message || '이메일 또는 비밀번호를 확인해주세요.');
      } else {
        setLoginError('서버와 통신 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <>
      <div className="container my-5">
        <div className="row justify-content-center">
            <div className="col-md-5">
                <h2 className="mb-4">로그인</h2>

                <form onSubmit={handleSubmit(onSubmit)}>
                    
                    {/* 이메일 입력 */}
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">이메일</label>
                        <input 
                            type="email" 
                            id="email" 
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            autoComplete="email"
                            {...register('email', { required: '이메일을 입력해주세요.' })} 
                        />
                        {errors.email && <div className="form-text text-danger">{errors.email.message}</div>}
                    </div>

                    {/* 비밀번호 입력 */}
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">비밀번호</label>
                        <input 
                            type="password" 
                            id="password" 
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            autoComplete="current-password"
                            {...register('password', { required: '비밀번호를 입력해주세요.' })} 
                        />
                        {errors.password && <div className="form-text text-danger">{errors.password.message}</div>}
                    </div>

                    {/* 에러 메시지 */}
                    {loginError && (
                        <div className="alert alert-danger" role="alert">
                            <span>{loginError}</span>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary w-100">로그인</button>
                    
                    <div className="d-grid gap-2 mt-3">
                        <Link href="/members/signup" className="btn btn-outline-secondary">
                            회원가입
                        </Link>
                    </div>
                    
                    <div className="mt-3 text-center">
                        <Link href="/members/forgot-password" className="text-decoration-none small text-muted">
                            비밀번호를 잊으셨나요?
                        </Link>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </>
  );
}