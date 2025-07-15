"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import axios from "axios";
import Content from "@/components/Content";
import { confirmDialog, toastDialog } from "@/lib/stdLib";
import { useSession } from "next-auth/react";
import { set } from "react-hook-form";
import { FiSave, FiX, FiFileText, FiUser, FiCalendar } from "react-icons/fi";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  Building,
  GraduationCap,
  FileText,
  UserCheck,
} from "lucide-react";

/**
 * @typedef {Object} InventoryItem
 * @property {number} id
 * @property {string} name
 * @property {number} quantity
 */

function PageContent() {
  const { data: session } = useSession();

  const userCreated = session?.user.person_id;
  const [data, setData] = useState([]); // Data for the first dropdown
  const [subData, setSubData] = useState([]); // Data for the second dropdown
  const [divPerson, setDivPerson] = useState(""); // State สำหรับค่า default
  const searchParams = useSearchParams();
  const labId = searchParams.get("labId");
  const labjobId = searchParams.get("labjobId");
  const isNew = labjobId === "new";
  const [loading, setLoading] = useState(!isNew);
  const breadcrumb = [
    { name: "รายวิชา", link: "/prepare-lab" },
    { name: "ใบเตรียมปฏิบัติการ", link: "/prepare-lab/new?labId=" + labId },
    { name: "กำหนดหัวหน้าบทปฏิบัติการ" },
  ];
  const router = useRouter();
  const [datacourse, setDatacourse] = useState(null);
  const [formData, setFormData] = useState({
    labjobTitle: "",
    personId: "",
    divId: "", // ID ของฝ่าย
    userCreated: userCreated,
  });

  // Handle form data changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      const updatedFormData = { ...formData, labId, userCreated };
      if (labjobId !== "new") {
        response = await axios.put(
          `/api/labjob?labjobId=${labjobId}`,
          updatedFormData
        );
      } else {
        response = await axios.post("/api/labjob", updatedFormData);
      }

      if (response.data.success) {
        toastDialog("บันทึกข้อมูลเรียบร้อย!", "success");
        router.push("/prepare-lab/new?labId=" + labId); // Go back to the main page
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  // Fetch SubDivision data
  const fetchSubDivisionData = useCallback(
    async (divId) => {
      try {
        let response;
        if (labjobId === "new") {
          response = await axios.get(`/api/labjob?divId=${divId}`);
        } else {
          response = await axios.get(
            `/api/labjob?divId=${divId}&labjobId=${labjobId}`
          );
        }

        if (response.data.success) {
          setSubData(response.data.listperson);
          if (!isNew && response.data.listperson.length > 0) {
            setFormData((prev) => ({
              ...prev,
              personId: response.data.data[0].personId,
            }));
          }
        }
      } catch (err) {
        console.error("❌ Error fetching sub-division data:", err);
      }
    },
    [labjobId, isNew]
  );

  // Fetch Labjob list
  const fetchLabjobList = useCallback(async () => {
    try {
      const response = await axios.get(`/api/assign-course?id=${labId}`);
      const fetchedDivPerson = response.data.users[0].personId;
      setDivPerson(fetchedDivPerson);

      if (response.data.success) {
        setData(
          response.data.users.filter(
            (user) => user.roleName === "หัวหน้าบทปฏิบัติการ"
          )
        );
      }
    } catch (err) {
      console.error("❌ Error fetching data:", err);
    }
  }, [labId]);

  // Fetch details of the specific labjob
  const fetchLabjobDetails = useCallback(async () => {
    try {
      const response = await axios.get(
        `/api/labjob?labjobId=${labjobId}&sId=${userCreated}`
      );
      const data = response.data;

      if (data.success) {
        const labjob = data.data[0];
        fetchSubDivisionData(labjob.subdivisionId);
        setFormData({
          labjobTitle: labjob.labjobTitle || "",
          personId: labjob.personId || "",
          divId: labjob.subdivisionId || "",
        });
      } else {
        console.error("Error fetching labjob data:", data.error);
        alert("ไม่สามารถโหลดข้อมูลได้");
      }
    } catch (err) {
      console.error("Error fetching labjob data:", err);
      alert("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }, [labjobId, userCreated, fetchSubDivisionData]);

  useEffect(() => {
    fetchLabjobList();
  }, [fetchLabjobList]);

  useEffect(() => {
    if (isNew && divPerson) {
      setFormData((prev) => ({ ...prev, divId: divPerson }));
      fetchSubDivisionData(divPerson);
    }
  }, [divPerson, isNew, fetchSubDivisionData]); // รันโค้ดเมื่อ divPerson หรือ isNew เปลี่ยนค่า

  // Fetch data when the page loads or labjobId changes
  useEffect(() => {
    setLoading(true);
    // Fetch the labjob list for the dropdown
    fetchLabjobList();

    if (!isNew) {
      // Fetch the labjob details if not creating a new labjob
      fetchLabjobDetails();
    }
  }, [isNew, userCreated, labjobId, fetchLabjobDetails, fetchLabjobList]); // Dependencies to trigger effect

  // Handle dropdown changes
  useEffect(() => {
    if (isNew && divPerson) {
      setFormData((prev) => ({ ...prev, divId: divPerson }));
    }
  }, [divPerson, isNew]);

  const handleSelectChange = async (event) => {
    const value = event.target.value;
    //console.log("Selected value:", value);
    setFormData((prev) => ({ ...prev, divId: value })); // อัปเดตค่า divId
    fetchSubDivisionData(value); // ดึงข้อมูลตามค่าที่เลือก
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/labjob`, { params: { labId } });
        setDatacourse(response.data.datacourse[0]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (labId) {
      fetchData();
    }
  }, [labId]);

  return (
    <Content breadcrumb={breadcrumb} title="เตรียมปฏิบัติการ">
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-t-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <FiFileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                ใบงานเตรียมปฏิบัติการ
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isNew
                  ? "สร้างใบงานเตรียมปฏิบัติการใหม่"
                  : "แก้ไขใบงานเตรียมปฏิบัติการ"}
              </p>
            </div>
          </div>

          {/* Course Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    รายวิชา: {datacourse?.courseunicode}{" "}
                    {datacourse?.coursename}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    {datacourse?.coursenameeng}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ปีการศึกษา
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {datacourse?.semester} / {datacourse?.acadyear}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {datacourse?.labgroupName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <GraduationCap className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      จำนวน Section
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {datacourse?.labSection} Section
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      จำนวนห้อง
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {datacourse?.labroom ?? "-"} ห้อง
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      จำนวนนักศึกษา
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {datacourse?.enrollseat} คน
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="labjobId" value="" />

            {/* Section Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-600">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                ข้อมูลใบเตรียมปฏิบัติการ
              </h4>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Worksheet Title */}
              <div className="lg:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <FiFileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ชื่อใบงานเตรียมปฏิบัติการ
                </label>
                <input
                  name="labjobTitle"
                  value={formData.labjobTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                  placeholder="กรุณากรอกชื่อใบงาน..."
                  required
                />
              </div>

              {/* Lab Chief */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                  หัวหน้าบทปฏิบัติการ
                </label>
                <select
                  name="personId"
                  value={formData.personId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required>
                  <option value="">เลือกหัวหน้าบทปฏิบัติการ</option>
                  {data?.map((item) => (
                    <option key={item.personId} value={item.personId}>
                      {item.fullname}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={() => router.push("/prepare-lab/new?labId=" + labId)}
                className="flex items-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105">
                <FiX className="w-4 h-4" />
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105">
                <FiSave className="w-4 h-4" />
                {isNew ? "บันทึกใบงาน" : "อัปเดตใบงาน"}
              </button>
            </div>
          </form>
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
