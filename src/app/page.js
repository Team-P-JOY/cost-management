"use client";

import {
  FiBook,
  FiDollarSign,
  FiUsers,
  FiChevronsDown,
  FiHome,
  FiInfo,
  FiChevronUp,
  FiChevronDown,
  FiCalendar,
  FiBarChart3,
  FiTrendingUp,
  FiActivity,
} from "react-icons/fi";

import {
  Armchair,
  ChartBarIcon,
  ChevronsRight,
  PersonStanding,
  User2,
  X,
  Calendar,
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  TrendingUp,
  BarChart3,
  Activity,
  Home,
  Info,
} from "lucide-react";

import Content from "@/components/Content";
import ExportButton from "@/components/ExportButton";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import TableList from "@/components/TableList";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  // Session and user data
  const { data: session } = useSession();
  const userlogin = session?.user.userRole;
  const userIdlogin = session?.user.person_id;
  const labgroupName = session?.user.userInfo.labgroupName;

  // Router
  const router = useRouter();

  // State management
  const [academicYears, setAcademicYears] = useState([]);
  const [labGroups, setLabGroups] = useState([]);
  const [selectedSchId, setSelectedSchId] = useState("");
  const [selectedLg, setSelectedLg] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [labDepartments, setLabDepartments] = useState([]);

  // Callback functions
  const redirectToPrepareLab = useCallback(() => {
    router.push("/prepare-labu");
  }, [router]);

  const handleClick = (item) => {
    const encodedLabId = btoa(item.labId.toString());
    router.push(`/dashboard?labId=${encodedLabId}`);
  };

  const toggleCourseExpansion = useCallback((courseId) => {
    setExpandedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      // สร้าง URL parameters โดยไม่ส่ง labgroupId ถ้าเลือก "ทั้งหมด"
      const params = new URLSearchParams();
      params.append("schId", selectedSchId);

      // ถ้าไม่ใช่ "ทั้งหมด" ให้ส่ง labgroupId ไป
      if (selectedLg && selectedLg.trim() !== "") {
        params.append("labgroupId", selectedLg);
      }

      const response = await fetch(`/api/assign-course?${params.toString()}`);
      const result = await response.json();

      if (result.success && result.data) {
        // กรองข้อมูลตามสิทธิ์ของผู้ใช้
        let filteredData = result.data;

        if (userlogin === "แอดมิน") {
          // แอดมินเห็นข้อมูลทั้งหมดตามการเลือก (API จะกรองให้แล้ว)
          setSearchResults(filteredData);
        } else if (userlogin === "หัวหน้าฝ่าย") {
          // หัวหน้าฝ่ายเห็นเฉพาะข้อมูลของฝ่ายตัวเอง
          const labgroupFilteredData = filteredData.filter(
            (item) => item.labgroupName === labgroupName
          );
          setSearchResults(labgroupFilteredData);
        } else {
          // ผู้ใช้ทั่วไปเห็นเฉพาะข้อมูลของตัวเอง
          const personalFilteredData = filteredData.filter(
            (item) => item.personId == userIdlogin
          );
          setSearchResults(personalFilteredData);
        }

        // จัดการข้อมูล Lab Departments จาก result.dataGroup (ถ้ามี) หรือ filteredData
        let departmentData = result.dataGroup || filteredData;

       

        // ใช้ข้อมูลจาก dataGroup โดยตรงโดยไม่ต้องจัดกลุ่ม หรือแสดงชื่อฝ่ายทั้งหมดถ้าไม่มีข้อมูล
        const departmentColors = [
          {
            gradient: "from-green-500 to-green-600",
            bgGradient: "from-green-50 to-green-100",
            darkBgGradient: "from-green-900/30 to-green-800/30",
            borderColor: "border-green-200/50 dark:border-green-700/50",
          },
          {
            gradient: "from-red-500 to-red-600",
            bgGradient: "from-red-50 to-red-100",
            darkBgGradient: "from-red-900/30 to-red-800/30",
            borderColor: "border-red-200/50 dark:border-red-700/50",
          },
          {
            gradient: "from-blue-500 to-blue-600",
            bgGradient: "from-blue-50 to-blue-100",
            darkBgGradient: "from-blue-900/30 to-blue-800/30",
            borderColor: "border-blue-200/50 dark:border-blue-700/50",
          },
          {
            gradient: "from-purple-500 to-purple-600",
            bgGradient: "from-purple-50 to-purple-100",
            darkBgGradient: "from-purple-900/30 to-purple-800/30",
            borderColor: "border-purple-200/50 dark:border-purple-700/50",
          },
          {
            gradient: "from-indigo-500 to-indigo-600",
            bgGradient: "from-indigo-50 to-indigo-100",
            darkBgGradient: "from-indigo-900/30 to-indigo-800/30",
            borderColor: "border-indigo-200/50 dark:border-indigo-700/50",
          },
        ];

        let departmentsArray;

        // รายชื่อฝ่ายทั้งหมดที่ต้องแสดง (เรียงตาม LABGROUP_ID)
        const allDepartments = [
          { id: 1, name: "ฝ่ายห้องปฏิบัติการวิทยาศาสตร์พื้นฐาน" },
          { id: 2, name: "ฝ่ายห้องปฎิบัติการวิทยาศาสตร์สุขภาพ" },
          { id: 3, name: "ฝ่ายห้องปฏิบัติการวิทยาศาสตร์เทคโนโลยี" },
          { id: 4, name: "ฝ่ายห้องปฎิบัติการวิทยาศาสตร์การแพทย์" },
        ];

        // สร้าง Map จากข้อมูลที่มี โดยใช้ LABGROUP_ID
        const dataMap = new Map();
        const additionalDepartments = new Map(); // เก็บฝ่ายที่มีข้อมูลแต่ไม่อยู่ในรายชื่อเริ่มต้น

        if (departmentData && departmentData.length > 0) {
          departmentData.forEach((item) => {
            if (item.labgroupId && item.labgroupName) {
              const labgroupId = parseInt(item.labgroupId);

              dataMap.set(labgroupId, {
                courses: item.course || 0,
                rooms: item.labroom || 0,
                name: item.labgroupName,
              });

              // ถ้า LABGROUP_ID ไม่อยู่ในรายชื่อเริ่มต้น ให้เพิ่มเข้าไป
              if (!allDepartments.find((dept) => dept.id === labgroupId)) {
                additionalDepartments.set(labgroupId, {
                  id: labgroupId,
                  name: item.labgroupName,
                });
              }
            }
          });
        }

        // รวมรายชื่อฝ่ายเริ่มต้นกับฝ่ายที่มีข้อมูลเพิ่มเติม
        const finalDepartments = [
          ...allDepartments,
          ...Array.from(additionalDepartments.values()),
        ];

        // รวมข้อมูลทั้งหมด โดยแสดงทุกฝ่าย
        departmentsArray = finalDepartments.map((dept, index) => {
          const data = dataMap.get(dept.id) || {
            courses: 0,
            rooms: 0,
            name: dept.name,
          };
          return {
            title: data.name,
            courses: data.courses,
            rooms: data.rooms,
            labgroupId: dept.id,
            icon: <Home className="w-5 h-5" />,
            ...departmentColors[index % departmentColors.length],
          };
        });

       

        setLabDepartments(departmentsArray);
      } else {
        setSearchResults([]);
        setLabDepartments([]);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
      setSearchResults([]);
      setLabDepartments([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSchId, selectedLg, userIdlogin, labgroupName, userlogin]);

  useEffect(() => {
    if (userlogin === "หัวหน้าบทปฏิบัติการ") {
      redirectToPrepareLab();
    }
  }, [userlogin, redirectToPrepareLab]);

  useEffect(() => {
    async function fetchAcademicYears() {
      try {
        const response = await fetch("/api/academic");
        const result = await response.json();

        if (result.data && result.data.length > 0) {
          setAcademicYears(result.data);

          const defaultYear = result.data.find((item) => item.status === 1);

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
    // ตรวจสอบว่าเลือกภาคการศึกษาแล้ว และเลือกฝ่ายห้องปฏิบัติการแล้ว (รวมทั้ง "ทั้งหมด")
    if (selectedSchId && selectedLg !== null && selectedLg !== "") {
      setLoading(true);
      fetchData();
    }
  }, [selectedSchId, selectedLg, fetchData]);

  return (
    <Content>
      {/* Unified Dashboard Overview */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-3xl p-6 border border-gray-200 dark:border-gray-600 shadow-xl">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  แดชบอร์ดระบบจัดการต้นทุน
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  ภาพรวมข้อมูลการเตรียมปฏิบัติการและต้นทุนรายวิชา
                </p>
              </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Academic Year Selector */}
              <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 dark:border-gray-600/50 shadow-md min-w-[200px]">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    ภาคการศึกษา
                  </label>
                  <select
                    className="w-full text-sm border-0 bg-transparent text-gray-900 dark:text-gray-100 focus:ring-0 p-0"
                    value={selectedSchId}
                    onChange={(e) => setSelectedSchId(e.target.value)}>
                    {academicYears.map((year) => (
                      <option key={year.schId} value={year.schId}>
                        {year.semester} / {year.acadyear}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lab Group Selector */}
              <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 dark:border-gray-600/50 shadow-md min-w-[250px]">
                <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    ฝ่ายห้องปฏิบัติการ
                  </label>
                  <select
                    className="w-full text-sm border-0 bg-transparent text-gray-900 dark:text-gray-100 focus:ring-0 p-0"
                    value={selectedLg}
                    onChange={(e) => setSelectedLg(e.target.value)}>
                    {labGroups.map((year) => (
                      <option key={year.labgroupId} value={year.labgroupId}>
                        {year.labgroupName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "รายวิชาที่เปิดให้บริการ",
                  value: searchResults.length,
                  unit: "รายวิชา",
                  icon: <BookOpen className="w-6 h-6" />,
                  gradient: "from-blue-500 to-blue-600",
                  bgGradient: "from-blue-50 to-blue-100",
                  darkBgGradient: "from-blue-900/30 to-blue-800/30",
                },
                {
                  title: "ต้นทุนรวม",
                  value: "-",
                  unit: "บาท",
                  icon: <FiDollarSign className="w-6 h-6" />,
                  gradient: "from-green-500 to-green-600",
                  bgGradient: "from-green-50 to-green-100",
                  darkBgGradient: "from-green-900/30 to-green-800/30",
                },
                {
                  title: "จำนวนนักศึกษา",
                  value: searchResults.reduce(
                    (sum, item) => sum + item.enrollseat,
                    0
                  ),
                  unit: "คน",
                  icon: <Users className="w-6 h-6" />,
                  gradient: "from-purple-500 to-purple-600",
                  bgGradient: "from-purple-50 to-purple-100",
                  darkBgGradient: "from-purple-900/30 to-purple-800/30",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${stat.bgGradient} dark:bg-gradient-to-br dark:${stat.darkBgGradient} backdrop-blur-sm rounded-2xl p-6 border border-white/50 dark:border-gray-600/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-md`}>
                      <div className="text-white">{stat.icon}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {typeof stat.value === "number"
                          ? stat.value.toLocaleString()
                          : stat.value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.unit}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {stat.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lab Departments Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ฝ่ายห้องปฏิบัติการ
              </h2>
              <div className="ml-auto">
                <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
                  {labDepartments.length} ฝ่าย
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {labDepartments.map((dept, index) => (
                <div
                  key={dept.title}
                  className={`bg-gradient-to-br ${dept.bgGradient} dark:bg-gradient-to-br dark:${dept.darkBgGradient} backdrop-blur-sm rounded-2xl p-4 border-2 ${dept.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-2 bg-gradient-to-br ${dept.gradient} rounded-xl shadow-md`}>
                      <div className="text-white">{dept.icon}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                        <span>{dept.courses}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-normal">
                          รายวิชา
                        </span>
                        <span className="text-gray-400">|</span>
                        <span>{dept.rooms}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-normal">
                          ห้อง
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-3 rounded-xl border border-white/50 dark:border-gray-600/50">
                    {dept.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reports Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              รายงานรายวิชา
            </h2>
            <div className="ml-auto flex items-center gap-2">
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-sm">
                {searchResults.length} รายวิชา
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden p-2">
            <TableList
              meta={[
                {
                  key: "coursename",
                  content: "ชื่อรายวิชา",
                  render: (item) => {
                    const isExpanded = expandedCourses.has(item.labId);
                    const hasSubCourses = item.sub && item.sub.length > 0;

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded-md">
                          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {item.coursecode} {item.coursename}
                            </div>
                            {hasSubCourses && (
                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  onClick={() =>
                                    toggleCourseExpansion(item.labId)
                                  }
                                  className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                                  {isExpanded ? (
                                    <FiChevronUp className="w-3 h-3" />
                                  ) : (
                                    <FiChevronDown className="w-3 h-3" />
                                  )}
                                  {item.sub.length} รายวิชาย่อย
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        {hasSubCourses && isExpanded && (
                          <div className="ml-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
                            {item.sub.map((sub, iSub) => (
                              <div
                                key={iSub}
                                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-600 rounded-md border-l-2 border-blue-200 dark:border-blue-700">
                                <ChevronsRight className="w-3 h-3" />
                                <span>
                                  {sub.coursecode} {sub.coursename}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  },
                },
                {
                  key: "facultyname",
                  content: "สำนักวิชา",
                  render: (item) => (
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {item.facultyname}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md inline-block">
                        {item.facultycode}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "section",
                  content: "รายละเอียดวิชา",
                  width: "150",
                  render: (item) => (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          กลุ่มเรียน: {item.section}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <User2 className="w-3 h-3" />
                          <span>{item.enrollseat}</span>
                        </div>
                        <span>|</span>
                        <div className="flex items-center gap-1">
                          <Armchair className="w-3 h-3" />
                          <span>{item.totalseat}</span>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "fullname",
                  content: "รายละเอียดห้องปฏิบัติการ",
                  width: "300",
                  render: (item) => {
                    if (!item.labgroupName) {
                      return (
                        <div className="text-center py-2">
                          <span className="text-xs text-gray-400 dark:text-gray-600 italic">
                            (ไม่มีข้อมูล)
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {item.labgroupName}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">ผู้รับผิดชอบหลัก:</span>{" "}
                          {item.fullname}
                        </div>
                      </div>
                    );
                  },
                },
                {
                  key: "labId",
                  content: "จัดการ",
                  width: "140",
                  className: "text-center",
                  render: (item) => (
                    <button
                      onClick={() => handleClick(item)}
                      className="flex items-center gap-2 px-4 py-2 text-white text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105">
                      <Info className="w-4 h-4" />
                      รายละเอียด
                    </button>
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
