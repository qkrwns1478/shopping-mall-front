'use client';

import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartPage() {
  const { cartItems, updateCartItemCount, removeFromCart } = useCart();

  const handleQuantityChange = (id: number, current: number, delta: number) => {
    const newCount = current + delta;
    if (newCount < 1) return;
    updateCartItemCount(id, newCount);
  };

  const handleRemove = (id: number) => {
    removeFromCart(id);
  };

  const productAmount = cartItems.reduce((acc, item) => {
    const itemPrice = item.isDiscount 
      ? Math.floor(item.price * (1 - item.discountRate / 100)) 
      : item.price;
    return acc + (itemPrice + item.optionPrice) * item.count;
  }, 0);
  const totalDeliveryFee = cartItems.reduce((acc, item) => acc + item.deliveryFee, 0);
  const totalAmount = productAmount + totalDeliveryFee;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">장바구니</h2>
        <p className="text-gray-500 mb-8">장바구니에 담긴 상품이 없습니다.</p>
        <Link href="/" className="px-6 py-3 bg-primary text-white rounded font-bold hover:bg-primary-dark transition">
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">장바구니</h2>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 장바구니 목록 */}
        <div className="flex-1 space-y-4">
          {cartItems.map((item) => {
            const discountedPrice = item.isDiscount 
                ? Math.floor(item.price * (1 - item.discountRate / 100)) 
                : item.price;

            return (
            <div key={item.cartItemId} className="flex gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="w-24 h-24 bg-gray-100 flex-shrink-0 rounded overflow-hidden">
                <Link href={`/item/${item.itemId}`}>
                    {item.imgUrl ? (
                    <img src={`http://localhost:8080${item.imgUrl}`} alt={item.itemNm} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                    )}
                </Link>
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/item/${item.itemId}`}>
                    <h3 className="text-lg font-bold text-gray-800 hover:text-primary hover:underline transition-colors cursor-pointer">
                        {item.itemNm}
                    </h3>
                  </Link>

                  <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                    {item.optionName && (
                      <p>옵션: {item.optionName} {item.optionPrice > 0 && `(+${item.optionPrice.toLocaleString()}원)`}</p>
                    )}
                    <p className="text-stone-400">
                      배송비: {item.deliveryFee === 0 ? '무료' : `${item.deliveryFee.toLocaleString()}원`}
                    </p>
                  </div>
                  
                  <div className="mt-2">
                    {item.isDiscount ? (
                        <div className="flex flex-wrap items-end gap-x-2">
                            <span className="text-sm text-gray-400 line-through">
                                {(item.price + item.optionPrice).toLocaleString()}원
                            </span>
                            <span className="text-base font-bold text-gray-900">
                                {(discountedPrice + item.optionPrice).toLocaleString()}원
                            </span>
                            <span className="text-xs text-red-600 font-bold bg-red-50 px-1 rounded">
                                {item.discountRate}% OFF
                            </span>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-600 font-medium">
                            {(item.price + item.optionPrice).toLocaleString()}원
                        </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button onClick={() => handleRemove(item.cartItemId!)} className="text-gray-400 hover:text-red-500 p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <div className="flex items-center border border-gray-300 rounded bg-white">
                  <button 
                    onClick={() => handleQuantityChange(item.cartItemId!, item.count, -1)}
                    className="px-2 py-1 hover:bg-gray-100 text-gray-600 transition-colors"
                  >-</button>
                  <span className="px-2 text-sm font-medium w-8 text-center">{item.count}</span>
                  <button 
                    onClick={() => handleQuantityChange(item.cartItemId!, item.count, 1)}
                    className="px-2 py-1 hover:bg-gray-100 text-gray-600 transition-colors"
                  >+</button>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* 결제 요약 */}
        <div className="w-full lg:w-80 h-fit bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-24">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">결제 예정 금액</h3>
          <div className="flex justify-between mb-2 text-gray-600">
            <span>총 상품 금액</span>
            <span>{productAmount.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between mb-4 text-gray-600">
            <span>총 배송비</span>
            <span>{totalDeliveryFee === 0 ? '0원' : `+${totalDeliveryFee.toLocaleString()}원`}</span>
          </div>
          <div className="flex justify-between mb-6 pt-4 border-t border-gray-300">
            <span className="font-bold text-lg">결제 금액</span>
            <span className="font-bold text-xl text-primary">{totalAmount.toLocaleString()}원</span>
          </div>
          <button className="w-full py-3 bg-primary text-white rounded font-bold hover:bg-primary-dark transition shadow-md">
            주문하기
          </button>
        </div>
      </div>
    </div>
  );
}