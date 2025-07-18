"use client";

import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { FiCheckCircle } from "react-icons/fi";

import Content from "@/components/Content";
import TableList from "@/components/TableList";

function DetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [facultyId, setFacultyId] = useState(
    searchParams.get("facultyId") || ""
  );
  const [schId, setSchId] = useState(searchParams.get("schId") || "");
  const [data, setData] = useState({
    course: [],
    faculty: [],
    term: [],
  });

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/course`, {
          params: { facultyId, schId },
        });
        const data = response.data;
        if (data.success) {
          setData({
            course: data.data,
            faculty: data.faculty,
            term: data.term,
          });
          setLoading(false);
        }
      } catch (err) {
        console.error(" Error fetching user data:", err);
        alert("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      }
    };
    fetchData();
  }, [facultyId, schId]);

  const breadcrumb = [
    { name: "แผนการให้บริการห้องปฎิบัติการ" },
    { name: "กำหนดรายวิชา", link: "/assign-course" },
    { name: "เพิ่มใหม่" },
  ];

  const meta = [
    {
      key: "coursecode",
      content: "รหัสรายวิชา",
      width: 120,
    },
    {
      key: "coursename",
      content: "ชื่อรายวิชา",
    },
    {
      key: "section",
      content: "จำนวนกลุ่ม",
      className: "text-center",
      width: 150,
    },
    {
      key: "totalseat",
      content: "จำนวนนักศึกษา",
      className: "text-center",
      width: 150,
    },
    {
      key: "courseid",
      sort: false,
      width: 120,
      content: "เลือกรายวิชา",
      render: (item) => (
        <div className="flex justify-center">
          <button
            className="cursor-pointer p-2 text-white text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() =>
              router.push(
                `/assign-course/new?courseId=${item.courseid}&schId=${schId}`
              )
            }>
            <FiCheckCircle className="w-4 h-4" />
            เลือก
          </button>
        </div>
      ),
    },
  ];

  return (
    <Content
      breadcrumb={breadcrumb}
      title=" แผนการให้บริการห้องปฎิบัติการ : กำหนดรายวิชา">
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold">
            แผนการให้บริการห้องปฎิบัติการ : กำหนดรายวิชา
          </h3>
        </div>
        <div className="p-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
          <div className="sm:col-span-6">
            <label className={className.label}>สำนักวิชา</label>
            <select
              value={facultyId}
              onChange={(e) => {
                setFacultyId(e.target.value);
                router.push(
                  `/assign-course/create?facultyId=${e.target.value}&schId=${schId}`
                );
              }}
              className={className.select}>
              <option value="" disabled>
                เลือกสำนักวิชา
              </option>
              {data.faculty.map((item) => (
                <option key={item.facultyid} value={item.facultyid}>
                  {item.facultyname}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-6">
            <label className={className.label}>ภาคการศึกษา</label>
            <select
              value={schId}
              onChange={(e) => {
                setSchId(e.target.value);
                router.push(
                  `/assign-course/create?facultyId=${facultyId}&schId=${e.target.value}`
                );
              }}
              className={className.select}>
              <option value="" disabled>
                เลือกภาคการศึกษา
              </option>
              {data.term.map((item) => (
                <option key={item.schId} value={item.schId}>
                  {item.semester}/{item.acadyear}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-12">
            <TableList meta={meta} data={data.course} loading={loading} />
          </div>
        </div>
      </div>
    </Content>
  );
}

export default function Detail() {
  return (
    <Suspense fallback={<div>กำลังโหลด...</div>}>
      <DetailContent />
    </Suspense>
  );
}

const className = {
  label: "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300",
  input:
    "block w-full px-3 py-1.5 border rounded-md shadow-sm dark:bg-gray-800",
  select: "block w-full px-4 py-2 border rounded-md dark:bg-gray-800",
};
