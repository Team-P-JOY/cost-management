"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Content from "@/components/Content";
import { FiEdit } from "react-icons/fi";
import TableList from "@/components/TableList";
import { useSession } from "next-auth/react";

export default function Page() {
  const router = useRouter(); // Get the router object
  const { data: session } = useSession();
  //console.log("session", session);
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
  }, [schId]);

  const meta = [
    {
      key: "courseunicode",
      content: "รหัสวิชา",
      className: "text-center",
      width: "150",
      render: (item) => {
        return (
          <>
            <div className="item-center">
              <span>
                {item.courseunicode}
                {/* {item.personId} */}
              </span>
            </div>
            <div className="item-center">
              <span>{item.courseunit}</span>
            </div>
          </>
        );
      },
    },
    ,
    {
      key: "coursename",
      content: "รายวิชา",
      render: (item) => {
        return (
          <>
            <div className="item-center">
              <span> {item.coursename}</span>
            </div>
            <div className="item-center">
              <span>({item.coursenameeng})</span>
            </div>
          </>
        );
      },
    },
    {
      key: "enrollseat",
      content: "เปิดลง | นักศึกษา",
      width: "150",
      className: "text-center",
      render: (item) => {
        return (
          <span className="item-center">
            {item.totalseat} | {item.enrollseat}
          </span>
        );
      },
    },
    {
      key: "labroom",
      content: " จำนวนห้อง LAB ",
      width: "150",
      className: "text-center",
      render: (item) => {
        return <span className="item-center">{item.labroom}</span>;
      },
    },
    {
      key: "section",
      content: " จำนวนกลุ่ม",
      width: "120",
      className: "text-center",
    },
    {
      key: "hour",
      content: " จำนวนชม.ที่เรียนต่อสัปดาห์",
      width: "200",
      className: "text-center",
    },
  ];

  if (
    userlogin === "ผู้ประสานงานรายวิชา" ||
    userlogin === "แอดมิน" ||
    userlogin === "หัวหน้าฝ่าย"
  ) {
    meta.push({
      key: "labId",
      content: "จัดการ",
      width: "270",
      className: "text-center",
      render: (item) => {
        const isOwner = String(item.personId) === String(userIdlogin);
        const isAdmin = userlogin === "แอดมิน";
        const isCoordinator = userlogin === "ผู้ประสานงานรายวิชา";
        const isDeptHead = userlogin === "หัวหน้าฝ่าย";
        const isLabChief = userlogin === "หัวหน้าบทปฏิบัติการ";

        if (!isOwner) {
          if (isCoordinator || isAdmin || isDeptHead) {
            return "-";
          }
          return null;
        }

        // ถ้าเป็นเจ้าของ (isOwner === true)
        return (
          <div className="cursor-pointer items-center justify-center flex gap-1">
            {(isAdmin || isCoordinator || isDeptHead) && (
              <>
                <button
                  className="cursor-pointer p-2 text-white text-sm bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg transition-all duration-200"
                  onClick={() => _onPressAdd(item.labId)}>
                  กำหนดปฏิบัติการ
                </button>
                <button
                  className="cursor-pointer p-2 text-white text-sm bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-200"
                  onClick={() => _onPressAddasset(item.labId)}>
                  แผนการใช้ทรัพยากร
                </button>
              </>
            )}

            {(isAdmin || isLabChief) && (
              <button
                className="cursor-pointer p-2 text-white text-sm bg-indigo-500 hover:bg-indigo-700 rounded-lg transition-all duration-200"
                onClick={() => _onPressAdd(item.labId)}>
                การใช้ทรัพยากรและอุปกรณ์ชำรุด
              </button>
            )}
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
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">
              รายการรายวิชาเตรียมปฏิบัติการ
            </h3>
          </div>

          <div className=" gap-1  justify-end">
            <div className="flex gap-2 justify-end items-center">
              <label className="block text-base font-medium text-gray-900 dark:text-gray-300 dark:text-gray-300 w-full">
                ปีการศึกษา
              </label>
              <select
                name="schId"
                className="border border-gray-500 p-2 rounded-lg w-full"
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
        <div className="p-4 overflow-auto">
          {error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <TableList meta={meta} data={lab} loading={loading} />
          )}
        </div>
      </div>
    </Content>
  );
}
const className = {
  label:
    "block text-sm font-medium text-gray-900 dark:text-gray-300 dark:text-gray-300",
  input:
    "block w-full px-3 py-1.5 border rounded-md shadow-sm dark:bg-gray-800",
  select: "block px-4 py-2 border rounded-md dark:bg-gray-800",
};
