"use client";

import { use, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
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
  const router = useRouter();
  const idParam = searchParams.get("labId");
  const labjobId = searchParams.get("labjobId");

  const labId = parseInt(idParam, 10);
  const isNew = labId === "new";
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tab1");
  const [Assetbroken, setAssetbroken] = useState([]);
  const [invent, setInvent] = useState([]);
  const [user, setUser] = useState([]);
  const [labasset, setLabasset] = useState({
    type1: [],
    type2: [],
    type3: [],
  });
  const [uselabasset, setUseLabasset] = useState({
    type1: [],
    type2: [],
    type3: [],
  });

  const [courseUser, setCourseUser] = useState([]);
  const [loadingInvent, setLoadingInvent] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [brokenFormModal, setBrokenFormModal] = useState(false);
  const [inventFormModal, setInventFormModal] = useState(false);
  const [userFormModal, setUserFormModal] = useState(false);

  const [data, setData] = useState({
    course: null,
    class: [],
    users: [],
    labgroup: [],
  });
  const [datalabjob, setDatalabjob] = useState([]);

  const [assetInfo, setAssetInfo] = useState(null);

  const tabs = [
    { id: "tab1", label: "ครุภัณฑ์" },
    { id: "tab2", label: "วัสดุไม่สิ้นเปลือง" },
    { id: "tab3", label: "วัสดุสิ้นเปลือง" },
    { id: "tab4", label: "อุปกรณ์ชำรุด" },
  ];
  const validationInventForm = Yup.object({
    assetId: Yup.string().required("กรุณาเลือกข้อมูล"),
    amountUsed: Yup.number()
      .required("กรุณากรอกจำนวนที่ใช้")
      .min(1, "จำนวนต้องไม่น้อยกว่า 1"),
    unitPrice: Yup.number()
      .required("กรุณากรอกข้อมูล")
      .min(1, "จำนวนต้องไม่น้อยกว่า 1"),
    assetUsedRemark: Yup.string()
      .nullable()
      .max(100, "ข้อความต้องไม่เกิน 100 ตัวอักษร"),
    hourUsed: Yup.number()
      .required("กรุณากรอกข้อมูล")
      .nullable()
      .min(0, "ชั่วโมงต้องไม่น้อยกว่า 0")
      .max(24, "ชั่วโมงต้องไม่เกิน 24"),
  });
  const inventForm = useFormik({
    initialValues: {
      id: "",
      labjobAssetId: "",
      labjobId: "",
      assetId: "",
      amountUsed: 0,
      hourUsed: 0,
      assetUsedRemark: "",
      type: "",
      assetextraFlag: 0,
      unitPrice: "",
      userId: session?.user.person_id,
    },
    validationSchema: validationInventForm,
    onSubmit: async (values) => {
      // ตรวจสอบค่าก่อนส่ง
      console.log("InventForm values before submit:", values);

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
      // values.unitPrice = invent.find(
      //   (inv) => inv.assetId === parseInt(values.assetId)
      // )?.unitPrice;
      values.invgroupName = invent.find(
        (inv) => inv.assetId === parseInt(values.assetId)
      )?.invgroupName;

      // ตรวจสอบค่าหลังจากกำหนดค่า assetNameTh และอื่น ๆ
      console.log("Values after asset info assignment:", values);

      if (values.type === 1) {
        if (values.labjobAssetId) {
          setUseLabasset((prevLabasset) => ({
            ...prevLabasset,
            type1: prevLabasset.type1.map((item) =>
              item.labjobAssetId === values.labjobAssetId ? values : item
            ),
          }));
        } else {
          values.labjobAssetId = "";
          setUseLabasset((prevLabasset) => ({
            ...prevLabasset,
            type1: [...(prevLabasset.type1 || []), values],
          }));
        }
      } else if (values.type === 2) {
        if (values.labjobAssetId) {
          setUseLabasset((prevLabasset) => ({
            ...prevLabasset,
            type2: prevLabasset.type2.map((item) =>
              item.labjobAssetId === values.labjobAssetId ? values : item
            ),
          }));
        } else {
          values.labjobAssetId = "";
          setUseLabasset((prevLabasset) => ({
            ...prevLabasset,
            type2: [...(prevLabasset.type2 || []), values],
          }));
        }
      } else if (values.type === 3) {
        if (values.labjobAssetId) {
          setUseLabasset((prevLabasset) => ({
            ...prevLabasset,
            type3: prevLabasset.type3.map((item) =>
              item.labjobAssetId === values.labjobAssetId ? values : item
            ),
          }));
        } else {
          values.labjobAssetId = "";
          setUseLabasset((prevLabasset) => ({
            ...prevLabasset,
            type3: [...(prevLabasset.type3 || []), values],
          }));
        }
      }
      await saveLabAsset(values);
      setInventFormModal(false);
      inventForm.resetForm();
      console.log("Form reset and modal closed.");
    },
  });
  const brokenForm = useFormik({
    initialValues: {
      assetId: "",
      amountUsed: "",
      hourUsed: "",
      labjobId: labjobId, // Ensure labjobId is properly passed in
      assetUsedRemark: "",
    },
    validationSchema: validationInventForm,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await fetch("/api/use-asset/broken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assetBroken: {
              labjobId: searchParams.get("labjobId"),
              brokenAmount: values.amountUsed,
              hourUsed: values.hourUsed || "",
              assetId: values.assetId,
              userId: session.user.person_id, // Assuming this comes from session/context
              labId: searchParams.get("id"), // Ensure labId is available in context/props
            },
          }),
        });

        const result = await response.json();
        if (result.success) {
          toastDialog("บันทึกข้อมูลเรียบร้อย!", "success");
          fetchData();
          setBrokenFormModal(false);
          brokenForm.resetForm();
          // Reset form after successful submission
        } else {
          // alert("เกิดข้อผิดพลาด: " + result.message);
          toastDialog("เกิดข้อผิดพลาด!" + result.message);
        }
      } catch (error) {
        console.error("Error:", error);
        toastDialog("เกิดข้อผิดพลาดในการส่งข้อมูล");
      }
    },
  });

  const saveLabAsset = async (values, isNew) => {
    console.log("Saving Lab Asset with values:", values);
    try {
      const url = `/api/use-asset`;

      // Use PUT if labjobAssetId exists, otherwise POST for a new entry
      const method = values.labjobAssetId ? "put" : "post";

      // Ensure that labjobId is included in the values when updating an existing asset
      if (method === "put" && !searchParams.get("labjobId")) {
        console.error("labjobId is required for PUT requests.");
        return {
          success: false,
          message: "labjobId is required for PUT requests.",
        };
      }

      // Prepare the data payload for the API
      const data = {
        uselabasset: {
          ...values,
          labjobId: searchParams.get("labjobId"), // Make sure labjobId is added for PUT request
        },
      };

      // Send the data to the API
      const response = await axios({
        method,
        url,
        data,
      });

      // Check the response from the API
      if (response.data.success) {
        // console.log("Data saved:", response.data);
        toastDialog("บันทึกข้อมูลเรียบร้อย!", "success");
        fetchData();
        return response.data; // Return the response data for further use
      } else {
        // console.error("Save failed:", response.data);
        toastDialog("บันทึกข้อมูลเรียบร้อย!", "success");
        fetchData();
        return response.data;
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return { success: false, message: "API Error" };
    }
  };

  const formik = useFormik({
    initialValues: {
      labjobAssetId: "", // กำหนดให้เป็นค่าว่างถ้ากำลังเพิ่มข้อมูลใหม่
      // ค่าเริ่มต้นอื่น ๆ ที่เกี่ยวข้อง
    },
    onSubmit: async (values) => {
      // ตรวจสอบค่า labjobAssetId
      const isNew = !values.labjobAssetId; // ถ้าไม่มี labjobAssetId, หมายถึงข้อมูลใหม่

      console.log(
        isNew
          ? "Adding new asset with values:"
          : "Editing existing asset with values:",
        values
      );

      const result = await saveLabAsset(values, isNew); // ส่งข้อมูลไปยัง API

      // ถ้าเรียบร้อย, จะไปที่หน้าถัดไปหรือรีโหลดหน้า
      if (result.success) {
        await router.push(
          `/prepare-lab/Use-asset?id=${searchParams.get(
            "id"
          )}&labjobId=${searchParams.get("labjobId")}`
        );
        if (isNew) window.location.reload(); // ถ้าเป็นข้อมูลใหม่, รีโหลดหน้า
      }
    },
  });

  useEffect(() => {
    const assetId = inventForm.values.assetId || brokenForm.values.assetId;

    if (assetId) {
      const foundAsset = invent.find(
        (inv) => inv.assetId === parseInt(assetId)
      );
      setAssetInfo(foundAsset);

      // เซ็ตค่า unitPrice ถ้ายังไม่มีการกรอกไว้
      if (foundAsset && inventForm.values.unitPrice === "") {
        inventForm.setFieldValue("unitPrice", foundAsset.unitPrice ?? "");
      }
    } else {
      setAssetInfo(null);
    }
  }, [inventForm.values.assetId, brokenForm.values.assetId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!isNew) {
        console.log("labId:", labId, "labjobId:", labjobId);

        const response = await axios.get(
          `/api/use-asset?id=${labId}&labjobId=${labjobId}`
        );
        const data = response.data;
        if (data.success) {
          setDatalabjob({ labjob: data.labjob });
          console.log("Data fetched:", data.labjob);
          setData({ course: data.course });

          setLabasset({
            type1: data.labasset?.filter((item) => item.type === 1) || [],
            type2: data.labasset?.filter((item) => item.type === 2) || [],
            type3: data.labasset?.filter((item) => item.type === 3) || [],
          });

          setUseLabasset({
            type1:
              data.uselabasset
                ?.filter((item) => item.type === 1)
                .map((item) => ({
                  ...item,
                  userId: parseInt(session.user.person_id, 10) || 0,
                })) || [],
            type2:
              data.uselabasset
                ?.filter((item) => item.type === 2)
                .map((item) => ({
                  ...item,
                  userId: parseInt(session.user.person_id, 10) || 0,
                })) || [],
            type3:
              data.uselabasset
                ?.filter((item) => item.type === 3)
                .map((item) => ({
                  ...item,
                  userId: parseInt(session.user.person_id, 10) || 0,
                })) || [],
          });
          setAssetbroken(data.assetbroken);
        }
      } else {
        const response = await axios.get(`/api/assign-course`, {
          params: {
            courseId: searchParams.get("courseId"),
            schId: searchParams.get("schId"),
          },
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

  // useEffect เรียกเมื่อ labId หรือ labjobId เปลี่ยน
  useEffect(() => {
    if (assetInfo?.unitPrice && !inventForm.values.unitPrice) {
      inventForm.setFieldValue("unitPrice", assetInfo.unitPrice);
    }
    fetchData();
  }, [assetInfo, labId, searchParams.get("labjobId")]);

  const breadcrumb = [
    // { name: "แผนการให้บริการห้องปฎิบัติการ" },
    { name: "รายการรายวิชา", link: "/prepare-labu" },
    { name: "ใบงานตรียมปฏิบัติการ", link: "/prepare-lab/new?labId=" + labId },
    { name: isNew ? "เพิ่มการใช้ทรัพยากร" : "เพิ่มการใช้ทรัพยากร" },
  ];

  const _callInvent = async (type, labId, extraFlag) => {
    setLoadingInvent(true);
    try {
      const response = await axios.get(`/api/use-asset/plnasset`, {
        params: {
          type: type,
          labId: labId,
          labjobId: searchParams.get("labjobId"),
          extraFlag: extraFlag,
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

  const _onPressAddInvent = async (type, labjobId, labId, extraFlag) => {
    setInventFormModal(true);
    inventForm.setValues({
      labjobAssetId: "",
      assetId: "",
      labjobId: labjobId,
      amountUsed: "",
      hourUsed: "",
      assetUsedRemark: "",
      flagDel: 0,
      type: type,
      assetextraFlag: extraFlag,
      userId: session?.user.person_id,
    });
    await _callInvent(type, labId, extraFlag);
  };

  const _onPressEditInvent = async (id, type) => {
    setInventFormModal(true);
    let asset;
    if (type === 1) {
      asset = uselabasset.type1.find((item) => item.labjobAssetId === id);
    } else if (type === 2) {
      asset = uselabasset.type2.find((item) => item.labjobAssetId === id);
    } else if (type === 3) {
      asset = uselabasset.type3.find((item) => item.labjobAssetId === id);
    }

    if (!asset) {
      console.error("Asset not found");
      return;
    }

    // Setting values for Formik
    inventForm.setValues({
      labjobAssetId: asset.labjobAssetId,
      assetId: asset.assetId,
      amountUsed: asset.amountUsed,
      hourUsed: asset.hourUsed || "",
      assetUsedRemark: asset.assetUsedRemark || "",
      flagDel: 0,
      type: type,
      assetextraFlag: asset.assetextraFlag,
      userId: session?.user.person_id,
      unitName: asset.unitName,
      unitPrice: asset.unitPrice,
    });

    // Fetch additional asset info if necessary
    await _callInvent(type, labId, asset.assetextraFlag);
  };

  const _onPressDeleteInvent = async (id, type) => {
    const result = await confirmDialog(
      "คุณแน่ใจหรือไม่?",
      "คุณต้องการลบข้อมูลนี้จริงหรือไม่?"
    );

    if (result.isConfirmed) {
      if (type === 1) {
        setUseLabasset((prevLabasset) => ({
          // ตรงนี้เปลี่ยนจาก type1 เป็น type
          ...prevLabasset, // ตรงนี้เปลี่ยนจาก type1 เป็น type
          type1: prevLabasset.type1.filter((item) => item.labjobAssetId !== id),
        }));
      } else if (type === 2) {
        setUseLabasset((prevLabasset) => ({
          ...prevLabasset,
          type2: prevLabasset.type1.filter((item) => item.labjobAssetId !== id),
        }));
      } else if (type === 3) {
        setUseLabasset((prevLabasset) => ({
          ...prevLabasset,
          type3: prevLabasset.type1.filter((item) => item.labjobAssetId !== id),
        }));
      }
      try {
        await axios.delete(
          `/api/use-asset?id=${id}&userId=${session?.user.person_id}`
        );
        toastDialog("ลบข้อมูลเรียบร้อย!", "success");
        const response = await axios.get(
          `/api/use-asset?id=${labId}&labjobId=${labjobId}`
        );
        const data = response.data;
        if (data.success) {
          setUseLabasset({
            type1:
              data.uselabasset
                ?.filter((item) => item.type === 1)
                .map((item) => ({
                  ...item,
                  userId: parseInt(session.user.person_id, 10) || 0,
                })) || [],
            type2:
              data.uselabasset
                ?.filter((item) => item.type === 2)
                .map((item) => ({
                  ...item,
                  userId: parseInt(session.user.person_id, 10) || 0,
                })) || [],
            type3:
              data.uselabasset
                ?.filter((item) => item.type === 3)
                .map((item) => ({
                  ...item,
                  userId: parseInt(session.user.person_id, 10) || 0,
                })) || [],
          });
        }

        // ✅ Navigate to another page and reload if needed
        await router.push(
          `/prepare-lab/Use-asset?id=${searchParams.get(
            "id"
          )}&labjobId=${searchParams.get("labjobId")}`
        );
      } catch (error) {
        console.error("Error deleting brand:", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  const _onPressDeleteBroken = async (id) => {
    const result = await confirmDialog(
      "คุณแน่ใจหรือไม่?",
      "คุณต้องการลบข้อมูลนี้จริงหรือไม่?"
    );

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `/api/use-asset/broken?id=${id}&userId=${session?.user.person_id}`
        );
        toastDialog("ลบข้อมูลเรียบร้อย!", "success");
        fetchData();
      } catch (error) {
        console.error("Error deleting brand:", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };
  const _onCloseInventForm = (status) => {
    setInventFormModal(status);
    setBrokenFormModal(status);
    inventForm.resetForm();
  };
  const _onPressAddBroken = async (type, labjobId, labId, extraFlag) => {
    setBrokenFormModal(true);
    inventForm.setValues({
      labjobAssetId: "",
      assetId: "",
      labjobId: labjobId,
      amountUsed: "",
      hourUsed: "",
      assetUsedRemark: "",
      flagDel: 0,
      type: type,
      assetextraFlag: extraFlag,
      userId: session?.user.person_id,
    });
    await _callInvent(type, labId, extraFlag);
  };
  const assetOptions = invent.map((inv, index) => ({
    label: `${inv.assetNameTh} ${inv.amountUnit} (${inv.unitName})`,
    value: `${inv.assetId}-${index}`,
  }));

  return (
    <Content
      breadcrumb={breadcrumb}
      title=" การใช้ทรัพยากร : ตามใบงานปฏิบัติการ">
      <div className="relative flex flex-col w-full text-gray-900 dark:text-gray-300 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold">
            {isNew ? "การใช้ทรัพยากร" : "การใช้ทรัพยากร"} :{" "}
            {data.course?.coursename} ({data.course?.coursecode}){" "}
            {datalabjob.labjob?.labjobTitle || ""}
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
                    <div className="sm:col-span-12">
                      <div className="p-4 border relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-indigo-50 dark:bg-gray-800shadow-md rounded-xl">
                        <div className="pb-4 border-gray-200 flex justify-between items-center">
                          <div className="font-xl font-semibold inline ">
                            <span className="pe-2">
                              บันทึกข้อมูลการใช้ทรัพยากร
                            </span>
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                              {uselabasset?.type1?.length ?? ""} รายการ
                            </span>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              className="cursor-pointer p-2 text-white text-sm bg-red-400 hover:bg-red-700  rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                              onClick={() =>
                                _onPressAddInvent(
                                  uselabasset?.type1?.[0]?.type ?? 1,
                                  labjobId,
                                  labId,
                                  1
                                )
                              }>
                              <FiPlus className="w-4 h-4" />
                              เพิ่มรายการนอก
                            </button>
                            <button
                              type="button"
                              className="cursor-pointer p-2 text-white text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                              onClick={() =>
                                _onPressAddInvent(
                                  uselabasset?.type1?.[0]?.type ?? 1,
                                  labjobId,
                                  labId,
                                  0
                                )
                              }>
                              <FiPlus className="w-4 h-4" />
                              เพิ่มรายการ
                            </button>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 border rounded-lg">
                          <TableList
                            exports={false}
                            meta={[
                              {
                                content: "รายการ",
                                key: "assetNameTh",
                                render: (item) => (
                                  <div>
                                    <div>
                                      {item.assetNameTh} (ราคาต่อหน่วย{" "}
                                      {item.unitPrice} บาท)
                                      {""}
                                      {item.assetextraFlag === "1" ? (
                                        <span style={{ color: "red" }}>
                                          {" "}
                                          (รายการนอก)
                                        </span>
                                      ) : (
                                        ""
                                      )}
                                    </div>

                                    <div className="flex gap-2 text-gray-500 dark:text-gray-400 ">
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
                                      หมายเหตุ : {item.assetUsedRemark || "-"}
                                    </div>
                                  </div>
                                ),
                              },
                              {
                                content: "จำนวน",
                                width: 100,
                                className: "text-center",
                                key: "amountUsed",
                                render: (item) => {
                                  return (
                                    <div>
                                      {item.amountUsed
                                        ? item.amountUsed.toLocaleString()
                                        : "-"}
                                    </div>
                                  );
                                },
                              },

                              {
                                content: "หน่วย",
                                width: 100,
                                key: "unitName",
                              },
                              {
                                key: "labjobAssetId",
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
                                          item.labjobAssetId,
                                          item.type
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
                                          item.labjobAssetId,
                                          item.type
                                        );
                                      }}>
                                      <FiTrash2 className="w-4 h-4" />
                                      ลบ
                                    </button>
                                  </div>
                                ),
                              },
                            ]}
                            data={uselabasset.type1}
                            loading={loading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "tab2" && (
                  <div className="p-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
                    <div className="sm:col-span-12">
                      <div className="p-4 border relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-indigo-50 dark:bg-gray-800shadow-md rounded-xl">
                        <div className="pb-4 border-gray-200 flex justify-between items-center">
                          <div className="font-xl font-semibold inline ">
                            <span className="pe-2">
                              บันทึกข้อมูลการใช้ทรัพยากร
                            </span>
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                              {uselabasset?.type2?.length ?? ""} รายการ
                            </span>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              className="cursor-pointer p-2 text-white text-sm bg-red-400 hover:bg-red-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                              onClick={() =>
                                _onPressAddInvent(
                                  uselabasset?.type2?.[0]?.type ?? 2,
                                  labjobId,
                                  labId,
                                  1
                                )
                              }>
                              <FiPlus className="w-4 h-4" />
                              เพิ่มรายการนอก
                            </button>
                            <button
                              type="button"
                              className="cursor-pointer p-2 text-white text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                              onClick={() =>
                                _onPressAddInvent(
                                  uselabasset?.type2?.[0]?.type ?? 2,
                                  labjobId,
                                  labId,
                                  0
                                )
                              }>
                              <FiPlus className="w-4 h-4" />
                              เพิ่มรายการ
                            </button>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 border rounded-lg">
                          <TableList
                            exports={false}
                            meta={[
                              {
                                content: "รายการ",
                                key: "assetNameTh",
                                render: (item) => (
                                  <div>
                                    <div>
                                      {item.assetNameTh} (ราคาต่อหน่วย{" "}
                                      {item.unitPrice} บาท){" "}
                                      {item.assetextraFlag === "1" ? (
                                        <span style={{ color: "red" }}>
                                          {" "}
                                          (รายการนอก)
                                        </span>
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                    <div className="flex gap-2 text-gray-500 dark:text-gray-400 ">
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
                                      หมายเหตุ : {item.assetUsedRemark || "-"}
                                    </div>
                                  </div>
                                ),
                              },
                              {
                                content: "จำนวน",
                                width: 100,
                                className: "text-center",
                                key: "amountUsed",
                                render: (item) => (
                                  <div>
                                    {item.amountUsed
                                      ? item.amountUsed.toLocaleString()
                                      : "-"}
                                  </div>
                                ),
                              },
                              {
                                content: "หน่วย",
                                width: 100,
                                key: "unitName",
                              },
                              {
                                key: "labjobAssetId",
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
                                          item.labjobAssetId,
                                          item.type
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
                                          item.labjobAssetId,
                                          item.type
                                        );
                                      }}>
                                      <FiTrash2 className="w-4 h-4" />
                                      ลบ
                                    </button>
                                  </div>
                                ),
                              },
                            ]}
                            data={uselabasset.type2}
                            loading={loading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "tab3" && (
                  <div className="p-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
                    <div className="sm:col-span-12">
                      <div className="p-4 border relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-indigo-50 dark:bg-gray-800shadow-md rounded-xl">
                        <div className="pb-4 border-gray-200 flex justify-between items-center">
                          <div className="font-xl font-semibold inline ">
                            <span className="pe-2">
                              บันทึกข้อมูลการใช้ทรัพยากร
                            </span>
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                              {uselabasset?.type3?.length ?? ""} รายการ
                            </span>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              className="cursor-pointer p-2 text-white text-sm bg-red-400 hover:bg-red-700  rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                              onClick={() =>
                                _onPressAddInvent(
                                  uselabasset?.type3?.[0]?.type ?? 3,
                                  labjobId,
                                  labId,
                                  1
                                )
                              }>
                              <FiPlus className="w-4 h-4" />
                              เพิ่มรายการนอก
                            </button>
                            <button
                              type="button"
                              className="cursor-pointer p-2 text-white text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed justify-end hover:scale-105"
                              onClick={() =>
                                _onPressAddInvent(
                                  uselabasset?.type3?.[0]?.type ?? 3,
                                  labjobId,
                                  labId,
                                  0
                                )
                              }>
                              <FiPlus className="w-4 h-4" />
                              เพิ่มรายการ
                            </button>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 border rounded-lg">
                          <TableList
                            exports={false}
                            meta={[
                              {
                                content: "รายการ",
                                key: "assetNameTh",
                                render: (item) => (
                                  <div>
                                    <div>
                                      {item.assetNameTh}(ราคาต่อหน่วย{" "}
                                      {item.unitPrice} บาท){" "}
                                      {item.assetextraFlag === "1" ? (
                                        <span style={{ color: "red" }}>
                                          {" "}
                                          (รายการนอก)
                                        </span>
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                    <div className="flex gap-2 text-gray-500 dark:text-gray-400 ">
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
                                      หมายเหตุ : {item.assetUsedRemark || "-"}
                                    </div>
                                  </div>
                                ),
                              },
                              {
                                content: "จำนวน",
                                width: 100,
                                className: "text-center",
                                key: "amountUsed",
                                render: (item) => {
                                  return (
                                    <div>
                                      {item.amountUsed
                                        ? item.amountUsed.toLocaleString()
                                        : "-"}
                                    </div>
                                  );
                                },
                              },

                              {
                                content: "หน่วย",
                                width: 100,
                                key: "unitName",
                              },
                              {
                                key: "labjobAssetId",
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
                                          item.labjobAssetId,
                                          item.type
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
                                          item.labjobAssetId,
                                          item.type
                                        );
                                      }}>
                                      <FiTrash2 className="w-4 h-4" />
                                      ลบ
                                    </button>
                                  </div>
                                ),
                              },
                            ]}
                            data={uselabasset.type3}
                            loading={loading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "tab4" && (
                  <div className="p-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
                    <div className="sm:col-span-12">
                      <div className="p-4 border relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-indigo-50 dark:bg-gray-800 shadow-md rounded-xl">
                        <div className="pb-4 border-gray-200 flex justify-between items-center">
                          <div className="font-xl font-semibold inline">
                            <span className="pe-2">
                              บันทึกข้อมูลอุปกรณ์ชำรุด
                            </span>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              className="cursor-pointer p-2 text-white text-sm bg-red-400 hover:bg-red-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                              onClick={() =>
                                _onPressAddBroken(
                                  uselabasset?.type3?.[0]?.type ?? 3,
                                  labjobId,
                                  labId,
                                  3
                                )
                              }>
                              <FiPlus className="w-4 h-4" />
                              เพิ่มรายการอุปกรณ์ชำรุด
                            </button>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 border rounded-lg">
                          {Array.isArray(Assetbroken) && (
                            <TableList
                              exports={false}
                              loading={loading}
                              meta={[
                                {
                                  content: "รายการ",
                                  key: "assetNameTh",
                                  render: (item) => (
                                    <div>
                                      <div>{item.assetNameTh} </div>
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
                                        หมายเหตุ : {item.assetUsedRemark || "-"}
                                      </div>
                                    </div>
                                  ),
                                },
                                {
                                  content: "จำนวน",
                                  width: 100,
                                  className: "text-center",
                                  key: "brokenAmount",
                                  render: (item) => (
                                    <div>
                                      {item.brokenAmount
                                        ? item.brokenAmount.toLocaleString()
                                        : "-"}
                                    </div>
                                  ),
                                },
                                {
                                  content: "หน่วย",
                                  width: 100,
                                  key: "unitName",
                                },
                                {
                                  key: "assetBrokenId",
                                  content: "Action",
                                  width: 100,
                                  sort: false,
                                  render: (item) => (
                                    <div className="flex gap-1 justify-center flex-wrap">
                                      <button
                                        type="button"
                                        className="cursor-pointer p-2 text-white text-sm bg-red-600 hover:bg-red-700  rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                                        onClick={() =>
                                          _onPressDeleteBroken(
                                            item.assetBrokenId,
                                            item.type
                                          )
                                        }>
                                        <FiTrash2 className="w-4 h-4" />
                                        ลบ
                                      </button>
                                    </div>
                                  ),
                                },
                              ]}
                              data={Assetbroken}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                          วัสดุที่เลือกใช้ใน{" "}
                          {datalabjob.labjob?.labjobTitle || ""}
                        </label>

                        <AutocompleteSelect2
                          name="assetId"
                          options={assetOptions}
                          value={inventForm.values.assetId}
                          onSelect={(name, item) => {
                            inventForm.setFieldValue(name, item.value);
                          }}
                          // error={inventForm.errors.assetId}
                          touched={inventForm.touched.assetId}
                          // placeholder="พิมพ์หรือเลือกวัสดุ"
                        />
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

                      <div className="sm:col-span-4">
                        <label className={className.label}>จำนวนที่ใช้</label>
                        <input
                          type="number"
                          name="amountUsed"
                          min="0"
                          value={inventForm.values.amountUsed || ""}
                          onChange={(e) =>
                            inventForm.setFieldValue(
                              "amountUsed",
                              e.target.value ? parseInt(e.target.value, 10) : ""
                            )
                          }
                          className={`${className.input} ${
                            inventForm.touched.amountUsed &&
                            inventForm.errors.amountUsed
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {inventForm.touched.amountUsed &&
                          inventForm.errors.amountUsed && (
                            <p className="mt-1 text-sm text-red-500">
                              {inventForm.errors.amountUsed}
                            </p>
                          )}
                      </div>
                      <div className="sm:col-span-2">
                        <label className={className.label}>
                          ชม.ที่ใช้/เทอม
                        </label>

                        <input
                          type="number"
                          name="hourUsed"
                          min="0"
                          value={inventForm.values.hourUsed || ""}
                          onChange={(e) =>
                            inventForm.setFieldValue(
                              "hourUsed",
                              e.target.value ? parseInt(e.target.value, 10) : ""
                            )
                          }
                          className={`${className.input} ${
                            inventForm.touched.hourUsed &&
                            inventForm.errors.hourUsed
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {inventForm.touched.hourUsed &&
                          inventForm.errors.hourUsed && (
                            <p className="mt-1 text-sm text-red-500">
                              {inventForm.errors.hourUsed}
                            </p>
                          )}
                      </div>
                      <div className="sm:col-span-3">
                        <label className={className.label}>
                          ราคา ณ ปัจจุบันต่อหน่วย
                        </label>
                        <input
                          type="number"
                          name="unitPrice"
                          value={
                            inventForm.values.unitPrice !== "" &&
                            inventForm.values.unitPrice !== undefined
                              ? inventForm.values.unitPrice.toString()
                              : ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const parsed = parseFloat(val);
                            inventForm.setFieldValue(
                              "unitPrice",
                              val === "" ? "" : parsed < 0 ? 0 : parsed
                            );
                          }}
                          min={0}
                          step="0.01"
                          className={`${className.input} ${
                            inventForm.touched.unitPrice &&
                            inventForm.errors.unitPrice
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {inventForm.touched.unitPrice &&
                          inventForm.errors.unitPrice && (
                            <p className="mt-1 text-sm text-red-500">
                              {inventForm.errors.unitPrice}
                            </p>
                          )}
                      </div>
                      <div className="sm:col-span-3">
                        <label className={className.label}>หน่วย</label>
                        <input
                          value={
                            assetInfo?.unitName ??
                            inventForm.values.unitName ??
                            "-"
                          }
                          disabled
                          name="unitName"
                          className={className.input}
                        />
                      </div>
                      <div className="sm:col-span-12">
                        <label className={className.label}>หมายเหตุ</label>
                        <input
                          type="text"
                          name="assetUsedRemark"
                          value={inventForm.values.assetUsedRemark ?? ""}
                          onChange={inventForm.handleChange}
                          className={`${className.input} ${
                            inventForm.touched.assetUsedRemark &&
                            inventForm.errors.assetUsedRemark
                              ? "border-red-500"
                              : ""
                          }`}
                        />

                        {inventForm.touched.assetUsedRemark &&
                          inventForm.errors.assetUsedRemark && (
                            <p className="mt-1 text-sm text-red-500">
                              {inventForm.errors.assetUsedRemark}
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
        open={brokenFormModal}
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
                <form onSubmit={brokenForm.handleSubmit}>
                  <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
                      <div className="sm:col-span-12">
                        <label className={className.label}>
                          อุปกรณ์ชำรุด {datalabjob.labjob?.labjobTitle || ""}
                        </label>
                        <select
                          name="assetId"
                          value={brokenForm.values.assetId}
                          onChange={(e) => {
                            brokenForm.setFieldValue(
                              "assetId",
                              Number(e.target.value)
                            );
                          }}
                          className={`${className.select} ${
                            brokenForm.touched.assetId &&
                            brokenForm.errors.assetId
                              ? "border-red-500"
                              : ""
                          }`}>
                          <option value="" disabled>
                            อุปกรณ์ชำรุด
                          </option>
                          {invent.map((inv, index) => (
                            <option
                              key={`${inv.assetId}-${index}`}
                              value={inv.assetId}>
                              {inv.assetNameTh} {inv.amountUnit} ({inv.unitName}{" "}
                              / {inv.totalAmountUsed})
                            </option>
                          ))}
                        </select>

                        {brokenForm.touched.assetId &&
                          brokenForm.errors.assetId && (
                            <p className="mt-1 text-sm text-red-500">
                              {brokenForm.errors.assetId}
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
                        <label className={className.label}>จำนวนที่ชำรุด</label>
                        <input
                          type="number"
                          name="amountUsed"
                          value={brokenForm.values.amountUsed || ""}
                          onChange={(e) =>
                            brokenForm.setFieldValue(
                              "amountUsed",
                              e.target.value ? parseInt(e.target.value, 10) : ""
                            )
                          }
                          className={`${className.input} ${
                            brokenForm.touched.amountUsed &&
                            brokenForm.errors.amountUsed
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {brokenForm.touched.amountUsed &&
                          brokenForm.errors.amountUsed && (
                            <p className="mt-1 text-sm text-red-500">
                              {brokenForm.errors.amountUsed}
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
                          name="assetUsedRemark"
                          value={brokenForm.values.assetUsedRemark ?? ""}
                          onChange={brokenForm.handleChange}
                          className={`${className.input} ${
                            brokenForm.touched.assetUsedRemark &&
                            brokenForm.errors.assetUsedRemark
                              ? "border-red-500"
                              : ""
                          }`}
                        />

                        {brokenForm.touched.assetUsedRemark &&
                          brokenForm.errors.assetUsedRemark && (
                            <p className="mt-1 text-sm text-red-500">
                              {brokenForm.errors.assetUsedRemark}
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
