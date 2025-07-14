"use client";
import Content from "@/components/Content";
import Image from "next/image";
import Link from "next/link";
import { FiBox } from "react-icons/fi";

export default function MatterPage() {
  const breadcrumb = [{ name: "ข้อมูลพัสดุ", link: "/matter" }];
  return (
    <Content breadcrumb={breadcrumb} title="ข้อมูลพัสดุ">
      <div className="relative flex flex-col h-screen text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <div className="flex flex-col items-start h-screen p-4">
          <div className="p-2 border-b border-gray-200  flex w-full">
            <div className="flex items-center justify-end space-x-2">
              <FiBox className="text-xl" />
              <h2 className="text-xl font-semibold text-right">ข้อมูลพัสดุ</h2>
            </div>
          </div>
          <div className="flex flex-row justify-center gap-6 p-4 items-start">
            {[
              {
                src: "/material.png",
                title: "ครุภัณฑ์ห้องปฎิบัติการ",
                href: "/assetss",
                idType: "1",
              },
              {
                src: "/m3.png",
                title: "วัสดุไม่สิ้นเปลือง",
                href: "/assetss",
                idType: "2",
              },
              {
                src: "/m2.png",
                title: "วัสดุสิ้นเปลือง",
                href: "/assetss",
                idType: "3",
              },
            ].map((item, index) => (
              <Link
                key={index}
                href={`${item.href}?idType=${encodeURIComponent(item.idType)}`}
                passHref>
                <div className="card-body p-4 bg-white flex flex-col items-center rounded-lg shadow-lg cursor-pointer">
                  <Image
                    src={item.src}
                    alt={item.title}
                    width={150}
                    height={150}
                  />
                  <h1 className="text-xl font-semibold text-primary">
                    {item.title}
                  </h1>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Content>
  );
}
