'use client';

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useModal } from "@/context/ModalContext";

export default function CartPage() {
  const { cartItems, updateCartItemCount, removeFromCart, removeSelectedCartItems } = useCart();
  const { showAlert, showConfirm } = useModal();
  
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (cartItems.length > 0) {
        if (selectedIds.size === 0) {
            const allIds = cartItems.map(item => item.cartItemId!).filter(id => id !== undefined);
            setSelectedIds(new Set(allIds));
        }
    }
  }, [cartItems.length]);

  const handleCheck = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
        newSelected.delete(id);
    } else {
        newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleCheckAll = () => {
    if (selectedIds.size === cartItems.length) {
        setSelectedIds(new Set());
    } else {
        const allIds = cartItems.map(item => item.cartItemId!).filter(id => id !== undefined);
        setSelectedIds(new Set(allIds));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) {
        showAlert('삭제할 상품을 선택해주세요.');
        return;
    }
    showConfirm('선택한 상품을 삭제하시겠습니까?', async () => {
        await removeSelectedCartItems(Array.from(selectedIds));
        setSelectedIds(new Set());
    });
  };

  const handleQuantityChange = (id: number, current: number, delta: number) => {
    const newCount = current + delta;
    if (newCount < 1) return;
    updateCartItemCount(id, newCount);
  };

  const handleRemove = (id: number) => {
    showConfirm('이 상품을 삭제하시겠습니까?', () => {
        removeFromCart(id);
        const newSelected = new Set(selectedIds);
        newSelected.delete(id);
        setSelectedIds(newSelected);
    });
  };

  const selectedCartItems = cartItems.filter(item => item.cartItemId !== undefined && selectedIds.has(item.cartItemId));

  const productAmount = selectedCartItems.reduce((acc, item) => {
    const itemPrice = item.isDiscount 
      ? Math.floor(item.price * (1 - item.discountRate / 100)) 
      : item.price;
    return acc + (itemPrice + item.optionPrice) * item.count;
  }, 0);

  const totalDeliveryFee = selectedCartItems.reduce((acc, item) => acc + item.deliveryFee, 0);
  const totalAmount = productAmount + totalDeliveryFee;

  // TODO: 주문 및 결제 기능 구현해야 함
  const handleOrder = () => {
    if (selectedCartItems.length === 0) {
        showAlert("주문할 상품을 선택해주세요.");
        return;
    }
    showAlert('구매 기능은 준비 중입니다.');
  };

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
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 mb-2">
            <div className="flex items-center">
                <input 
                    type="checkbox" 
                    id="checkAll"
                    checked={cartItems.length > 0 && selectedIds.size === cartItems.length}
                    onChange={handleCheckAll}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                />
                <label htmlFor="checkAll" className="ml-3 text-sm font-bold text-gray-700 cursor-pointer select-none">
                    전체 선택 ({selectedIds.size}/{cartItems.length})
                </label>
            </div>
            <button 
                onClick={handleDeleteSelected}
                className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
            >
                선택 삭제
            </button>
          </div>

          {cartItems.map((item) => {
            const discountedPrice = item.isDiscount 
                ? Math.floor(item.price * (1 - item.discountRate / 100)) 
                : item.price;
            const isChecked = item.cartItemId !== undefined && selectedIds.has(item.cartItemId);

            return (
            <div key={item.cartItemId} className={`flex gap-4 p-4 bg-white border rounded-lg shadow-sm transition-colors ${isChecked ? 'border-primary/50 ring-1 ring-primary/20' : 'border-gray-200'}`}>
              {/* 개별 체크박스 */}
              <div className="flex items-center">
                <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={() => handleCheck(item.cartItemId!)}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                />
              </div>

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
                    <h3 className="text-lg font-bold text-gray-800 hover:text-primary hover:underline transition-colors cursor-pointer line-clamp-1">
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
                        <div className="inline-flex items-baseline gap-x-2">
                            <span className="text-base font-bold text-gray-900">
                                {(discountedPrice + item.optionPrice).toLocaleString()}원
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                                {(item.price + item.optionPrice).toLocaleString()}원
                            </span>
                            <span className="text-xs text-red-600 font-bold">
                                {item.discountRate}%↓
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
                
                <div className="flex items-center border border-gray-300 rounded bg-white h-8">
                  <button 
                    onClick={() => handleQuantityChange(item.cartItemId!, item.count, -1)}
                    className="px-2 h-full hover:bg-gray-100 text-gray-600 transition-colors"
                  >-</button>
                  <span className="px-2 text-sm font-medium w-8 text-center">{item.count}</span>
                  <button 
                    onClick={() => handleQuantityChange(item.cartItemId!, item.count, 1)}
                    className="px-2 h-full hover:bg-gray-100 text-gray-600 transition-colors"
                  >+</button>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* 결제 요약 */}
        <div className="w-full lg:w-80 h-fit bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-24">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
            주문 예상 금액 ({selectedIds.size}개)
          </h3>
          <div className="flex justify-between mb-2 text-gray-600">
            <span>총 상품 가격</span>
            <span>{productAmount.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between mb-4 text-gray-600">
            <span>총 배송비</span>
            <span>{totalDeliveryFee === 0 ? '0원' : `+${totalDeliveryFee.toLocaleString()}원`}</span>
          </div>

          <div className="flex justify-end mb-2 pt-4 border-t border-gray-300">
            <span className="font-bold text-xl text-primary">{totalAmount.toLocaleString()}원</span>
          </div>

          <button 
            onClick={handleOrder}
            className="w-full py-3 bg-primary text-white rounded font-bold hover:bg-primary-dark transition shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={selectedIds.size === 0}
          >
            {selectedIds.size > 0 ? `주문하기` : '상품을 선택해주세요'}
          </button>
        </div>
      </div>
    </div>
  );
}