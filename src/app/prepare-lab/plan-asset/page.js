"use client";

import { use, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import Select from "react-select";
import { useRef } from "react";

import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiChevronLeft,
} from "react-icons/fi";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Content from "@/components/Content";
import { useFormik } from "formik";
import * as Yup from "yup";
import { confirmDialog, toastDialog } from "@/lib/stdLib";
import TableList from "@/components/TableList";
import AutocompleteSelect2 from "@/components/AutocompleteSelect2";

export default function Detail() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  // const { id } = useParams();
  const router = useRouter();
  // const isNew = id === "new";
  const idParam = searchParams.get("id");
  console.log("Raw id:", idParam);

  const labId = parseInt(idParam, 10);
  const isNew = labId === "new";
  console.log("Parsed labId:", labId, typeof labId);

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
    { id: "tab1", label: "ครุภัณฑ์" },
    { id: "tab2", label: "วัสดุไม่สิ้นเปลือง" },
    { id: "tab3", label: "วัสดุสิ้นเปลือง" },
  ];

  const validationSchema = Yup.object({
    personId: Yup.string().required("กรุณาเลือกข้อมูล"),
    labgroupId: Yup.string().required("กรุณาเลือกข้อมูล"),
    labroom: Yup.number()
      .required("กรุณากรอกข้อมูล")
      .min(1, "จำนวนต้องไม่น้อยกว่า 1"),
    labgroupNum: Yup.number()
      .required("กรุณากรอกข้อมูล")
      .min(1, "จำนวนต้องไม่น้อยกว่า 1"),
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
      labgroupNum: "",
      personId: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      values.labasset = labasset;
      values.courseUser = courseUser;
      try {
        console.log("values", values);
        if (isNew) {
          await axios.post(`/api/assign-course`, values);
          toastDialog("บันทึกข้อมูลเรียบร้อย!", "success");
          router.push("/assign-course?schId=" + searchParams.get("schId"));
        } else {
          const res = await axios.put(`/api/assign-course?id=${labId}`, values);
          console.log("res", res);
          toastDialog("บันทึกข้อมูลเรียบร้อย!", "success");
          router.push("/prepare-lab/plan-asset?id=" + searchParams.get("id"));
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
  const saveLabAsset = async (values) => {
    console.log("saveLabAsset", values);
    try {
      const payload = {
        labassetId: values.labassetId, // ถ้ามี = ใช้ PUT
        labId: values.labId || searchParams.get("id"),
        assetId: values.assetId,
        amount: values.amount,
        assetRemark: values.assetRemark || "",
        userId: values.userId,
      };

      if (
        !payload.labId ||
        !payload.assetId ||
        !payload.amount ||
        !payload.userId
      ) {
        toastDialog("ข้อมูลไม่ครบถ้วน โปรดตรวจสอบ", "error");
        return;
      }
      console.log("payload", payload);
      // ถ้ามี labassetId ให้ใช้ PUT แทน POST
      if (payload.labassetId) {
        await axios.put(`/api/use-asset/plnasset`, { labaset: payload });
      } else {
        await axios.post(`/api/use-asset/plnasset`, { labaset: payload });
      }

      localStorage.setItem("labCourseAssetData", JSON.stringify(payload));
      toastDialog("บันทึกข้อมูลเรียบร้อย!", "success");
      setInventFormModal(false);

      // รีโหลดข้อมูล
      fetchData();

      // ดึงข้อมูลล่าสุดอีกครั้ง
      await axios.get(`/api/assign-course?id=${payload.labId}`);

      // เปลี่ยนหน้า
      await router.push(`/prepare-lab/plan-asset?id=${payload.labId}`);
    } catch (error) {
      console.error("Error saving lab course asset:", error);
      toastDialog("เกิดข้อผิดพลาดในการบันทึก", "error");
    }
  };

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
          values.labassetId = "";
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
          values.labassetId = "";
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
          values.labassetId = "";
          setLabasset((prevLabasset) => ({
            ...prevLabasset,
            type3: [...(prevLabasset.type3 || []), values],
          }));
        }
      }
      await saveLabAsset(values);
      setInventFormModal(false);
      inventForm.resetForm();
    },
  });
  useEffect(() => {
    if (inventFormModal && inventForm.values.assetId) {
      const found = invent.find(
        (inv) => inv.assetId === parseInt(inventForm.values.assetId)
      );
      setAssetInfo(found || null);
    } else {
      setAssetInfo(null);
    }
  }, [inventFormModal, inventForm.values.assetId]);
  useEffect(() => {
    fetchData();
  }, [labId, searchParams.get("id")]);
  const fetchData = async () => {
    try {
      setLoading(true);
      let response;

      if (!isNew) {
        response = await axios.get(`/api/assign-course?id=${labId}`);
      } else {
        response = await axios.get(`/api/assign-course`, {
          params: {
            courseId: searchParams.get("courseId"),
            schId: searchParams.get("schId"),
          },
        });
      }

      const data = response.data;

      if (data.success) {
        setData({
          course: data.course,
          class: data.class,
          users: data.users,
          labgroup: data.labgroup,
        });

        if (!isNew) {
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
            labgroupNum: form.labgroupNum,
            personId: form.personId,
            userId: session?.user.person_id,
          });

          setLabasset({
            type1: data.labasset?.filter((item) => item.type === 1) || [],
            type2: data.labasset?.filter((item) => item.type === 2) || [],
            type3: data.labasset?.filter((item) => item.type === 3) || [],
          });

          setCourseUser(data.courseUser);
        } else {
          formik.setValues({
            courseid: data.course?.courseid,
            labgroupId: "",
            schId: searchParams.get("schId"),
            acadyear: data.class?.[0]?.acadyear,
            semester: data.class?.[0]?.semester,
            section: data.class?.length,
            labroom: "",
            hour: "",
            labgroupNum: "",
            personId: "",
            userId: session?.user.person_id,
          });
        }
      }
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      toastDialog("ไม่สามารถโหลดข้อมูลได้!", "error", 2000);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumb = [
    { name: "แผนการให้บริการห้องปฎิบัติการ" },
    { name: "ใบงานปฏิบัติการตามรายวิชา", link: "/prepare-lab" },
    { name: isNew ? "เพิ่มใหม่" : "เพิ่มข้อมูล" },
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
    setInventFormModal(true);
  };

  const _onPressEditInvent = async (id, type) => {
    // fetchData();
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
      // assetNameTh: assetData?.assetNameTh || "",
      amount: asset.amount,
      assetRemark: asset.assetRemark ? asset.assetRemark : "",
      flagDel: 0,
      type: type,
      userId: session?.user.person_id,
    });

    await _callInvent(type);
    setInventFormModal(true);
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
  const assetOptions = invent.map((inv) => ({
    label: `${inv.assetNameTh} ${inv.amountUnit} (${inv.unitName})`,
    value: inv.assetId,
  }));

  return (
    <Content breadcrumb={breadcrumb} title=" แผนการใช้ทรัพยากร ">
      <div className="relative flex flex-col w-full text-gray-900 dark:text-gray-300 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold">
            {isNew ? "แผนการใช้ทรัพยากร" : "แผนการใช้ทรัพยากร"} : {"รายวิชา"}{" "}
            {data.course?.coursename} ({data.course?.coursecode})
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
                  <div className="p-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
                    {[
                      {
                        type: 1,
                        name: "ครุภัณฑ์",
                        asset: labasset.type1,
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
                              onClick={() => _onPressAddInvent(type.type)}>
                              <FiPlus className="w-4 h-4" />
                              เพิ่ม
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
                                      หมายเหตุ : {item.assetRemark || "-"}
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
                                      }}>
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
                                      }}>
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
                )}
                {activeTab === "tab2" && (
                  <div className="p-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
                    {[
                      // {
                      //   type: 1,
                      //   name: "ครุภัณฑ์",
                      //   asset: labasset.type1,
                      // },
                      {
                        type: 2,
                        name: "วัสดุไม่สิ้นเปลือง",
                        asset: labasset.type2,
                      },
                      // {
                      //   type: 3,
                      //   name: "วัสดุสิ้นเปลือง",
                      //   asset: labasset.type3,
                      // },
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
                              onClick={() => _onPressAddInvent(type.type)}>
                              <FiPlus className="w-4 h-4" />
                              เพิ่ม
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
                                      หมายเหตุ : {item.assetRemark || "-"}
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
                                      }}>
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
                                      }}>
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
                )}
                {activeTab === "tab3" && (
                  <div className="p-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
                    {[
                      // {
                      //   type: 1,
                      //   name: "ครุภัณฑ์",
                      //   asset: labasset.type1,
                      // },
                      // {
                      //   type: 2,
                      //   name: "วัสดุไม่สิ้นเปลือง",
                      //   asset: labasset.type2,
                      // },
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
                              onClick={() => _onPressAddInvent(type.type)}>
                              <FiPlus className="w-4 h-4" />
                              เพิ่ม
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
                                      หมายเหตุ : {item.assetRemark || "-"}
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
                                      }}>
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
                                      }}>
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
                )}
              </div>
            </div>

            <div className="md:col-span-2 flex justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              {/* <button
                type="button"
                className="cursor-pointer p-3 text-white text-sm bg-gray-600 hover:bg-gray-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                onClick={() => router.back()}>
                <FiChevronLeft className="w-4 h-4" />
                ย้อนกลับ
              </button>
              <button
                type="submit"
                className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
                บันทึกข้อมูล
              </button> */}
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
                          วัสดุที่เลือกใช้ : แผนการใช้ทรัพยากรรายวิชา{" "}
                          {data.course?.coursecode} {data.course?.coursename}
                        </label>

                        <AutocompleteSelect2
                          name="assetId"
                          options={assetOptions}
                          value={inventForm.values.assetId}
                          onSelect={(name, item) => {
                            inventForm.setFieldValue(name, item.value);
                          }}
                          error={inventForm.errors.assetId}
                          touched={inventForm.touched.assetId}
                          // placeholder="พิมพ์หรือเลือกวัสดุ"
                        />
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
                        <label className={className.label}>หมายเหตุ</label>
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
