"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiPlus, FiEdit, FiTrash2, FiCheckCircle } from "react-icons/fi";
import Content from "@/components/Content";
import TableList from "@/components/TableList";
import axios from "axios";
import { navigation } from "@/lib/params";
import { confirmDialog, toastDialog } from "@/lib/stdLib";

export default function List() {
  const searchParams = useSearchParams();
  const breadcrumb = [
    { name: "แผนการให้บริการห้องปฎิบัติการ" },
    { name: "กำหนดรายวิชา", link: "/assign-course" },
  ];
  const router = useRouter();
  const [data, setData] = useState({ data: [], semester: [] });
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schId, setSchId] = useState(searchParams.get("schId") || "");

  const _onPressAdd = () => {
    router.push("/assign-course/create?schId=" + schId);
  };
  const _onPressEdit = (id) => {
    router.push(`/assign-course/${id}`);
  };
  const _onPressDelete = async (id) => {
    const result = await confirmDialog("ยืนยันการลบข้อมูล ?", "");

    if (result.isConfirmed) {
      await axios.delete(`/api/assign-course?id=${id}`);
      await toastDialog("ลบข้อมูลเรียบร้อย!", "success");
      setReload(reload + 1);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let schselect = schId;
        if (schId === "") {
          const schyearRes = await axios.get(`/api/schyear`);
          const schyear = schyearRes.data;
          if (schyear.success) {
            setSchId(schyear.data);
            schselect = schyear.data;
          }
        }

        const response = await axios.get(`/api/assign-course`, {
          params: { schId: schselect },
        });
        const data = response.data;
        if (data.success) {
          setData({ data: data.data, semester: data.semester });
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
  }, [reload, schId]);

  const meta = [
    {
      key: "acadyear",
      content: "ปีการศึกษา",
      width: "100",
      render: (item) => (
        <div>
          {item.semester}/{item.acadyear}
        </div>
      ),
    },
    {
      key: "coursecode",
      content: "รายวิชา",
      render: (item) => (
        <div className="flex flex-col">
          <p className="block">
            {item.coursecode} {item.coursename}
          </p>
        </div>
      ),
    },

    {
      key: "facultyname",
      content: "สำนักวิชา",
      render: (item) => (
        <div className="flex flex-col">
          <p className="block">{item.facultyname}</p>
          <p className="block opacity-70">{item.facultycode}</p>
        </div>
      ),
    },

    {
      key: "section",
      content: "รายละเอียดวิชา",
      width: "300",
      render: (item) => (
        <div className="flex flex-col">
          <p className="block">จำนวนกลุ่มเรียน : {item.section} กลุ่ม</p>
          <p className="block opacity-70">
            จำนวนนักศึกษา : {item.totalseat} คน
          </p>
        </div>
      ),
    },

    {
      key: "fullname",
      content: "รายละเอียดห้องปฎิบัติการ",
      width: "300",
      render: (item) => (
        <div className="flex flex-col">
          <p className="block">{item.labgroupName}</p>
          <p className="block opacity-70">ผู้รับผิดชอบหลัก : {item.fullname}</p>
        </div>
      ),
    },
    {
      key: "labId",
      content: "Action",
      width: "100",
      sort: false,
      export: false,
      render: (item) => (
        <div className="flex gap-1">
          <button
            className="cursor-pointer p-2 text-white text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              return _onPressEdit(item.labId);
            }}>
            <FiEdit className="w-4 h-4" />
            แก้ไข
          </button>
          <button
            className="cursor-pointer p-2 text-white text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              return _onPressDelete(item.labId);
            }}>
            <FiTrash2 className="w-4 h-4" />
            ลบ
          </button>
        </div>
      ),
    },
  ];

  return (
    <Content
      breadcrumb={breadcrumb}
      title="รายงานแผนการให้บริการห้องปฎิบัติการ ">
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="p-4 border-b border-gray-200  flex justify-between">
          <div>
            <h3 className="font-semibold ">กำหนดรายวิชา</h3>
          </div>
          <div className="flex gap-4">
            <div className="flex gap-2 items-center">
              <label className={className.label}>ภาคการศึกษา :</label>
              <select
                value={schId}
                onChange={(e) => {
                  setSchId(e.target.value);
                  router.push(`/assign-course?schId=${e.target.value}`);
                }}
                className="block bg-white px-4 py-2 border rounded-md dark:bg-gray-800">
                <option value="" disabled>
                  เลือกภาคการศึกษา
                </option>
                {data.semester.map((item) => (
                  <option key={item.schId} value={item.schId}>
                    {item.semester}/{item.acadyear}
                  </option>
                ))}
              </select>
            </div>

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
            <TableList meta={meta} data={data.data} loading={loading} />
          )}
        </div>
      </div>
    </Content>
  );
}

const className = {
  label:
    "block text-sm font-medium text-gray-900 dark:text-gray-300 dark:text-gray-300",
  input:
    "block bg-white w-full px-3 py-1.5 border rounded-md shadow-sm dark:bg-gray-800",
  select: "block bg-white px-4 py-2 border rounded-md dark:bg-gray-800",
};
