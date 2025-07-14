"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Content from "@/components/Content";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiBookOpen,
  FiUsers,
  FiCalendar,
  FiLayers,
} from "react-icons/fi";
import TableList from "@/components/TableList";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  Building,
  GraduationCap,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

export default function Page() {
  const { data: session } = useSession();
  const userlogin = session?.user.userRole;

  const userloginId = session?.user.person_id;
  let breadcrumb = [];
  switch (userlogin) {
    case "หัวหน้าบทปฏิบัติการ":
      breadcrumb = [
        { name: "รายการรายวิชา", link: "/prepare-labu" },
        { name: "ใบงานเตรียมปฏิบัติการ" },
      ];
      break;
    case "แอดมิน":
      breadcrumb = [
        { name: "รายการรายวิชา", link: "/prepare-lab" },
        { name: "ใบงานเตรียมปฏิบัติการ" },
      ];
      break;
    default:
      breadcrumb = [
        { name: "หน้าหลัก" },
        { name: "รายการรายวิชา", link: "/prepare-lab" },
      ];
  }

  const copylabjob = [
    {
      id: 1,
      subjectCode: "การทดลองที่ 1 การเตรียมสารละลาย-212",
      subjectName: "นางจรรยพร ขาวคง",
    },
    {
      id: 2,
      subjectCode: "การทดลองที่ 2 การเตรียมสารละลาย-212",
      subjectName: "นางสาวณัฏฐนริน สมจิตร",
    },
    {
      id: 3,
      subjectCode: "การทดลองที่ 3 การเตรียมสารละลาย-212",
      subjectName: "ญาปกา",
    },
  ];

  const router = useRouter();
  const [CopyLabjobModal, setCopyLabjob] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(0);
  const [labjob, setLabjob] = useState([]);
  const sId = session?.user.person_id;
  const [datacourse, setDatacourse] = useState(null);
  const searchParams = useSearchParams();
  const labId = searchParams.get("labId") || "";

  const meta2 = [
    {
      key: "รหัสวิชา",
      content: "ใบงานเตรียมปฏิบัติการ",
      className: "text-left",
      render: (item) => item.subjectCode,
    },
    {
      key: "subjectName",
      content: "หัวหน้าบทปฏิบัติการ",
      className: "text-left",
      render: (item) => item.subjectName,
    },
  ];

  const _onPressAdd = (labId) => {
    if (!labId) {
      alert("labId ไม่ถูกต้อง");
      return;
    }
    router.push(
      `/prepare-lab/worksheet?labId=${labId}&labjobId=new&sId=${sId}`
    );
  };
  const _onPressAddu = (labId, labjob) => {
    if (!labId) {
      alert("labId ไม่ถูกต้อง");
      return;
    }
    router.push(
      `/prepare-lab/Use-asset?labId=${labId}&labjobId=${labjob}&sId=${sId}`
    );
  };
  const _onCloseInventForm = (status) => {
    setCopyLabjob(status);
  };
  const _onPressAddCoopy = () => {
    setCopyLabjob(true);
  };
  const _onPressEdit = (labjobId) => {
    if (!labjobId) {
      alert("labjobId ไม่ถูกต้อง");
      return;
    }
    router.push(`/prepare-lab/worksheet?labId=${labId}&labjobId=${labjobId}`);
  };
  const _onPressDelete = async (id) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบข้อมูล ?",
      // text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "ยกเลิก",
      confirmButtonText: "ยืนยัน",
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      await axios.delete(`/api/labjob?id=${id}`);
      await Swal.fire({
        title: "ลบข้อมูลเรียบร้อย!",
        icon: "success",
        showCancelButton: false,
        showConfirmButton: false,
        timer: 1000,
      });
      window.location.reload();
    }
  };
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`/api/labjob`, {
          params: { labId, userloginId, userlogin },
        });
        setDatacourse(response.data.datacourse[0]);
        if (response.data.labjoblist) {
          const labjoblist = response.data.labjoblist;

          setLabjob(labjoblist || []);
        } else {
          setLabjob([]); // ถ้าไม่มี labjoblist ให้ตั้งเป็น array ว่าง
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [reload, labId, userloginId, userlogin]);

  const meta = [
    {
      key: "labjobTitle",
      content: "ใบงานเตรียมปฏิบัติการ",
      render: (item) => {
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {item.labjobTitle}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "fullname",
      content: "หัวหน้าบทปฏิบัติการ",
      width: "250",
      className: "text-center",
      render: (item) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {item.fullname}
            </span>
          </div>
        );
      },
    },
  ];
  let button;
  button = (
    <button
      className="group flex items-center gap-2 px-4 py-2 text-white text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      onClick={() => _onPressAdd(labId)}
      disabled={!labId}>
      <FiPlus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
      <span className="font-medium">เพิ่มใบงานเตรียมปฏิบัติการ</span>
    </button>
  );

  let button2;
  button2 = (
    <div className="flex justify-end items-center">
      <button
        type="button"
        className="group flex items-center gap-2 px-4 py-2 text-white text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        onClick={() => _onPressAddCoopy()}>
        <FiCopy className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
        <span className="font-medium">คัดลอกใบงาน</span>
      </button>
    </div>
  );

  meta.push({
    key: "labjobId",
    content: "การจัดการ",
    width: "400",
    className: "text-center",
    render: (item) => {
      let content;
      if (userlogin === "หัวหน้าบทปฏิบัติการ") {
        content = (
          <button
            className="group flex items-center gap-2 px-3 py-2 text-white text-sm bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            onClick={() => _onPressAddu(item.labId, item.labjobId)}>
            <FiLayers className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="font-medium">การใช้ทรัพยากรและอุปกรณ์ชำรุด</span>
          </button>
        );
      } else if (userlogin === "แอดมิน") {
        content = (
          <div className="flex items-center gap-2">
            <button
              className="group flex items-center gap-1 px-3 py-2 text-white text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              onClick={() => _onPressEdit(item.labjobId)}>
              <FiEdit className="w-3 h-3 group-hover:rotate-12 transition-transform" />
              <span className="font-medium">แก้ไข</span>
            </button>
            <button
              className="group flex items-center gap-1 px-3 py-2 text-white text-sm bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              onClick={() => _onPressDelete(item.labjobId)}>
              <FiTrash2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
              <span className="font-medium">ลบ</span>
            </button>
            <button
              className="group flex items-center gap-1 px-3 py-2 text-white text-sm bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              onClick={() => _onPressAddu(item.labId, item.labjobId)}>
              <FiLayers className="w-3 h-3 group-hover:rotate-12 transition-transform" />
              <span className="font-medium hidden lg:inline">
                การใช้ทรัพยากร
              </span>
              <span className="font-medium lg:hidden">ทรัพยากร</span>
            </button>
          </div>
        );
      } else {
        content = (
          <span className="text-gray-400 italic">ไม่มีสิทธิ์การเข้าถึง</span>
        );
      }

      return <div className="flex items-center justify-center">{content}</div>;
    },
  });

  return (
    <Content breadcrumb={breadcrumb} title="ใบงานเตรียมปฏิบัติการ">
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-t-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                ใบงานเตรียมปฏิบัติการ
              </h3>
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
                      ภาคการศึกษา {datacourse?.semester} /{" "}
                      {datacourse?.acadyear}
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

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-3 mt-4">
            {button}
            {labjob.length === 0 ? button2 : null}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {error ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
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
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
              <TableList
                meta={meta}
                data={labjob}
                loading={loading}
                className="rounded-xl"
              />
            </div>
          )}
        </div>
      </div>
      <Dialog
        open={CopyLabjobModal}
        onClose={_onCloseInventForm}
        className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-2xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full sm:max-w-5xl data-closed:sm:translate-y-0 data-closed:sm:scale-95 border border-gray-200 dark:border-gray-700">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FiCopy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <DialogTitle
                    as="h3"
                    className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    คัดลอกใบงานเตรียมปฏิบัติการ
                  </DialogTitle>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  เลือกรายวิชาและใบงานที่ต้องการคัดลอก
                </p>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid gap-6 sm:grid-cols-2 mb-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ปีการศึกษา
                    </label>
                    <select
                      name="schId"
                      defaultValue=""
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                      <option value="" disabled>
                        กรุณาเลือกปีการศึกษา
                      </option>
                      <option>2/2567</option>
                      <option>1/2567</option>
                      <option>2/2566</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                      รายวิชา
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      defaultValue="">
                      <option value="" disabled>
                        กรุณาเลือกรายวิชา
                      </option>
                      <option>
                        BIO61-212 ปฏิบัติการจุลชีววิทยา Microbiology Laboratory
                      </option>
                      <option>MAC62-241 สถิติเชิงอนุมานเบื้องต้น</option>
                      <option>CHM61-241 หลักเคมีวิเคราะห์</option>
                    </select>
                  </div>
                </div>

                {/* Table Section */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    รายการใบงานที่สามารถคัดลอกได้
                  </h4>
                  <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
                    <TableList
                      meta={meta2}
                      data={copylabjob}
                      loading={loading}
                      exports={false}
                      showOptions={false}
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-center gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <button
                    type="submit"
                    onClick={() => _onCloseInventForm(false)}
                    className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium">
                    <FiCopy className="w-4 h-4" />
                    คัดลอกข้อมูล
                  </button>
                  <button
                    type="button"
                    onClick={() => _onCloseInventForm(false)}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 font-medium">
                    ยกเลิก
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </Content>
  );
}
