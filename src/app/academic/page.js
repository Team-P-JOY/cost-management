"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import Content from "@/components/Content";
import TableList from "@/components/TableList";
import axios from "axios";
import Swal from "sweetalert2";
import Link from "next/link";
import { confirmDialog, toastDialog } from "@/lib/stdLib";

export default function List() {
  const breadcrumb = [{ name: "กำหนดปีการศึกษา", link: "/academic" }];
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState(null);
  const _onPressAdd = () => {
    router.push("/academic/new");
  };
  const _onPressEdit = (id) => {
    router.push(`/academic/${id}`);
  };

  const _onChangeStatus = async (id, status) => {
    try {
      await axios.put(`/api/academic/select-academic?id=${id}`, { status });
      await toastDialog("เลือกภาคเรียนตั้งต้นเรียบร้อย!", "success");
      setReload(reload + 1);
    } catch (error) {
      console.error("Error saving data:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const _onPressDelete = async (id) => {
    const result = await confirmDialog("ยืนยันการลบข้อมูล ?", "");

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/academic?id=${id}`);
        await toastDialog("ลบข้อมูลเรียบร้อย!", "success");
        setReload(reload + 1);
      } catch (error) {
        console.error("Error deleting brand:", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`/api/academic`);
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
      key: "acadyear",
      content: "ปีการศึกษา",
      render: (item) => {
        return (
          <div
            className={`flex justify-center items-center ${
              item.status === 1 ? "text-green-500" : ""
            }`}>
            <span className="px-2 py-1 text-sm font-medium rounded-full">
              {item.acadyear}
            </span>
          </div>
        );
      },
    },
    {
      key: "semester",
      content: "ภาคเรียน",

      render: (item) => {
        return (
          <div
            className={`flex justify-center items-center ${
              item.status === 1 ? "text-green-500" : ""
            }`}>
            <span className="px-2 py-1 text-sm font-medium rounded-full">
              ภาคเรียนที่ {item.semester}
            </span>
          </div>
        );
      },
    },

    {
      key: "status",
      content: "ภาคเรียนตั้งต้น",
      width: "170", // แก้จาก "170" (string) เป็น 170 (number)
      align: "center", // ถ้าใช้ Ant Design Table
      render: (item) => {
        const enabled = item.status === 1;
        return (
          <div className="flex justify-center items-center">
            <button
              onClick={() => _onChangeStatus(item.schId, enabled ? "0" : "1")}
              className={`relative w-12 h-6 flex items-center rounded-full transition ${
                enabled ? "bg-green-500" : "bg-gray-300"
              }`}>
              <div
                className={`absolute left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        );
      },
    },

    {
      key: "schId",
      content: "Action",
      width: "100",
      sort: false,
      export: false,
      render: (item) => (
        <div className="flex gap-1">
          <button
            className="cursor-pointer p-2 text-white text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              return _onPressEdit(item.schId);
            }}>
            <FiEdit className="w-4 h-4" />
            แก้ไข
          </button>
          <button
            className="cursor-pointer p-2 text-white text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              return _onPressDelete(item.schId);
            }}>
            <FiTrash2 className="w-4 h-4" />
            ลบ
          </button>
        </div>
      ),
    },
  ];

  return (
    <Content breadcrumb={breadcrumb} title="ปีการศึกษา">
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="p-4 border-b border-gray-200  flex justify-between items-center">
          <div>
            <h3 className="font-semibold ">กำหนดปีการศึกษา</h3>
          </div>
          <div className="flex gap-1 ml-auto">
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
            <TableList meta={meta} data={employees} loading={loading} />
          )}
        </div>
      </div>
    </Content>
  );
}
