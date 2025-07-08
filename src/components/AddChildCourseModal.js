import { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { FiX, FiPlus } from "react-icons/fi";
import AutocompleteSelect2 from "./AutocompleteSelect2";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function AddChildCourseModal({
  isOpen,
  onClose,
  parentLabId,
  onSuccess,
}) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    courseId: "",
    courseName: "",
    section: 1,
    enrollSeat: 0,
    totalSeat: 0,
    note: "",
  });

  const [courseOptions, setCourseOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load course options when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCourseOptions();
    }
  }, [isOpen]);

  const loadCourseOptions = async () => {
    try {
      // Get courses for the faculty - using facultyId=1 as default
      // You might want to make this dynamic based on the parent course's faculty
      const response = await axios.get(
        `/api/assign-course/find-course?parentLabId=${parentLabId}`
      );
      if (response.data.success) {
        const options = response.data.parent.map((course) => ({
          value: course.courseid,
          label: `${course.coursecode} - ${course.coursename}`,
          courseCode: course.coursecode,
          courseName: course.coursename,
        }));
        setCourseOptions(options);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      // Set empty options if there's an error
      setCourseOptions([]);
    }
  };

  const handleSelectCourse = (name, selectedItem) => {
    setFormData((prev) => ({
      ...prev,
      courseId: selectedItem.value,
      courseName: selectedItem.label,
    }));
    setErrors((prev) => ({ ...prev, courseId: "" }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "section" || name === "enrollSeat" || name === "totalSeat"
          ? parseInt(value) || 0
          : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.courseId) {
      newErrors.courseId = "กรุณาเลือกรายวิชา";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/assign-course", {
        courseid: formData.courseId,
        parentLabId: parentLabId,
        isChild: true,
        section: null,
        enrollSeat: null,
        totalSeat: null,
        note: null,
        userId: session?.user?.person_id,
      });

      if (response.data.success) {
        onSuccess();
        handleClose();
      } else {
        setErrors({
          submit: response.data.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      setErrors({ submit: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      courseId: "",
      courseName: "",
      section: 1,
      enrollSeat: 0,
      totalSeat: 0,
      note: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              เพิ่มรายวิชาย่อย
            </DialogTitle>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                รายวิชา *
              </label>
              <AutocompleteSelect2
                name="courseId"
                options={courseOptions}
                value={formData.courseId}
                onSelect={handleSelectCourse}
                placeholder="ค้นหาและเลือกรายวิชา..."
                error={errors.courseId}
                touched={true}
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="text-red-500 text-sm">{errors.submit}</div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <FiPlus size={16} />
                    เพิ่มรายวิชาย่อย
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
