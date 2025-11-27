'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import api from '@/lib/api';
import { useModal } from "@/context/ModalContext";

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
  const { showAlert } = useModal();
  const { register, handleSubmit, watch, setValue, setError, clearErrors, formState: { errors } } = useForm<SignupFormInputs>();

  const [emailVerified, setEmailVerified] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [emailMsg, setEmailMsg] = useState({ text: '', type: '' });
  const [codeMsg, setCodeMsg] = useState({ text: '', type: '' });

  /* 타이머 로직 */
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setEmailMsg({ text: '인증번호 유효시간이 만료되었습니다. 다시 시도해주세요.', type: 'text-red-500' });
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
        setTimeLeft(300);
        setTimerActive(true);
        setEmailMsg({ text: `인증번호가 발송되었습니다.`, type: 'text-secondary' }); // secondary color 사용
      } else {
        setEmailMsg({ text: data.message, type: 'text-red-500' });
        setIsSending(false);
      }
    } catch (error) {
      console.error(error);
      setEmailMsg({ text: '오류가 발생했습니다. 다시 시도해주세요.', type: 'text-red-500' });
      setIsSending(false);
    }
  };

  /* 인증번호 확인 핸들러 */
  const handleVerifyCode = async () => {
    const email = watch('email');
    const code = watch('verificationCode');

    if (!code || code.length !== 6) {
      setCodeMsg({ text: '6자리 인증번호를 입력하세요.', type: 'text-red-500' });
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
        setCodeMsg({ text: '이메일 인증에 성공했습니다.', type: 'text-green-600' });
        setEmailVerified(true);
        setEmailMsg({ text: '이메일 인증이 완료되었습니다.', type: 'text-green-600' });
      } else {
        setCodeMsg({ text: '인증번호가 일치하지 않습니다.', type: 'text-red-500' });
      }
    } catch (error) {
      setCodeMsg({ text: '오류가 발생했습니다.', type: 'text-red-500' });
    }
  };

  /* 주소 찾기 핸들러 */
  const handleAddressSearch = () => {
    if (!window.daum?.Postcode) {
      showAlert("주소 검색 서비스를 불러오지 못했습니다.", "오류");
      return;
    }
    
    new window.daum.Postcode({
      oncomplete: function(data: any) {
        let addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
        let extraAddr = '';

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
      setEmailMsg({ text: '이메일 인증을 완료해주세요.', type: 'text-red-500' });
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
        router.push('/signup-success');
      } else {
        showAlert(response.data.message || '회원가입에 실패했습니다.', "가입 실패");
      }
    } catch (error: any) {
      console.error("Signup Error:", error);
      const errorMessage = error.response?.data?.message || '서버 오류가 발생했습니다.';
      showAlert(errorMessage, "오류");
    }
  };

  const inputClass = "w-full px-4 py-3 text-stone-700 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 ease-in-out placeholder-stone-400";
  const errorInputClass = "border-red-500 focus:ring-red-200 focus:border-red-500";
  const buttonSecondaryClass = "px-4 py-3 font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-200 transition duration-200 ease-in-out whitespace-nowrap shadow-sm";

  return (
    <div className="container mx-auto px-4 py-16">
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />
      
      <div className="flex justify-center">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-primary mb-2">회원가입</h2>
            <p className="text-stone-500 text-sm">MUNSIKSA의 회원이 되어 다양한 혜택을 누리세요.</p>
          </div>

          <div className="bg-white shadow-xl rounded-xl p-8 sm:p-10 border border-stone-100">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* 이메일 */}
                <div>
                    <label htmlFor="email" className="block mb-1.5 text-sm font-semibold text-stone-700">이메일</label>
                    <div className="flex gap-2">
                        <input 
                            type="email" 
                            id="email" 
                            className={`${inputClass} ${errors.email ? errorInputClass : ''}`}
                            autoComplete="username"
                            readOnly={emailVerified || (showCodeInput && timerActive)}
                            placeholder="email@example.com"
                            {...register('email', { required: '이메일은 필수 입력 값입니다.' })} 
                        />
                        <button 
                            className={buttonSecondaryClass}
                            type="button" 
                            id="btn-send-code"
                            onClick={handleSendVerificationEmail}
                            disabled={isSending || emailVerified}
                        >
                            {isSending && !showCodeInput ? '전송 중...' : '인증 요청'}
                        </button>
                    </div>

                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    <p className={`mt-1 text-xs ${emailMsg.type}`}>
                        {emailMsg.text} 
                        {timerActive && <span className="ml-1 font-medium">({formatTime(timeLeft)})</span>}
                    </p>
                </div>

                {/* 인증번호 */}
                {showCodeInput && !emailVerified && (
                    <div className="p-5 bg-stone-50 rounded-lg border border-stone-100">
                        <label htmlFor="verification-code" className="block mb-1.5 text-sm font-semibold text-stone-700">인증번호</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                id="verification-code" 
                                className={`${inputClass} bg-white border-stone-300`}
                                placeholder="6자리 숫자"
                                autoComplete="off"
                                {...register('verificationCode')}
                            />
                            <button 
                                className={`${buttonSecondaryClass} bg-secondary border-secondary hover:bg-[#8d6945]`}
                                type="button" 
                                id="btn-verify-code"
                                onClick={handleVerifyCode}
                            >
                                확인
                            </button>
                        </div>
                        <p className={`mt-1 text-xs ${codeMsg.type}`}>{codeMsg.text}</p>
                    </div>
                )}

                {/* 이름 */}
                <div>
                    <label htmlFor="name" className="block mb-1.5 text-sm font-semibold text-stone-700">이름</label>
                    <input 
                        type="text" 
                        id="name" 
                        className={`${inputClass} ${errors.name ? errorInputClass : ''}`}
                        autoComplete="name" 
                        {...register('name', { required: '이름은 필수 입력 값입니다.' })}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>

                {/* 비밀번호 */}
                <div>
                    <label htmlFor="password" className="block mb-1.5 text-sm font-semibold text-stone-700">비밀번호</label>
                    <input 
                        type="password" 
                        id="password" 
                        className={`${inputClass} ${errors.password ? errorInputClass : ''}`}
                        autoComplete="new-password" 
                        placeholder="8자 이상 입력해주세요"
                        {...register('password', { 
                            required: '비밀번호는 필수 입력 값입니다.',
                            minLength: { value: 8, message: '비밀번호는 8자 이상 입력해주세요.' } 
                        })}
                    />
                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                </div>

                {/* 비밀번호 확인 */}
                <div>
                    <label htmlFor="passwordConfirm" className="block mb-1.5 text-sm font-semibold text-stone-700">비밀번호 확인</label>
                    <input 
                        type="password" 
                        id="passwordConfirm" 
                        className={`${inputClass} ${errors.passwordConfirm ? errorInputClass : ''}`}
                        autoComplete="new-password" 
                        {...register('passwordConfirm', { required: '비밀번호 확인은 필수 입력 값입니다.' })}
                    />
                    {errors.passwordConfirm && <p className="mt-1 text-xs text-red-500">{errors.passwordConfirm.message}</p>}
                </div>

                {/* 주소 */}
                <div>
                    <label htmlFor="postcode" className="block mb-1.5 text-sm font-semibold text-stone-700">주소</label>
                    <div className="flex gap-2 mb-2">
                        <input 
                            type="text" 
                            id="postcode" 
                            className={`${inputClass} bg-stone-100 cursor-default`}
                            placeholder="우편번호" 
                            readOnly 
                            autoComplete="postal-code"
                            {...register('postcode', { required: true })} 
                            onClick={handleAddressSearch}
                        />
                        <button 
                            className={buttonSecondaryClass}
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
                        className={`${inputClass} bg-stone-100 mb-2 cursor-default`}
                        placeholder="기본 주소" 
                        readOnly 
                        autoComplete="address-line1"
                        {...register('mainAddress', { required: true })} 
                        onClick={handleAddressSearch}
                    />
                    <input 
                        type="text" 
                        id="detailAddress" 
                        className={inputClass}
                        placeholder="상세 주소" 
                        autoComplete="address-line2"
                        {...register('detailAddress')} 
                    />
                    {(errors.postcode || errors.mainAddress) && <p className="mt-1 text-xs text-red-500">주소를 입력해주세요.</p>}
                </div>

                {/* 생년월일 */}
                <div>
                    <label htmlFor="birthday" className="block mb-1.5 text-sm font-semibold text-stone-700">생년월일 (선택)</label>
                    <input 
                        type="date" 
                        id="birthday" 
                        className={inputClass}
                        autoComplete="bday"
                        {...register('birthday')}
                    />
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        className="w-full px-4 py-3.5 font-bold text-white bg-primary rounded-md shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-200"
                    >
                        가입하기
                    </button>
                </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}