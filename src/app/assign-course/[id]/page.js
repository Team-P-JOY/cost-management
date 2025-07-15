"use client";

import { use, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiUser,
  FiBook,
  FiClock,
  FiHome,
  FiUsers,
} from "react-icons/fi";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Content from "@/components/Content";
import { useFormik } from "formik";
import * as Yup from "yup";
import { confirmDialog, toastDialog } from "@/lib/stdLib";
import TableList from "@/components/TableList";
import UserAutocomplete from "@/components/UserAutocomplete";
import { set } from "react-hook-form";

const roleList = [
  { roleId: "1", roleName: "นักวิทยาศาสตร์" },
  { roleId: "2", roleName: "พนักงานวิทยาศาสตร์" },
  { roleId: "3", roleName: "พนักงานห้องทดลอง" },
  { roleId: "4", roleName: "นายช่างเทคนิค" },
  { roleId: "5", roleName: "วิศวกร" },
  { roleId: "6", roleName: "พนักงานธุรการ" },
  { roleId: "7", roleName: "เจ้าหน้าที่บริหารงานทั่วไป" },
];

export default function Detail() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const userlogin = session?.user.roleName;
  const { id } = useParams();
  const router = useRouter();
  const isNew = id === "new";
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tab1");

  const [invent, setInvent] = useState([]);
  const [user, setUser] = useState([]);
  const [labasset, setLabasset] = useState({
    type1: [],
    type2: [],
    type3: [],
  });

  const [courseUser, setCourseUser] = useState([]);
  const [loadingInvent, setLoadingInvent] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [inventFormModal, setInventFormModal] = useState(false);
  const [userFormModal, setUserFormModal] = useState(false);

  const [data, setData] = useState({
    course: null,
    class: [],
    users: [],
    labgroup: [],
  });

  const [assetInfo, setAssetInfo] = useState(null);

  const tabs = [
    { id: "tab1", label: "รายละเอียดวิชา" },
    { id: "tab2", label: "ผู้รับผิดชอบ" },
    // { id: "tab3", label: "ทรัพยากรตามรายวิชา" },
  ];

  const validationSchema = Yup.object({
    personId: Yup.string().required("กรุณาเลือกข้อมูล"),
    labgroupId: Yup.string().required("กรุณาเลือกข้อมูล"),
    labroom: Yup.number()
      .required("กรุณากรอกข้อมูล")
      .min(1, "จำนวนต้องไม่น้อยกว่า 1"),
    // labgroupNum: Yup.number()
    //   .required("กรุณากรอกข้อมูล")
    //   .min(1, "จำนวนต้องไม่น้อยกว่า 1"),
    hour: Yup.number()
      .required("กรุณากรอกข้อมูล")
      .min(1, "จำนวนต้องไม่น้อยกว่า 1"),
  });

  const formik = useFormik({
    initialValues: {
      courseid: "",
      labgroupId: "",
      schId: "1",
      acadyear: "",
      semester: "",
      section: "",
      labroom: "",
      hour: "",
      // labgroupNum: "",
      lab_parent_id: "",
      personId: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      console.log("formik values", values);
      // values.labasset = labasset;
      // values.courseUser = courseUser;
      try {
        console.log("values", values);
        if (isNew) {
          await axios.post(`/api/assign-course`, values);
          toastDialog("บันทึกข้อมูลเรียบร้อย!", "success");
          router.push("/assign-course?schId=" + searchParams.get("schId"));
        } else {
          const res = await axios.put(`/api/assign-course?id=${id}`, values);
          console.log("res", res);
          toastDialog("บันทึกข้อมูลเรียบร้อย!", "success");
          router.back();
        }
      } catch (error) {
        toastDialog("เกิดข้อผิดพลาดในการบันทึกข้อมูล!", "error", 2000);
        console.error("❌ Error saving data:", error);
      }
    },
  });

  const validationInventForm = Yup.object({
    assetId: Yup.string().required("กรุณาเลือกข้อมูล"),
    amount: Yup.number()
      .required("กรุณากรอกข้อมูล")
      .min(1, "จำนวนต้องไม่น้อยกว่า 1"),
    assetRemark: Yup.string()
      .nullable()
      .max(100, "ข้อความต้องไม่เกิน 100 ตัวอักษร"),
  });

  const validationUserForm = Yup.object({
    personId: Yup.string().required("กรุณาเลือกข้อมูล"),
    roleId: Yup.string().required("กรุณาเลือกข้อมูล"),
  });

  const userForm = useFormik({
    initialValues: {
      courseUserId: "",
      labId: "",
      personId: "",
      fullname: "",
      roleId: "",
    },
    validationSchema: validationUserForm,
    onSubmit: async (values) => {
      values.userId = session?.user.person_id;
      values.fullname = data.users.find(
        (item) => parseInt(item.personId) === parseInt(values.personId)
      )?.fullname;
      if (values.courseUserId) {
        const response = await axios.put(
          `/api/assign-course/course-user?id=${values.courseUserId}`,
          {
            ...values,
            labId: id,
          }
        );
        const res = response.data;
        if (res.success) {
          toastDialog("บันทึกข้อมูลเรียบร้อย!", "success");
          setCourseUser(res.courseUser);
        }
      } else {
        const response = await axios.post(`/api/assign-course/course-user`, {
          ...values,
          labId: id,
        });
        const res = response.data;
        if (res.success) {
          toastDialog("บันทึกข้อมูลเรียบร้อย!", "success");
          setCourseUser(res.courseUser);
        }
      }
      setUserFormModal(false);
      userForm.resetForm();
    },
  });

  const inventForm = useFormik({
    initialValues: {
      id: "",
      labassetId: "",
      labId: "",
      assetId: "",
      amount: "",
      assetRemark: "",
      type: "",
    },
    validationSchema: validationInventForm,
    onSubmit: async (values) => {
      values.assetNameTh = invent.find(
        (inv) => inv.assetId === parseInt(values.assetId)
      )?.assetNameTh;
      values.brandName = invent.find(
        (inv) => inv.assetId === parseInt(values.assetId)
      )?.brandName;
      values.amountUnit = invent.find(
        (inv) => inv.assetId === parseInt(values.assetId)
      )?.amountUnit;
      values.unitName = invent.find(
        (inv) => inv.assetId === parseInt(values.assetId)
      )?.unitName;
      values.invgroupName = invent.find(
        (inv) => inv.assetId === parseInt(values.assetId)
      )?.invgroupName;

      if (values.type === 1) {
        if (values.labassetId) {
          setLabasset((prevLabasset) => ({
            ...prevLabasset,
            type1: prevLabasset.type1.map((item) =>
              item.labassetId === values.labassetId ? values : item
            ),
          }));
        } else {
          values.labassetId = uuidv4();
          setLabasset((prevLabasset) => ({
            ...prevLabasset,
            type1: [...(prevLabasset.type1 || []), values],
          }));
        }
      } else if (values.type === 2) {
        if (values.labassetId) {
          setLabasset((prevLabasset) => ({
            ...prevLabasset,
            type2: prevLabasset.type2.map((item) =>
              item.labassetId === values.labassetId ? values : item
            ),
          }));
        } else {
          values.labassetId = uuidv4();
          setLabasset((prevLabasset) => ({
            ...prevLabasset,
            type2: [...(prevLabasset.type2 || []), values],
          }));
        }
      } else if (values.type === 3) {
        if (values.labassetId) {
          setLabasset((prevLabasset) => ({
            ...prevLabasset,
            type3: prevLabasset.type3.map((item) =>
              item.labassetId === values.labassetId ? values : item
            ),
          }));
        } else {
          values.labassetId = uuidv4();
          setLabasset((prevLabasset) => ({
            ...prevLabasset,
            type3: [...(prevLabasset.type3 || []), values],
          }));
        }
      }

      setInventFormModal(false);
      inventForm.resetForm();
    },
  });

  useEffect(() => {
    if (inventForm.values.assetId) {
      setAssetInfo(
        invent.find(
          (inv) => inv.assetId === parseInt(inventForm.values.assetId)
        )
      );
    } else {
      setAssetInfo(null);
    }
  }, [inventForm.values.assetId]);

  useEffect(() => {
    if (!isNew) {
      setLoading(true);
      const fetchData = async () => {
        try {
          const response = await axios.get(`/api/assign-course?id=${id}`);
          const data = response.data;
          if (data.success) {
            setData({
              course: data.course,
              class: data.class,
              users: data.users,
              labgroup: data.labgroup,
            });

            const form = data.data;
            formik.setValues({
              courseid: form.courseid,
              labgroupId: form.labgroupId,
              schId: form.schId,
              acadyear: form.acadyear,
              semester: form.semester,
              section: form.section,
              labroom: form.labroom,
              hour: form.hour,
              // labgroupNum: form.labgroupNum,
              personId: form.personId,
              userId: session?.user.person_id,
            });

            setLabasset({
              type1: data.labasset?.filter((item) => item.type === 1) || [],
              type2: data.labasset?.filter((item) => item.type === 2) || [],
              type3: data.labasset?.filter((item) => item.type === 3) || [],
            });
            console.log("data.courseUser", data.courseUser);
            setCourseUser(data.courseUser);

            setLoading(false);
          }
        } catch (err) {
          console.error("❌ Error fetching data:", err);
          toastDialog("ไม่สามารถโหลดข้อมูลได้!", "error", 2000);
        }
      };
      fetchData();
    } else {
      setLoading(true);
      const fetchData = async () => {
        try {
          const courseId = decodeURIComponent(
            searchParams.get("courseId") || ""
          );
          const schId = decodeURIComponent(searchParams.get("schId") || "");
          const response = await axios.get(`/api/assign-course`, {
            params: { courseId, schId },
          });
          const data = response.data;

          if (data.success) {
            setData({
              course: data.course,
              class: data.class,
              users: data.users,
              labgroup: data.labgroup,
            });
            formik.setValues({
              courseid: data.course?.courseid,
              labgroupId: "",
              schId: searchParams.get("schId"),
              acadyear: data.class?.[0]?.acadyear,
              semester: data.class?.[0]?.semester,
              section: data.class?.length,
              labroom: "",
              hour: "",
              // labgroupNum: "",
              personId: "",
              userId: session?.user.person_id,
            });

            setLoading(false);
          }
        } catch (err) {
          console.error("❌ Error fetching data:", err);
          toastDialog("ไม่สามารถโหลดข้อมูลได้!", "error", 2000);
        }
      };
      fetchData();
    }
  }, [id]);
  // เมื่อ formik.values.labgroupId ถูกตั้งค่าแล้ว ให้เรียก handleChangeLabgroup เพื่ออัปเดต user
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (formik.values.labgroupId && data?.users) {
      const selectedUser = data.users.filter(
        (item) => item.labgroupId == formik.values.labgroupId
      );
      setUser(selectedUser);
      const personInGroup = selectedUser.find(
        (u) => u.personId == formik.values.personId
      );
      if (!personInGroup) {
        formik.setFieldValue("personId", "");
      }
    }
  }, [formik.values.labgroupId]);
  let linkBreadcrumb = [];
  if (userlogin !== "ผู้ดูแลระบบ" || userlogin !== "หัวหน้าฝ่าย") {
    linkBreadcrumb = ["/assign-plan"];
  } else {
    linkBreadcrumb = ["/assign-course"];
  }
  // ถ้า userlogin ไม่ใช่ผู้ดูแลระบบ ให้ลิงก์ไปยังแผนการให้บริการห้องปฎิบัติการ

  const breadcrumb = [
    { name: "แผนการให้บริการห้องปฎิบัติการ" },
    { name: "กำหนดรายวิชา", link: { linkBreadcrumb } },
    { name: isNew ? "เพิ่มใหม่" : "แก้ไขข้อมูล" },
  ];

  const _callInvent = async (type) => {
    setLoadingInvent(true);
    try {
      const response = await axios.get(`/api/assign-course/invasset`, {
        params: {
          type: type,
        },
      });
      const data = response.data;

      if (data.success) {
        setInvent(data.data);
      }
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      toastDialog("ไม่สามารถโหลดข้อมูลได้!", "error", 2000);
    } finally {
      setLoadingInvent(false);
    }
  };

  const _onPressAddInvent = async (type) => {
    setInventFormModal(true);
    inventForm.setValues({
      labassetId: "",
      assetId: "",
      amount: "",
      assetRemark: "",
      flagDel: 0,
      type: type,
      userId: session?.user.person_id,
    });
    await _callInvent(type);
  };

  const _onPressAddUser = async () => {
    setUserFormModal(true);
    userForm.setValues({
      labcourseUserId: "",
      personId: "",
      roleId: "",
      flagDel: 0,
      userId: session?.user.person_id,
    });
  };

  const _onPressEditUser = async (id) => {
    setUserFormModal(true);
    const asset = courseUser.find((item) => item.labcourseUserId === id);

    console.log("id", id);
    userForm.setValues({
      labcourseUserId: asset.labcourseUserId,
      personId: asset.personId,
      roleId: asset.roleId,
      userId: session?.user.person_id,
    });
  };

  const _onPressEditInvent = async (id, type) => {
    setInventFormModal(true);
    let asset;
    if (type === 1) {
      asset = labasset.type1.find((item) => item.labassetId === id);
    } else if (type === 2) {
      asset = labasset.type2.find((item) => item.labassetId === id);
    } else if (type === 3) {
      asset = labasset.type3.find((item) => item.labassetId === id);
    }

    inventForm.setValues({
      labassetId: asset.labassetId,
      assetId: asset.assetId,
      amount: asset.amount,
      assetRemark: asset.assetRemark ? asset.assetRemark : "",
      flagDel: 0,
      type: type,
      userId: session?.user.person_id,
    });
    await _callInvent(type);
  };

  const _onPressDeleteUser = async (labcourseUserId) => {
    console.log("labcourseUserId", labcourseUserId);
    const result = await confirmDialog("ยืนยันการลบข้อมูล ?", "");
    if (result.isConfirmed) {
      const response = await axios.delete(
        `/api/assign-course/course-user?id=${labcourseUserId}&labId=${id}`
      );

      const res = response.data;
      if (res.success) {
        toastDialog("ลบข้อมูลเรียบร้อย!", "success");
        setCourseUser(res.courseUser);
      }

      // setCourseUser((prevItem) =>
      //   prevItem.filter((item) => item.courseUserId !== id)
      // );
    }
  };

  const _handleChangeLabgroup = (e) => {
    const value = e.target.value;

    const selectedUser = data.users.filter((item) => item.labgroupId == value);

    setUser(selectedUser);
    formik.setFieldValue("labgroupId", value);

    // ถ้า personId เดิมไม่อยู่ใน user list ที่กรองมาแล้ว ให้เคลียร์
    const currentPersonId = formik.values.personId;
    const personStillExists = selectedUser.some(
      (u) => u.personId == currentPersonId
    );

    if (!personStillExists) {
      formik.setFieldValue("personId", "");
    }
  };

  const _onPressDeleteInvent = async (id, type) => {
    const result = await confirmDialog("ยืนยันการลบข้อมูล ?", "");

    if (result.isConfirmed) {
      if (type === 1) {
        setLabasset((prevLabasset) => ({
          ...prevLabasset,
          type1: prevLabasset.type1.filter((item) => item.labassetId !== id),
        }));
      } else if (type === 2) {
        setLabasset((prevLabasset) => ({
          ...prevLabasset,
          type2: prevLabasset.type1.filter((item) => item.labassetId !== id),
        }));
      } else if (type === 3) {
        setLabasset((prevLabasset) => ({
          ...prevLabasset,
          type3: prevLabasset.type1.filter((item) => item.labassetId !== id),
        }));
      }
    }
  };

  const _onCloseInventForm = (status) => {
    setInventFormModal(status);
    inventForm.resetForm();
  };

  const _onCloseUserForm = (status) => {
    setUserFormModal(status);
    inventForm.resetForm();
  };

  return (
    <Content
      breadcrumb={breadcrumb}
      title=" แผนการให้บริการห้องปฎิบัติการ : กำหนดรายวิชา">
      <div className="relative flex flex-col w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="relative bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FiBook className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {isNew ? "เพิ่มใหม่" : "แก้ไขข้อมูล"}
              </h3>
              {!isNew && data.course && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  {data.course.coursecode} {data.course.coursename}
                </p>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4 animate-pulse">
              <FiBook className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              กำลังโหลดข้อมูล...
            </p>
          </div>
        ) : (
          <div className="p-6">
            <form onSubmit={formik.handleSubmit}>
              <div className="w-full">
                {/* Clean Tab Navigation */}
                <div className="flex border-b border-gray-200 dark:border-gray-600 mb-6">
                  {tabs.map((tab) => (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2 ${
                        activeTab === tab.id
                          ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                          : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
                      }`}>
                      {tab.id === "tab1" && <FiBook className="w-4 h-4" />}
                      {tab.id === "tab2" && <FiUsers className="w-4 h-4" />}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-6">
                  {activeTab === "tab1" && (
                    <>
                      {/* Course Information Card */}
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                          {data.course?.coursecode} {data.course?.coursename}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex">
                            <span className="text-gray-600 dark:text-gray-400 w-32">
                              สำนักวิชา:
                            </span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {data.course?.facultyname}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="text-gray-600 dark:text-gray-400 w-32">
                              ภาคการศึกษา:
                            </span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {data.class?.[0]?.semester}/
                              {data.class?.[0]?.acadyear}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="text-gray-600 dark:text-gray-400 w-32">
                              จำนวนกลุ่ม:
                            </span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {data.class?.length} กลุ่ม
                            </span>
                          </div>
                          <div className="flex">
                            <span className="text-gray-600 dark:text-gray-400 w-32">
                              จำนวนนักศึกษา:
                            </span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {data.class?.reduce(
                                (total, item) => total + item.totalseat,
                                0
                              )}{" "}
                              คน
                            </span>
                          </div>
                        </div>

                        {data.course?.description1 && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">
                              รายละเอียด:
                            </span>
                            <p className="text-gray-900 dark:text-gray-100 mt-1">
                              {data.course.description1}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Form Fields Card */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className={className.label}>
                              กลุ่มห้องปฎิบัติการ
                            </label>
                            <select
                              name="labgroupId"
                              value={formik.values.labgroupId || ""}
                              onChange={(event) => {
                                _handleChangeLabgroup(event);
                                formik.handleChange(event);
                              }}
                              className={`${className.select} ${
                                formik.touched.labgroupId &&
                                formik.errors.labgroupId
                                  ? "border-red-500"
                                  : ""
                              }`}>
                              <option value="" disabled>
                                เลือกกลุ่มห้องปฎิบัติการ
                              </option>
                              {data.labgroup.map((labgroup) => (
                                <option
                                  key={labgroup.labgroupId}
                                  value={labgroup.labgroupId}>
                                  {labgroup.labgroupName}
                                </option>
                              ))}
                            </select>
                            {formik.touched.labgroupId &&
                              formik.errors.labgroupId && (
                                <p className="mt-1 text-sm text-red-500">
                                  {formik.errors.labgroupId}
                                </p>
                              )}
                          </div>

                          <div>
                            <label className={className.label}>
                              ผู้ประสานงานรายวิชา
                            </label>
                            <select
                              name="personId"
                              value={formik.values.personId || ""}
                              onChange={formik.handleChange}
                              className={`${className.select} ${
                                formik.touched.personId &&
                                formik.errors.personId
                                  ? "border-red-500"
                                  : ""
                              }`}>
                              <option value="" disabled>
                                {user.length > 0
                                  ? "เลือกผู้รับผิดชอบหลัก"
                                  : "- ไม่มีข้อมูล -"}
                              </option>
                              {user.map((user, index) => (
                                <option
                                  key={user.personId + index}
                                  value={user.personId}>
                                  {user.fullname} ({user.roleName})
                                </option>
                              ))}
                            </select>
                            {formik.touched.personId &&
                              formik.errors.personId && (
                                <p className="mt-1 text-sm text-red-500">
                                  {formik.errors.personId}
                                </p>
                              )}
                          </div>

                          <div>
                            <label className={className.label}>
                              จำนวนห้อง LAB ที่เปิดบริการ
                            </label>
                            <input
                              type="number"
                              name="labroom"
                              value={formik.values.labroom || ""}
                              onChange={formik.handleChange}
                              className={`${className.input} ${
                                formik.touched.labroom && formik.errors.labroom
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                            {formik.touched.labroom &&
                              formik.errors.labroom && (
                                <p className="mt-1 text-sm text-red-500">
                                  {formik.errors.labroom}
                                </p>
                              )}
                          </div>

                          <div>
                            <label className={className.label}>
                              รวมจำนวนชั่วโมงเรียน/ภาคการศึกษา
                            </label>
                            <input
                              type="number"
                              name="hour"
                              value={formik.values.hour || ""}
                              onChange={formik.handleChange}
                              className={`${className.input} ${
                                formik.touched.hour && formik.errors.hour
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                            {formik.touched.hour && formik.errors.hour && (
                              <p className="mt-1 text-sm text-red-500">
                                {formik.errors.hour}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <button
                          type="button"
                          className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          onClick={() => router.back()}>
                          ยกเลิก
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                          บันทึกข้อมูล
                        </button>
                      </div>
                    </>
                  )}
                  {activeTab === "tab2" && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            ผู้รับผิดชอบ
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {courseUser.length} รายการ
                          </p>
                        </div>
                        <button
                          type="button"
                          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                          onClick={() => _onPressAddUser()}>
                          <FiPlus className="w-4 h-4" />
                          เพิ่มใหม่
                        </button>
                      </div>
                      <TableList
                        exports={false}
                        meta={[
                          {
                            content: "ผู้รับผิดชอบ",
                            key: "fullname",
                          },
                          {
                            content: "ตำแหน่งที่รับผิดชอบ",
                            key: "roleId",
                            render: (item) => (
                              <div>
                                {
                                  roleList.find(
                                    (role) =>
                                      parseInt(role.roleId) === item.roleId
                                  )?.roleName
                                }
                              </div>
                            ),
                          },
                          {
                            key: "labcourseUserId",
                            content: "จัดการ",
                            width: "140",
                            sort: false,
                            render: (item) => (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  className="flex items-center gap-1 px-3 py-1.5 text-white text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                                  onClick={() => {
                                    _onPressEditUser(item.labcourseUserId);
                                  }}>
                                  <FiEdit className="w-3 h-3" />
                                  แก้ไข
                                </button>
                                <button
                                  type="button"
                                  className="flex items-center gap-1 px-3 py-1.5 text-white text-xs bg-red-600 hover:bg-red-700 rounded transition-colors"
                                  onClick={() =>
                                    _onPressDeleteUser(item.labcourseUserId)
                                  }>
                                  <FiTrash2 className="w-3 h-3" />
                                  ลบ
                                </button>
                              </div>
                            ),
                          },
                        ]}
                        data={courseUser}
                        loading={loading}
                      />
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      <Dialog
        open={userFormModal}
        onClose={_onCloseUserForm}
        className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-lg">
              {loadingUser ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  กำลังโหลดข้อมูล...
                </div>
              ) : (
                <form onSubmit={userForm.handleSubmit}>
                  <div className="px-6 pt-6 pb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                      เพิ่มผู้รับผิดชอบ
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className={className.label}>ผู้รับผิดชอบ</label>
                        <select
                          name="personId"
                          value={userForm.values.personId}
                          onChange={userForm.handleChange}
                          className={`${className.select} ${
                            userForm.touched.personId &&
                            userForm.errors.personId
                              ? "border-red-500"
                              : ""
                          }`}>
                          <option value="" disabled>
                            เลือกผู้รับผิดชอบ
                          </option>
                          {data.users.map((inv, index) => (
                            <option
                              key={inv.personId + index}
                              value={inv.personId}>
                              {inv.fullname}
                            </option>
                          ))}
                        </select>
                        {userForm.touched.personId &&
                          userForm.errors.personId && (
                            <p className="mt-1 text-sm text-red-500">
                              {userForm.errors.personId}
                            </p>
                          )}
                      </div>

                      <div>
                        <label className={className.label}>
                          ตำแหน่งที่รับผิดชอบ
                        </label>
                        <select
                          name="roleId"
                          value={userForm.values.roleId}
                          onChange={userForm.handleChange}
                          className={`${className.select} ${
                            userForm.touched.roleId && userForm.errors.roleId
                              ? "border-red-500"
                              : ""
                          }`}>
                          <option value="" disabled>
                            เลือกตำแหน่งที่รับผิดชอบ
                          </option>
                          {roleList.map((role) => (
                            <option key={role.roleId} value={role.roleId}>
                              {role.roleName}
                            </option>
                          ))}
                        </select>
                        {userForm.touched.roleId && userForm.errors.roleId && (
                          <p className="mt-1 text-sm text-red-500">
                            {userForm.errors.roleId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={() => _onCloseUserForm(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                      ยืนยัน
                    </button>
                  </div>
                </form>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </Content>
  );
}

const className = {
  label:
    "mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300 dark:text-gray-300",
  input:
    "block bg-white text-gray-900 dark:text-white w-full px-3 py-1.5 border rounded-md shadow-sm dark:bg-gray-800",
  select:
    "block bg-white text-gray-900 dark:text-white w-full px-4 py-2 border rounded-md dark:bg-gray-800",
};
