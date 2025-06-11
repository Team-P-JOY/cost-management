"use client";

import { use, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { FiPlus, FiEdit, FiTrash2, FiCheckCircle } from "react-icons/fi";
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
import { set } from "react-hook-form";

const roleList = [
  { roleId: "1", roleName: "นักวิทยาศาสตร์" },
  { roleId: "2", roleName: "พนักงานวิทยาศาสตร์" },
  { roleId: "3", roleName: "พนักงานห้องทดลอง" },
];

export default function Detail() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
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

  const breadcrumb = [
    { name: "แผนการให้บริการห้องปฎิบัติการ" },
    { name: "กำหนดรายวิชา", link: "/assign-course" },
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
    const result = await confirmDialog(
      "คุณแน่ใจหรือไม่?",
      "คุณต้องการลบข้อมูลนี้จริงหรือไม่?"
    );
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
    const result = await confirmDialog(
      "คุณแน่ใจหรือไม่?",
      "คุณต้องการลบข้อมูลนี้จริงหรือไม่?"
    );

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
      <div className="relative flex flex-col w-full text-gray-900 dark:text-gray-300 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold">
            {isNew ? "เพิ่มใหม่" : "แก้ไขข้อมูล"} : {data.course?.coursecode}{" "}
            {data.course?.coursename}
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            กำลังโหลดข้อมูล...
          </div>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <div className="w-full">
              <div className="flex px-4 mt-2">
                {tabs.map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex justify-center font-semibold items-center space-x-2 p-4 transition text-lg border-blue-600 dark:border-blue-300 border-2 ${
                      activeTab === tab.id
                        ? "text-blue-600 border-b-0 rounded-t-lg dark:text-blue-300"
                        : "text-gray-500 border-x-0 border-t-0 dark:text-white"
                    }`}>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div>
                {activeTab === "tab1" && (
                  <>
                    <div className="p-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
                      <div className="sm:col-span-12">
                        <h3 className="font-xl font-semibold">
                          {data.course?.coursecode} {data.course?.coursename}
                        </h3>
                      </div>
                      <div className="sm:col-span-4">
                        <i>สำนักวิชา</i> : {data.course?.facultyname}
                      </div>
                      <div className="sm:col-span-8">
                        <i>เทอมการศึกษา</i> : {data.class?.[0]?.semester}/
                        {data.class?.[0]?.acadyear}
                      </div>
                      <div className="sm:col-span-4">
                        <i>จำนวนกลุ่ม</i> : {data.class?.length} กลุ่ม
                      </div>
                      <div className="sm:col-span-4">
                        <i>จำนวนนักศึกษา</i> :{" "}
                        {data.class?.reduce(
                          (total, item) => total + item.totalseat,
                          0
                        )}{" "}
                        คน
                      </div>
                      <div className="sm:col-span-12">
                        <i>รายละเอียด</i> : {data.course?.description1}
                      </div>

                      <div className="sm:col-span-12">
                        <div className="p-4 border relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
                          <div className="p-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
                            <div className="sm:col-span-6">
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
                            <div className="sm:col-span-6">
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

                            <div className="sm:col-span-4">
                              <label className={className.label}>
                                จำนวนห้อง LAB ที่เปิดบริการ
                              </label>

                              <input
                                type="number"
                                name="labroom"
                                value={formik.values.labroom || ""}
                                onChange={formik.handleChange}
                                className={`${className.input} ${
                                  formik.touched.labroom &&
                                  formik.errors.labroom
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

                            {/* <div className="sm:col-span-4">
                              <label className={className.label}>
                                จำนวนกลุ่มต่อห้อง
                              </label>
                              <input
                                type="number"
                                name="labgroupNum"
                                value={formik.values.labgroupNum || ""}
                                onChange={formik.handleChange}
                                className={`${className.input} ${
                                  formik.touched.labgroupNum &&
                                  formik.errors.labgroupNum
                                    ? "border-red-500"
                                    : ""
                                }`}
                              />
                              {formik.touched.labgroupNum &&
                                formik.errors.labgroupNum && (
                                  <p className="mt-1 text-sm text-red-500">
                                    {formik.errors.labgroupNum}
                                  </p>
                                )}
                            </div> */}

                            <div className="sm:col-span-4">
                              <label className={className.label}>
                                จำนวนชั่วโมงเรียน
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
                      </div>
                    </div>
                    <div className="md:col-span-2 flex justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        className="p-2 text-white bg-gray-600 hover:bg-gray-700 rounded-lg"
                        onClick={() => router.back()}>
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
                        บันทึกข้อมูล
                      </button>
                    </div>
                  </>
                )}
                {activeTab === "tab2" && (
                  <div className="p-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
                    <div className="sm:col-span-12">
                      <div className="p-4 border relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
                        <div className="pb-4 border-gray-200 flex justify-between items-center">
                          <div className="font-xl font-semibold inline">
                            <span className="pe-2">ผู้รับผิดชอบ</span>
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                              {courseUser.length} รายการ
                            </span>
                          </div>
                          <button
                            type="button"
                            className="cursor-pointer p-2 text-white text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                              content: "Action",
                              width: "100",
                              sort: false,

                              render: (item) => (
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    className="cursor-pointer p-2 text-white text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => {
                                      _onPressEditUser(item.labcourseUserId);
                                    }}>
                                    <FiEdit className="w-4 h-4" />
                                    แก้ไข
                                  </button>
                                  <button
                                    type="button"
                                    className="cursor-pointer p-2 text-white text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() =>
                                      _onPressDeleteUser(item.labcourseUserId)
                                    }>
                                    <FiTrash2 className="w-4 h-4" />
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
                    </div>
                  </div>
                )}
                {/* {activeTab === "tab3" && (
                  <div className="p-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
                    {[
                      {
                        type: 1,
                        name: "ครุภัณฑ์",
                        asset: labasset.type1,
                      },
                      {
                        type: 2,
                        name: "วัสดุไม่สิ้นเปลือง",
                        asset: labasset.type2,
                      },
                      {
                        type: 3,
                        name: "วัสดุสิ้นเปลือง",
                        asset: labasset.type3,
                      },
                    ].map((type) => (
                      <div className="sm:col-span-12" key={type.type}>
                        <div className="p-4 border relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
                          <div className="pb-4 border-gray-200 flex justify-between items-center">
                            <div className="font-xl font-semibold inline">
                              <span className="pe-2">{type.name}</span>
                              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                                {type.asset.length} รายการ
                              </span>
                            </div>
                            <button
                              type="button"
                              className="cursor-pointer p-2 text-white text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => _onPressAddInvent(type.type)}
                            >
                              <FiPlus className="w-4 h-4" />
                              เพิ่มใหม่
                            </button>
                          </div>
                          <TableList
                            exports={false}
                            meta={[
                              {
                                content: "รายการ",
                                key: "assetNameTh",
                                render: (item) => (
                                  <div>
                                    <div> {item.assetNameTh}</div>
                                    <div className="flex gap-2 text-gray-500 dark:text-gray-400">
                                      <div className="text-sm">
                                        ยี่ห้อ : {item.brandName || "-"}
                                      </div>
                                      <div className="text-sm">
                                        ขนาด : {item.amountUnit || "-"}
                                      </div>
                                      <div className="text-sm">
                                        ห้องปฎิบัติการ :{" "}
                                        {item.invgroupName || "-"}
                                      </div>
                                    </div>
                                    <div className="text-sm">
                                      Remark : {item.assetRemark || "-"}
                                    </div>
                                  </div>
                                ),
                              },
                              {
                                content: "จำนวน",
                                width: 100,
                                className: "text-center",
                                key: "amount",
                                render: (item) => (
                                  <div>{item.amount.toLocaleString()}</div>
                                ),
                              },
                              {
                                content: "หน่วย",
                                width: 100,
                                key: "unitName",
                              },
                              {
                                key: "assetId",
                                content: "Action",
                                width: "100",
                                sort: false,
                                render: (item) => (
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      className="cursor-pointer p-2 text-white text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                      onClick={() => {
                                        return _onPressEditInvent(
                                          item.labassetId,
                                          type.type
                                        );
                                      }}
                                    >
                                      <FiEdit className="w-4 h-4" />
                                      แก้ไข
                                    </button>
                                    <button
                                      type="button"
                                      className="cursor-pointer p-2 text-white text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                      onClick={() => {
                                        return _onPressDeleteInvent(
                                          item.labassetId,
                                          type.type
                                        );
                                      }}
                                    >
                                      <FiTrash2 className="w-4 h-4" />
                                      ลบ
                                    </button>
                                  </div>
                                ),
                              },
                            ]}
                            data={type.asset}
                            loading={loading}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )} */}
              </div>
            </div>
          </form>
        )}
      </div>

      <Dialog
        open={inventFormModal}
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
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full sm:max-w-2xl data-closed:sm:translate-y-0 data-closed:sm:scale-95">
              {loadingInvent ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  กำลังโหลดข้อมูล...
                </div>
              ) : (
                <form onSubmit={inventForm.handleSubmit}>
                  <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
                      <div className="sm:col-span-12">
                        <label className={className.label}>
                          วัสดุที่เลือกใช้
                        </label>
                        <select
                          name="assetId"
                          value={inventForm.values.assetId}
                          onChange={inventForm.handleChange}
                          className={`${className.select} ${
                            inventForm.touched.assetId &&
                            inventForm.errors.assetId
                              ? "border-red-500"
                              : ""
                          }`}>
                          <option value="" disabled>
                            เลือกวัสดุที่เลือกใช้
                          </option>
                          {invent.map((inv) => (
                            <option key={inv.assetId} value={inv.assetId}>
                              {inv.assetNameTh} {inv.amountUnit}
                              {/* [{inv.brandName}                              ]  */}
                              ({inv.unitName})
                            </option>
                          ))}
                        </select>
                        {inventForm.touched.assetId &&
                          inventForm.errors.assetId && (
                            <p className="mt-1 text-sm text-red-500">
                              {inventForm.errors.assetId}
                            </p>
                          )}
                      </div>
                      {assetInfo && (
                        <div className="sm:col-span-12">
                          <div className="border rounded-lg border-blue-600 dark:border-blue-300">
                            <div className="p-4 border-b border-blue-600 dark:border-blue-300">
                              <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                                {assetInfo?.assetNameTh}
                              </h3>
                            </div>
                            <div className="p-4">
                              <div className="text-gray-500 dark:text-gray-400">
                                <div className="text-sm">
                                  ยี่ห้อ : {assetInfo?.brandName || "-"}
                                </div>
                                <div className="text-sm">
                                  ขนาด : {assetInfo?.amountUnit || "-"}
                                </div>
                                <div className="text-sm">
                                  ห้องปฎิบัติการ :{" "}
                                  {assetInfo?.invgroupName || "-"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="sm:col-span-9">
                        <label className={className.label}>จำนวนที่ใช้</label>
                        <input
                          type="number"
                          name="amount"
                          value={inventForm.values.amount}
                          onChange={inventForm.handleChange}
                          className={`${className.input} ${
                            inventForm.touched.amount &&
                            inventForm.errors.amount
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {inventForm.touched.amount &&
                          inventForm.errors.amount && (
                            <p className="mt-1 text-sm text-red-500">
                              {inventForm.errors.amount}
                            </p>
                          )}
                      </div>
                      <div className="sm:col-span-3">
                        <label className={className.label}>หน่วย</label>
                        <input
                          value={assetInfo?.unitName || "-"}
                          disabled
                          className={className.input}
                        />
                      </div>
                      <div className="sm:col-span-12">
                        <label className={className.label}>Remark</label>
                        <input
                          type="text"
                          name="assetRemark"
                          value={inventForm.values.assetRemark}
                          onChange={inventForm.handleChange}
                          className={`${className.input} ${
                            inventForm.touched.assetRemark &&
                            inventForm.errors.assetRemark
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {inventForm.touched.assetRemark &&
                          inventForm.errors.assetRemark && (
                            <p className="mt-1 text-sm text-red-500">
                              {inventForm.errors.assetRemark}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 sm:ml-3 sm:w-auto">
                      ยืนยัน
                    </button>
                    <button
                      type="button"
                      data-autofocus
                      onClick={() => _onCloseInventForm(false)}
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto">
                      ยกเลิก
                    </button>
                  </div>
                </form>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={userFormModal}
        onClose={_onCloseUserForm}
        className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 text-gray-900 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full sm:max-w-2xl data-closed:sm:translate-y-0 data-closed:sm:scale-95">
              {loadingUser ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  กำลังโหลดข้อมูล...
                </div>
              ) : (
                <form onSubmit={userForm.handleSubmit}>
                  <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
                      <div className="sm:col-span-12">
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

                      <div className="sm:col-span-12">
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
                  <div className="md:col-span-2 flex justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 sm:ml-3 sm:w-auto">
                      ยืนยัน
                    </button>
                    <button
                      type="button"
                      data-autofocus
                      onClick={() => _onCloseUserForm(false)}
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto">
                      ยกเลิก
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
