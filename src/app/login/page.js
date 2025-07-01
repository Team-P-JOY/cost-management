"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NotificationBox from "@/components/NotificationBox";

import {
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiLogIn,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { useTheme } from "next-themes";
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState("light");
  const router = useRouter();

  useEffect(() => {
    setMounted(theme);
  }, [theme]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setNotification(null);

    setLoading(true);
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);
    if (res.ok) {
      router.push("/");
    } else {
      setNotification({
        type: "error",
        message: "Invalid username or password",
      });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 dark:from-gray-900 dark:to-black transition-all">
      {notification && (
        <NotificationBox
          type={notification.type}
          message={notification.message}
        />
      )}

      <div className="absolute top-4 right-4">
        <button
          onClick={() => setTheme(mounted === "dark" ? "light" : "dark")}
          className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full transition"
        >
          {mounted === "dark" ? (
            <FiSun size={20} className="text-yellow-500" />
          ) : (
            <FiMoon size={20} className="text-gray-800" />
          )}
        </button>
      </div>

      <div className="relative bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 m-8 max-w-md w-full text-center backdrop-blur-md bg-opacity-80 dark:bg-opacity-70">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="ระบบบริหารจัดการต้นทุน"
            width={200}
            height={127.19}
            loading="lazy"
            className="mb-4 transition-transform transform hover:scale-105" // ✅ เพิ่มเอฟเฟกต์ hover
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-0">
          ระบบบริหารจัดการต้นทุน
        </h2>
        <p className="text-gray-500 dark:text-gray-300 mb-6 ">
          สำหรับศูนย์เครื่องมือวิทยาศาสตร์และเทคโนโลยี
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative flex items-center">
            <FiUser className="absolute left-4 text-gray-500 dark:text-gray-400 text-lg" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 p-3 border rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
              placeholder="Username"
              required
            />
          </div>

          <div className="relative flex items-center">
            <FiLock className="absolute left-4 text-gray-500 dark:text-gray-400 text-lg" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 p-3 border rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
              placeholder="Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-gray-500 dark:text-gray-400 text-lg transition"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {isLoading ? (
            <>
              <div className="flex items-center justify-center">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-12 w-12"></div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                กำลังเข้าสู่ระบบ...
              </p>
            </>
          ) : (
            <button
              type="submit"
              className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all font-semibold shadow-md hover:shadow-xl"
            >
              <FiLogIn className="mr-2" /> เข้าสู่ระบบ
            </button>
          )}
        </form>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6 flex items-center justify-center">
          <i className="p-4">Powered by</i>{" "}
          <Image
            src="https://hrms.wu.ac.th/img/cdtwu.png"
            alt="CDTWU"
            width={70}
            height={20}
          />
        </p>
      </div>
    </main>
  );
}
