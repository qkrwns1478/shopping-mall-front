"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useCart } from "@/context/CartContext";

interface LoginFormInputs {
  email: string;
  password: string;
}

function LoginContent() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { mergeLocalCartToDb } = useCart();

  const router = useRouter();
  const searchParams = useSearchParams();

  const onSubmit = async (data: LoginFormInputs) => {
    setLoginError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const response = await api.post("/members/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (response.data.success) {
        await mergeLocalCartToDb();
        const redirectUrl = searchParams.get("redirect");
        if (redirectUrl) {
          router.replace(redirectUrl);
        } else {
          window.location.href = "/";
        }
      } else {
        setLoginError(response.data.message || "로그인에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.response && error.response.data) {
        setLoginError(error.response.data.message || "이메일 또는 비밀번호를 확인해주세요.");
      } else {
        setLoginError("서버와 통신 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 bg-white border border-stone-200 text-stone-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder-stone-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 lg:p-0">
      <div className="w-full h-full flex flex-col lg:flex-row shadow-2xl overflow-hidden bg-white min-h-screen max-w-[1920px] mx-auto">
        <div className="hidden lg:flex w-1/2 bg-[#fdfbf7] relative items-center justify-center p-12 overflow-hidden border-r border-stone-100">
          <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply"></div>

          <div className="absolute -top-24 -left-24 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 text-center max-w-lg"
          >
            <div className="mb-10 flex justify-center">
              <img src="/logo.png" alt="MUNSIKSA" className="h-32 w-auto drop-shadow-sm" />
            </div>
            <h1 className="text-4xl font-bold mb-6 text-primary tracking-tight">
              Traditional Beauty,
              <br />
              <span className="text-secondary italic">Modern Lifestyle</span>
            </h1>
            <p className="text-stone-600 text-lg font-light leading-relaxed">
              MUNSIKSA와 함께
              <br />
              당신만의 고유한 취향을 발견해보세요.
            </p>
          </motion.div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md space-y-8 relative z-10"
          >
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-stone-500">계정에 로그인하여 서비스를 이용하세요.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
                    이메일
                  </label>
                  <input
                    type="email"
                    id="email"
                    className={`${inputClass} ${errors.email ? "border-red-500 ring-red-100" : ""}`}
                    placeholder="email@example.com"
                    {...register("email", { required: "이메일을 입력해주세요." })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="password" className="text-sm font-medium text-stone-700">
                      비밀번호
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-secondary hover:text-[#8d6945] transition-colors"
                    >
                      비밀번호를 잊으셨나요?
                    </Link>
                  </div>
                  <input
                    type="password"
                    id="password"
                    className={`${inputClass} ${
                      errors.password ? "border-red-500 ring-red-100" : ""
                    }`}
                    placeholder="••••••••"
                    {...register("password", { required: "비밀번호를 입력해주세요." })}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500 font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              {loginError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3"
                >
                  <svg
                    className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-red-600 font-medium">{loginError}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-[0.98]"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "로그인"
                )}
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-stone-500">계정이 없으신가요?</span>
                </div>
              </div>

              <Link
                href="/signup"
                className="w-full flex justify-center py-3.5 px-4 border border-stone-300 rounded-lg shadow-sm text-sm font-bold text-stone-700 bg-white hover:bg-stone-50 transition-colors duration-200"
              >
                회원가입 하기
              </Link>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-stone-100">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
