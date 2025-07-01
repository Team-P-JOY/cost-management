"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import React, { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiCheckCircle } from "react-icons/fi";
import { useSession } from "next-auth/react";

import Content from "@/components/Content";
import TableList from "@/components/TableList";
import {
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiXCircle,
} from "react-icons/fi";
export default function Detail() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [facultyId, setFacultyId] = useState(
    searchParams.get("facultyId") || ""
  );
  const [selected, setSelected] = useState("0");

  const [schId, setSchId] = useState(searchParams.get("schId") || "");
  const [data, setData] = useState({
    course: [],
    faculty: [],
    term: [],
  });

  const [filterData, setFilterData] = useState([]);

  useEffect(() => {
    if (selected === "0") {
      setFilterData(data.course);
    } else {
      setFilterData(data.course.filter((item) => item.type === selected));
    }
  }, [selected]);

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

          if (selected === "0") {
            setFilterData(data.data);
          } else {
            setFilterData(data.data.filter((item) => item.type === selected));
          }

          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Error fetching user data:", err);
        alert("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      }
    };
    fetchData();
  }, [facultyId, schId]);

  
  const handleCreate = async (courseid) => {
    const term = data.term.find((item) => item.schId == schId);
    const section = filterData.find(
      (item) => item.courseid === courseid
    )?.section;
    const params = new URLSearchParams({
      courseId: encodeURIComponent(courseid),
      schId: encodeURIComponent(schId),
    });
    // router.push(`/assign-course/new`);
    router.push(`/assign-course/new?${params.toString()}`);
    // ถ้าคุณยังต้องการให้แค่ดูข้อมูลที่เตรียมจะส่ง สามารถ console.log ได้
    console.log({
      courseid: courseid,
      schId: schId,
      acadyear: term.acadyear,
      semester: term.semester,
      section,
      userId: session?.user.person_id,
    });
  };
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "", order: "asc" });
  const processedData = useMemo(() => {
    let result = [...filterData];

   
    if (search.trim() !== "") {
      result = result.filter((item) => {
        const combined = `${item.coursecode} ${item.coursename}`.toLowerCase();
        return combined.includes(search.toLowerCase());
      });
    }

    
    if (sort.key !== "") {
      result.sort((a, b) => {
        const valA = a[sort.key];
        const valB = b[sort.key];
        if (valA === valB) return 0;

        if (sort.order === "asc") {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
    }

    return result;
  }, [data, search, sort]);
  const breadcrumb = [
    { name: "แผนการให้บริการห้องปฎิบัติการ" },
    { name: "กำหนดรายวิชา", link: "/assign-course" },
    { name: "เพิ่มใหม่" },
  ];

  const meta = [
    {
      key: "coursename",
      content: "ชื่อรายวิชา",
      render: (item) => (
        <div className="text-left">
          {item.coursecode} {item.coursename}
        </div>
      ),
    },
    {
      key: "courseunit",
      content: "หน่วยกิต",
      className: "text-center",
      width: 150,
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
            onClick={() => handleCreate(item.courseid)}>
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
            <label className={className.label}>เทอมการศึกษา</label>
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
                เลือกเทอมการศึกษา
              </option>
              {data.term.map((item) => (
                <option key={item.schId} value={item.schId}>
                  เทอม {item.semester}/{item.acadyear}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-12">
            <div className="flex justify-end space-x-4">
              {[
                { id: "0", label: "ทั้งหมด" },
                { id: "1", label: "บรรยาย" },
                { id: "2", label: "ปฎิบัติการ" },
                { id: "3", label: "บรรยายและปฎิบัติการ" },
              ].map((option) => (
                <label
                  key={option.id}
                  className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="options"
                    value={option.id}
                    checked={selected === option.id}
                    onChange={() => setSelected(option.id)}
                    className="peer hidden "
                  />
                  <div className="w-5 h-5 border-2 border-gray-400 rounded-full peer-checked:border-white peer-checked:ring-2 peer-checked:ring-blue-300 peer-checked:bg-blue-500"></div>
                  <span className="text-gray-700 peer-checked:text-blue-600">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="sm:col-span-12">
            <TableList
              meta={meta}
              data={processedData}
              loading={loading}
              exports={false}
              disableSearch={true}
              customSearchSlot={
                <div className="relative w-full max-w-xs">
                  <input
                    type="text"
                    placeholder="ค้นหา..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-40 h-7 text-sm pr-8 pl-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-white"
                  />
                  {search ? (
                    <FiXCircle
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4 cursor-pointer"
                      onClick={() => setSearch("")}
                    />
                  ) : (
                    <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                  )}
                </div>
              }
            />
          </div>
        </div>
        <div className="md:col-span-2 flex justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="p-2 text-white bg-gray-600 hover:bg-gray-700 rounded-lg"
            onClick={() => router.back()}>
            ย้อนกลับ
          </button>
        </div>
      </div>
    </Content>
  );
}

const className = {
  label: "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300",
  input:
    "block bg-white w-full px-3 py-1.5 border rounded-md shadow-sm dark:bg-gray-800",
  select: "block bg-white w-full px-4 py-2 border rounded-md dark:bg-gray-800",
};
