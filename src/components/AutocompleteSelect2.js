// components/AutocompleteSelect2.jsx
import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const AutocompleteSelect2 = ({
  name,
  options = [],
  value,
  onSelect,
  placeholder = "เลือก",
  error,
  touched,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    const selected = options.find((o) => o.value === value);
    setInputValue(selected ? selected.label : "");
  }, [value, options]);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (item) => {
    setInputValue(item.label);
    setShowDropdown(false);
    onSelect(name, item);
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder={placeholder}
        className={`border p-2 pr-10 rounded w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 dark:border-gray-600 ${
          touched && error
            ? "border-red-500"
            : "border-gray-300 dark:border-gray-600"
        }`}
      />

      {/* ▼ ไอคอนสามเหลี่ยมขวา */}

      {/* × ปุ่มล้างค่า */}
      {inputValue ? (
        <button
          type="button"
          className="absolute right-2 top-3 text-gray-500 hover:text-red-500"
          onClick={() => {
            setInputValue("");
            onSelect(name, { value: "", label: "" }); // รีเซ็ตค่า
          }}
        >
          <X className="w-4 h-4" />
        </button>
      ) : (
        <div className="absolute right-2 top-3 pointer-events-none text-gray-500 text-sm">
          <Search className="w-4 h-4" />
        </div>
      )}

      {showDropdown && filtered.length > 0 && (
        <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 mt-1 rounded max-h-60 overflow-y-auto shadow-lg">
          {filtered.map((item, index) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-gray-100"
              onMouseDown={() => handleSelect(item)}
            >
              <div>{item.label}</div>
            </li>
          ))}
        </ul>
      )}
      {touched && error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default AutocompleteSelect2;
