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
  const { data: session } = useSession();
  const userlogin = session?.user.userRole;
  const userIdlogin = session?.user.person_id;
  const labgroupName = session?.user.userInfo.labgroupName;
  const [academicYears, setAcademicYears] = useState([]);
  const [labGroups, setLabGroups] = useState([]);
  const [selectedSchId, setSelectedSchId] = useState("");
  const [selectedLg, setSelectedLg] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Get the router object
  const [expandedItems, setExpandedItems] = useState(new Set()); // สำหรับจัดการการแสดง/ซ่อนรายวิชาย่อย
  const [expandedSections, setExpandedSections] = useState(
    new Set(["reports"])
  ); // สำหรับจัดการการแสดง/ซ่อนแต่ละ section

  const redirectToPrepareLab = useCallback(() => {
    router.push("/prepare-labu");
  }, [router]);

  const toggleExpanded = (labId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(labId)) {
      newExpanded.delete(labId);
    } else {
      newExpanded.add(labId);
    }
    setExpandedItems(newExpanded);
  };

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/assign-course?schId=${selectedSchId}&labgroupId=${selectedLg}`
      );
      const result = await response.json();

      const filteredData = result.data.filter(
        (item) => item.personId == userIdlogin
      );
      const labgroupFilteredData = result.data.filter(
        (item) => item.labgroupName === labgroupName
      );
      if (userlogin === "แอดมิน") {
        setSearchResults(result.data);
      } else if (
        userlogin === "หัวหน้าฝ่าย" &&
        labgroupFilteredData &&
        labgroupFilteredData.length > 0
      ) {
        setSearchResults(labgroupFilteredData);
      } else if (filteredData && filteredData.length > 0) {
        setSearchResults(filteredData);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
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
  }, [selectedSchId, selectedLg, fetchData]);

  const handleClick = (item) => {
    const encodedLabId = btoa(item.labId.toString());
    router.push(`/dashboard?labId=${encodedLabId}`);
  };
  return (
    <Content>
      {/* Header Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  แดชบอร์ดระบบจัดการต้นทุน
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ภาพรวมข้อมูลการเตรียมปฏิบัติการและต้นทุนรายวิชา
                </p>
              </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Academic Year Selector */}
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-600 shadow-sm min-w-[200px]">
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
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-600 shadow-sm min-w-[250px]">
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
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            title: "รายวิชาที่เปิดให้บริการ",
            value: searchResults.length,
            unit: "รายวิชา",
            icon: <BookOpen className="w-5 h-5" />,
            iconBg: "bg-blue-100 dark:bg-blue-900",
            iconColor: "text-blue-600 dark:text-blue-400",
            gradient: "from-blue-500 to-blue-600",
          },
          {
            title: "ต้นทุนรวม",
            value: "-",
            unit: "บาท",
            icon: <FiDollarSign className="w-5 h-5" />,
            iconBg: "bg-green-100 dark:bg-green-900",
            iconColor: "text-green-600 dark:text-green-400",
            gradient: "from-green-500 to-green-600",
          },
          {
            title: "จำนวนนักศึกษา",
            value: searchResults.reduce(
              (sum, item) => sum + item.enrollseat,
              0
            ),
            unit: "คน",
            icon: <Users className="w-5 h-5" />,
            iconBg: "bg-purple-100 dark:bg-purple-900",
            iconColor: "text-purple-600 dark:text-purple-400",
            gradient: "from-purple-500 to-purple-600",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <div className={stat.iconColor}>{stat.icon}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : stat.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.unit}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </h3>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full bg-gradient-to-r ${stat.gradient}`}
                  style={{ width: "75%" }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lab Departments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg mb-6">
        <div
          className="p-6 border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={() => toggleSection("departments")}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ฝ่ายห้องปฏิบัติการ
            </h2>
            <div className="ml-auto flex items-center gap-2">
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-sm">
                4 ฝ่าย
              </span>
              {expandedSections.has("departments") ? (
                <FiChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <FiChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>
        </div>

        {expandedSections.has("departments") && (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "วิทยาศาสตร์สุขภาพ",
                  courses: "10",
                  rooms: "20",
                  icon: <Home className="w-5 h-5" />,
                  iconBg: "bg-green-100 dark:bg-green-900",
                  iconColor: "text-green-600 dark:text-green-400",
                  borderColor: "border-green-200 dark:border-green-700",
                },
                {
                  title: "วิทยาศาสตร์พื้นฐาน",
                  courses: "30",
                  rooms: "29",
                  icon: <Home className="w-5 h-5" />,
                  iconBg: "bg-red-100 dark:bg-red-900",
                  iconColor: "text-red-600 dark:text-red-400",
                  borderColor: "border-red-200 dark:border-red-700",
                },
                {
                  title: "วิทยาศาสตร์เทคโนโลยี",
                  courses: "40",
                  rooms: "35",
                  icon: <Home className="w-5 h-5" />,
                  iconBg: "bg-blue-100 dark:bg-blue-900",
                  iconColor: "text-blue-600 dark:text-blue-400",
                  borderColor: "border-blue-200 dark:border-blue-700",
                },
                {
                  title: "วิทยาศาสตร์การแพทย์",
                  courses: "50",
                  rooms: "45",
                  icon: <Home className="w-5 h-5" />,
                  iconBg: "bg-purple-100 dark:bg-purple-900",
                  iconColor: "text-purple-600 dark:text-purple-400",
                  borderColor: "border-purple-200 dark:border-purple-700",
                },
              ].map((dept, index) => (
                <div
                  key={index}
                  className={`bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border-2 ${dept.borderColor} hover:shadow-md transition-all duration-200`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${dept.iconBg}`}>
                      <div className={dept.iconColor}>{dept.icon}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        <span>{dept.courses}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          รายวิชา
                        </span>
                        <span className="text-gray-400">|</span>
                        <span>{dept.rooms}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ห้อง
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center bg-white dark:bg-gray-600 p-2 rounded-lg">
                    {dept.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Reports Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <div
          className="p-6 border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={() => toggleSection("reports")}>
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
              {expandedSections.has("reports") ? (
                <FiChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <FiChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>
        </div>

        {expandedSections.has("reports") && (
          <div className="p-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
              <TableList
                meta={[
                  {
                    key: "coursename",
                    content: "ชื่อรายวิชา",
                    render: (item) => (
                      <div className="space-y-2">
                        <div
                          className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 p-2 rounded-md transition-colors"
                          onClick={() => toggleExpanded(item.labId)}>
                          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {item.coursecode} {item.coursename}
                            </div>
                            {item.sub && item.sub.length > 0 && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                                  {item.sub.length} รายวิชาย่อย
                                </span>
                                {expandedItems.has(item.labId) ? (
                                  <FiChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <FiChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {expandedItems.has(item.labId) &&
                          item.sub &&
                          item.sub.length > 0 && (
                            <div className="ml-6 space-y-1">
                              {item.sub.map((sub, iSub) => (
                                <div
                                  key={iSub}
                                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-600 rounded-md">
                                  <ChevronsRight className="w-3 h-3" />
                                  <span>
                                    {sub.coursecode} {sub.coursename}
                                  </span>
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
                            <span className="font-medium">
                              ผู้รับผิดชอบหลัก:
                            </span>{" "}
                            {item.fullname}
                          </div>
                        </div>
                      );
                    },
                  },
                  {
                    key: "labId",
                    content: "จัดการ",
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
        )}
      </div>
    </Content>
  );
}
