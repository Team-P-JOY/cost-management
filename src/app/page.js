"use client";
import {
  FiBook,
  FiDollarSign,
  FiUsers,
  FiChevronsDown,
  FiHome,
} from "react-icons/fi";
import Content from "@/components/Content";
import ExportButton from "@/components/ExportButton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import TableList from "@/components/TableList";

export default function Dashboard() {
  const { data: session } = useSession();
  console.log("session", session);
  const userlogin = session?.user.userRole;
  const userIdlogin = session?.user.person_id;
  const [academicYears, setAcademicYears] = useState([]);
  const [labGroups, setLabGroups] = useState([]);
  const [selectedSchId, setSelectedSchId] = useState("");
  const [selectedLg, setSelectedLg] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAcademicYears() {
      try {
        const response = await fetch("/api/academic");
        const result = await response.json();
        console.log("Academic Years:", result);

        if (result.data && result.data.length > 0) {
          setAcademicYears(result.data);

          const defaultYear = result.data.find((item) => item.status === 1);
          console.log("Default Year:", defaultYear);

          if (defaultYear) {
            setSelectedSchId(defaultYear.schId);
          }
        }
      } catch (error) {
        console.error("Error fetching academic years:", error);
      }
    }

    fetchAcademicYears();
  }, []);

  useEffect(() => {
    async function fetchLabGroups() {
      try {
        const response = await fetch("/api/labgroup");
        const result = await response.json();
        console.log("Lab Groups:", result);

        if (result.data && result.data.length > 0) {
          // เพิ่มตัวเลือก "ทั้งหมด" ไว้ด้านหน้า
          const labGroupsWithAll = [
            { labgroupId: " ", labgroupName: "ทั้งหมด" },
            ...result.data,
          ];
          setLabGroups(labGroupsWithAll);
          setSelectedLg(" "); // ตั้งค่า default เป็น "ทั้งหมด"
        }
      } catch (error) {
        console.error("Error fetching lab groups:", error);
      }
    }

    fetchLabGroups();
  }, []);
  useEffect(() => {
    // ตรวจสอบว่าเลือกครบทั้งสองค่าแล้ว
    if (selectedSchId && selectedLg !== null) {
      fetchData();
    }
  }, [selectedSchId, selectedLg]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `/api/assign-course?schId=${selectedSchId}&labgroupId=${selectedLg}`
      );
      const result = await response.json();
      console.log("ผลลัพธ์:", result.data);
      console.log("userIdlogin:", userIdlogin);
      const filteredData = result.data.filter(
        (item) => item.personId == userIdlogin
      );
      if (userlogin === "แอดมิน") {
        setSearchResults(result.data);
      } else if (filteredData && filteredData.length > 0) {
        setSearchResults(filteredData);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
    } finally {
      setLoading(false);
    }
  };

  // const schId = "1"; // Replace with actual schId if needed
  return (
    <Content>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-white dark:text-gray-300">
          {/* Dashboard */}
          {/* <Link href="/dashboard">คลิก</Link> */}
        </h1>

        <div className="flex items-center justify-end space-x-4">
          <label className="text-gray-900 dark:text-gray-300 text-xl">
            ภาคการศึกษา
          </label>

          <select
            className="p-4 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 rounded-lg focus:outline-none w-28  text-gray-800 dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600"
            value={selectedSchId}
            onChange={(e) => setSelectedSchId(e.target.value)}>
            {academicYears.map((year) => (
              <option
                key={year.schId}
                value={year.schId}
                className="text-gray-800 dark:text-gray-300 !w-28 p-4">
                {year.semester} / {year.acadyear}
                {/* {year.status === 1 ? " (ปัจจุบัน)" : ""} */}
              </option>
            ))}
          </select>

          <select
            className="p-4 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 rounded-lg focus:outline-none w-260 text-gray-800 dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600"
            value={selectedLg}
            onChange={(e) => setSelectedLg(e.target.value)}>
            {labGroups.map((year) => (
              <option
                key={year.labgroupId}
                value={year.labgroupId}
                className="text-gray-800 dark:text-gray-300 !w-64 p-4 text-base">
                {year.labgroupName}
              </option>
            ))}
          </select>
          {/* <button
            className="outline-2 outline-offset-2 outline-sky-300 bg-sky-300 text-white px-4 py-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 text-2xl w-24"
            onClick={handleSearch}>
            {" "}
            ค้นหา
          </button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "รายวิชาที่เปิดให้บริการ",
            value: searchResults.length,
            unit: "รายวิชา",
            icon: <FiBook className="text-blue-500" />,
            bg: "bg-green-100",
          },
          {
            title: "ต้นทุนรวม",
            value: "-",
            unit: "บาท",
            icon: <FiDollarSign className="text-green-500" />,
            bg: "bg-orange-100",
          },
          {
            title: "จำนวนนักศึกษา",
            value: searchResults.reduce(
              (sum, item) => sum + item.enrollseat,
              0
            ),
            unit: "คน",
            icon: <FiUsers className="text-purple-500" />,
            bg: "bg-blue-200",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className={`bg-gray-100 dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center space-x-4 transition-transform transform hover:scale-105 ${stat.bg}`}>
            <div className="text-4xl">{stat.icon}</div>
            <div>
              <h3 className="text-gray-800 dark:text-gray-300">{stat.title}</h3>
              <span className="text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                <p className="text-2xl font-semibold text-black dark:text-white">
                  {stat.value}
                </p>
                {stat.unit && <p className="text-gray-500">{stat.unit}</p>}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="collapse bg-gray-100 dark:bg-gray-800 mt-2">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title text-xl font-medium text-gray-800 dark:text-gray-300 flex items-center space-x-2">
          <FiChevronsDown className="text-purple-500" />{" "}
          <p>ฝ่ายห้องปฏิบติการ</p>
        </div>
        <div className="collapse-content text-gray-800 dark:text-gray-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "วิทยาศาสตร์สุขภาพ",
                value: "10",
                number: "20",
                unit: "รายวิชา",
                icon: <FiHome className="text-green-500" />,
                unitn: "ห้อง",
              },
              {
                title: "วิทยาศาสตร์พื้นฐาน",
                value: "30",
                number: "29",
                unit: "รายวิชา",
                icon: <FiHome className="text-red-500" />,
                unitn: "ห้อง",
              },
              {
                title: "วิทยาศาสตร์เทคโนโลยี",
                value: "40",
                number: "35",
                unit: "รายวิชา",
                icon: <FiHome className="text-purple-500" />,
                unitn: "ห้อง",
              },
              {
                title: "วิทยาศาสตร์การแพทย์",
                value: "50",
                number: "45",
                unit: "รายวิชา",
                icon: <FiHome className="text-purple-500" />,
                unitn: "ห้อง",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className={`bg-gray-200 dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center space-x-4 transition-transform transform hover:scale-105 ${stat.bg}`}>
                <div className="text-4xl">{stat.icon}</div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                    <p className="text-2xl font-semibold text-black dark:text-white p-2">
                      {stat.value}
                    </p>
                    {stat.unit && <p className="text-gray-500">{stat.unit}</p>}
                    <p>|</p>
                    <span className="text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                      <p className="text-2xl font-semibold text-black dark:text-white">
                        {stat.number}
                      </p>
                      {stat.unitn && (
                        <p className="text-gray-500">{stat.unitn}</p>
                      )}
                    </span>
                  </span>{" "}
                  <div className="mt-2  items-center text-xs bg-gray-300 dark:bg-gray-700 p-2 rounded-lg">
                    <div className="flex items-center text-gray-800 dark:text-gray-300 justify-center">
                      <span className="text-base"> {stat.title}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="collapse bg-gray-100 dark:bg-gray-800 mt-2">
        <input type="radio" name="my-accordion-1" defaultChecked />
        <div className="collapse-title text-xl font-medium text-gray-800 dark:text-gray-300 flex items-center space-x-2">
          <FiChevronsDown className="text-purple-500" /> <p>รายงาน</p>
        </div>
        <div className="collapse-content">
          <div className="overflow-x-auto text-gray-800 dark:text-gray-300">
            <TableList
              meta={[
                {
                  key: "coursename",
                  content: "ชื่อรายวิชา",
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
                      <p className="block">
                        จำนวนกลุ่มเรียน : {item.section} กลุ่ม
                      </p>
                      <p className="block opacity-70">
                        จำนวนนักศึกษา : {item.enrollseat}/{item.totalseat} คน
                      </p>
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
                        <div className="flex flex-col">
                          <i className="text-xs text-gray-300 dark:text-gray-700">
                            (ไม่มีข้อมูล)
                          </i>
                        </div>
                      );
                    }
                    return (
                      <div className="flex flex-col">
                        <p className="block">{item.labgroupName}</p>
                        <p className="block opacity-70">
                          ผู้รับผิดชอบหลัก : {item.fullname}
                        </p>
                      </div>
                    );
                  },
                },

                {
                  key: "labId",
                  content: "รายละเอียด",
                  render: (item) => (
                    <div className="flex flex-col">
                      <Link
                        href={`/dashboard?labId=${btoa(item.labId.toString())}`}
                        className="text-blue-500 hover:underline">
                        ดูรายละเอียด
                      </Link>
                    </div>
                  ),
                },
              ]}
              data={searchResults}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </Content>
  );
}
