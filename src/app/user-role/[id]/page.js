"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Content from "@/components/Content";
import { useFormik } from "formik";
import { navigation } from "@/lib/params";
import * as Yup from "yup";
import { toastDialog } from "@/lib/stdLib";

export default function Detail() {
  const { id } = useParams();
  const router = useRouter();
  const isNew = id === "new";
  const [loading, setLoading] = useState(!isNew);

  const validationSchema = Yup.object({
    roleName: Yup.string().required("กรุณากรอกชื่อสิทธิ"),
    roleAccess: Yup.array().min(1, "กรุณาเลือกอย่างน้อย 1 การอนุญาติเข้าถึง"),
    statusId: Yup.string().required("กรุณาเลือกสถานะ"),
  });

  const formik = useFormik({
    initialValues: {
      roleName: "",
      roleAccess: [],
      statusId: "1",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isNew) {
          await axios.post(`/api/user-role`, values);
        } else {
          await axios.put(`/api/user-role?id=${id}`, values);
        }
        toastDialog("บันทึกข้อมูลเรียบร้อย!", "success");
        router.back();
      } catch (error) {
        toastDialog("เกิดข้อผิดพลาดในการบันทึกข้อมูล!", "error", 2000);
        console.error(" Error saving data:", error);
      }
    },
  });

  useEffect(() => {
    if (!isNew) {
      setLoading(true);
      const fetchData = async () => {
        try {
          const response = await axios.get(`/api/user-role?id=${id}`);
          const data = response.data;
          if (data.success) {
            const user = data.data;
            formik.setValues({
              roleName: user.roleName || "",
              roleAccess: user.roleAccess || [],
              statusId: user.statusId?.toString() || "1",
            });

            setLoading(false);
          }
        } catch (err) {
          console.error(" Error fetching data:", err);
          toastDialog("ไม่สามารถโหลดข้อมูลได้!", "error", 2000);
        }
      };
      fetchData();
    }
  }, [id]);

  const breadcrumb = [
    { name: "จัดการสิทธิการใช้งาน", link: "" },
    { name: isNew ? "เพิ่มใหม่" : "แก้ไข" },
  ];

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    formik.setFieldValue(
      "roleAccess",
      checked
        ? [...formik.values.roleAccess, value]
        : formik.values.roleAccess.filter((item) => item !== value)
    );
  };

  return (
    <Content breadcrumb={breadcrumb} title="จัดการสิทธิการใช้งาน">
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold">
            {isNew ? "เพิ่มสิทธิใหม่" : "แก้ไขข้อมูลสิทธิ"}
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            กำลังโหลดข้อมูล...
          </div>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <div className="p-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
              {/* Name */}
              <div className="sm:col-span-8">
                <label className={className.label}>ชื่อสิทธิ</label>
                <input
                  type="text"
                  name="roleName"
                  value={formik.values.roleName}
                  onChange={formik.handleChange}
                  className={`${className.input} ${
                    formik.touched.roleName && formik.errors.roleName
                      ? "border-red-500"
                      : ""
                  }`}
                />
                {formik.touched.roleName && formik.errors.roleName && (
                  <p className="mt-1 text-sm text-red-500">
                    {formik.errors.roleName}
                  </p>
                )}
              </div>

              {/* Status ID */}
              <div className="sm:col-span-4">
                <label className={className.label}>สถานะ</label>
                <select
                  name="statusId"
                  value={formik.values.statusId}
                  onChange={formik.handleChange}
                  className={className.select}>
                  <option value="1">ใช้งาน</option>
                  <option value="0">ไม่ใช้งาน</option>
                </select>
              </div>

              <div className="sm:col-span-12">
                <label className={className.label}>การอนุญาติเข้าถึง</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {navigation.map((navi, index) => (
                    <div key={navi.id}>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="roleAccess"
                          value={navi.id}
                          checked={formik.values.roleAccess.includes(
                            navi.id.toString()
                          )}
                          onChange={handleCheckboxChange}
                          className={`checkbox ${
                            formik.touched.roleAccess &&
                            formik.errors.roleAccess
                              ? "checkbox-error"
                              : "checkbox-success"
                          }`}
                        />
                        <div className="flex flex-col">
                          <span
                            className={`font-semibold ${
                              formik.touched.roleAccess &&
                              formik.errors.roleAccess
                                ? "text-red-500"
                                : "text-gray-900 dark:text-gray-300"
                            }`}>
                            {navi.name}
                          </span>
                        </div>
                      </label>
                      {navi.child &&
                        navi.child.map((child, index2) => (
                          <div key={child.id} className="ms-4 mt-1">
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                name="roleAccess"
                                value={child.id}
                                checked={formik.values.roleAccess.includes(
                                  child.id.toString()
                                )}
                                onChange={handleCheckboxChange}
                                className={`checkbox checkbox-sm ${
                                  formik.touched.roleAccess &&
                                  formik.errors.roleAccess
                                    ? "checkbox-error"
                                    : "checkbox-success"
                                }`}
                              />
                              <div className="flex flex-col">
                                <span
                                  className={`font-semibold ${
                                    formik.touched.roleAccess &&
                                    formik.errors.roleAccess
                                      ? "text-red-500"
                                      : "text-gray-900 dark:text-gray-300"
                                  }`}>
                                  {child.name}
                                </span>
                              </div>
                            </label>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
                {formik.touched.roleAccess && formik.errors.roleAccess && (
                  <p className="mt-1 text-sm text-red-500">
                    {formik.errors.roleAccess}
                  </p>
                )}
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
          </form>
        )}
      </div>
    </Content>
  );
}

const className = {
  label: "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300",
  input:
    "block bg-white w-full px-3 py-1.5 border rounded-md shadow-sm dark:bg-gray-800",
  select: "block bg-white w-full px-4 py-2 border rounded-md dark:bg-gray-800",
};
