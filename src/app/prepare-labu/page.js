"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Content from "@/components/Content";
import {
  FiEdit,
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiSettings,
} from "react-icons/fi";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  Building,
  GraduationCap,
  FileText,
  Settings,
  Activity,
  Armchair,
} from "lucide-react";
import TableList from "@/components/TableList";
import { useSession } from "next-auth/react";

function PageContent() {
  const router = useRouter(); // Get the router object
  const { data: session } = useSession();
  //console.log("session", session);
  const userlogin = session?.user.userRole;
  const userIdlogin = session?.user.person_id;
  console.log("userIdlogin", userlogin);
  const breadcrumb = [
    { name: "บันทึกใบงานเตรียมปฏิบัติการ" },
    { name: "รายการรายวิชา", link: "/prepare-labu" },
  ];
  const searchParams = useSearchParams();
  const initialSchId = searchParams.get("schId") || ""; // Get schId from URL
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schYears, setSchYears] = useState([]);
  const [lab, setLab] = useState([]);
  const [schId, setSchId] = useState(initialSchId);

  const _onPressAdd = (labId) => {
    router.push(`/prepare-lab/new?labId=${labId}`);
  };
  const _onPressAddasset = (labId) => {
    router.push(`/prepare-lab/plan-asset?id=${labId}`);
  };
  const _onPressAddlab = (labId) => {
    router.push(`/prepare-lab/Use-asset?id=${labId}`);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const schYearRes = await axios.get("/api/academic");
        //console.log("Academic Data:", schYearRes.data); // Debugging
        const fetchedSchYears = schYearRes.data.data || [];
        setSchYears(fetchedSchYears);
        // Set the initial schId where status is 1
        if (!schId) {
          const defaultSchId = fetchedSchYears.find(
            (item) => item.status === 1
          )?.schId;
          if (defaultSchId) {
            setSchId(defaultSchId);
          }
        }

        const response = await axios.get(`/api/prepare-lab`, {
          params: { schId, userIdlogin, userlogin },
        });

        const data = response.data;
        //console.log("lab", data);
        if (response.data.success) {
          setLab(response.data.data || []); // Access `data.data`
        } else {
          setLab([]); // Ensure it's always an array
        }
      } catch (err) {
        console.error(
          "Error fetching lab data:",
          err.response?.data || err.message
        );
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [schId, userIdlogin, userlogin]);

  const meta = [
    {
      key: "courseunicode",
      content: "รหัสวิชา",
      className: "text-center",
      width: "150",
      render: (item) => {
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {item.courseunicode}
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              {item.courseunit} หน่วยกิต
            </span>
          </div>
        );
      },
    },
    {
      key: "coursename",
      content: "รายวิชา",
      render: (item) => {
        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {item.coursename}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 italic">
              ({item.coursenameeng})
            </div>
          </div>
        );
      },
    },
    {
      key: "enrollseat",
      content: "นักศึกษา | ที่นั่ง",

      width: "150",
      className: "text-center",
      render: (item) => {
        return (
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Users className="w-4 h-4" />
              <span className="font-semibold">{item.enrollseat}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Armchair className="w-4 h-4" />
              <span className="font-semibold">{item.totalseat}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "labroom",
      content: "จำนวนห้อง LAB",
      width: "150",
      className: "text-center",
      render: (item) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {item.labroom}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ห้อง
            </span>
          </div>
        );
      },
    },
    {
      key: "section",
      content: "จำนวนกลุ่ม",
      width: "120",
      className: "text-center",
      render: (item) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <GraduationCap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {item.section}
            </span>
          </div>
        );
      },
    },
    {
      key: "hour",
      content: "จำนวนชม.ต่อสัปดาห์",
      width: "200",
      className: "text-center",
      render: (item) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {item.hour}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ชม.
            </span>
          </div>
        );
      },
    },
  ];

  if (userlogin === "หัวหน้าบทปฏิบัติการ" || userlogin === "แอดมิน") {
    meta.push({
      key: "labId",
      content: "จัดการ",
      width: "270",
      className: "text-center",
      render: (item) => {
        const isOwner = String(item.personId) === String(userIdlogin);

        return (
          <div className="flex items-center justify-center">
            <button
              className="flex items-center gap-2 px-4 py-2 text-white text-sm bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
              onClick={() => _onPressAdd(item.labId)}>
              <Settings className="w-4 h-4" />
              การใช้ทรัพยากรและอุปกรณ์ชำรุด
            </button>
          </div>
        );
      },
    });
  }

  // else {
  //   <div className="cursor-pointer items-center justify-center flex gap-1">
  //     {"-"}
  //   </div>;
  // }

  let title;
  if (userlogin === "หัวหน้าบทปฏิบัติการ") {
    title = "การใช้ทรัพยากรและอุปกรณ์ชำรุด";
  } else if (userlogin === "แอดมิน") {
    title = "บันทึกใบงานเตรียมปฏิบัติการและแผนการใช้ทรัพยากร";
  } else if (userlogin === "แอดมิน" || userlogin === "หัวหน้าบทปฏิบัติการ") {
    title = "การใช้ทรัพยากรและอุปกรณ์ชำรุด";
  }
  return (
    <Content breadcrumb={breadcrumb} title={title}>
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-t-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                  รายการรายวิชาเตรียมปฏิบัติการ
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  จัดการการใช้ทรัพยากรและอุปกรณ์ชำรุด
                </p>
              </div>
            </div>

            {/* Academic Year Selector */}
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm min-w-[280px]">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ปีการศึกษา
                </label>
                <select
                  name="schId"
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={schId}
                  onChange={(e) => setSchId(e.target.value)}>
                  <option value="" disabled>
                    เลือกปีการศึกษา
                  </option>
                  {schYears.map((item) => (
                    <option key={item.schId} value={item.schId}>
                      {item.semester} / {item.acadyear}
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
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FiSettings className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-red-600 dark:text-red-400 text-lg font-medium">
                  {error}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden p-2">
              <TableList meta={meta} data={lab} loading={loading} />
            </div>
          )}
        </div>
      </div>
    </Content>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>กำลังโหลด...</div>}>
      <PageContent />
    </Suspense>
  );
}
