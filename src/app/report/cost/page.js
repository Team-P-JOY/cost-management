"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiInfo } from "react-icons/fi";
import Content from "@/components/Content";
import TableList from "@/components/TableList";
import axios from "axios";

function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const breadcrumb = [{ name: "รายงาน" }, { name: "รายงานค่าใช้จ่าย" }];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Add your API call here
        // const response = await axios.get("/api/report/cost");
        // setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const meta = [
    {
      key: "id",
      content: "ID",
      render: (item) => item.id,
    },
  ];

  return (
    <Content breadcrumb={breadcrumb} title="รายงานค่าใช้จ่าย">
      <div className="relative flex flex-col w-full text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <TableList meta={meta} data={data} loading={loading} />
        </div>
      </div>
    </Content>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>กำลังโหลด...</div>}>
      <PageContent />
    </Suspense>
  );
}
