"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiInfo,
  FiCalendar,
  FiBook,
  FiUsers,
  FiFilter,
  FiFileText,
  FiXCircle,
  FiUserCheck,
  FiChevronDown,
  FiChevronUp,
  FiEdit,
} from "react-icons/fi";
import Image from "next/image";
import Content from "@/components/Content";
import TableList from "@/components/TableList";
import axios from "axios";
import { useSession } from "next-auth/react";
import { User2, Armchair, ChevronsRight } from "lucide-react";

function ListContent() {
  const { data: session } = useSession();
  const userlogin = session?.user.userRole;
  const userIdlogin = session?.user.person_id;
  const labgroupName = session?.user.userInfo.labgroupName;
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
  const [dataReport, setDataReport] = useState([]);
  const [labgroupId, setLabgroupId] = useState(
    searchParams.get("labgroupId") || ""
  );
  const [expandedItems, setExpandedItems] = useState(new Set());
  const toggleExpanded = (labId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(labId)) {
      newExpanded.delete(labId);
    } else {
      newExpanded.add(labId);
    }
    setExpandedItems(newExpanded);
  };

  const _onPressDetail = (id) => {
    router.push(`/report/assign-course/${id}`);
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
        if (schselect === "0") {
          schselect = "0";
        }
        // console.log("Using schId:", schselect);

        const response = await axios.get(`/api/assign-course`, {
          params: { schId: schselect, labgroupId },
        });
        const data = response.data;
        // console.log("Data fetched:", data.data);
        if (data.success) {
          const filteredData = data.data.filter(
            (item) => item.personId == userIdlogin
          );
          const labgroupFilteredData = data.data.filter(
            (item) => item.labgroupName === labgroupName
          );
          
          if (userlogin === "แอดมิน") {
            setDataReport(data.data);
          } else if (
            userlogin === "หัวหน้าฝ่าย" &&
            labgroupFilteredData &&
            labgroupFilteredData.length > 0
          ) {
            setDataReport(labgroupFilteredData);
          } else if (filteredData && filteredData.length > 0) {
            setDataReport(filteredData);
          }
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
  }, [reload, schId, labgroupId, labgroupName, userIdlogin, userlogin]);

  const meta = [
    {
      key: "acadyear",
      content: (
        <span className="flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-blue-600" />
          <span>ปีการศึกษา</span>
        </span>
      ),
      width: "120",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {item.semester}/{item.acadyear}
          </span>
        </div>
      ),
    },
    {
      key: "coursename",
      content: (
        <span className="flex items-center gap-2">
          <FiBook className="w-4 h-4 text-green-600" />
          <span>รายวิชา</span>
        </span>
      ),
      render: (item) => (
        <div className="flex flex-col space-y-1">
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-all duration-200 group"
            onClick={() => toggleExpanded(item.labId)}>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.coursecode}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {item.coursename}
              </p>
            </div>
            {item.sub && item.sub.length > 0 && (
              <>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs">
                  {item.sub.length} ย่อย
                </span>
                <div className="text-blue-500 dark:text-blue-400">
                  {expandedItems.has(item.labId) ? (
                    <FiChevronUp className="w-4 h-4" />
                  ) : (
                    <FiChevronDown className="w-4 h-4" />
                  )}
                </div>
              </>
            )}
          </div>
          {expandedItems.has(item.labId) && item.sub && item.sub.length > 0 && (
            <div className="ml-3 space-y-1 border-l border-gray-200 dark:border-gray-600 pl-3">
              {item.sub.map((sub, iSub) => (
                <div
                  key={iSub}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-1">
                    <ChevronsRight className="w-3 h-3 text-blue-500" />
                    <div>
                      <p className="font-medium text-xs text-gray-900 dark:text-white">
                        {sub.coursecode}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {sub.coursename}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "facultyname",
      content: "สำนักวิชา",
      render: (item) => (
        <div className="flex flex-col">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {item.facultyname}
          </p>
        </div>
      ),
    },
    {
      key: "section",
      content: (
        <span className="flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-purple-600" />
          <span>รายละเอียดวิชา</span>
        </span>
      ),
      width: "180",
      render: (item) => (
        <div className="dark:bg-gray-700 p-2  border-gray-200 dark:border-gray-600 space-y-1">
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium text-gray-900 dark:text-white">
              กลุ่มเรียน : {item.section}
            </p>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
              <User2 className="w-3 h-3" />
              <span>{item.enrollseat}</span>
            </div>
            <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded">
              <Armchair className="w-3 h-3" />
              <span>{item.totalseat}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "fullname",
      content: "รายละเอียดห้องปฎิบัติการ",
      width: "300",
      render: (item) => {
        if (!item.labgroupName) {
          return (
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="w-3 h-3 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <FiFilter className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                ไม่มีข้อมูล
              </span>
            </div>
          );
        }
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <FiUsers className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {item.labgroupName}
              </span>
            </div>
            <div className="flex items-center gap-2 pl-10">
              <div className="flex items-center gap-2">
                <Image
                  alt={item.fullname || "User avatar"}
                  src={`https://hrms.wu.ac.th/index.php?r=image&id=${item.personId}`}
                  width={25}
                  height={25}
                  className="rounded-full"
                  loading="lazy"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.fullname}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "labId",
      content: "จัดการ",
      width: "130",
      sort: false,
      export: false,
      className: "text-center",
      render: (item) => (
        <div className="flex gap-1">
          <button
            className="group flex items-center gap-1 px-3 py-2 text-white text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            onClick={() => {
              return _onPressDetail(item.labId);
            }}>
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
      title="รายงานแผนการให้บริการห้องปฎิบัติการ">
      {/* Header and Content in One Card */}
      <div className="relative flex flex-col w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header Section */}
        <div className="relative bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                {/* <FiBarChart3 className="w-6 h-6 text-green-600" /> */}
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  รายงานแผนการให้บริการห้องปฎิบัติการ
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  ติดตามและรายงานการใช้งานห้องปฎิบัติการ
                </p>
              </div>
            </div>

            {/* Controls in Header */}
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                <FiUsers className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  กลุ่มห้องปฎิบัติการ:
                </label>
                <select
                  value={labgroupId}
                  onChange={(e) => {
                    setLabgroupId(e.target.value);
                    router.push(
                      `/report/assign-course?schId=${schId}&labgroupId=${e.target.value}`
                    );
                  }}
                  className="bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md px-2 py-1 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="" className="text-gray-900 dark:text-gray-100">
                    ทั้งหมด
                  </option>
                  {data.labgroup.map((item) => (
                    <option
                      key={item.labgroupId}
                      value={item.labgroupId}
                      className="text-gray-900 dark:text-gray-100">
                      {item.labgroupName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                <FiCalendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  ภาคการศึกษา:
                </label>
                <select
                  value={schId}
                  onChange={(e) => {
                    setSchId(e.target.value);
                    router.push(
                      `/report/assign-course?schId=${e.target.value}&labgroupId=${labgroupId}`
                    );
                  }}
                  className="bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md px-2 py-1 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  {data.semester.map((item) => (
                    <option
                      key={item.schId}
                      value={item.schId}
                      className="text-gray-900 dark:text-gray-100">
                      {item.semester}/{item.acadyear}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {error ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <FiFileText className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-500 font-medium">{error}</p>
            </div>
          ) : (
            <TableList meta={meta} data={dataReport} loading={loading} />
          )}
        </div>
      </div>
    </Content>
  );
}

export default function List() {
  return (
    <Suspense fallback={<div>กำลังโหลด...</div>}>
      <ListContent />
    </Suspense>
  );
}

const className = {
  label:
    "mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300 dark:text-gray-300",
  input:
    "block bg-white text-gray-900 dark:text-white w-full px-3 py-1.5 border rounded-md shadow-sm dark:bg-gray-800",
  select:
    "block bg-white text-gray-900 dark:text-white w-full px-4 py-2 border rounded-md dark:bg-gray-800",
};
