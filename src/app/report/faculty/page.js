"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiInfo } from "react-icons/fi";
import Content from "@/components/Content";
import TableList from "@/components/TableList";
import axios from "axios";
import { set } from "react-hook-form";

// Define styles
const className = {
  label: "block text-sm font-medium text-end text-gray-900 dark:text-gray-300",
  input:
    "block w-full px-3 py-1.5 border rounded-md shadow-sm dark:bg-gray-800",
  select: "block px-4 py-2 border rounded-md dark:bg-gray-800",
};

export default function List() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State variables
  const [dataFaculty, setFaculty] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [yearOptions, setYearOptions] = useState([]); // เก็บตัวเลือกทั้งหมด (array)
  const [selectedYear, setSelectedYear] = useState(""); // เก็บค่าที่เลือก (string)
  const [facultyReport, setFacultyReport] = useState([]);

  const breadcrumb = [
    { name: "รายงาน" },
    {
      name: "รายงานต้นทุนตามสำนักวิชา",
      link: "/report/faculty",
    },
  ];

  // Fetch faculty data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1. ดึงข้อมูลปีการศึกษาก่อน
        const yearResponse = await axios.get("/api/report/faculty");

        if (yearResponse.data && yearResponse.data.success) {
          const yearData = yearResponse.data.year || [];
          console.log("Year data fetched successfully:", yearData);
          setYearOptions(yearData);

          // ถ้ามีพารามิเตอร์ปีในใน URL ให้ใช้ค่านั้น
          const yearParam = searchParams.get("year");
          if (yearParam) {
            setSelectedYear(yearParam);
          }
          // ถ้าไม่มี ให้ใช้ปีล่าสุด
          else if (yearData.length > 0) {
            setSelectedYear(yearData[0].schId);
          }

          // 2. จากนั้นจึงดึงข้อมูลสำนักวิชา
          console.log("Now fetching faculty data...");
          const facultyResponse = await axios.get(`/api/report/faculty`, {
            params: {
              year: yearParam || (yearData.length > 0 ? yearData[0].schId : ""),
              facultyId: searchParams.get("facultyId") || "",
            },
          });

          const facultyData = facultyResponse.data;
          if (facultyData.success) {
            console.log("Faculty data fetched successfully");
            setFaculty(facultyData.data || []);
            setFacultyReport(facultyData.report || []); // เพิ่มบรรทัดนี้เพื่อเก็บข้อมูลรายงาน

            // ตั้งค่าพารามิเตอร์จาก URL
            const facultyIdParam = searchParams.get("facultyId");
            if (facultyIdParam) {
              setSelectedFaculty(facultyIdParam);
            }
          } else {
            setError(facultyData.error || "ไม่สามารถโหลดข้อมูลสำนักวิชาได้");
          }
        } else {
          setError("ไม่สามารถโหลดข้อมูลปีการศึกษาได้");
        }
      } catch (err) {
        console.error(
          "Error in fetchData:",
          err.message,
          "\nResponse:",
          err.response?.data,
          "\nStack:",
          err.stack
        );
        setError(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [searchParams]); // ลบ selectedYear ออกจาก dependencies

  // Filter data when selectedFaculty changes
  useEffect(() => {
    if (!dataFaculty.length) return;

    // เริ่มจากข้อมูลทั้งหมด
    let filtered = dataFaculty;

    // กรองตามสำนักวิชา (ถ้ามีการเลือก)
    if (selectedFaculty) {
      filtered = filtered.filter(
        (item) => (item.facultyid || item.id) === selectedFaculty
      );
    }

    // กรองตามปีการศึกษา (ถ้ามีการเลือก)
    if (selectedYear) {
      filtered = filtered.filter((item) => {
        return (
          item.schId === selectedYear ||
          item.yearId === selectedYear ||
          item.year === selectedYear
        );
      });
    }

    setFilteredData(filtered);
  }, [selectedFaculty, selectedYear, dataFaculty]);

  // กำหนด meta สำหรับตาราง
  const reportMeta = [
    {
      key: "coursecode",
      content: "รหัสวิชา",
      width: "100",
    },
    {
      key: "coursename",
      content: "ชื่อวิชา",
      width: "250",
    },
    {
      key: "facultyname",
      content: "สำนักวิชา",
      width: "150",
    },
    {
      key: "priceperTermInvtype1",
      content: "ครุภัณฑ์ห้องปฎิบัติการ",
      width: "120",
      render: (item) => (
        <div className="text-right">
          {Number(item.priceperTermInvtype1 || 0).toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      key: "priceperTermInvtype2",
      content: "วัสดุไม่สิ้นเปลือง",
      width: "120",
      render: (item) => (
        <div className="text-right">
          {Number(item.priceperTermInvtype2 || 0).toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      key: "priceperTermInvtype3",
      content: "วัสดุสิ้นเปลือง",
      width: "120",
      render: (item) => (
        <div className="text-right">
          {Number(item.priceperTermInvtype3 || 0).toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      key: "priceperTermInvtype4",
      content: "ครุภัณฑ์วิทยาศาสตร์",
      width: "120",
      render: (item) => (
        <div className="text-right">
          {Number(item.priceperTermInvtype4 || 0).toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      key: "total",
      content: "รวมค่าใช้จ่าย",
      width: "120",
      render: (item) => {
        const total =
          Number(item.priceperTermInvtype1 || 0) +
          Number(item.priceperTermInvtype2 || 0) +
          Number(item.priceperTermInvtype3 || 0) +
          Number(item.priceperTermInvtype4 || 0);
        return (
          <div className="text-right font-semibold">
            {total.toLocaleString("th-TH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        );
      },
    },
  ];

  return (
    <Content breadcrumb={breadcrumb} title="รายงานข้อมูลสำนักวิชา">
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="p-4 border-b border-gray-200 flex justify-between">
          <div>
            <h3 className="font-semibold">รายงานข้อมูลสำนักวิชา</h3>
          </div>
          <div className="flex gap-4">
            <div className="flex gap-2 items-center">
              <label className={className.label}>สำนักวิชา :</label>
              <select
                value={selectedFaculty || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedFaculty(value);
                  router.push(
                    `/report/faculty?year=${
                      selectedYear || ""
                    }&facultyId=${value}`
                  );
                }}
                className="block px-4 py-2 border rounded-md dark:bg-gray-800 min-w-[200px]">
                <option value="">แสดงทุกสำนักวิชา</option>
                {dataFaculty && dataFaculty.length > 0 ? (
                  dataFaculty.map((item) => (
                    <option
                      key={item.facultyid || item.id}
                      value={item.facultyid || item.id}>
                      {item.facultycode ? `${item.facultycode} - ` : ""}
                      {item.facultyname || item.name}
                    </option>
                  ))
                ) : (
                  <option disabled>กำลังโหลดข้อมูล...</option>
                )}
              </select>
            </div>
            <div className="flex items-center">
              <label className={className.label}>ปีการศึกษา : </label>
              <select
                className={className.select}
                value={selectedYear || ""}
                onChange={(e) => {
                  const yearValue = e.target.value;
                  setSelectedYear(yearValue);
                  router.push(
                    `/report/faculty?year=${yearValue}&facultyId=${
                      selectedFaculty || ""
                    }`
                  );
                }}>
                <option value="">เลือก</option>
                {yearOptions && yearOptions.length > 0 ? (
                  yearOptions.map((item) => (
                    <option key={item.schId} value={item.schId}>
                      {item.semester} /{item.acadyear}
                    </option>
                  ))
                ) : (
                  <option disabled>กำลังโหลดปีการศึกษา...</option>
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 overflow-auto">
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : loading ? (
            <div className="text-center py-4">กำลังโหลดข้อมูล...</div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="font-semibold text-lg">
                  ข้อมูลรายวิชาและต้นทุน
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedFaculty
                    ? `ตารางแสดงรายวิชาของสำนักวิชา: ${
                        filteredData.length > 0
                          ? filteredData[0].facultyname
                          : ""
                      }`
                    : "ตารางแสดงรายวิชาทั้งหมด"}
                </p>
              </div>

              {facultyReport.length > 0 ? (
                <TableList meta={reportMeta} data={facultyReport} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2">ไม่พบข้อมูลรายวิชา</p>
                  <p className="mt-1 text-sm">
                    กรุณาเลือกสำนักวิชาและปีการศึกษา
                  </p>
                </div>
              )}

              {facultyReport.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <h4 className="font-semibold mb-2">สรุปค่าใช้จ่าย</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded shadow-sm">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ครุภัณฑ์ห้องปฎิบัติการ
                      </div>
                      <div className="text-xl font-semibold">
                        {facultyReport
                          .reduce(
                            (sum, item) =>
                              sum + Number(item.priceperTermInvtype1 || 0),
                            0
                          )
                          .toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded shadow-sm">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        วัสดุไม่สิ้นเปลือง
                      </div>
                      <div className="text-xl font-semibold">
                        {facultyReport
                          .reduce(
                            (sum, item) =>
                              sum + Number(item.priceperTermInvtype2 || 0),
                            0
                          )
                          .toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded shadow-sm">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        วัสดุสิ้นเปลือง
                      </div>
                      <div className="text-xl font-semibold">
                        {facultyReport
                          .reduce(
                            (sum, item) =>
                              sum + Number(item.priceperTermInvtype3 || 0),
                            0
                          )
                          .toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded shadow-sm">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ครุภัณฑ์วิทยาศาสตร์
                      </div>
                      <div className="text-xl font-semibold">
                        {facultyReport
                          .reduce(
                            (sum, item) =>
                              sum + Number(item.priceperTermInvtype4 || 0),
                            0
                          )
                          .toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded shadow-sm">
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        รวมค่าใช้จ่ายทั้งหมด
                      </div>
                      <div className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                        {facultyReport
                          .reduce(
                            (sum, item) =>
                              sum +
                              (Number(item.priceperTermInvtype1 || 0) +
                                Number(item.priceperTermInvtype2 || 0) +
                                Number(item.priceperTermInvtype3 || 0) +
                                Number(item.priceperTermInvtype4 || 0)),
                            0
                          )
                          .toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Content>
  );
}
