"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiInfo } from "react-icons/fi";
import Content from "@/components/Content";
import TableList from "@/components/TableList";
import axios from "axios";

export default function List() {
  const searchParams = useSearchParams();
  const breadcrumb = [
    { name: "รายงาน" },
    {
      name: "รายงานแผนการให้บริการห้องปฎิบัติการ",
      link: "/report/assign-course",
    },
  ];
  const router = useRouter();
  const [data, setData] = useState({ data: [], semester: [], labgroup: [] });
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schId, setSchId] = useState(searchParams.get("schId") || "");
  const [labgroupId, setLabgroupId] = useState(
    searchParams.get("labgroupId") || ""
  );

  const _onPressDetail = (id) => {
    router.push(`/report/assign-course/${id}`);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        if (schId === "") {
          const schyearRes = await axios.get(`/api/schyear`);
          const schyear = schyearRes.data;
          if (schyear.success) {
            setSchId(schyear.data);
          }
        }

        const response = await axios.get(`/api/assign-course`, {
          params: { schId },
        });
        const data = response.data;
        if (data.success) {
          setData({
            data: data.data,
            semester: data.semester,
            labgroup: data.labgroup,
          });
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
          เทอม {item.semester}/{item.acadyear}
        </div>
      ),
    },
    {
      key: "coursecode",
      content: "รายวิชา",
      render: (item) => (
        <div className="flex flex-col">
          <p className="block">{item.coursename}</p>
          <p className="block opacity-70">รหัสวิชา : {item.coursecode}</p>
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
      content: "ผู้รับผิดชอบหลัก",
      width: "200",
    },

    {
      key: "labId",
      content: "Action",
      width: "120",
      nowrap: true,
      sort: false,
      render: (item) => (
        <div className="flex gap-1">
          <button
            className="cursor-pointer p-2 text-white text-sm bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              return _onPressDetail(item.labId);
            }}
          >
            <FiInfo className="w-4 h-4" />
            รายละเอียด
          </button>
        </div>
      ),
    },
  ];

  return (
    <Content
      breadcrumb={breadcrumb}
      title="รายงานแผนการให้บริการห้องปฎิบัติการ"
    >
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="p-4 border-b border-gray-200  flex justify-between">
          <div>
            <h3 className="font-semibold">
              รายงานแผนการให้บริการห้องปฎิบัติการ
            </h3>
          </div>
          <div className="flex gap-4">
            <div className="flex gap-2 items-center">
              <label className={className.label}>กลุ่มห้องปฎิบัติการ :</label>
              <select
                value={labgroupId}
                onChange={(e) => {
                  setLabgroupId(e.target.value);
                  router.push(
                    `/report/assign-course?schId=${schId}&labgroupId=${e.target.value}`
                  );
                }}
                className="block px-4 py-2 border rounded-md dark:bg-gray-800"
              >
                <option value="">แสดงทุกห้องปฎิบัติการ</option>
                {data.labgroup.map((item) => (
                  <option key={item.labgroupId} value={item.labgroupId}>
                    {item.labgroupName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <label className={className.label}>เทอมการศึกษา :</label>
              <select
                value={schId}
                onChange={(e) => {
                  setSchId(e.target.value);
                  router.push(
                    `/report/assign-course?schId=${e.target.value}&labgroupId=${labgroupId}`
                  );
                }}
                className="block px-4 py-2 border rounded-md dark:bg-gray-800"
              >
                <option value="">แสดงทุกเทอมการศึกษา</option>
                {data.semester.map((item) => (
                  <option key={item.schId} value={item.schId}>
                    เทอม {item.semester}/{item.acadyear}
                  </option>
                ))}
              </select>
            </div>
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
    "block text-sm font-medium text-end text-gray-900 dark:text-gray-300 dark:text-gray-300",
  input:
    "block w-full px-3 py-1.5 border rounded-md shadow-sm dark:bg-gray-800",
  select: "block px-4 py-2 border rounded-md dark:bg-gray-800",
};
