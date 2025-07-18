"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Content from "@/components/Content";
import { toastDialog } from "@/lib/stdLib";
import { useFormik } from "formik";
import * as Yup from "yup";
import dynamic from "next/dynamic";

const UserAutocomplete = dynamic(
  () => import("@/components/UserAutocomplete"),
  {
    ssr: false,
  }
);

export default function Detail() {
  const { id } = useParams();
  const router = useRouter();
  const isNew = id === "new";
  const [loading, setLoading] = useState(!isNew);

  const [roleOptions, setRoleOptions] = useState([]);
  const [labgroupOptions, setLabgroupOptions] = useState([]);

  const validationSchema = Yup.object({
    personId: Yup.string().required("กรุณาเลือกผู้ใช้"),
    role: Yup.string().required("กรุณากรอกตำแหน่ง"),
    statusId: Yup.string().required("กรุณาเลือกสถานะ"),
    labgroupId: Yup.string().required("กรุณาเลือกกลุ่มห้องปฎิบัติการ"),
  });

  const formik = useFormik({
    initialValues: {
      personId: "",
      role: "1",
      statusId: "1",
      labgroupId: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isNew) {
          await axios.post(`/api/user`, values);
        } else {
          await axios.put(`/api/user?id=${id}`, values);
        }
        toastDialog("บันทึกข้อมูลเรียบร้อย!", "success");
        router.back();
      } catch (error) {
        toastDialog("เกิดข้อผิดพลาดในการบันทึกข้อมูล!", "error", 2000);
        console.error(" Error saving user:", error);
      }
    },
  });

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      if (!isNew) {
        const response = await axios.get(`/api/user?id=${id}`);
        const data = response.data;
        if (data.success) {
          const user = data.data[0];
          formik.setValues({
            personId: user.personId || "",
            role: user.role?.toString() || "1",
            statusId: user.statusId?.toString() || "1",
            labgroupId: user.labgroupId || "",
          });

          setRoleOptions(data.role);
          setLabgroupOptions(data.labgroup);

          setLoading(false);
        } else {
          console.error("Error fetching data:", err);
          toastDialog("ไม่สามารถโหลดข้อมูลได้!", "error", 2000);
        }
      } else {
        const response = await axios.get(`/api/user?id=new`);
        const data = response.data;
        if (data.success) {
          setRoleOptions(data.role);
          setLabgroupOptions(data.labgroup);
          setLoading(false);
        } else {
          console.error("Error fetching data:", err);
          toastDialog("ไม่สามารถโหลดข้อมูลได้!", "error", 2000);
        }
      }
    };
    fetchData();
  }, [id]);

  const breadcrumb = [
    { name: "กำหนดผู้รับผิดชอบ", link: "/user" },
    { name: isNew ? "เพิ่มใหม่" : "แก้ไข" },
  ];

  return (
    <Content breadcrumb={breadcrumb} title="กำหนดผู้รับผิดชอบ">
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold">
            {isNew ? "เพิ่มผู้ใช้งานใหม่" : "แก้ไขข้อมูลผู้ใช้"}
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">กำลังโหลดข้อมูล...</div>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <div className="p-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-12">
              <div className="sm:col-span-12">
                <label className={className.label}>พนักงาน</label>
                <UserAutocomplete formik={formik} label="personId" />
                {formik.touched.personId && formik.errors.personId && (
                  <p className="mt-1 text-sm text-red-500">
                    {formik.errors.personId}
                  </p>
                )}
              </div>

              <div className="sm:col-span-4">
                <label className={className.label}>สิทธิการใช้งาน</label>
                <div className="mt-2 grid grid-cols-1">
                  <select
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    className={className.select}>
                    <option value="" disabled>
                      เลือกสิทธิการใช้งาน
                    </option>
                    {roleOptions.map((role) => (
                      <option key={role.roleId} value={role.roleId}>
                        {role.roleName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className={className.label}>กลุ่มห้องปฎิบัติการ</label>
                <div className="mt-2 grid grid-cols-1">
                  <select
                    name="labgroupId"
                    value={formik.values.labgroupId}
                    onChange={formik.handleChange}
                    className={`${className.select} ${
                      formik.touched.labgroupId && formik.errors.labgroupId
                        ? "border-red-500"
                        : ""
                    }`}>
                    <option value="" disabled>
                      เลือกกลุ่มห้องปฎิบัติการ
                    </option>
                    {labgroupOptions.map((labgroup) => (
                      <option
                        key={labgroup.labgroupId}
                        value={labgroup.labgroupId}>
                        {labgroup.labgroupName}
                      </option>
                    ))}
                  </select>
                  {formik.touched.labgroupId && formik.errors.labgroupId && (
                    <p className="mt-1 text-sm text-red-500">
                      {formik.errors.labgroupId}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className={className.label}>สถานะ</label>
                <div className="mt-2 grid grid-cols-1">
                  <select
                    name="statusId"
                    value={formik.values.statusId}
                    onChange={formik.handleChange}
                    className={className.select}>
                    <option value="1">ใช้งาน</option>
                    <option value="0">ไม่ใช้งาน</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="cursor-pointer p-2 text-white bg-gray-600 hover:bg-gray-700 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => router.back()}>
                ยกเลิก
              </button>
              <button
                type="submit"
                className="cursor-pointer p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
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
    "block w-full bg-white px-3 py-1.5 border-2 rounded-md shadow-sm dark:bg-gray-800 dark:border-white dark:text-white focus:outline-indigo-600",
  select:
    "block w-full bg-white px-4 py-2 border-2 rounded-md shadow-sm dark:bg-gray-800 dark:border-white dark:text-white focus:outline-indigo-600",
};
