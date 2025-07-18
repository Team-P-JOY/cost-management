"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiChevronsRight,
  FiCornerDownRight,
} from "react-icons/fi";
import { Shield, Users, Settings, CheckCircle, XCircle } from "lucide-react";
import Content from "@/components/Content";
import TableList from "@/components/TableList";
import axios from "axios";
import { navigation } from "@/lib/params";
import { confirmDialog, toastDialog } from "@/lib/stdLib";

export default function List() {
  const breadcrumb = [{ name: "จัดการสิทธิการใช้งาน", link: "/user-role" }];
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const _onPressAdd = () => {
    router.push("/user-role/new");
  };
  const _onPressEdit = (id) => {
    router.push(`/user-role/${id}`);
  };
  const _onPressDelete = async (id) => {
    const result = await confirmDialog("ยืนยันการลบข้อมูล ?", "");

    if (result.isConfirmed) {
      await axios.delete(`/api/user-role?id=${id}`);
      await toastDialog("ลบข้อมูลเรียบร้อย!", "success");
      setReload(reload + 1);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`/api/user-role`);
        const data = response.data;
        if (data.success) {
          setEmployees(data.data);
        } else {
          setError("ไม่สามารถโหลดข้อมูลพนักงานได้");
        }
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [reload]);

  const meta = [
    {
      key: "roleName",
      content: "ชื่อสิทธิการใช้งาน",
      width: "200",
      render: (item) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {item.roleName}
          </div>
        </div>
      ),
    },
    {
      key: "roleAccess",
      content: "การอนุญาติเข้าถึง",
      render: (item) => {
        const roleAccess = JSON.parse(item.roleAccess);
        if (!roleAccess) return null;

        return (
          <div className="flex flex-col gap-2">
            {navigation.map((navi, index) => {
              const role = roleAccess.find(
                (nav) => parseInt(nav) === parseInt(navi.id)
              );
              if (!role) return null;
              return (
                <div
                  key={`nav-${navi.id}`}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    <div className="p-1 bg-green-100 dark:bg-green-900 rounded-md">
                      <FiChevronsRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    {navi.name}
                  </div>
                  {navi.child &&
                    navi.child.map((child, index2) => {
                      const roleChild = roleAccess.find(
                        (nav) => parseInt(nav) === parseInt(child.id)
                      );
                      if (!roleChild) return null;
                      return (
                        <div
                          className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 ml-6 mt-1 p-1 bg-white dark:bg-gray-800 rounded-md border-l-2 border-green-200 dark:border-green-700"
                          key={`child-${navi.id}-${child.id}`}>
                          <FiCornerDownRight className="w-3 h-3 text-green-500" />
                          {child.name}
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        );
        // return (
        //   <div className="flex flex-col gap-1">
        //     {JSON.parse(item.roleAccess)?.map((access, index) => {
        //       const navi = navigation.find(
        //         (nav) => nav.id === parseInt(access)
        //       );

        //       if (!navi) return null;
        //       return (
        //         <span key={index} className="text-sm flex gap-2">
        //           <FiCheckCircle className="w-4 h-4 text-green-900" />
        //           {navi.name}
        //         </span>
        //       );
        //     })}
        //   </div>
        // );
      },
    },
    {
      key: "statusId",
      content: "สถานะ",
      width: "150",
      sort: false,
      render: (item) => {
        return (
          <div className="flex justify-center">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-2 ${
                item.statusId === 1
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
              }`}>
              {item.statusId === 1 ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {item.statusId === 1 ? "ใช้งาน" : "ไม่ใช้งาน"}
            </span>
          </div>
        );
      },
    },
    {
      key: "roleId",
      content: "Action",
      width: "100",
      sort: false,
      export: false,
      render: (item) => (
        <div className="flex gap-2 justify-center">
          <button
            className="cursor-pointer px-3 py-2 text-white text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105"
            onClick={() => {
              return _onPressEdit(item.roleId);
            }}>
            <FiEdit className="w-4 h-4" />
            แก้ไข
          </button>
          <button
            className="cursor-pointer px-3 py-2 text-white text-sm bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105"
            onClick={() => {
              return _onPressDelete(item.roleId);
            }}>
            <FiTrash2 className="w-4 h-4" />
            ลบ
          </button>
        </div>
      ),
    },
  ];

  return (
    <Content breadcrumb={breadcrumb} title="จัดการสิทธิการใช้งาน">
      {/* Header Section */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  จัดการสิทธิการใช้งาน
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  กำหนดสิทธิ์การเข้าถึงระบบสำหรับผู้ใช้งาน
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200/50 dark:border-gray-600/50 shadow-md">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {employees.length} สิทธิ์
                  </span>
                </div>
              </div>
              <button
                className="cursor-pointer px-4 py-2 text-white text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={_onPressAdd}>
                <FiPlus className="w-4 h-4" />
                เพิ่มใหม่
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              รายการสิทธิการใช้งาน
            </h2>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden p-2">
            {error ? (
              <div className="text-center py-12">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 text-lg font-medium">{error}</p>
              </div>
            ) : (
              <TableList meta={meta} data={employees} loading={loading} />
            )}
          </div>
        </div>
      </div>
    </Content>
  );
}
