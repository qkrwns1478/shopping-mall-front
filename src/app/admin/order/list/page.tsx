"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { OrderHist } from "@/types/order";
import { useModal } from "@/context/ModalContext";

export default function AdminOrderListPage() {
  const { showAlert, showConfirm } = useModal();
  const [orders, setOrders] = useState<OrderHist[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/orders?page=${pageNum}`);
      setOrders(response.data.content);
      setTotalPages(response.data.totalPages);
      setPage(response.data.number);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      showAlert("주문 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(0);
  }, []);

  const handleCancelOrder = async (orderId: number) => {
    showConfirm("정말로 이 주문을 취소 처리하시겠습니까?", async () => {
      try {
        const response = await api.post(`/api/admin/orders/${orderId}/cancel`);
        if (response.data.success) {
          showAlert(
            "해당 주문의 상태를 취소로 변경했습니다. 포트원 관리자 채널에서 주문 취소를 진행해주세요.",
            "주문 취소 완료"
          );
          fetchOrders(page);
        } else {
          showAlert(response.data.message);
        }
      } catch (error: any) {
        showAlert(error.response?.data?.message || "주문 취소 중 오류가 발생했습니다.");
      }
    });
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">주문 관리</h2>
      </div>

      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주문번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                회원
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주문일자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주문내역
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                결제금액
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  주문 내역이 없습니다.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.orderId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.memberEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.orderDate}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.orderItemDtoList[0]?.itemNm}
                    {order.orderItemDtoList.length > 1 &&
                      ` 외 ${order.orderItemDtoList.length - 1}건`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.orderStatus === "ORDER"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.orderStatus === "ORDER" ? "주문완료" : "취소됨"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                    {order.totalAmount.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {order.orderStatus === "ORDER" && (
                      <button
                        onClick={() => handleCancelOrder(order.orderId)}
                        className="text-red-600 hover:text-red-900 font-bold border border-red-200 bg-red-50 px-3 py-1 rounded hover:bg-red-100 transition"
                      >
                        취소
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => fetchOrders(i)}
              className={`px-3 py-1 rounded ${
                page === i
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
