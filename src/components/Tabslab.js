import { useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import Button from "@/components/Button";
import AddItemForm from "@/components/AddItemForm";

const Tabs = () => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [items, setItems] = useState([
    { id: 1, name: "Item 1", quantity: 10, note: "Note 1" },
    { id: 2, name: "Item 2", quantity: 20, note: "Note 2" },
  ]);

  const handleEdit = (item) => {
    // Handle your editing logic
  };

  const handleDelete = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleAdd = (newItem) => {
    setItems([...items, newItem]);
  };

  return (
    <div>
      <div className="tabs">
        <div className="tabs-list bg-gray-100 p-2 border-b">
          <button
            className={`tabs-trigger px-4 ${
              activeTab === "inventory" ? "bg-fuchsia-200" : ""
            }`}
            onClick={() => setActiveTab("inventory")}>
            ครุภัณฑ์ห้องปฎิบัติการ
          </button>
          <button
            className={`tabs-trigger px-4 ${
              activeTab === "supplies" ? "bg-fuchsia-200" : ""
            }`}
            onClick={() => setActiveTab("supplies")}>
            วัสดุไม่สิ้นเปลือง
          </button>
          <button
            className={`tabs-trigger px-4 ${
              activeTab === "chemicals" ? "bg-fuchsia-200" : ""
            }`}
            onClick={() => setActiveTab("chemicals")}>
            วัสดุสิ้นเปลือง
          </button>
          <button
            className={`tabs-trigger px-4 ${
              activeTab === "additional" ? "bg-fuchsia-200" : ""
            }`}
            onClick={() => setActiveTab("additional")}>
            วัสดุอุปกรณ์เพิ่มเติม
          </button>
        </div>

        {activeTab === "inventory" && (
          <div className="tabs-content p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left border-b">ที่</th>
                    <th className="py-3 px-4 text-left border-b">
                      รายการครุภัณฑ์ห้องปฎิบัติการ
                    </th>
                    <th className="py-3 px-4 text-left border-b">จำนวน</th>
                    <th className="py-3 px-4 text-left border-b">หมายเหตุ</th>
                    <th className="py-3 px-4 text-left border-b">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{item.id}</td>
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{item.quantity}</td>
                      <td className="py-3 px-4">{item.note}</td>
                      <td className="py-3 px-4 flex ">
                        <div className="flex gap-1">
                          <button
                            //   variant="outline"
                            //   size="sm"
                            onClick={() => handleEdit(item)}
                            className="cursor-pointer p-2 text-white text-sm bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            <FiEdit className="h-4 w-4 mr-1" />
                            แก้ไข
                          </button>
                          <button
                            //   variant="destructive"
                            //   size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="cursor-pointer p-2 text-white text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                            <FiTrash2 className="h-4 w-4" />
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* <div className="p-4 border-t">
              <AddItemForm onAdd={handleAdd} />
            </div> */}
          </div>
        )}

        {activeTab === "supplies" && (
          <div className="tabs-content p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left border-b">ที่</th>
                    <th className="py-3 px-4 text-left border-b">
                      รายการวัสดุสิ้นเปลือง
                    </th>
                    <th className="py-3 px-4 text-left border-b">จำนวน</th>
                    <th className="py-3 px-4 text-left border-b">หมายเหตุ</th>
                    <th className="py-3 px-4 text-left border-b">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{item.id}</td>
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{item.quantity}</td>
                      <td className="py-3 px-4">{item.note}</td>
                      <td className="py-3 px-4 flex ">
                        <div className="flex gap-1">
                          <button
                            //   variant="outline"
                            //   size="sm"
                            onClick={() => handleEdit(item)}
                            className="cursor-pointer p-2 text-white text-sm bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            <FiEdit className="h-4 w-4 mr-1" />
                            แก้ไข
                          </button>
                          <button
                            //   variant="destructive"
                            //   size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="cursor-pointer p-2 text-white text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                            <FiTrash2 className="h-4 w-4" />
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* <div className="p-4 border-t">
              <AddItemForm onAdd={handleAdd} />
            </div> */}
          </div>
        )}

        {activeTab === "chemicals" && (
          <div className="p-8 text-center text-gray-500">
            ไม่มีข้อมูลสารเคมี
          </div>
        )}

        {activeTab === "additional" && (
          <div className="p-8 text-center text-gray-500">
            ไม่มีข้อมูลวัสดุอุปกรณ์เพิ่มเติม
          </div>
        )}
      </div>
    </div>
  );
};

export default Tabs;
