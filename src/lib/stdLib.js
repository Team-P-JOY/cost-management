import Swal from "sweetalert2";

export const getTheme = () => {
  if (typeof window !== "undefined") {
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  }
  return "light";
};

export const confirmDialog = async (title, text) => {
  const theme = getTheme();
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    background: theme === "dark" ? "#1f2937" : "",
    color: theme === "dark" ? "#f9fafb" : "",
  });

  return result;
};

export const toastDialog = (title, icon = "success", timer = 1000) => {
  const theme = getTheme();
  Swal.fire({
    title,
    icon,
    showCancelButton: false,
    showConfirmButton: false,
    timer: timer,
    background: theme === "dark" ? "#1f2937" : "",
    color: theme === "dark" ? "#f9fafb" : "",
  });
};
