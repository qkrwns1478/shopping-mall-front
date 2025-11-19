'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import api from '@/lib/api';

declare global {
  interface Window {
    daum: any;
  }
}

interface SignupFormInputs {
  email: string;
  verificationCode?: string;
  name: string;
  password: string;
  passwordConfirm: string;
  postcode: string;
  mainAddress: string;
  detailAddress: string;
  birthday?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { register, handleSubmit, watch, setValue, setError, clearErrors, formState: { errors } } = useForm<SignupFormInputs>();

  const [emailVerified, setEmailVerified] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [emailMsg, setEmailMsg] = useState({ text: '', type: '' }); // 'text-danger' | 'text-success'
  const [codeMsg, setCodeMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setEmailMsg({ text: '인증번호 유효시간이 만료되었습니다. 다시 시도해주세요.', type: 'text-danger' });
      setShowCodeInput(false);
      setIsSending(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  /* 인증번호 발송 핸들러 */
  const handleSendVerificationEmail = async () => {
    const email = watch('email');

    if (!email || !email.includes('@')) {
      setError('email', { type: 'manual', message: '올바른 이메일 형식이 아닙니다.' });
      return;
    }
    clearErrors('email');

    setIsSending(true);
    setEmailMsg({ text: '', type: '' });
    setEmailVerified(false);

    try {
      const formData = new FormData();
      formData.append('email', email);

      const response = await api.post('/members/send-verification-email', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const data = response.data;

      if (data.success) {
        setShowCodeInput(true);
        setTimeLeft(300); // 5분
        setTimerActive(true);
        setEmailMsg({ text: `인증번호가 발송되었습니다.`, type: 'text-success' });
      } else {
        setEmailMsg({ text: data.message, type: 'text-danger' });
        setIsSending(false);
      }
    } catch (error) {
      console.error(error);
      setEmailMsg({ text: '오류가 발생했습니다. 다시 시도해주세요.', type: 'text-danger' });
      setIsSending(false);
    }
  };

  /* 인증번호 확인 핸들러 */
  const handleVerifyCode = async () => {
    const email = watch('email');
    const code = watch('verificationCode');

    if (!code || code.length !== 6) {
      setCodeMsg({ text: '6자리 인증번호를 입력하세요.', type: 'text-danger' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('code', code);

      const response = await api.post('/members/verify-code', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const data = response.data;

      if (data.verified) {
        setTimerActive(false);
        setCodeMsg({ text: '이메일 인증에 성공했습니다.', type: 'text-success' });
        setEmailVerified(true);
        setEmailMsg({ text: '이메일 인증이 완료되었습니다.', type: 'text-success' });
      } else {
        setCodeMsg({ text: '인증번호가 일치하지 않습니다.', type: 'text-danger' });
      }
    } catch (error) {
      setCodeMsg({ text: '오류가 발생했습니다.', type: 'text-danger' });
    }
  };

  /* 주소 찾기 핸들러 */
  const handleAddressSearch = () => {
    if (!window.daum?.Postcode) {
      alert("주소 검색 서비스를 불러오지 못했습니다.");
      return;
    }
    
    new window.daum.Postcode({
      oncomplete: function(data: any) {
        // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분
        let addr = ''; // 주소 변수
        let extraAddr = ''; // 참고항목 변수

        if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
            addr = data.roadAddress;
        } else { // 사용자가 지번 주소를 선택했을 경우(J)
            addr = data.jibunAddress;
        }

        // 도로명 주소일 때 참고항목 조합
        if(data.userSelectedType === 'R'){
            if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                extraAddr += data.bname;
            }
            if(data.buildingName !== '' && data.apartment === 'Y'){
                extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            if(extraAddr !== ''){
                extraAddr = ' (' + extraAddr + ')';
            }
        }

        setValue('postcode', data.zonecode);
        setValue('mainAddress', addr + extraAddr);

        document.getElementById('detailAddress')?.focus();
      }
    }).open();
  };

  /* 회원가입 제출 핸들러 */
  const onSubmit = async (data: SignupFormInputs) => {
    if (!emailVerified) {
      setEmailMsg({ text: '이메일 인증을 완료해주세요.', type: 'text-danger' });
      document.getElementById('email')?.focus();
      return;
    }

    if (data.password !== data.passwordConfirm) {
      setError('passwordConfirm', { type: 'manual', message: '비밀번호가 일치하지 않습니다.' });
      return;
    }

    let fullAddress = '';
    if (data.postcode && data.mainAddress) {
        fullAddress = `(${data.postcode}) ${data.mainAddress}`;
        if (data.detailAddress) {
            fullAddress += `, ${data.detailAddress}`;
        }
    } else {
        setError('mainAddress', { type: 'manual', message: '주소를 입력해주세요.'});
        return;
    }

    try {
      const payload = {
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        name: data.name,
        address: fullAddress,
        birthday: data.birthday || null
      };

      const response = await api.post('/members/signup', payload);

      if (response.data.success) {
        alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
        router.push('/members/login');
      } else {
        alert(response.data.message || '회원가입에 실패했습니다.');
      }
    } catch (error: any) {
      console.error("Signup Error:", error);
      const errorMessage = error.response?.data?.message || '서버 오류가 발생했습니다.';
      alert(errorMessage);
    }
  };

  return (
    <>
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />
      
      <div className="container my-5">
        <div className="row justify-content-center">
            <div className="col-md-6">
                <h2 className="mb-4">회원가입</h2>

                <form id="signup-form" onSubmit={handleSubmit(onSubmit)}>
                    
                    {/* 이메일 */}
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">이메일</label>
                        <div className="input-group">
                            <input 
                                type="email" 
                                id="email" 
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                                autoComplete="email"
                                readOnly={emailVerified || (showCodeInput && timerActive)}
                                {...register('email', { required: '이메일은 필수 입력 값입니다.' })} 
                            />
                            <button 
                                className="btn btn-outline-secondary" 
                                type="button" 
                                id="btn-send-code"
                                onClick={handleSendVerificationEmail}
                                disabled={isSending || emailVerified}
                            >
                                {isSending && !showCodeInput ? '전송 중...' : '인증번호 발송'}
                            </button>
                        </div>

                        {/* 에러 메시지 및 상태 메시지 */}
                        {errors.email && <div className="form-text text-danger">{errors.email.message}</div>}
                        <div id="email-msg" className={`form-text ${emailMsg.type}`}>
                            {emailMsg.text} 
                            {timerActive && <span className="ms-1">({formatTime(timeLeft)})</span>}
                        </div>
                    </div>

                    {/* 인증번호 */}
                    {showCodeInput && !emailVerified && (
                        <div id="verification-code-group" className="mb-3">
                            <label htmlFor="verification-code" className="form-label">인증번호</label>
                            <div className="input-group">
                                <input 
                                    type="text" 
                                    id="verification-code" 
                                    className="form-control" 
                                    placeholder="6자리 숫자를 입력하세요"
                                    autoComplete="off"
                                    {...register('verificationCode')}
                                />
                                <button 
                                    className="btn btn-outline-secondary" 
                                    type="button" 
                                    id="btn-verify-code"
                                    onClick={handleVerifyCode}
                                >
                                    인증 확인
                                </button>
                            </div>
                            <div id="code-msg" className={`form-text ${codeMsg.type}`}>{codeMsg.text}</div>
                        </div>
                    )}

                    {/* 이름 */}
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">이름</label>
                        <input 
                            type="text" 
                            id="name" 
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            autoComplete="name" 
                            {...register('name', { required: '이름은 필수 입력 값입니다.' })}
                        />
                        {errors.name && <div className="form-text text-danger">{errors.name.message}</div>}
                    </div>

                    {/* 비밀번호 */}
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">비밀번호</label>
                        <input 
                            type="password" 
                            id="password" 
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            autoComplete="new-password" 
                            {...register('password', { 
                                required: '비밀번호는 필수 입력 값입니다.',
                                minLength: { value: 8, message: '비밀번호는 8자 이상 입력해주세요.' } 
                            })}
                        />
                        {errors.password && <div className="form-text text-danger">{errors.password.message}</div>}
                    </div>

                    {/* 비밀번호 확인 */}
                    <div className="mb-3">
                        <label htmlFor="passwordConfirm" className="form-label">비밀번호 확인</label>
                        <input 
                            type="password" 
                            id="passwordConfirm" 
                            className={`form-control ${errors.passwordConfirm ? 'is-invalid' : ''}`}
                            autoComplete="new-password" 
                            {...register('passwordConfirm', { required: '비밀번호 확인은 필수 입력 값입니다.' })}
                        />
                        {errors.passwordConfirm && <div className="form-text text-danger">{errors.passwordConfirm.message}</div>}
                    </div>

                    {/* 주소 */}
                    <div className="mb-3">
                        <label htmlFor="postcode" className="form-label">주소</label>
                        <div className="input-group">
                            <input 
                                type="text" 
                                id="postcode" 
                                className="form-control" 
                                placeholder="우편번호" 
                                readOnly 
                                autoComplete="postal-code"
                                {...register('postcode', { required: true })} 
                                onClick={handleAddressSearch}
                            />
                            <button 
                                className="btn btn-outline-secondary" 
                                type="button" 
                                id="btn-search-address"
                                onClick={handleAddressSearch}
                            >
                                우편번호 찾기
                            </button>
                        </div>
                        <input 
                            type="text" 
                            id="mainAddress" 
                            className="form-control mt-2" 
                            placeholder="주소" 
                            readOnly 
                            autoComplete="address-line1"
                            {...register('mainAddress', { required: true })} 
                            onClick={handleAddressSearch}
                        />
                        <input 
                            type="text" 
                            id="detailAddress" 
                            className="form-control mt-2" 
                            placeholder="상세주소" 
                            autoComplete="address-line2"
                            {...register('detailAddress')} 
                        />
                        {(errors.postcode || errors.mainAddress) && <div className="form-text text-danger">주소를 입력해주세요.</div>}
                    </div>

                    {/* 생년월일 */}
                    <div className="mb-3">
                        <label htmlFor="birthday" className="form-label">생년월일 (선택)</label>
                        <input 
                            type="date" 
                            id="birthday" 
                            className="form-control" 
                            autoComplete="off" 
                            {...register('birthday')}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">가입하기</button>
                </form>
            </div>
        </div>
      </div>
    </>
  );
}