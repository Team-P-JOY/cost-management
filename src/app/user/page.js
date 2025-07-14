"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import Content from "@/components/Content";
import TableList from "@/components/TableList";
import axios from "axios";
import { confirmDialog, toastDialog } from "@/lib/stdLib";

export default function List() {
  const breadcrumb = [{ name: "กำหนดผู้รับผิดชอบ", link: "/user" }];
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState(null);
  const _onPressAdd = () => {
    router.push("/user/new");
  };
  const _onPressEdit = (id) => {
    router.push(`/user/${id}`);
  };
  const _onPressDelete = async (id) => {
    const result = await confirmDialog("ยืนยันการลบข้อมูล ?", "");

    if (result.isConfirmed) {
      await axios.delete(`/api/user?id=${id}`);
      await toastDialog("ลบข้อมูลเรียบร้อย!", "success");
      setReload(reload + 1);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`/api/user`);
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
      key: "fullname",
      content: "ชื่อ",
      render: (item) => {
        const avatar =
          "https://hrms.wu.ac.th/index.php?r=image&id=" + item.personId;
        return (
          <div className="flex min-w-0 gap-x-4">
            <img
              alt=""
              src={avatar}
              width={48}
              height={48}
              className="size-12 flex-none rounded-full bg-gray-50"
            />
            <div className="min-w-0 flex-auto">
              <p className="font-semibold">{item.fullname}</p>
              <p className="mt-1 truncate text-xs/5 text-gray-500">
                {item.positionThName}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "roleName",
      content: "สิทธิ์การใช้งาน",
      render: (item) => {
        return (
          <div className="min-w-0 flex-auto">
            <p className="font-semibold">{item.roleName}</p>
            <p className="mt-1 truncate text-xs/5 text-gray-500">
              {item.labgroupName}
            </p>
          </div>
        );
      },
    },
    {
      key: "statusId",
      content: "สถานะ",
      width: "100",
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
      key: "personId",
      content: "Action",
      width: "100",
      sort: false, // ไม่ต้องเรียงข้อมูล
      export: false, // ไม่ต้อง export ข้อมูล
      render: (item) => (
        <div className="flex gap-1">
          <button
            className="cursor-pointer p-2 text-white text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              return _onPressEdit(item.userId);
            }}>
            <FiEdit className="w-4 h-4" />
            แก้ไข
          </button>
          <button
            className="cursor-pointer p-2 text-white text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              return _onPressDelete(item.userId);
            }}>
            <FiTrash2 className="w-4 h-4" />
            ลบ
          </button>
        </div>
      ),
    },
  ];

  return (
    <Content breadcrumb={breadcrumb} title="กำหนดผู้รับผิดชอบ">
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="p-4 border-b border-gray-200  flex justify-between items-center">
          <div>
            <h3 className="font-semibold">กำหนดผู้รับผิดชอบ</h3>
          </div>
          <div className="flex gap-1">
            <button
              className="cursor-pointer p-2 text-white text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
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
            <TableList
              meta={meta}
              data={employees}
              loading={loading}
              exports={false}
            />
            // <TableList meta={meta} data={employees} loading={loading}  />
          )}
        </div>
      </div>
    </Content>
  );
}
