"use client"; //  ต้องเพิ่ม

import { useSession, signOut } from "next-auth/react";
import Content from "@/components/Content";
import { useState } from "react";
import { useEffect } from "react";
import { use } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FileText,
  Users,
  Beaker,
  TrendingUp,
  User2,
  Armchair,
} from "lucide-react";
const tabs1 = [
  "ภาพรวม",
  "บทปฏิบัติการ",
  "ครุภัณฑ์ห้องปฎิบัติการ",
  "วัสดุสิ้นเปลือง",
  "วัสดุไม่สิ้นเปลือง",
  "ครุภัณฑ์วิทยาศาสตร์",
  "อุปกรณ์ชำรุด",
  // "คณะ",
  // "หลักสูตร",
];
import TableList from "@/components/TableList";

export default function Dashboard({ searchParams }) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("แนวโน้ม");
  const [dataFaculty, setFaculty] = useState(null);
  const [dataReg, setReg] = useState(null);
  const [dataLabjob, setLabjob] = useState([]);
  const [facproReport, setFacproReport] = useState([]);
  const [dataEquipment, setEquipment] = useState(null);
  const [dataSupplies, setSupplies] = useState(null);
  const [dataDurableitems, setDurableitems] = useState(null);
  const [dataCourse, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [broken, setBroken] = useState(null);
  const [scientific, setScientific] = useState([]);
  // const router = useRouter();
  // const { labId } = router.query;
  const params = use(searchParams);
  const encodedLabId = params.labId;
  const decodeLabId = (encoded) => {
    if (!encoded) return null;
    try {
      return atob(encoded);
    } catch {
      return null;
    }
  };

  const id = decodeLabId(encodedLabId);

  const [activeTab1, setActiveTab1] = useState("ภาพรวม");
  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/report/labcourse?id=${id}`);
      if (res.ok) {
        const json = await res.json();
        setFaculty(json.faculty);
        setData(json.data);
        setReg(json.reg);
        setLabjob(json.labjob);
        setEquipment(json.equipment);
        setSupplies(json.supplies);
        setDurableitems(json.durableitems);
        setFacproReport(json.facproReport);
        setBroken(json.broken);
        setScientific(Array.isArray(json.scientific) ? json.scientific : []);
      } else {
        console.error("Failed to fetch data");
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);
  const breadcrumb = [
    // { name: "แผนการให้บริการห้องปฎิบัติการ" },
    { name: "รายงานต้นทุนห้องปฏิบัติการ" },
  ];
  return (
    <Content
      breadcrumb={breadcrumb}
      title={`รายงานต้นทุนห้องปฏิบัติการรายวิชา ${
        dataCourse && dataCourse.length > 0
          ? dataCourse[0].coursename
          : " (กำลังโหลด...)"
      }`}>
      <div className="min-h-screen bg-purple-50 rounded-lg p-4">
        <div
          role="tablist"
          aria-orientation="horizontal"
          className="tabs tabs-boxed h-10 items-center justify-center rounded-lg text-muted-foreground grid grid-cols-12 mb-2 bg-white shadow-md"
          tabIndex={0}>
          {tabs1.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab1 === tab}
              aria-controls={`tab-content-${tab}`}
              data-state={activeTab1 === tab ? "active" : "inactive"}
              onClick={() => setActiveTab1(tab)}
              className={`tab tab-boxed col-span-2 text-center  rounded-lg transition-all duration-200 
            ${activeTab1 === tab ? "tab-active !bg-gray-200" : ""}
          `}>
              {tab}
            </button>
          ))}
        </div>
        <div>
          {/* Tab Panels */}
          {tabs1.map((tab) => {
            const isActive = activeTab1 === tab;
            const panelId = `tab-content-${tab.replace(/\s+/g, "-")}`;
            const tabId = `tab-${tab.replace(/\s+/g, "-")}`;
            return (
              <div
                key={tab}
                id={panelId}
                role="tabpanel"
                aria-labelledby={tabId}
                hidden={!isActive}
                className="p-2 border rounded-md bg-white">
                {isActive && activeTab1 === "ภาพรวม" && (
                  <main className="container mx-auto py-6 px-4">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {/* Card 1 */}
                      <div className="card bg-red-50 p-4 border shadow border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-red-100 p-2 rounded-full">
                            <FileText className="h-5 w-5 text-red-500" />
                          </div>
                          <span className="text-red-500 font-medium">
                            ต้นทุนรวม
                          </span>
                        </div>
                        <h2 className="text-black text-2xl font-bold">
                          <span>
                            {facproReport
                              ?.reduce((sum, item) => {
                                return (
                                  sum +
                                  (item.costPerprogram1 || 0) +
                                  (item.costPerprogram2 || 0) +
                                  (item.costPerprogram3 || 0)
                                );
                              }, 0)
                              .toLocaleString("th-TH", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{" "}
                            บาท
                          </span>
                        </h2>

                        <p className="text-sm text-gray-500">
                          ต้นทุนทั้งหมดของห้องปฏิบัติการ
                        </p>
                      </div>

                      {/* Card 2 */}
                      <div className="card p-4 bg-blue-50 border shadow border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Users className="h-5 w-5 text-blue-500" />
                          </div>
                          <span className="text-blue-500 font-medium">
                            นักศึกษา
                          </span>
                        </div>
                        <h2 className="text-black text-2xl font-bold">
                          {Array.isArray(dataReg)
                            ? dataReg.reduce(
                                (sum, cls) => sum + (cls.enrollseat || 0),
                                0
                              )
                            : 0}{" "}
                          คน
                        </h2>

                        <p className="text-sm text-gray-500">
                          จำนวนนักศึกษาที่ลงทะเบียน
                        </p>
                      </div>

                      {/* Card 3 */}
                      <div className="card p-4 bg-amber-50 border shadow border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-amber-100 p-2 rounded-full">
                            <Beaker className="h-5 w-5 text-amber-500" />
                          </div>
                          <span className="text-amber-500 font-medium">
                            บทปฏิบัติการ
                          </span>
                        </div>
                        <h2 className="text-black text-2xl font-bold">
                          {Array.isArray(dataLabjob) ? dataLabjob.length : 0}{" "}
                          รายการ
                        </h2>
                        <p className="text-sm text-gray-500">
                          จำนวนบทปฏิบัติการทั้งหมด
                        </p>
                      </div>

                      {/* Card 4 */}
                      <div className="card p-4 bg-green-50 border shadow border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-green-100 p-2 rounded-full">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                          </div>
                          <span className="text-green-500 font-medium">
                            ต้นทุนต่อนักศึกษา
                          </span>
                        </div>
                        <h2 className="text-black text-2xl font-bold">
                          <span>
                            {facproReport
                              ?.reduce((sum, item) => {
                                return (
                                  ((item.costPerprogram1 || 0) +
                                    (item.costPerprogram2 || 0) +
                                    (item.costPerprogram3 || 0)) /
                                  item.countstd
                                );
                              }, 0)
                              .toLocaleString("th-TH", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{" "}
                            บาท
                          </span>
                        </h2>
                        <p className="text-sm text-gray-500">
                          ต้นทุนต่อหัวต่อนักศึกษา
                        </p>
                      </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="card grid grid-cols-1 lg:grid-cols-2 gap-6 ">
                      {/* Cost Analysis Chart */}
                      <div className="p-6 burder shadow border-black-900 rounded-lg">
                        <h2 className="text-black text-2xl font-bold mb-1">
                          ข้อมูลพื้นฐานของรายวิชา
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                          รายละเอียดเกี่ยวกับรายวิชาห้องปฏิบัติการ
                        </p>

                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                          <div className="text-gray-500 text-base">
                            รหัสวิชา:
                          </div>
                          <div className="text-black font-medium text-base">
                            {" "}
                            {dataCourse && dataCourse.length > 0
                              ? dataCourse[0].coursecode
                              : "กำลังโหลด..."}{" "}
                          </div>

                          <div className="text-gray-500 text-base">
                            ชื่อวิชา:
                          </div>
                          <div className="text-black font-medium text-base">
                            {" "}
                            {dataCourse && dataCourse.length > 0
                              ? dataCourse[0].coursename
                              : "กำลังโหลด..."}{" "}
                            <br />
                            {dataCourse && dataCourse.length > 0
                              ? dataCourse[0].coursenameeng
                              : "กำลังโหลด..."}{" "}
                          </div>
                          <div className="text-gray-500 text-base">
                            รายวิชาย่อย:
                          </div>
                          <div className="text-black font-medium text-base">
                            {dataCourse &&
                            dataCourse.length > 0 &&
                            dataCourse[0].sub &&
                            dataCourse[0].sub.length > 0 ? (
                              <ul className="list-disc list-inside ">
                                {dataCourse[0].sub.map((sub, iSub) => (
                                  <li
                                    key={iSub}
                                    className="text-sm text-gray-900 dark:text-gray-400 flex items-center gap-1">
                                    {sub.coursecode} {sub.coursename}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-sm text-gray-400 ">-</div>
                            )}
                          </div>
                          <div className="text-gray-500 text-base">
                            สำนักวิชา:
                          </div>
                          <div className="text-black font-medium text-base">
                            {" "}
                            {dataCourse && dataCourse.length > 0
                              ? dataCourse[0].facultyname
                              : "กำลังโหลด..."}{" "}
                          </div>

                          <div className="text-gray-500 text-base">
                            ปีการศึกษา:
                          </div>
                          <div className="text-black font-medium text-base">
                            {" "}
                            {dataCourse && dataCourse.length > 0
                              ? dataCourse[0].acadyear
                              : "กำลังโหลด..."}
                            {" / "}
                            {dataCourse && dataCourse.length > 0
                              ? dataCourse[0].semester
                              : "กำลังโหลด..."}
                          </div>

                          <div className="text-gray-500 text-base">
                            กลุ่มปฏิบัติการ:
                          </div>
                          <div className="text-black font-medium text-base">
                            {" "}
                            {dataCourse && dataCourse.length > 0
                              ? dataCourse[0].labgroupName
                              : "กำลังโหลด..."}{" "}
                          </div>
                        </div>
                      </div>

                      {/* Lab Information */}
                      <div className="grid gap-6 ">
                        <div className="card p-6 burder shadow border-black-900 rounded-lg">
                          <h2 className="text-black text-2xl font-bold mb-1">
                            ข้อมูลการลงทะเบียน
                          </h2>
                          <p className="text-sm text-gray-500 mb-4">
                            จำนวนนักศึกษาที่ลงทะเบียนในแต่ละ section
                          </p>
                          {Array.isArray(dataReg) ? (
                            <>
                              {dataReg.map((cls, index) => {
                                return (
                                  <div
                                    key={index}
                                    className="grid gap-y-2 text-sm">
                                    <div className="text-base flex justify-between py-1">
                                      <div className="text-gray-500">
                                        กลุ่ม {cls.section}:
                                      </div>
                                      <div className="text-black font-medium">
                                        {/* {cls.enrollseat} คน / {cls.totalseat}{" "}
                                        ที่นั่ง
                                        <p className="block">
                                          กลุ่มเรียน : {item.section}
                                        </p> */}
                                        <p className="block opacity-70 flex items-center gap-1 ">
                                          <User2 className="w-4 h-4" />{" "}
                                          {cls.enrollseat} |{" "}
                                          <Armchair className="w-4 h-4" />{" "}
                                          {cls.totalseat}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* รวมจำนวนและอัตราการเต็มรวม */}
                              <div className="grid gap-y-1 text-sm mb-4 mt-2">
                                <div className="flex justify-between py-1 font-medium">
                                  <div className="text-gray-500 text-base">
                                    จำนวนนักศึกษาทั้งหมด:
                                  </div>
                                  <div className="text-black text-base">
                                    {dataReg.reduce(
                                      (sum, cls) => sum + (cls.enrollseat || 0),
                                      0
                                    )}{" "}
                                    คน
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div>กำลังโหลดข้อมูล...</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Top Lab Costs */}
                    <div className="card mt-6 p-6 burder shadow border-black-900 rounded-lg">
                      <h2 className="text-black text-2xl font-bold mb-1">
                        สรุปจำนวนรายวิชาปฏิบัติการ
                      </h2>
                      <p className="text-sm text-gray-500 mb-4">ข้อมูลต้นทุน</p>

                      <div className="overflow-x-auto">
                        <TableList
                          meta={[
                            {
                              key: "facultyname",
                              content: "สำนักวิชา",
                              render: (item) => (
                                <div className="flex flex-col">
                                  <p className="block">{item.facultyname}</p>
                                  <p className="block opacity-60 text-sm">
                                    {item.labjobDesc}
                                  </p>
                                </div>
                              ),
                            },
                            {
                              key: "programname",
                              content: "หลักสูตร",
                            },

                            {
                              key: "countstd",
                              className: "text-right",
                              content: "จำนวนนักศึกษา",
                              render: (row) =>
                                row.totalEnroll != null
                                  ? Number(row.countstd).toLocaleString(
                                      "en-US",
                                      {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                      }
                                    )
                                  : "-",
                            },
                            {
                              key: "costPerprogram3",
                              className: "text-right",
                              content: "วัสดุสิ้นเปลือง(ราคา/ภาค)",
                              render: (row) =>
                                row.costPerprogram3 != null
                                  ? Number(row.costPerprogram3).toLocaleString(
                                      "en-US",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }
                                    )
                                  : "-",
                            },
                            {
                              key: "costPerprogram2",
                              className: "text-right",
                              content: "วัสดุไม่สิ้นเปลือง(ราคา/ภาค)",
                              render: (row) =>
                                row.costPerprogram2 != null
                                  ? Number(row.costPerprogram2).toLocaleString(
                                      "en-US",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }
                                    )
                                  : "-",
                            },
                            {
                              key: "costPerprogram1",
                              className: "text-right",
                              content: "ครุภัณฑ์ห้องปฎิบัติการ",
                              render: (row) =>
                                row.costPerprogram1 != null
                                  ? Number(row.costPerprogram1).toLocaleString(
                                      "en-US",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }
                                    )
                                  : "-",
                            },

                            {
                              key: "costPerprogram1",
                              className: "text-right",
                              content: "รายจ่ายรวม (บาท)",
                              render: (row) => {
                                const total =
                                  (row.costPerprogram1 || 0) +
                                  (row.costPerprogram2 || 0) +
                                  (row.costPerprogram3 || 0);

                                return total.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                });
                              },
                            },
                            {
                              key: "priceperTermInvtype1",
                              className: "text-right",
                              content: "ค่าใช้ต่อคน (บาท)",
                              render: (row) => {
                                const total =
                                  ((row.costPerprogram1 || 0) +
                                    (row.costPerprogram2 || 0) +
                                    (row.costPerprogram3 || 0)) /
                                  (row.countstd || 1);

                                return total.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                });
                              },
                            },
                          ]}
                          data={facproReport}
                          loading={loading}
                        />
                      </div>
                    </div>
                  </main>
                )}
                {isActive && activeTab1 === "บทปฏิบัติการ" && (
                  <main className="container mx-auto py-6 px-4">
                    {/* Top Lab Costs */}
                    <div className="card mt-6 p-6 burder shadow border-black-900 rounded-lg">
                      <h2 className="text-black text-2xl font-bold mb-1">
                        ต้นทุนบทปฏิบัติการรายวิชา
                      </h2>
                      <p className="text-sm text-gray-500 mb-4">
                        รายละเอียดต้นทุนของแต่ละบทปฏิบัติการ
                      </p>

                      <div className="overflow-x-auto">
                        <TableList
                          meta={[
                            {
                              key: "labjobTitle",
                              content: "ชื่อบทปฏิบัติการ",
                              render: (item) => (
                                <div className="flex flex-col">
                                  <p className="block font-medium text-gray-900 dark:text-gray-100">
                                    {item.labjobTitle}
                                  </p>
                                </div>
                              ),
                            },
                            {
                              key: "fullname",
                              content: "หัวหน้าบทปฏิบัติการ",
                              render: (item) => (
                                <div className="flex flex-col">
                                  <p className="block text-gray-900 dark:text-gray-100">
                                    {item.fullname}
                                  </p>
                                  <p className="block opacity-60 text-sm">
                                    ผู้รับผิดชอบ
                                  </p>
                                </div>
                              ),
                            },
                            {
                              key: "assetCount",
                              content: "จำนวนรายการ",
                              render: (item) => (
                                <div className="text-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {item.asset ? item.asset.length : 0} รายการ
                                  </span>
                                </div>
                              ),
                            },
                            {
                              key: "totalCost",
                              content: "ต้นทุนรวม (บาท)",
                              render: (item) => {
                                const total = item.asset
                                  ? item.asset.reduce((sum, asset) => {
                                      const amount = parseFloat(
                                        asset.amountUsed || 0
                                      );
                                      const price = parseFloat(
                                        asset.unitPrice || 0
                                      );
                                      return sum + amount * price;
                                    }, 0)
                                  : 0;

                                return (
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-green-600">
                                      {total.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      บาท
                                    </div>
                                  </div>
                                );
                              },
                            },
                          ]}
                          data={dataLabjob}
                          loading={loading}
                        />
                      </div>
                    </div>
                  </main>
                )}
                {isActive && activeTab1 === "ครุภัณฑ์ห้องปฎิบัติการ" && (
                  <main className="container mx-auto py-6 px-4">
                    {/* Top Lab Costs */}
                    <div className="card mt-6 p-6 burder shadow border-black-900 rounded-lg">
                      <h2 className="text-black text-xl font-bold mb-1">
                        การคิดราคาต้นทุนของรายวิชา
                        <span>
                          :{" "}
                          {dataCourse && dataCourse.length > 0
                            ? dataCourse[0].coursecode
                            : "กำลังโหลด..."}{" "}
                          {dataCourse && dataCourse.length > 0
                            ? dataCourse[0].coursename
                            : "กำลังโหลด..."}{" "}
                        </span>
                        สำหรับการลงทุนทางครุภัณฑ์
                      </h2>
                      <p className="text-sm text-gray-500 mb-4">
                        รายการครุภัณฑ์ห้องปฎิบัติการ
                      </p>

                      <div className="overflow-x-auto">
                        <TableList
                          meta={[
                            {
                              key: "assetNameTh",
                              content: "รายการครุภัณฑ์ห้องปฎิบัติการ",
                              render: (item) => (
                                <div className="flex flex-col">
                                  <p className="block">
                                    {item.assetNameTh} ขนาด
                                    {item.amountUnit === "unit"
                                      ? ""
                                      : " " + item.amountUnit}
                                  </p>
                                  <p className="block opacity-60 text-sm">
                                    {item.assetNameEng}
                                  </p>
                                </div>
                              ),
                            },
                            {
                              key: "unitPrice",
                              content: "ราคา/หน่วย (บาท/เครื่อง)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.unitPrice?.toLocaleString() ?? "-"}
                                </div>
                              ),
                            },
                            {
                              key: "totalAmountUsed",
                              content: "จำนวนที่ใช้ (อัน/เครื่อง)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.totalAmountUsed?.toLocaleString() ??
                                    "-"}
                                </div>
                              ),
                            },
                            {
                              key: "itemTotal",
                              content: "ราคารวม (บาท)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.itemTotal?.toLocaleString() ?? "-"}
                                </div>
                              ),
                            },
                            {
                              key: "costPerHour5y",
                              content: "ราคา/ชม. (บาท/ชม)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.costPerHour5y?.toFixed(2) ?? "-"}
                                </div>
                              ),
                            },
                            {
                              key: "priceSemester",
                              content: "ราคา/เทอม (บาท/เทอม)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.priceSemester?.toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  ) ?? "-"}
                                </div>
                              ),
                            },
                            {
                              key: "costPerHourTotalStudents",
                              content: "ราคา/เทอม/คน (บาท/เทอม/คน)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.costPerHourTotalStudents?.toFixed(2) ??
                                    "-"}
                                </div>
                              ),
                            },
                          ]}
                          data={dataEquipment}
                          loading={loading}
                        />

                        {/* แถวสรุปรวม */}
                        {dataEquipment && dataEquipment.length > 0 && (
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-t-2 border-gray-200">
                            <h3 className="font-semibold text-lg mb-3 text-gray-700 dark:text-gray-200">
                              สรุปรวมครุภัณฑ์ห้องปฎิบัติการ
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                                <div className="text-blue-600 dark:text-blue-300 font-medium">
                                  จำนวนรายการ
                                </div>
                                <div className="text-xl font-bold text-blue-800 dark:text-blue-200">
                                  {dataEquipment.length} รายการ
                                </div>
                              </div>

                              <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                                <div className="text-green-600 dark:text-green-300 font-medium">
                                  ราคารวมทั้งหมด
                                </div>
                                <div className="text-xl font-bold text-green-800 dark:text-green-200">
                                  {dataEquipment
                                    .reduce(
                                      (sum, item) =>
                                        sum + (item.itemTotal || 0),
                                      0
                                    )
                                    .toLocaleString()}{" "}
                                  บาท
                                </div>
                              </div>

                              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                                <div className="text-purple-600 dark:text-purple-300 font-medium">
                                  ราคา/เทอม รวม
                                </div>
                                <div className="text-xl font-bold text-purple-800 dark:text-purple-200">
                                  {dataEquipment
                                    .reduce(
                                      (sum, item) =>
                                        sum + (item.priceSemester || 0),
                                      0
                                    )
                                    .toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}{" "}
                                  บาท
                                </div>
                              </div>

                              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900 rounded-lg">
                                <div className="text-orange-600 dark:text-orange-300 font-medium">
                                  ราคา/เทอม/คน รวม
                                </div>
                                <div className="text-xl font-bold text-orange-800 dark:text-orange-200">
                                  {dataEquipment
                                    .reduce(
                                      (sum, item) =>
                                        sum +
                                        (item.costPerHourTotalStudents || 0),
                                      0
                                    )
                                    .toFixed(2)}{" "}
                                  บาท
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </main>
                )}
                {isActive && activeTab1 === "วัสดุสิ้นเปลือง" && (
                  <main className="container mx-auto py-6 px-4">
                    {/* Top Lab Costs */}
                    <div className="card mt-6 p-6 burder shadow border-black-900 rounded-lg">
                      <h2 className="text-black text-xl font-bold mb-1">
                        การคิดราคาต้นทุนของรายวิชา
                        <span>
                          :{" "}
                          {dataCourse && dataCourse.length > 0
                            ? dataCourse[0].coursecode
                            : "กำลังโหลด..."}{" "}
                          {dataCourse && dataCourse.length > 0
                            ? dataCourse[0].coursename
                            : "กำลังโหลด..."}{" "}
                        </span>
                        สำหรับการลงทุนทางวัสดุสิ้นเปลือง
                      </h2>
                      <p className="text-sm text-gray-500 mb-4">
                        รายการวัสดุสิ้นเปลือง
                      </p>

                      <div className="overflow-x-auto">
                        <TableList
                          meta={[
                            {
                              key: "assetNameTh",
                              content: "รายการวัสดุสิ้นเปลือง",
                              render: (item) => (
                                <div className="flex flex-col">
                                  <p className="block">{item.assetNameTh}</p>
                                  <p className="block opacity-60 text-sm">
                                    {item.assetNameEng}
                                  </p>
                                </div>
                              ),
                            },
                            {
                              key: "packPrice",
                              content: "ราคา/pack (บาท/pack)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.packPrice?.toLocaleString() ?? "-"}
                                </div>
                              ),
                            },
                            {
                              key: "amountUnit",
                              content: "จำนวน/pack (หน่วย/pack)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.amountUnit?.toLocaleString() ?? "-"}
                                </div>
                              ),
                            },
                            {
                              key: "unitPrice",
                              content: "ราคา/หน่วย (บาท/หน่วย)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.unitPrice?.toLocaleString() ?? "-"}
                                </div>
                              ),
                            },
                            {
                              key: "amountUsed",
                              content: "จำนวนที่ใช้ (หน่วย)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.amountUsed?.toFixed(2) ?? "-"}
                                </div>
                              ),
                            },
                            {
                              key: "itemTotal",
                              content: "ราคารวม (บาท)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.itemTotal?.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }) ?? "-"}
                                </div>
                              ),
                            },
                            {
                              key: "priceStd",
                              content: "ราคารวม/คน (บาท/คน)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.priceStd?.toFixed(2) ?? "-"}
                                </div>
                              ),
                            },
                          ]}
                          data={dataSupplies}
                          loading={loading}
                        />

                        {/* แถวสรุปรวมวัสดุสิ้นเปลือง */}
                        {dataSupplies && dataSupplies.length > 0 && (
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-t-2 border-gray-200">
                            <h3 className="font-semibold text-lg mb-3 text-gray-700 dark:text-gray-200">
                              สรุปรวมวัสดุสิ้นเปลือง
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                                <div className="text-blue-600 dark:text-blue-300 font-medium">
                                  จำนวนรายการ
                                </div>
                                <div className="text-xl font-bold text-blue-800 dark:text-blue-200">
                                  {dataSupplies.length} รายการ
                                </div>
                              </div>

                              <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                                <div className="text-green-600 dark:text-green-300 font-medium">
                                  ราคารวมทั้งหมด
                                </div>
                                <div className="text-xl font-bold text-green-800 dark:text-green-200">
                                  {dataSupplies
                                    .reduce(
                                      (sum, item) =>
                                        sum + (item.itemTotal || 0),
                                      0
                                    )
                                    .toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}{" "}
                                  บาท
                                </div>
                              </div>

                              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                                <div className="text-purple-600 dark:text-purple-300 font-medium">
                                  จำนวนที่ใช้รวม
                                </div>
                                <div className="text-xl font-bold text-purple-800 dark:text-purple-200">
                                  {dataSupplies
                                    .reduce(
                                      (sum, item) =>
                                        sum + (item.amountUsed || 0),
                                      0
                                    )
                                    .toFixed(2)}{" "}
                                  หน่วย
                                </div>
                              </div>

                              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900 rounded-lg">
                                <div className="text-orange-600 dark:text-orange-300 font-medium">
                                  ราคารวม/คน รวม
                                </div>
                                <div className="text-xl font-bold text-orange-800 dark:text-orange-200">
                                  {dataSupplies
                                    .reduce(
                                      (sum, item) => sum + (item.priceStd || 0),
                                      0
                                    )
                                    .toFixed(2)}{" "}
                                  บาท
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </main>
                )}
                {isActive && activeTab1 === "วัสดุไม่สิ้นเปลือง" && (
                  <main className="container mx-auto py-6 px-4">
                    {/* Top Lab Costs */}
                    <div className="card mt-6 p-6 burder shadow border-black-900 rounded-lg">
                      <h2 className="text-black text-xl font-bold mb-1">
                        การคิดราคาต้นทุนของรายวิชา
                        <span>
                          :{" "}
                          {dataCourse && dataCourse.length > 0
                            ? dataCourse[0].coursecode
                            : "กำลังโหลด..."}{" "}
                          {dataCourse && dataCourse.length > 0
                            ? dataCourse[0].coursename
                            : "กำลังโหลด..."}{" "}
                        </span>
                        สำหรับการลงทุนทางวัสดุไม่สิ้นเปลือง
                      </h2>
                      <p className="text-sm text-gray-500 mb-4">
                        รายการวัสดุไม่สิ้นเปลือง
                      </p>

                      <div className="overflow-x-auto">
                        <TableList
                          meta={[
                            {
                              key: "assetNameTh",
                              content: "รายการวัสดุไม่สิ้นเปลือง",
                              render: (item) => (
                                <div className="flex flex-col">
                                  <p className="block">{item.assetNameTh}</p>
                                  <p className="block opacity-60 text-sm">
                                    {item.assetNameEng}
                                  </p>
                                </div>
                              ),
                            },
                            {
                              key: "packPrice",
                              content: "ราคา/pack (บาท/pack)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.packPrice?.toLocaleString() ?? "-"}
                                </div>
                              ),
                            },
                            {
                              key: "unitPrice",
                              content: "ราคา/หน่วย (บาท/หน่วย)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.unitPrice?.toLocaleString() ?? "-"}
                                </div>
                              ),
                            },
                            {
                              key: "amountUsed",
                              content: "จำนวนที่ใช้ (หน่วย)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.amountUsed?.toFixed(2) ?? "-"}
                                </div>
                              ),
                            },
                            {
                              key: "itemTotal",
                              content: "ราคารวม (บาท)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.itemTotal?.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }) ?? "-"}
                                </div>
                              ),
                            },
                            {
                              key: "costStd",
                              content: "ราคาที่ใช้/ชม. (บาท/ชม.)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.costPerHour5y?.toFixed(2) ?? "-"}
                                </div>
                              ),
                            },
                            {
                              key: "hourUsed",
                              content: "จำนวนชม. (ที่ใช้/เทอม)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.hourUsed?.toFixed(2) ?? "-"}
                                </div>
                              ),
                            },
                            {
                              key: "priceSemester",
                              content: "ราคา/ภาคการศึกษา (บาท/เทอม)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.priceSemester?.toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  ) ?? "-"}
                                </div>
                              ),
                            },
                            {
                              key: "costStd",
                              content: "ราคารวม/คน (บาท/คน)",
                              render: (item) => (
                                <div className="text-right">
                                  {item.costStd?.toFixed(2) ?? "-"}
                                </div>
                              ),
                            },
                          ]}
                          data={dataDurableitems}
                          loading={loading}
                        />

                        {/* แถวสรุปรวมวัสดุไม่สิ้นเปลือง */}
                        {dataDurableitems && dataDurableitems.length > 0 && (
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-t-2 border-gray-200">
                            <h3 className="font-semibold text-lg mb-3 text-gray-700 dark:text-gray-200">
                              สรุปรวมวัสดุไม่สิ้นเปลือง
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                                <div className="text-blue-600 dark:text-blue-300 font-medium">
                                  จำนวนรายการ
                                </div>
                                <div className="text-xl font-bold text-blue-800 dark:text-blue-200">
                                  {dataDurableitems.length} รายการ
                                </div>
                              </div>

                              <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                                <div className="text-green-600 dark:text-green-300 font-medium">
                                  ราคารวมทั้งหมด
                                </div>
                                <div className="text-xl font-bold text-green-800 dark:text-green-200">
                                  {dataDurableitems
                                    .reduce(
                                      (sum, item) =>
                                        sum + (item.itemTotal || 0),
                                      0
                                    )
                                    .toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}{" "}
                                  บาท
                                </div>
                              </div>

                              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                                <div className="text-purple-600 dark:text-purple-300 font-medium">
                                  ราคา/ภาคการศึกษา รวม
                                </div>
                                <div className="text-xl font-bold text-purple-800 dark:text-purple-200">
                                  {dataDurableitems
                                    .reduce(
                                      (sum, item) =>
                                        sum + (item.priceSemester || 0),
                                      0
                                    )
                                    .toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}{" "}
                                  บาท
                                </div>
                              </div>

                              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900 rounded-lg">
                                <div className="text-orange-600 dark:text-orange-300 font-medium">
                                  ราคารวม/คน รวม
                                </div>
                                <div className="text-xl font-bold text-orange-800 dark:text-orange-200">
                                  {dataDurableitems
                                    .reduce(
                                      (sum, item) => sum + (item.costStd || 0),
                                      0
                                    )
                                    .toFixed(2)}{" "}
                                  บาท
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </main>
                )}
                {isActive && activeTab1 === "ครุภัณฑ์วิทยาศาสตร์" && (
                  <main className="container mx-auto py-6 px-4">
                    {/* Scientific Equipment Costs */}
                    <div className="card mt-6 p-6 burder shadow border-black-900 rounded-lg">
                      <h2 className="text-black text-xl font-bold mb-1">
                        การคิดราคาต้นทุนของรายวิชา
                        <span>
                          :{" "}
                          {dataCourse && dataCourse.length > 0
                            ? dataCourse[0].coursecode
                            : "กำลังโหลด..."}{" "}
                          {dataCourse && dataCourse.length > 0
                            ? dataCourse[0].coursename
                            : "กำลังโหลด..."}{" "}
                        </span>
                        สำหรับการลงทุนทางครุภัณฑ์วิทยาศาสตร์
                      </h2>
                      <p className="text-sm text-gray-500 mb-4">
                        รายการครุภัณฑ์วิทยาศาสตร์
                      </p>

                      <div className="overflow-x-auto">
                        {Array.isArray(scientific) && scientific.length > 0 ? (
                          <>
                            <TableList
                              meta={[
                                {
                                  key: "assetNameTh",
                                  content: "รายการวัสดุไม่สิ้นเปลือง",
                                  render: (item) => (
                                    <div className="flex flex-col">
                                      <p className="block">
                                        {item.assetNameTh}
                                      </p>
                                      <p className="block opacity-60 text-sm">
                                        {item.assetNameEng}
                                      </p>
                                    </div>
                                  ),
                                },
                                {
                                  key: "packPrice",
                                  content: "ราคา/แพ็ค ",
                                  render: (item) => (
                                    <div className="text-right">
                                      {item.packPrice?.toLocaleString() ?? "-"}
                                      <p className="text-xs opacity-60">
                                        บาท/pack
                                      </p>
                                    </div>
                                  ),
                                },
                                {
                                  key: "unitPrice",
                                  content: "ราคา/หน่วย ",
                                  render: (item) => (
                                    <div className="text-right">
                                      {item.unitPrice?.toLocaleString() ?? "-"}
                                      <p className="text-xs opacity-60">
                                        บาท/หน่วย
                                      </p>
                                    </div>
                                  ),
                                },
                                {
                                  key: "amountUsed",
                                  content: "จำนวนที่ใช้ ",
                                  render: (item) => (
                                    <div className="text-right">
                                      {item.amountUsed?.toFixed(2) ?? "-"}
                                      <p className="text-xs opacity-60">
                                        หน่วย
                                      </p>
                                    </div>
                                  ),
                                },
                                {
                                  key: "itemTotal",
                                  content: "ราคารวม ",
                                  render: (item) => (
                                    <div className="text-right">
                                      {item.itemTotal?.toLocaleString(
                                        undefined,
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }
                                      ) ?? "-"}
                                      <p className="text-xs opacity-60">บาท</p>
                                    </div>
                                  ),
                                },
                                {
                                  key: "costStd",
                                  content: "ราคาที่ใช้/ชม. ",
                                  render: (item) => (
                                    <div className="text-right">
                                      {item.costPerHour5y?.toFixed(2) ?? "-"}
                                      <p className="text-xs opacity-60">
                                        บาท/ชม.
                                      </p>
                                    </div>
                                  ),
                                },
                                {
                                  key: "hourUsed",
                                  content: "จำนวนชม. ",
                                  render: (item) => (
                                    <div className="text-right">
                                      {item.hourUsed?.toFixed(2) ?? "-"}
                                      <p className="text-xs opacity-60">
                                        ที่ใช้/เทอม
                                      </p>
                                    </div>
                                  ),
                                },
                                {
                                  key: "priceSemester",
                                  content: "ราคา/ภาคการศึกษา ",
                                  render: (item) => (
                                    <div className="text-right">
                                      {item.priceSemester?.toLocaleString(
                                        undefined,
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }
                                      ) ?? "-"}
                                      <p className="text-xs opacity-60">
                                        บาท/เทอม
                                      </p>
                                    </div>
                                  ),
                                },
                                {
                                  key: "costStd",
                                  content: "ต้นทุนต่อนักศึกษา",
                                  render: (item) => (
                                    <div className="text-right">
                                      <p className="text-green-600 dark:text-green-400 font-semibold">
                                        {Number(item.costStd).toLocaleString(
                                          "th-TH",
                                          {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          }
                                        )}
                                      </p>
                                      <p className="text-xs opacity-60">
                                        บาท/คน
                                      </p>
                                    </div>
                                  ),
                                },
                              ]}
                              data={scientific}
                            />

                            {/* Summary Row */}
                            <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                  <p className="text-sm font-medium text-blue-600">
                                    รวมรายการ
                                  </p>
                                  <p className="text-lg font-bold text-blue-900">
                                    {scientific.length} รายการ
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium text-blue-600">
                                    รวมจำนวนที่ใช้
                                  </p>
                                  <p className="text-lg font-bold text-blue-900">
                                    {scientific
                                      .reduce(
                                        (sum, item) =>
                                          sum + Number(item.amountUsed || 0),
                                        0
                                      )
                                      .toLocaleString("th-TH")}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium text-blue-600">
                                    รวมราคาต่อเทอม
                                  </p>
                                  <p className="text-lg font-bold text-blue-900">
                                    {scientific
                                      .reduce(
                                        (sum, item) =>
                                          sum + Number(item.priceSemester || 0),
                                        0
                                      )
                                      .toLocaleString("th-TH", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}{" "}
                                    บาท
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium text-blue-600">
                                    เฉลี่ยต้นทุนต่อนักศึกษา
                                  </p>
                                  <p className="text-lg font-bold text-green-600">
                                    {scientific.length > 0
                                      ? (
                                          scientific.reduce(
                                            (sum, item) =>
                                              sum + Number(item.costStd || 0),
                                            0
                                          ) / scientific.length
                                        ).toLocaleString("th-TH", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : "0.00"}{" "}
                                    บาท/คน
                                  </p>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                              <svg
                                className="w-8 h-8 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <p className="text-gray-500 text-lg">
                              ไม่มีครุภัณฑ์วิทยาศาสตร์ที่ต้องรายงาน
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                              ห้องปฏิบัติการนี้ไม่มีการใช้ครุภัณฑ์วิทยาศาสตร์
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </main>
                )}
                {isActive && activeTab1 === "อุปกรณ์ชำรุด" && (
                  <main className="container mx-auto py-6 px-4">
                    {/* Broken Equipment */}
                    <div className="card mt-6 p-6 burder shadow border-black-900 rounded-lg">
                      <h2 className="text-black text-xl font-bold mb-1">
                        รายการอุปกรณ์ชำรุดและต้องซ่อมแซม
                        <span>
                          {" รายวิชา "}
                          {dataCourse && dataCourse.length > 0
                            ? dataCourse[0].coursecode
                            : "กำลังโหลด..."}{" "}
                          {dataCourse && dataCourse.length > 0
                            ? dataCourse[0].coursename
                            : "กำลังโหลด..."}{" "}
                        </span>
                      </h2>
                      <p className="text-sm text-gray-500 mb-4">
                        อุปกรณ์ที่ชำรุดและต้องดำเนินการซ่อมแซมหรือเปลี่ยนใหม่
                      </p>

                      <div className="overflow-x-auto">
                        <TableList
                          meta={[
                            {
                              key: "assetNameTh",
                              content: "ชื่ออุปกรณ์",
                              render: (item) => (
                                <div className="flex flex-col">
                                  <p className="block font-medium text-gray-900 dark:text-gray-100">
                                    {item.assetNameTh}
                                  </p>
                                  <p className="block opacity-60 text-sm">
                                    {item.assetNameEng || "ไม่มีชื่อภาษาอังกฤษ"}
                                  </p>
                                </div>
                              ),
                            },
                            {
                              key: "brandName",
                              content: "ยี่ห้อ / รุ่น",
                              render: (item) => (
                                <div className="flex flex-col">
                                  <p className="block text-gray-900 dark:text-gray-100">
                                    {item.brandName || "-"}
                                  </p>
                                  <p className="block opacity-60 text-sm">
                                    {item.version || "ไม่ระบุรุ่น"}
                                  </p>
                                </div>
                              ),
                            },

                            {
                              key: "unitPrice",
                              content: "ราคาต่อหน่วย",
                              render: (item) => (
                                <div className="text-right">
                                  <div className="text-base font-medium text-gray-900">
                                    {item.unitPrice?.toLocaleString() ?? "-"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    บาท
                                  </div>
                                </div>
                              ),
                            },
                            {
                              key: "packPrice",
                              content: "ราคาต่อแพ็ค",
                              render: (item) => (
                                <div className="text-right">
                                  <div className="text-base font-medium text-gray-900">
                                    {item.packPrice?.toLocaleString() ?? "-"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    บาท
                                  </div>
                                </div>
                              ),
                            },
                            {
                              key: "brokenAmount",
                              content: "จำนวนที่ชำรุด (ชิ้น)",
                              render: (item) => (
                                <div className="text-center">
                                  <div className="text-base font-medium text-red-600">
                                    {item.brokenAmount || "-"}
                                  </div>
                                </div>
                              ),
                            },
                            {
                              key: "totalCost",
                              content: "มูลค่าความเสียหาย",
                              render: (item) => {
                                const cost =
                                  (item.unitPrice || 0) *
                                  (item.brokenAmount || 0);
                                return (
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-red-600">
                                      {cost.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      บาท
                                    </div>
                                  </div>
                                );
                              },
                            },
                          ]}
                          data={broken || []}
                          loading={loading}
                        />

                        {/* กรณีไม่มีข้อมูล */}
                        {(!broken || broken.length === 0) && !loading && (
                          <div className="text-center py-8">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                              <svg
                                className="w-8 h-8 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                              ไม่มีอุปกรณ์ชำรุด
                            </h3>
                            <p className="text-gray-500">
                              ขณะนี้ไม่มีอุปกรณ์ที่ชำรุดในรายวิชานี้
                              ทุกอุปกรณ์อยู่ในสภาพดี
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </main>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Content>
  );
}
