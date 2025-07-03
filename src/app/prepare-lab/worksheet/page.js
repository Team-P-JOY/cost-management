"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Content from "@/components/Content";
import { confirmDialog, toastDialog } from "@/lib/stdLib";
import { useSession } from "next-auth/react";
import { set } from "react-hook-form";
// import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

/**
 * @typedef {Object} InventoryItem
 * @property {number} id
 * @property {string} name
 * @property {number} quantity
 */

export default function Page() {
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

  // Fetch Labjob list
  const fetchLabjobList = async () => {
    try {
      const response = await axios.get(`/api/assign-course?id=${labId}`);
      const fetchedDivPerson = response.data.users[0].personId;
      setDivPerson(fetchedDivPerson); // เก็บค่า divPerson
      //console.log("divPerson:", fetchedDivPerson);
      if (response.data.success) {
        setData(
          response.data.users.filter(
            (user) => user.roleName === "หัวหน้าบทปฏิบัติการ"
          )
        ); // Set the first dropdown data
      }
    } catch (err) {
      console.error("❌ Error fetching data:", err);
    }
  };
  // Fetch details of the specific labjob
  const fetchLabjobDetails = async () => {
    try {
      const response = await axios.get(
        `/api/labjob?labjobId=${labjobId}&sId=${userCreated}`
      );
      const data = response.data;

      if (data.success) {
        const labjob = data.data[0];
        const person = subData.find(
          (person) => person.personId === labjob.personId
        );
        fetchSubDivisionData(labjob.subdivisionId);
        setFormData({
          labjobTitle: labjob.labjobTitle || "", // ตั้งค่าชื่อใบงาน
          personId: labjob.personId || "", // ตั้งค่าผู้รับผิดชอบ
          divId: labjob.subdivisionId || "", // ตั้งค่าฝ่าย
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
  };
  useEffect(() => {
    fetchLabjobList();
  }, []);
  useEffect(() => {
    if (isNew && divPerson) {
      setFormData((prev) => ({ ...prev, divId: divPerson }));
      fetchSubDivisionData(divPerson);
    }
  }, [divPerson, isNew]); // รันโค้ดเมื่อ divPerson หรือ isNew เปลี่ยนค่า

  const fetchSubDivisionData = async (divId) => {
    try {
      let response; // กำหนดตัวแปร response ให้อยู่ข้างนอก
      if (labjobId === "new") {
        response = await axios.get(`/api/labjob?divId=${divId}`);
      } else {
        response = await axios.get(
          `/api/labjob?divId=${divId}&labjobId=${labjobId}`
        );
      }
      // console.log("Person:", response.data.data[0].personId);
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
  };

  // Fetch data when the page loads or labjobId changes
  useEffect(() => {
    setLoading(true);
    // Fetch the labjob list for the dropdown
    fetchLabjobList();

    if (!isNew) {
      // Fetch the labjob details if not creating a new labjob
      fetchLabjobDetails();
    }
  }, [isNew, userCreated, labjobId]); // Dependencies to trigger effect

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
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="p-2 border-b border-gray-200 items-center">
          <input type="hidden" name="labjobId" value="" />
          <div className="flex gap-1 justify-centerp-2 pl-2 border-b border-gray-200 py-3">
            <h3 className="font-semibold text-lg">ใบงานเตรียมปฏิบัติการ</h3>
          </div>
          <div className="grid grid-cols-12 gap-2 pl-2 pt-2">
            <div className="sm:col-span-12">
              <p className="text-lg text-gray-600">
                รายวิชา : {datacourse ? datacourse.courseunicode : " "}{" "}
                {datacourse ? datacourse.coursename : " "}{" "}
                {datacourse ? datacourse.coursenameeng : " "}
              </p>
            </div>
            <div className="sm:col-span-4">
              ปีการศึกษา : {datacourse?.semester} / {datacourse?.acadyear}{" "}
              {datacourse ? datacourse.labgroupName : " "}
            </div>
            <div className="sm:col-span-2">
              <i>จำนวน Section </i> :{" "}
              <strong>{datacourse ? datacourse.labSection : " "}</strong>{" "}
              Section
            </div>
            <div className="sm:col-span-2">
              <i>จำนวนห้อง</i> : <strong>{datacourse?.labroom ?? "-"}</strong>{" "}
              ห้อง
            </div>
            <div className="sm:col-span-2">
              <i>จำนวนนักศึกษา </i> :{" "}
              <strong>{datacourse ? datacourse.enrollseat : " "}</strong> คน
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-1 justify-left items-left pt-6 border-b font-semibold">
              <h3 className="text-xl text-gray-900 p-2 boder">
                ข้อมูลใบเตรียมปฏิบัติการ
              </h3>
            </div>
            <div className="grid gap-x-3 gap-y-2 sm:grid-cols-12 pl-10 pr-10 pt-2">
              <div className="sm:col-span-9 pl-6 pt-2">
                <span className="block text-base font-medium text-gray-900 dark:text-gray-300 py-2">
                  ชื่อใบงานเตรียมปฎิบัติการ
                </span>
                <input
                  name="labjobTitle"
                  value={formData.labjobTitle}
                  onChange={handleChange}
                  className="border border-gray-500 p-2 rounded-lg w-full"
                  required
                />
              </div>
              <div className="sm:col-span-3 p-2 pr-6">
                <span className="block text-base font-medium text-gray-900 dark:text-gray-300 py-2">
                  หัวหน้าบทปฏิบัติการ
                </span>
                <select
                  name="personId"
                  value={formData.personId}
                  onChange={handleChange}
                  className="border border-gray-500 p-2 rounded-lg w-full"
                  required>
                  <option value="">-เลือก-</option>
                  {data?.map((item) => (
                    <option key={item.personId} value={item.personId}>
                      {item.fullname}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-12 flex justify-center gap-2 p-4  dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => router.push("/prepare-lab/new?labId=" + labId)}
                  className="cursor-pointer p-2 text-white bg-gray-600 hover:bg-gray-700 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="cursor-pointer p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isNew ? "บันทึก" : "บันทึก"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Content>
  );
}
