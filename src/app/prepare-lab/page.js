"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Content from "@/components/Content";
import { FiEdit, FiSettings, FiBookOpen, FiLayers } from "react-icons/fi";
import TableList from "@/components/TableList";
import { useSession } from "next-auth/react";
import {
  Armchair,
  User2,
  GraduationCap,
  Clock,
  Building,
  Users,
  BookOpen,
} from "lucide-react";

function PageContent() {
  const router = useRouter(); // Get the router object
  const { data: session } = useSession();
  const labgroupName = session?.user.userInfo.labgroupName;

  const userlogin = session?.user.userRole;
  const userIdlogin = session?.user.person_id;
  console.log("userIdlogin", userlogin);
  const breadcrumb = [
    { name: "บันทึกใบงานเตรียมปฏิบัติการ" },
    { name: "รายการรายวิชา", link: "/prepare-lab" },
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

        // const data = response.data;
        if (response.data.success) {
          let labData = [];
          if (userlogin === "แอดมิน") {
            labData = response.data.data;
          } else if (userlogin === "หัวหน้าฝ่าย") {
            labData = response.data.data.filter((item) => {
              return (
                item.userCreated == userIdlogin ||
                item.labgroupName === labgroupName
              );
            });
          } else if (userlogin === "ผู้ประสานงานรายวิชา") {
            labData = response.data.data.filter((item) => {
              return String(item.personId) === String(userIdlogin);
            });
          }
          setLab(labData || []); // Access `data.data`
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
  }, [schId, labgroupName, userIdlogin, userlogin]);

  const meta = [
    {
      key: "courseunicode",
      content: "รหัสวิชา",
      className: "text-center",
      width: "150",
      render: (item) => {
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-900 dark:text-blue-300">
                {item.courseunicode}
              </span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                {item.courseunit} หน่วยกิต
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "coursename",
      content: "รายวิชา",
      render: (item) => {
        return (
          <div className="space-y-2">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              <span className="text-sm">{item.coursename}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">
              <span>({item.coursenameeng})</span>
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
      content: "ห้องปฏิบัติการ",
      width: "150",
      className: "text-center",
      render: (item) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-purple-900 dark:text-purple-300">
              {item.labroom} ห้อง
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
            <span className="font-semibold text-orange-900 dark:text-orange-300">
              {item.section} กลุ่ม
            </span>
          </div>
        );
      },
    },
    {
      key: "hour",
      content: "ชั่วโมง/สัปดาห์",
      width: "150",
      className: "text-center",
      render: (item) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-indigo-900 dark:text-indigo-300">
              {item.hour} ชม.
            </span>
          </div>
        );
      },
    },
  ];

  if (
    userlogin === "ผู้ประสานงานรายวิชา" ||
    userlogin === "แอดมิน" ||
    userlogin === "หัวหน้าฝ่าย"
  ) {
    meta.push({
      key: "labId",
      content: "การจัดการ",
      width: "320",
      className: "text-center",
      render: (item) => {
        const isOwner = String(item.personId) === String(userIdlogin);
        const isAdmin = userlogin === "แอดมิน";
        const isCoordinator = userlogin === "ผู้ประสานงานรายวิชา";
        const isDeptHead = userlogin === "หัวหน้าฝ่าย";
        const isLabChief = userlogin === "หัวหน้าบทปฏิบัติการ";

        return (
          <div className="flex items-center justify-center gap-2">
            {(isAdmin || isCoordinator || isDeptHead) && (
              <>
                <button
                  className="group flex items-center gap-1 px-2 py-2 text-white text-xs bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 hover:from-fuchsia-600 hover:to-fuchsia-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  onClick={() => _onPressAdd(item.labId)}
                  title="กำหนดปฏิบัติการ">
                  <FiBookOpen className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                  <span className="hidden xl:inline text-xs">
                    กำหนดปฏิบัติการ
                  </span>
                  <span className="xl:hidden text-xs">ปฏิบัติการ</span>
                </button>
                <button
                  className="group flex items-center gap-1 px-2 py-2 text-white text-xs bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  onClick={() => _onPressAddasset(item.labId)}
                  title="แผนการใช้ทรัพยากร">
                  <FiLayers className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                  <span className="hidden xl:inline text-xs">
                    แผนการใช้ทรัพยากร
                  </span>
                  <span className="xl:hidden text-xs">ทรัพยากร</span>
                </button>
              </>
            )}
          </div>
        );
      },
    });
  }

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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <FiBookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                  รายการรายวิชาเตรียมปฏิบัติการ
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  จัดการและติดตามความคืบหน้าการเตรียมปฏิบัติการ
                </p>
              </div>
            </div>

            {/* Academic Year Selector */}
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  ปีการศึกษา
                </label>
              </div>
              <select
                name="schId"
                className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg min-w-[180px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                value={schId}
                onChange={(e) => setSchId(e.target.value)}>
                <option value="" disabled>
                  กรุณาเลือก
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

        {/* Content Section */}
        <div className="p-6">
          {error ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSettings className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-red-600 dark:text-red-400 font-medium">
                  {error}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 p-2">
              <TableList
                meta={meta}
                data={lab}
                loading={loading}
                className="rounded-xl"
              />
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

const className = {
  label:
    "block text-sm font-medium text-gray-900 dark:text-gray-300 dark:text-gray-300",
  input:
    "block w-full px-3 py-1.5 border rounded-md shadow-sm dark:bg-gray-800",
  select: "block px-4 py-2 border rounded-md dark:bg-gray-800",
};
