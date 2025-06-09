"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Content from "@/components/Content";
import { FiPlus, FiEdit, FiTrash2, FiChevronLeft } from "react-icons/fi";
import TableList from "@/components/TableList";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";

export default function Page() {
  const breadcrumb = [
    { name: "รายวิชา", link: "/prepare-lab" },
    { name: "ใบเตรียมปฏิบัติการ" },
  ];
  const router = useRouter(); // Get the router object
  const { data: session } = useSession();
  const userlogin = session?.user.userRole;
  const userloginId = session?.user.person_id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(0);
  const [labjob, setLabjob] = useState([]);
  const sId = session?.user.person_id;
  const [datacourse, setDatacourse] = useState(null);
  const searchParams = useSearchParams();
  const labId = searchParams.get("labId") || "";
  //console.log(labId);
  const _onPressAdd = (labId) => {
    if (!labId) {
      alert("labId ไม่ถูกต้อง");
      return;
    }
    router.push(
      `/prepare-lab/worksheet?labId=${labId}&labjobId=new&sId=${sId}`
    );
  };
  const _onPressAsset = (labId, labjobId) => {
    console.log("labId", labId);
    console.log("labjobId", labjobId);
    if (!labId) {
      alert("labId ไม่ถูกต้อง");
      return;
    }
    //  router.push(
    //    `/prepare-lab/worksheet?labId=${labId}&labjobId=new&sId=${sId}`
    //  );
    router.push(`/prepare-lab/Use-asset?id=${labId}&labjobId=${labjobId}`);
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
  if (userlogin === "หัวหน้าบทปฏิบัติการ") {
    button = " ";
    meta.push({
      key: "labjobId",
      content: "จัดการ",
      width: "200",
      className: "text-center",
      render: (item) => (
        <div className="cursor-pointer items-center justify-center flex gap-1">
          <button
            className="cursor-pointer p-2 text-white text-sm bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed justify-center"
            onClick={() => _onPressAsset(item.labId, item.labjobId)}>
            <FiEdit className="w-4 h-4" />
            การใช้ทรัพยากร
          </button>
        </div>
      ),
    });
  } else {
    button = (
      <button
        className="cursor-pointer p-3 text-white text-sm bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
        onClick={() => _onPressAdd(labId)}
        disabled={!labId}>
        <FiPlus className="w-4 h-4" />
        เพิ่มใบงานเตรียมปฏิบัติการ
      </button>
    );
    meta.push({
      key: "labjobId",
      content: "จัดการใบเตรียมปฏิบัติการ",
      width: "200",
      className: "text-center",
      render: (item) => (
        <div className="cursor-pointer items-center justify-center flex gap-1">
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
        </div>
      ),
    });
  }
  return (
    <Content breadcrumb={breadcrumb} title="เตรียมปฏิบัติการ">
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="flex gap-1 p-2">
          {/* <button
            type="button"
            className="cursor-pointer p-2 text-white text-sm bg-gray-600 hover:bg-gray-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            onClick={() => router.back()}>
            <FiChevronLeft className="w-4 h-4" />
            ย้อนกลับ
          </button> */}
          <span className="flex-1"></span>
        </div>
        <div className="p-2 border-b border-gray-200 items-center">
          <div className="flex gap-1 justify-center items-center p-2">
            <h3 className="font-semibold text-lg">ใบเตรียมปฏิบัติการ</h3>
          </div>
          <div className="flex gap-1 justify-center items-center p-1 border-b border-gray-200"></div>
          <div className="flex gap-1 justify-left items-left p-1 border-b font-semibold">
            <p className="text-lg text-gray-600">
              รายวิชา : {datacourse ? datacourse.courseunicode : " "}{" "}
              {datacourse ? datacourse.coursename : " "}
            </p>
            {/* <p className="text-lg text-gray-600">
                {" "}
                ({datacourse ? datacourse.coursenameeng : " "})
              </p> */}
          </div>
          {/* <div className="flex gap-1 justify-left items-left p-1 border-gray-200 ">
            <p className="text-lg text-gray-900 p-2 font-semibold">
              จำนวน Section ที่เปิดให้บริการ
            </p>
          </div> */}
          <div className="flex gap-1 justify-left items-left  ps-2 border-gray-200 p-1">
            <p className="text-lg text-gray-700 font-medium">
              {/* {datacourse ? datacourse.labSection : " "} */}
              ปีการศึกษา : 2/2568
              <span> </span>
              {/* กลุ่ม จำนวน <span>
                {datacourse ? datacourse.labroom : " "}
              </span>{" "} */}
            </p>
            <p className="text-lg text-gray-700 font-medium">
              {" "}{datacourse ? datacourse.labgroupName : " "}
            </p>
          </div>
          {/* <div className="flex gap-1 justify-left items-left p-1 border-gray-200">
            <p className="text-lg text-gray-900 p-2 font-medium">
              วันและเวลาเรียน
            </p>
          </div>
          <div className="flex gap-1 justify-left items-left  ps-16 border-gray-200 ">
            <p className="text-lg text-gray-700 ">
              วันพฤหัสบดี เวลา 03.00 - 16.00 น. จำนวน 2 ห้องปฏิบัติการ(เคมี 3-4)
            </p>
          </div> */}
          {/* <div className="flex gap-1 justify-left items-left pt-6 border-b font-semibold">
            <h3 className="text-xl text-gray-900 p-2 boder">
              รายการเตรียมปฏิบัติการ
            </h3>
          </div> */}
          <div className="p-2 mr-4 flex justify-end items-center">{button}</div>
        </div>
        <div className="p-2 overflow-auto responsive">
          {error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <TableList meta={meta} data={labjob} loading={loading} />
          )}
        </div>
      </div>
    </Content>
  );
}
