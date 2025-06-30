"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Content from "@/components/Content";
import { FiPlus, FiEdit, FiTrash2, FiCopy } from "react-icons/fi";
import TableList from "@/components/TableList";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
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
  }, [reload]);

  const meta = [
    {
      key: "labjobTitle",
      content: "ใบงานเตรียมปฏิบัติการ",
    },
    {
      key: "fullname",
      content: " หัวหน้าบทปฏิบัติการ",
      width: "200",
      className: "text-center",
      render: (item) => {
        return <span className="item-center">{item.fullname}</span>;
      },
    },
  ];
  let button;
  button = (
    <button
      className="cursor-pointer p-2 text-white text-sm bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
      onClick={() => _onPressAdd(labId)}
      disabled={!labId}>
      <FiPlus className="w-4 h-4" />
      เพิ่มใบงานเตรียมปฏิบัติการ
    </button>
  );
  let button2;
  button2 = (
    <div className="p-2 mr-2 flex justify-end items-center">
      <button
        type="button"
        className="cursor-pointer p-2 text-white text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
        onClick={() => _onPressAddCoopy()}>
        <FiCopy className="w-4 h-4" />
        คัดลอก
      </button>
    </div>
  );

  meta.push({
    key: "labjobId",
    content: "จัดการใบเตรียมปฏิบัติการ",
    width: "400",
    className: "text-center",
    render: (item) => {
      let content;
      if (userlogin === "หัวหน้าบทปฏิบัติการ") {
        content = (
          <>
            <button
              className="cursor-pointer p-2 text-white text-sm bg-indigo-500 hover:bg-indigo-700 rounded-lg transition-all duration-200"
              onClick={() => _onPressAddu(item.labId, item.labjobId)}>
              การใช้ทรัพยากรและอุปกรณ์ชำรุด
            </button>
            ;
          </>
        );
      } else if (userlogin === "แอดมิน") {
        content = (
          <>
            <button
              className="cursor-pointer p-2 text-white text-sm bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed justify-center"
              onClick={() => _onPressEdit(item.labjobId)}>
              <FiEdit className="w-4 h-4" />
              แก้ไข
            </button>
            <button
              className="cursor-pointer p-2 text-white text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed justify-center"
              onClick={() => _onPressDelete(item.labjobId)}>
              <FiTrash2 className="w-4 h-4" />
              ลบ
            </button>
            <button
              className="cursor-pointer p-2 text-white text-sm bg-indigo-500 hover:bg-indigo-700 rounded-lg transition-all duration-200"
              onClick={() => _onPressAddu(item.labId, item.labjobId)}>
              การใช้ทรัพยากรและอุปกรณ์ชำรุด
            </button>
          </>
        );
      } else {
        content = "-";
      }

      return (
        <div className="cursor-pointer items-center justify-center flex gap-1">
          {content}
        </div>
      );
    },
  });

  return (
    <Content breadcrumb={breadcrumb} title="ใบงานเตรียมปฏิบัติการ">
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="p-2 border-b border-gray-200 items-center">
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
          <div className="p-2 mr-4 flex justify-end items-center">
            {button}
            {labjob.length === 0 ? button2 : null}
          </div>
        </div>
        <div className="p-2 overflow-auto responsive">
          {error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <TableList meta={meta} data={labjob} loading={loading} />
          )}
        </div>
      </div>
      <Dialog
        open={CopyLabjobModal}
        onClose={_onCloseInventForm}
        className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 text-gray-900 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full sm:max-w-4xl data-closed:sm:translate-y-0 data-closed:sm:scale-95">
              <DialogTitle
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300 p-4 border-b border-gray-200 p-2">
                คัดลอกใบงานเตรียมปฏิบัติการ
              </DialogTitle>

              <div className="grid gap-x-2 gap-y-2 sm:grid-cols-12">
                <div className="sm:col-span-4 pl-6 pt-2">
                  <span className="block text-base font-medium text-gray-900 dark:text-gray-300 py-2">
                    ปีการศึกษา
                  </span>
                  <select
                    name="schId"
                    defaultValue=""
                    className="block bg-white text-gray-900 dark:text-white w-full px-4 py-2 border rounded-md dark:bg-gray-800">
                    <option value="" disabled>
                      เลือก
                    </option>
                    <option>2/2567</option>
                    <option>1/2567</option>
                    <option>2/2566</option>
                  </select>
                </div>

                <div className="sm:col-span-8 p-2 pr-6">
                  <span className="block text-base font-medium text-gray-900 dark:text-gray-300 py-2 ">
                    รายวิชา
                  </span>
                  <select
                    className="block bg-white text-gray-900 dark:text-white w-full px-4 py-2 border rounded-md dark:bg-gray-800"
                    defaultValue="">
                    <option value="" disabled>
                      เลือก
                    </option>
                    <option>
                      BIO61-212 ปฏิบัติการจุลชีววิทยา Microbiology Laboratory
                    </option>
                    <option>MAC62-241 สถิติเชิงอนุมานเบื้องต้น</option>
                    <option>CHM61-241 หลักเคมีวิเคราะห์</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-12 p-2 overflow-auto">
                <div className="p-4 overflow-auto">
                  {error ? (
                    <p className="text-center text-red-500">{error}</p>
                  ) : (
                    <TableList
                      meta={meta2}
                      data={copylabjob}
                      loading={loading}
                      exports={false}
                      showOptions={false}
                    />
                  )}
                </div>
                <div className="md:col-span-2 flex justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    onClick={() => _onCloseInventForm(false)}
                    className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
                    คัดลอกข้อมูล
                  </button>
                  <button
                    type="button"
                    data-autofocus
                    onClick={() => _onCloseInventForm(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto">
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
