"use client";

import { use, useEffect, useState, useCallback, Suspense } from "react";
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

function DetailContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { id } = useParams();
  const router = useRouter();
  const isNew = id === "new";
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tab1");

  const [invent, setInvent] = useState([]);
  const [labasset, setLabasset] = useState({
    type1: [],
    type2: [],
    type3: [],
  });
  const [loadingInvent, setLoadingInvent] = useState(false);
  const [inventFormModal, setInventFormModal] = useState(false);

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
    { id: "tab3", label: "ทรัพยากรตามรายวิชา" },
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
      try {
        if (isNew) {
          await axios.post(`/api/assign-course`, values);
          toastDialog("บันทึกข้อมูลเรียบร้อย!", "success");
          router.push("/assign-course?schId=" + searchParams.get("schId"));
        } else {
          await axios.put(`/api/assign-course?id=${id}`, values);
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
  }, [inventForm.values.assetId, invent]);

  const courseId = searchParams.get("courseId");
  const schId = searchParams.get("schId");

  useEffect(() => {
    const fetchData = async () => {
      if (!isNew) {
        setLoading(true);
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
              labgroupNum: form.labgroupNum,
              personId: form.personId,
              userId: session?.user.person_id,
            });

            console.log("data.labasset", data.labasset);
            setLabasset({
              type1: data.labasset?.filter((item) => item.type === 1) || [],
              type2: data.labasset?.filter((item) => item.type === 2) || [],
              type3: data.labasset?.filter((item) => item.type === 3) || [],
            });
          }
        } catch (err) {
          console.error("❌ Error fetching data:", err);
          toastDialog("ไม่สามารถโหลดข้อมูลได้!", "error", 2000);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(true);
        try {
          const response = await axios.get(`/api/assign-course`, {
            params: {
              courseId: courseId,
              schId: schId,
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
              schId: schId,
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
        } catch (err) {
          console.error("❌ Error fetching data:", err);
          toastDialog("ไม่สามารถโหลดข้อมูลได้!", "error", 2000);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew, session?.user.person_id, courseId, schId]);

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
          type2: prevLabasset.type2.filter((item) => item.labassetId !== id),
        }));
      } else if (type === 3) {
        setLabasset((prevLabasset) => ({
          ...prevLabasset,
          type3: prevLabasset.type3.filter((item) => item.labassetId !== id),
        }));
      }
    }
  };

  const _onCloseInventForm = (status) => {
    setInventFormModal(status);
    inventForm.resetForm();
  };

  return (
    <Content
      breadcrumb={breadcrumb}
      title=" แผนการให้บริการห้องปฎิบัติการ : กำหนดรายวิชา">
      <div className="relative flex flex-col w-full text-gray-900 dark:text-gray-300 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold">
            {isNew ? "เพิ่มใหม่" : "แก้ไขข้อมูล"} : {data.course?.coursename} (
            {data.course?.coursecode})
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
                      <h3 className="font-xl font-semibold">
                        {data.course?.coursename} ({data.course?.coursecode})
                      </h3>
                    </div>
                    <div className="sm:col-span-4">
                      <i>สำนักวิชา</i> : {data.course?.coursename}
                    </div>
                    <div className="sm:col-span-8">
                      <i>ภาคการศึกษา</i> : {data.class?.[0]?.semester}/
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
                    <div className="sm:col-span-6">
                      <i>ผู้รับผิดชอบหลัก</i> :{" "}
                      {
                        data.users?.find(
                          (user) => user.personId === formik.values.personId
                        )?.fullname
                      }
                    </div>
                    <div className="sm:col-span-6">
                      <i>กลุ่มห้องปฎิบัติการ</i> :{" "}
                      {
                        data.labgroup?.find(
                          (labgroup) =>
                            labgroup.labgroupId === formik.values.labgroupId
                        )?.labgroupName
                      }
                    </div>

                    <div className="sm:col-span-4">
                      <i>จำนวนห้อง LAB ที่เปิดบริการ</i> :{" "}
                      {formik.values.labroom} ห้อง
                    </div>

                    <div className="sm:col-span-4">
                      <i>จำนวนกลุ่มต่อห้อง</i> : {formik.values.labgroupNum}{" "}
                      กลุ่ม/ห้อง
                    </div>

                    <div className="sm:col-span-4">
                      <i>จำนวนชั่วโมงเรียน</i> : {formik.values.hour} ชั่วโมง
                    </div>
                  </div>
                )}
                {activeTab === "tab2" && (
                  <div className="p-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
                    <p>เนื้อหาแท็บที่ 2</p>
                  </div>
                )}
                {activeTab === "tab3" && (
                  <div className="p-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
                    {[
                      {
                        type: 1,
                        name: "ครุภัณฑ์ห้องปฎิบัติการ",
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
                          </div>
                          <TableList
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
              <button
                type="button"
                className="p-2 text-white bg-gray-600 hover:bg-gray-700 rounded-lg"
                onClick={() => router.back()}>
                ย้อนกลับ
              </button>
            </div>
          </form>
        )}
      </div>
    </Content>
  );
}

export default function Detail() {
  return (
    <Suspense fallback={<div>กำลังโหลด...</div>}>
      <DetailContent />
    </Suspense>
  );
}

const className = {
  label:
    "mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300 dark:text-gray-300",
  input:
    "block text-gray-900 dark:text-white w-full px-3 py-1.5 border rounded-md shadow-sm dark:bg-gray-800",
  select:
    "block text-gray-900 dark:text-white w-full px-4 py-2 border rounded-md dark:bg-gray-800",
};
