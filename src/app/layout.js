import { Sarabun } from "next/font/google";

import ThemeProvider from "@/components/ThemeProvider";
import CustomSessionProvider from "@/components/SessionProvider";
import SessionChecker from "@/components/SessionChecker";
import JWTErrorHandler from "@/components/JWTErrorHandler";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import "./globals.css";

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "ระบบบริหารจัดการต้นทุน",
  description: "สำหรับศูนย์เครื่องมือวิทยาศาสตร์",
  icons: {
    icon: "/logo.png",
  },
};

export default async function RootLayout({ children }) {
  let session = null;
  
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.log("Session error (likely due to JWT secret change):", error.message);
    // Session will be null, which is fine - user will need to log in again
    session = null;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sarabun.variable} antialiased bg-gray-100 dark:bg-gray-900 transition-colors duration-300 ease-in-out min-h-screen`}
      >
        <ThemeProvider>
          <CustomSessionProvider session={session}>
            <JWTErrorHandler />
            <SessionChecker />
            {children}
          </CustomSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
