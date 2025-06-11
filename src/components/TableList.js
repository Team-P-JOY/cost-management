import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiXCircle,
} from "react-icons/fi";
import TableListExport from "./TableListExport";

const TableList = ({ data, meta, loading, exports, disableSearch,customSearchSlot  }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "", order: "" });
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleSelection = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedItems = localStorage.getItem("@itemsPerPage");
      if (storedItems) {
        setItemsPerPage(Number(storedItems));
      }
    }
  }, []);

  const updateItemsPerPage = (value) => {
    setItemsPerPage(value);
    localStorage.setItem("@itemsPerPage", value);
  };

  const totalPages =
    data.length > 0 ? Math.ceil(data.length / itemsPerPage) : 1;

  const filteredSortedData = useMemo(() => {
    let result = [...data];

    if (search.trim() !== "") {
      result = result.filter((item) =>
        meta.some((m) =>
          item[m.key]?.toString().toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    if (sort.key !== "") {
      result.sort((a, b) =>
        sort.order === "asc"
          ? a[sort.key] > b[sort.key]
            ? 1
            : -1
          : a[sort.key] < b[sort.key]
          ? 1
          : -1
      );
    }

    return result;
  }, [data, search, sort, meta, itemsPerPage]);

  const dataDisplay = useMemo(() => {
    return filteredSortedData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredSortedData, currentPage]);

  useEffect(() => {
    if (dataDisplay.length === 0 && currentPage !== 1) setCurrentPage(1);
  }, [dataDisplay.length, currentPage]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex gap-2">
          {exports !== false && (
            <TableListExport
              tableId="myTable"
              fileName="excel-export.xlsx"
              selectedOptions={selectedOptions}
              data={data}
              meta={meta}
            />
          )}
        </div>
        <div className="flex gap-1">
          <div className="flex gap-1 items-center">
            <div className=" w-40">
              <button
                className="w-40 h-7 text-sm px-3 py-1 border border-gray-300 rounded-md bg-white dark:bg-gray-800 w-full flex justify-between items-centeพ"
                onClick={() => setIsOpen(!isOpen)}>
                <span>แสดงรายการ</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute" ref={dropdownRef}>
                {isOpen && (
                  <div className="absolute w-40">
                    <div className="absolute right-0 z-10 mt-2 w-64 p-2 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in">
                      {meta.map((m, index) => (
                        <label
                          key={`show-${index}`}
                          className="flex text-sm items-center m-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!selectedOptions.includes(index)}
                            onChange={() => toggleSelection(index)}
                            className="mr-1"
                          />
                          {m.content}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 items-center">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 dark:text-gray-300"></label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                updateItemsPerPage(e.target.value);
              }}
              className="w-40 h-7 text-sm px-3 py-1 border border-gray-300 rounded-md bg-white dark:bg-gray-800">
              <option value="10">10 รายการ/หน้า</option>
              <option value="20">20 รายการ/หน้า</option>
              <option value="50">50 รายการ/หน้า</option>
              <option value="100">100 รายการ/หน้า</option>
            </select>
          </div>
          {/* เพิ่มการเช็ค disableSearch */}
          {disableSearch ? customSearchSlot : (
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="ค้นหา..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-40 h-7 text-sm pr-8 pl-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-white"
              />
              {search ? (
                <FiXCircle
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4 cursor-pointer"
                  onClick={() => setSearch("")}
                />
              ) : (
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4 " />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col overflow-x-auto">
        <div className="overflow-x-auto">
          <table
            id="myTable"
            className="min-w-full rounded-lg text-left text-sm">
            <thead>
              <tr className="border-y border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-700">
                <th
                  width="40"
                  className="border text-sm border-gray-200 dark:border-gray-700 px-1 py-3 text-center font-medium text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600">
                  <p className="flex items-center justify-center opacity-70">
                    #
                  </p>
                </th>
                {meta.map((m, index) =>
                  !selectedOptions.includes(index) ? (
                    <th
                      key={`header-${index}`}
                      width={m.width || ""}
                      className="border text-sm border-gray-200 dark:border-gray-700 px-1 py-3 text-center font-medium text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600">
                      {m.sort === false ? (
                        <p className="flex items-center justify-center gap-1">
                          {m.content}
                        </p>
                      ) : (
                        <p
                          className="flex items-center justify-center gap-1 hover:text-gray-900 cursor-pointer dark:hover:text-white"
                          onClick={() => {
                            if (sort.key === m.key) {
                              setSort((prev) => ({
                                key: prev.key,
                                order: prev.order === "asc" ? "desc" : "asc",
                              }));
                            } else {
                              setSort({ key: m.key, order: "asc" });
                            }
                          }}>
                          {m.content}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-4 h-4">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                          </svg>
                        </p>
                      )}
                    </th>
                  ) : null
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <tr
                    key={`loading-${index}`}
                    className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-3 text-center">
                      <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-8 mx-auto rounded-md"></div>
                    </td>

                    {meta.map((_, i) =>
                      !selectedOptions.includes(i) ? (
                        <td key={`loading-cell-${i}`} className="p-3">
                          <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-full rounded-md"></div>
                        </td>
                      ) : null
                    )}
                  </tr>
                ))
              ) : dataDisplay.length > 0 ? (
                dataDisplay.map((item, index) => {
                  const currentRow =
                    (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr
                      key={item.id || currentRow}
                      className="border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
                      <td className="border border-gray-200 dark:border-gray-700 p-2 text-center text-gray-900 dark:text-gray-300">
                        {currentRow}
                      </td>
                      {meta.map((m, i) =>
                        !selectedOptions.includes(i) ? (
                          <td
                            key={`row-${currentRow}-col-${i}`}
                            className={[
                              "border border-gray-200 dark:border-gray-700 p-2 text-gray-900 dark:text-gray-300",
                              m.className || "",
                            ].join(" ")}>
                            {m.render
                              ? m.render(item)
                              : item[m.key] || (
                                  <i className="text-xs text-gray-300 dark:text-gray-700">
                                    (ไม่มีข้อมูล)
                                  </i>
                                )}
                          </td>
                        ) : null
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr className="border border-gray-200 dark:border-gray-700">
                  <td colSpan={meta.length + 1} className="p-4 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-16 h-16 mb-2 text-gray-300 dark:text-gray-500"
                        viewBox="0 0 32 32">
                        <path
                          fill="currentColor"
                          d="M6 8h10v2H6zm0 4h8v2H6zm0 4h4v2H6z"
                        />
                        <path
                          fill="currentColor"
                          d="M28 26H7.414L30 3.414L28.586 2l-2 2H4a2 2 0 0 0-2 2v16h2V6h20.586L2 28.586L3.414 30l2-2H28a2 2 0 0 0 2-2V10h-2Z"
                        />
                      </svg>

                      <i className="text-lg font-medium text-gray-300 dark:text-gray-500">
                        ไม่มีข้อมูล
                      </i>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between py-3">
        <p className="text-sm text-gray-500 dark:text-gray-300">
          ทั้งหมด {data.length} รายการ
        </p>
        {data.length > itemsPerPage && (
          <div className="flex items-center justify-between gap-1">
            <p className="text-sm text-gray-500 dark:text-gray-300 pr-2">
              หน้า {currentPage} / {totalPages}
            </p>
            <button
              className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 rounded-md disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}>
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 rounded-md disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}>
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableList;
