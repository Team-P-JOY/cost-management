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
    },
    {
      key: "roleAccess",
      content: "การอนุญาติเข้าถึง",
      render: (item) => {
        const roleAccess = JSON.parse(item.roleAccess);
        if (!roleAccess) return null;

        return (
          <div className="flex flex-col gap-1">
            {navigation.map((navi, index) => {
              const role = roleAccess.find(
                (nav) => parseInt(nav) === parseInt(navi.id)
              );
              if (!role) return null;
              return (
                <div key={navi.id}>
                  <span className="text-sm flex gap-2">
                    <FiChevronsRight className="w-4 h-4 text-green-900" />
                    {navi.name}
                  </span>
                  {navi.child &&
                    navi.child.map((child, index2) => {
                      const roleChild = roleAccess.find(
                        (nav) => parseInt(nav) === parseInt(child.id)
                      );
                      if (!roleChild) return null;
                      return (
                        <span
                          className="text-xs flex gap-2 ms-4"
                          key={child.id}>
                          <FiCornerDownRight className="w-3 h-3 text-green-900" />
                          {child.name}
                        </span>
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
      width: "100",
      sort: false,
      render: (item) => {
        return (
          <span
            className={`px-2 py-1 text-sm font-medium rounded-full ${
              item.statusId === 1
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}>
            {item.statusId === 1 ? "ใช้งาน" : "ไม่ใช้งาน"}
          </span>
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
        <div className="flex gap-1">
          <button
            className="cursor-pointer p-2 text-white text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              return _onPressEdit(item.roleId);
            }}>
            <FiEdit className="w-4 h-4" />
            แก้ไข
          </button>
          <button
            className="cursor-pointer p-2 text-white text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="p-4 border-b border-gray-200  flex justify-between items-center">
          <div>
            <h3 className="font-semibold ">จัดการสิทธิการใช้งาน</h3>
          </div>
          <div className="flex gap-1">
            <button
              className="cursor-pointer p-2 text-white text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={_onPressAdd}>
              <FiPlus className="w-4 h-4" />
              เพิ่มใหม่
            </button>
          </div>
        </div>

        <div className="p-4 overflow-auto">
          {error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <TableList meta={meta} data={employees} loading={loading} />
          )}
        </div>
      </div>
    </Content>
  );
}
