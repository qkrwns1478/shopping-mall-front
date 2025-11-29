'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Member } from '@/types/member';
import { useModal } from "@/context/ModalContext";

export default function MemberListPage() {
  const { showAlert, showConfirm } = useModal();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN'>('USER');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);

  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [pointAmount, setPointAmount] = useState('');

  useEffect(() => {
    api.get('/members/info').then(res => {
      if(res.data.authenticated) {
        setCurrentUserEmail(res.data.email);
      }
    }).catch(err => console.error(err));
  }, []);

  const fetchMembers = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/members/list?page=${pageNum}`);
      setMembers(response.data.content);
      setTotalPages(response.data.totalPages);
      setPage(response.data.number);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      showAlert('회원 목록을 불러오는데 실패했습니다.', "오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(0);
  }, []);

  const handleDelete = (member: Member) => {
    if (member.role === 'ADMIN') {
        showAlert("관리자 계정은 강제 탈퇴가 불가능합니다. 권한 변경 후 시도해 주세요.", "불가");
        return;
    }

    showConfirm('정말로 이 회원을 탈퇴시키겠습니까? 복구할 수 없습니다.', async () => {
      try {
        const response = await api.delete(`/admin/members/${member.id}`);
        if (response.data.success) {
          showAlert('회원이 탈퇴 처리되었습니다.');
          fetchMembers(page);
        } else {
          showAlert(response.data.message);
        }
      } catch (error: any) {
        showAlert(error.response?.data?.message || '삭제 중 오류가 발생했습니다.', "오류");
      }
    });
  };

  const openRoleModal = (member: Member) => {
    if (member.email === currentUserEmail) {
        showAlert("로그인한 계정의 권한 변경은 불가합니다. 다른 관리자 계정으로 로그인 후 시도해주세요.", "불가");
        return;
    }

    setSelectedMember(member);
    setNewRole(member.role);
    setVerificationCode('');
    setIsCodeSent(false);
    setIsModalOpen(true);
  };

  const sendVerificationCode = async () => {
    if (!selectedMember) return;

    try {
      const payload = {
        email: selectedMember.email,
        name: selectedMember.name,
        currentRole: selectedMember.role,
        newRole: newRole
      };

      const response = await api.post('/admin/members/role/send-verification', payload);
      
      if (response.data.success) {
        showAlert('관리자 이메일로 인증 코드가 발송되었습니다.');
        setIsCodeSent(true);
      } else {
        showAlert(response.data.message);
      }
    } catch (error: any) {
      showAlert(error.response?.data?.message || '코드 발송 실패', "오류");
    }
  };

  const handleSubmitRoleChange = async () => {
    if (!selectedMember || !verificationCode) return;

    try {
      const response = await api.post(`/admin/members/${selectedMember.id}/role`, {
        role: newRole,
        code: verificationCode
      });

      if (response.data.success) {
        showAlert('권한이 변경되었습니다.');
        setIsModalOpen(false);
        fetchMembers(page);
      } else {
        showAlert(response.data.message);
      }
    } catch (error: any) {
      showAlert(error.response?.data?.message || '권한 변경 실패', "오류");
    }
  };

  const openPointModal = (member: Member) => {
    setSelectedMember(member);
    setPointAmount('');
    setIsPointModalOpen(true);
  };

  const handlePointSubmit = async () => {
    if (!selectedMember) return;
    const amount = parseInt(pointAmount);
    
    if (isNaN(amount) || amount === 0) {
        showAlert("유효한 포인트 금액을 입력해주세요.");
        return;
    }

    try {
        const response = await api.post(`/admin/members/${selectedMember.id}/points`, {
            point: amount
        });

        if (response.data.success) {
            showAlert("포인트가 수정되었습니다.");
            setIsPointModalOpen(false);
            fetchMembers(page);
        } else {
            showAlert(response.data.message);
        }
    } catch (error: any) {
        showAlert(error.response?.data?.message || '포인트 수정 실패', "오류");
    }
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">회원 관리</h2>
      </div>

      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주소</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">권한</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">포인트</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={member.address}>
                  {member.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    member.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                    {member.points.toLocaleString()} P
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => openPointModal(member)}
                    className="text-green-600 hover:text-green-900 mr-4"
                  >
                    포인트 관리
                  </button>
                  <button 
                    onClick={() => openRoleModal(member)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    권한 변경
                  </button>
                  <button 
                    onClick={() => handleDelete(member)} 
                    className="text-red-600 hover:text-red-900"
                    // disabled={member.role === 'ADMIN'}
                  >
                    강제 탈퇴
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => fetchMembers(i)}
              className={`px-3 py-1 rounded ${
                page === i 
                  ? 'bg-primary text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* 권한 변경 모달 */}
      {isModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">권한 변경</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedMember.email}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">변경할 권한</label>
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'USER' | 'ADMIN')}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-xs text-yellow-700">
                  보안을 위해 현재 로그인된 관리자 계정의 이메일로 인증 코드가 발송됩니다.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="인증 코드 입력"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md p-2"
                  disabled={!isCodeSent}
                />
                <button
                  onClick={sendVerificationCode}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium whitespace-nowrap"
                >
                  {isCodeSent ? '코드 재발송' : '인증 코드 발송'}
                </button>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSubmitRoleChange}
                disabled={!isCodeSent || !verificationCode}
                className="px-4 py-2 text-white bg-primary rounded hover:bg-primary-dark disabled:bg-blue-300"
              >
                변경 확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 포인트 변경 모달 */}
      {isPointModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">포인트 관리</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedMember.name} ({selectedMember.email})</p>
            </div>
            <div className="p-6">
                <div className="mb-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">현재 보유 포인트</p>
                    <p className="text-2xl font-bold text-primary">{selectedMember.points.toLocaleString()} P</p>
                </div>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">지급/회수 금액</label>
                <input
                    type="number"
                    placeholder="예: 1000 (지급), -1000 (회수)"
                    value={pointAmount}
                    onChange={(e) => setPointAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                    * 양수 입력 시 포인트 지급, 음수 입력 시 포인트가 차감됩니다.
                </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsPointModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handlePointSubmit}
                className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}