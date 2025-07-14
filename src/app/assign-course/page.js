"use client";

import { useState, useEffect } from "react";
import React, { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiPlus, FiEdit, FiTrash2, FiCheckCircle } from "react-icons/fi";
import Content from "@/components/Content";
import TableList from "@/components/TableList";
import AddChildCourseModal from "@/components/AddChildCourseModal";
import axios from "axios";
import { navigation } from "@/lib/params";
import { useSession } from "next-auth/react";
import { confirmDialog, toastDialog } from "@/lib/stdLib";
import {
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiXCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import {
  Armchair,
  ChartBarIcon,
  ChevronsRight,
  PersonStanding,
  User2,
  X,
} from "lucide-react";

export default function List() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "", order: "asc" });
  const { data: session } = useSession();
  const labgroupName = session?.user.userInfo.labgroupName;
  const userlogin = session?.user.userRole;
  const userIdlogin = session?.user.person_id;
  const searchParams = useSearchParams();
  const breadcrumb = [
    { name: "แผนการให้บริการห้องปฎิบัติการ" },
    { name: "กำหนดรายวิชา", link: "/assign-course" },
  ];
  const router = useRouter();
  const [data, setData] = useState({ data: [], semester: [] });
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schId, setSchId] = useState(searchParams.get("schId") || "");
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [selectedParentLabId, setSelectedParentLabId] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set()); // สำหรับจัดการการแสดง/ซ่อนรายวิชาย่อย

  // ฟังก์ชันสำหรับ toggle การแสดง/ซ่อนรายวิชาย่อย
  const toggleExpanded = (labId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(labId)) {
      newExpanded.delete(labId);
    } else {
      newExpanded.add(labId);
    }
    setExpandedItems(newExpanded);
  };

  const _onPressAdd = () => {
    router.push("/assign-course/create?schId=" + schId);
  };

  const _onPressAddChild = (labId) => {
    setSelectedParentLabId(labId);
    setShowAddChildModal(true);
  };

  const _onCloseAddChildModal = () => {
    setShowAddChildModal(false);
    setSelectedParentLabId(null);
  };

  const _onAddChildSuccess = async () => {
    await toastDialog("เพิ่มรายวิชาย่อยเรียบร้อย!", "success");
    setReload(reload + 1);
  };

  const _onPressEdit = (id) => {
    router.push(`/assign-course/${id}`);
  };
  const _onPressDelete = async (id) => {
    const result = await confirmDialog("ยืนยันการลบข้อมูล ?", "");

    if (result.isConfirmed) {
      await axios.delete(`/api/assign-course?id=${id}`);
      await toastDialog("ลบข้อมูลเรียบร้อย!", "success");
      setReload(reload + 1);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let schselect = schId;
        if (schId === "") {
          const schyearRes = await axios.get(`/api/schyear`);
          const schyear = schyearRes.data;
          if (schyear.success) {
            setSchId(schyear.data);
            schselect = schyear.data;
          }
        }

        const response = await axios.get(`/api/assign-course`, {
          params: { schId: schselect },
        });
        const data = response.data;
        if (data.success) {
          setData({ data: data.data, semester: data.semester });
        } else {
          setError("ไม่สามารถโหลดข้อมูลพนักงานได้");
        }
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [reload, schId]);

  const meta = [
    {
      key: "acadyear",
      content: "ปีการศึกษา",
      width: "110",
      render: (item) => (
        <div className="flex items-center justify-center">
          <div className=" px-2 py-1 rounded text-xs font-medium">
            {item.semester}/{item.acadyear}
          </div>
        </div>
      ),
    },
    {
      key: "coursecode",
      content: "รายวิชา",
      render: (item) => (
        <div className="flex flex-col space-y-1">
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-all duration-200 group"
            onClick={() => toggleExpanded(item.labId)}>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.coursecode}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {item.coursename}
              </p>
            </div>
            {item.sub && item.sub.length > 0 && (
              <>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs">
                  {item.sub.length} ย่อย
                </span>
                <div className="text-blue-500 dark:text-blue-400">
                  {expandedItems.has(item.labId) ? (
                    <FiChevronUp className="w-4 h-4" />
                  ) : (
                    <FiChevronDown className="w-4 h-4" />
                  )}
                </div>
              </>
            )}
          </div>
          {expandedItems.has(item.labId) && item.sub && item.sub.length > 0 && (
            <div className="ml-3 space-y-1 border-l border-gray-200 dark:border-gray-600 pl-3">
              {item.sub.map((sub, iSub) => (
                <div
                  key={iSub}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-1">
                    <ChevronsRight className="w-3 h-3 text-blue-500" />
                    <div>
                      <p className="font-medium text-xs text-gray-900 dark:text-white">
                        {sub.coursecode}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {sub.coursename}
                      </p>
                    </div>
                  </div>
                  <button
                    className="group flex items-center gap-0.5 px-2 py-1 text-white text-xs bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-md transform hover:scale-105"
                    onClick={() => _onPressDelete(sub.labId)}>
                    <FiTrash2 className="w-2 h-2 group-hover:scale-110 transition-transform" />
                    <span className="font-sm">ลบ</span>
                  </button>
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
      width: "300",
      render: (item) => (
        <div className="flex flex-col space-y-1">
          <div className=" dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 rounded text-sm font-medium">
            {item.facultyname}
          </div>
        </div>
      ),
    },

    {
      key: "section",
      content: "รายละเอียดวิชา",
      width: "140",
      render: (item) => (
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 space-y-1">
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium text-gray-900 dark:text-white">
              กลุ่มเรียน : {item.section}
            </p>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
              <User2 className="w-3 h-3" />
              <span>{item.enrollseat}</span>
            </div>
            <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded">
              <Armchair className="w-3 h-3" />
              <span>{item.totalseat}</span>
            </div>
          </div>
        </div>
      ),
    },

    {
      key: "fullname",
      content: "รายละเอียดห้องปฎิบัติการ",
      width: "250",
      render: (item) => {
        if (!item.labgroupName) {
          return (
            <div className="flex items-center justify-center p-3">
              <div className="text-center">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-1 mx-auto">
                  <FiXCircle className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  ไม่มีข้อมูล
                </p>
              </div>
            </div>
          );
        }
        return (
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {item.fullname}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
              {item.labgroupName}
            </p>
          </div>
        );
      },
    },
    {
      key: "labId",
      content: "จัดการ",
      width: "220",
      sort: false,
      export: false,
      className: "text-center",
      render: (item) => (
        <div className="flex gap-1">
          <button
            className="group flex items-center gap-0.5 px-2 py-1 text-white text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            onClick={() => _onPressAddChild(item.labId)}>
            <FiPlus className="w-3 h-3 group-hover:rotate-12 transition-transform" />
            <span className="text-xs">รายวิชาย่อย</span>
          </button>

          <button
            className="group flex items-center gap-0.5 px-2 py-1 text-white text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            onClick={() => _onPressEdit(item.labId)}>
            <FiEdit className="w-3 h-3 group-hover:rotate-12 transition-transform" />
            <span className="text-xs">แก้ไข</span>
          </button>

          <button
            className="group flex items-center gap-0.5 px-2 py-1 text-white text-sm bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            onClick={() => _onPressDelete(item.labId)}>
            <FiTrash2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
            <span className="text-xs">ลบ</span>
          </button>
        </div>
      ),
    },
  ];
  const processedData = useMemo(() => {
    let result = [];
    if (userlogin === "แอดมิน") {
      result = data.data;
    } else if (userlogin === "หัวหน้าฝ่าย") {
      result = data.data.filter((item) => {
        return (
          item.userCreated == userIdlogin || item.labgroupName === labgroupName
        );
      });
    }

    if (search.trim() !== "") {
      result = result.filter((item) => {
        const combined = `${item.coursecode} ${item.coursename}`.toLowerCase();
        return combined.includes(search.toLowerCase());
      });
    }

    // ✅ sort ตาม field เดียว (แล้วแต่คุณจะระบุ)
    if (sort.key !== "") {
      result.sort((a, b) => {
        const valA = a[sort.key];
        const valB = b[sort.key];
        if (valA === valB) return 0;

        if (sort.order === "asc") {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
    }

    return result;
  }, [data, search, sort, labgroupName, userIdlogin, userlogin]);

  return (
    <Content
      breadcrumb={breadcrumb}
      title="แผนการให้บริการห้องปฎิบัติการ : กำหนดรายวิชา">
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="relative p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold ">รายการรายวิชาที่กำหนด</h3>
                <p className="text-sm">
                  จัดการการกำหนดรายวิชาสำหรับห้องปฎิบัติการ
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex gap-1 items-center bg-white/20 rounded px-3 py-1">
                <label className="text-sm font-medium text-white">
                  ปีการศึกษา :
                </label>
                <select
                  value={schId}
                  onChange={(e) => {
                    setSchId(e.target.value);
                    router.push(`/assign-course?schId=${e.target.value}`);
                  }}
                  className="block bg-white text-gray-800 px-2 py-1 border border-black rounded text-sm
">
                  <option value="" disabled>
                    กรุณาเลือก
                  </option>
                  {data.semester.map((item) => (
                    <option key={item.schId} value={item.schId}>
                      {item.semester}/{item.acadyear}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="group flex items-center gap-2 px-4 py-2 text-white text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                onClick={_onPressAdd}>
                <FiPlus className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span>เพิ่มรายวิชา</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800">
          {error ? (
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full mb-3">
                <FiXCircle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-red-600 dark:text-red-400 font-medium">
                {error}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Table Container */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden p-2">
                <TableList
                  meta={meta}
                  data={processedData}
                  loading={loading}
                  disableSearch={true}
                  customSearchSlot={
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ค้นหารายวิชา..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-48 h-8 text-sm pr-8 pl-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white bg-white transition-all duration-200"
                      />
                      {search ? (
                        <FiXCircle
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-4 h-4 cursor-pointer transition-colors"
                          onClick={() => setSearch("")}
                        />
                      ) : (
                        <FiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      )}
                    </div>
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Child Course Modal */}
      <AddChildCourseModal
        isOpen={showAddChildModal}
        onClose={_onCloseAddChildModal}
        parentLabId={selectedParentLabId}
        onSuccess={_onAddChildSuccess}
      />
    </Content>
  );
}

const className = {
  label: "block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1",
  input:
    "block bg-white w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200",
  select:
    "block bg-white px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200",
};
