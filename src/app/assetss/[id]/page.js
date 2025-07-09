"use client";

import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Content from "@/components/Content";
import axios from "axios";
import Swal from "sweetalert2";
import Select from "react-select";

export default function AssetForm() {
  const breadcrumb = [{ name: "ข้อมูลครุภัณฑ์", link: "/matter2" }];
  const router = useRouter();
  const { id } = useParams();
  const isNew = id === "new";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCategoryAndGrade, setShowCategoryAndGrade] = useState(false);
  const [options, setOptions] = useState([]);
  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [data, setData] = useState(null); // ใช้ state เก็บข้อมูล asset
  const requiredMessage = "กรอกข้อมูลนี้";
  const requiredSelect = "เลือกข้อมูลนี้";
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      assetNameTh: "",
      assetNameEng: "",
      invtypeId: "",
      unitId: "",
      brandId: "",
      amountUnit: "",
      version: "",
      catNo: "",
      grade: "",
      unitPrice: "",
      packPrice: "",
      invgroupId: "",
      status: "1",
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [materialsRes, brandsRes, typesRes, groupsRes] =
          await Promise.all([
            axios.get("/api/materials"),
            axios.get("/api/brand"),
            axios.get("/api/invtype"),
            axios.get("/api/invgroup"),
          ]);
        setOptions(materialsRes.data.data || []);
        setBrands(brandsRes.data.data || []);
        setTypes(typesRes.data.data || []);
        setGroups(groupsRes.data.data || []);
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchAsset() {
      if (!isNew) {
        setLoading(true);
        try {
          const response = await axios.get(`/api/assetss?id=${id}`);
          // console.log("response", response);
          if (response.data.success) {
            const asset = response.data.data[0];
            // console.log("assetP", asset);

            // ใช้ setValue เพื่อเติมข้อมูลลงในฟอร์ม
            Object.keys(asset).forEach((key) => {
              setValue(key, asset[key]);
            });
          } else {
            setError("ไม่พบข้อมูลครุภัณฑ์");
          }
        } catch (err) {
          setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
          setLoading(false);
        }
      }
    }
    fetchAsset();
  }, [id, isNew, setValue]);

  const typeassetValue = watch("invtypeId");
  useEffect(() => {
    setShowCategoryAndGrade(typeassetValue === "1" || typeassetValue === "2");
  }, [typeassetValue]);

  const onSubmit = async (formData) => {
    // console.log("formData", formData);
    ["brandId", "unitId"].forEach((field) => {
      formData[field] =
        formData[field] && formData[field].value
          ? String(formData[field].value)
          : "";
    });
    try {
      if (isNew) {
        await axios.post(`/api/assetss`, formData);
      } else {
        await axios.put(`/api/assetss?id=${id}`, formData);
      }
      await Swal.fire({
        title: isNew ? "เพิ่มข้อมูลใหม่เรียบร้อย!" : "แก้ไขข้อมูลเรียบร้อย!",
        icon: "success",
        showCancelButton: false,
        showConfirmButton: false,
        timer: 1000,
      });
      router.back();
    } catch (error) {
      console.error("Error saving asset:", error);
      if (error.response) {
        // Error response from the server
        Swal.fire({
          title: `Error: ${error.response.status}`,
          text: error.response.data.message || "เกิดข้อผิดพลาด",
          icon: "error",
        });
      } else {
        Swal.fire({ title: "เกิดข้อผิดพลาด", icon: "error" });
      }
    }
  };

  return (
    <Content
      breadcrumb={breadcrumb}
      title={isNew ? "เพิ่มข้อมูลพัสดุ" : "แก้ไขข้อมูลพัสดุ"}>
      <div className="container mx-auto p-4">
        <div className="bg-white p-6 rounded-lg shadow-md text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 ">
          <h3 className="font-semibold text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 text-2xl pb-4">
            {isNew ? "เพิ่มข้อมูลพัสดุ" : "แก้ไขข้อมูลพัสดุ"}
          </h3>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="form-control max-w-8xl mx-auto space-y-4 p-2">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Asset Names */}
              <div className="form-control">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  ชื่อ (ภาษาไทย) *
                </label>
                <input
                  type="text"
                  {...register("assetNameTh", {
                    required: requiredMessage,
                  })}
                  className="block w-full px-3 py-1.5 border-2 rounded-md shadow-sm dark:bg-gray-800 dark:border-white text-black focus:outline-indigo-600"
                />
                {errors.assetNameTh && (
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="label-text-alt text-error">
                      {errors.assetNameTh.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className={className.label}>ชื่อ (English)</label>
                <input
                  type="text"
                  {...register("assetNameEng", {
                    // required: requiredMessage,
                  })}
                  className={className.input}
                />
                {errors.assetNameEng && (
                  <label className={className.label}>
                    <span className="label-text-alt text-error">
                      {errors.assetNameEng.message}
                    </span>
                  </label>
                )}
              </div>

              {/* หน่วยนับ และ ยี่ห้อ */}
              <div className="grid grid-cols-3 gap-2">
                {/* Type and Category */}
                <div className="form-control">
                  <label className={className.label}>ประเภท *</label>
                  <select
                    {...register("invtypeId", {
                      required: requiredSelect,
                    })}
                    className={className.select}>
                    <option className="text-gray-900" value="">
                      - เลือก -
                    </option>
                    {types.map((type) => (
                      <option
                        key={type.invtypeId}
                        value={type.invtypeId}
                        className="text-gray-900">
                        {type["invtypeName"]}
                      </option>
                    ))}
                  </select>
                  {errors.invtypeId && (
                    <label className={className.label}>
                      <span className="label-text-alt text-error">
                        {errors.invtypeId.message}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className={className.label}>หน่วยนับ *</label>
                  <Controller
                    name="unitId"
                    control={control}
                    rules={{ required: requiredSelect }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={options.map((option) => ({
                          value: option.unitId,
                          label: option.unitName,
                        }))}
                        placeholder="- เลือก -"
                        isClearable
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    )}
                  />
                  {errors.unitId && (
                    <label className={className.label}>
                      <span className="label-text-alt text-error">
                        {errors.unitId.message}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className={className.label}>ยี่ห้อ *</label>
                  <Controller
                    name="brandId"
                    control={control}
                    rules={{ required: requiredSelect }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={brands.map((brand) => ({
                          value: brand.brandId, // Only value is passed
                          label: brand.brandName, // Display label
                        }))}
                        placeholder="- เลือก -"
                        isClearable
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    )}
                  />
                  {errors.brandId && (
                    <label className={className.label}>
                      <span className="label-text-alt text-error">
                        {errors.brandId.message}
                      </span>
                    </label>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Amount and Version */}
                <div className="form-control">
                  <label className={className.label}>
                    {typeassetValue === "1" || typeassetValue === "2"
                      ? "ขนาด/ขนาดบรรจุ * "
                      : " จำนวน/แพ็ค *"}{" "}
                  </label>
                  <input
                    type="text"
                    {...register("amountUnit", {
                      required: requiredMessage,
                    })}
                    className={className.input}
                    placeholder={
                      typeassetValue === "1" || typeassetValue === "2"
                        ? "ขนาด/ขนาดบรรจุ * "
                        : " จำนวน/แพ็ค *"
                    }
                  />
                  {errors.amountUnit && (
                    <label className={className.label}>
                      <span className="label-text-alt text-error">
                        {errors.amountUnit.message}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className={className.label}>รุ่น </label>
                  <input
                    type="text"
                    {...register("version", {
                      // required: requiredMessage,
                    })}
                    className={className.input}
                    placeholder="รุ่น"
                  />
                  {errors.version && (
                    <label className={className.label}>
                      <span className="label-text-alt text-error">
                        {errors.version.message}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {showCategoryAndGrade && (
                <>
                  <div className="form-control">
                    <label className={className.label}>Category No. </label>
                    <input
                      type="text"
                      {...register("catNo")}
                      className={className.input}
                      placeholder="Category Number"
                    />
                    {errors.catNo && (
                      <label className={className.label}>
                        <span className="label-text-alt text-error">
                          {errors.catNo.message}
                        </span>
                      </label>
                    )}
                  </div>
                  <div className="form-control">
                    <label className={className.label}>Grade </label>
                    <input
                      type="text"
                      {...register("grade")}
                      className={className.input}
                      placeholder="Grade"
                    />
                    {errors.grade && (
                      <label className={className.label}>
                        <span className="label-text-alt text-error">
                          {errors.grade.message}
                        </span>
                      </label>
                    )}
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-4">
                {/* Pricing */}
                <div className="form-control">
                  <label className={className.label}>
                    ราคาต่อหน่วย (บาท) *
                  </label>
                  <input
                    type="text"
                    {...register("unitPrice", {
                      required: requiredMessage,
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/, // ต้องเป็นตัวเลขเท่านั้น เทศนิยมได้ 2 ตำแหน่งเขียนไง 0.00
                        message: "กรอกตัวเลขเทศนิยมได้ 2 ตำแหน่งเท่านั้น",
                      },
                    })}
                    className={className.input}
                    placeholder="0.00"
                  />
                  {errors.unitPrice && (
                    <label className={className.label}>
                      <span className="label-text-alt text-error">
                        {errors.unitPrice.message}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className={className.label}>ราคาต่อแพ็ค (บาท) *</label>
                  <input
                    type="text"
                    {...register("packPrice", {
                      required: requiredMessage,
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        // ต้องเป็นตัวเลขเท่านั้น เทศนิยมได้ 2 ตำแหน่งเขียนไง 0.00
                        message: "กรอกตัวเลขทศนิยม 2 ตำแหน่งเท่านั้น",
                      },
                    })}
                    className={className.input}
                    placeholder="0.00"
                  />
                  {errors.packPrice && (
                    <label className={className.label}>
                      <span className="label-text-alt text-error">
                        {errors.packPrice.message}
                      </span>
                    </label>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Responsible Person */}
                <div className="form-control">
                  <label className={className.label}>ผู้รับผิดชอบ *</label>
                  <select
                    {...register("invgroupId", {
                      required: requiredSelect,
                    })}
                    className={className.select}>
                    <option value="">- เลือก -</option>
                    {groups.map((group) => (
                      <option key={group.invgroupId} value={group.invgroupId}>
                        {group.invgroupName}
                      </option>
                    ))}
                  </select>
                  {errors.invgroupId && (
                    <label className={className.label}>
                      <span className="label-text-alt text-error">
                        {errors.invgroupId.message}
                      </span>
                    </label>
                  )}
                </div>

                {/* Status */}
                <div className="form-control">
                  <label className={className.label}>สถานะ *</label>
                  <select
                    {...register("status", {
                      required: requiredSelect,
                    })}
                    className={className.select}>
                    <option value="1">ใช้งาน</option>
                    <option value="0">ไม่ใช้งาน</option>
                  </select>
                  {errors.status && (
                    <label className={className.label}>
                      <span className="label-text-alt text-error">
                        {errors.status.message}
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="cursor-pointer p-2 text-white bg-gray-600 hover:bg-gray-700 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => router.back()}>
                ยกเลิก
              </button>
              <button
                type="submit"
                className="cursor-pointer p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isNew ? "บันทึกข้อมูล" : "บันทึกข้อมูล"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Content>
  );
}

const className = {
  label: "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300",
  input:
    "block w-full px-3 py-1.5 border-2 rounded-md shadow-sm dark:bg-gray-800 dark:border-white text-black focus:outline-indigo-600",
  select:
    "block w-50 px-1 py-2 border-2 rounded-md shadow-sm text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800  text-black focus:outline-indigo-600",
};
