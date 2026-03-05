import React, { useState, useRef, useEffect } from 'react';

export default function MultiSelect({ options, selectedValues, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (id) => {
    const newSelection = selectedValues.includes(id)
      ? selectedValues.filter(val => val !== id)
      : [...selectedValues, id];
    onChange(newSelection);
  };

  const removeTag = (e, id) => {
    e.stopPropagation();
    onChange(selectedValues.filter(val => val !== id));
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  const selectedItems = options.filter(opt => selectedValues.includes(opt.id));
  const unselectedItems = options.filter(opt => 
    !selectedValues.includes(opt.id) && 
    opt.role_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Input Field with Tags */}
      <div onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between p-2 bg-transparent border border-gray-200 text-gray-700 rounded-lg cursor-pointer min-h-10.5">
        <div className="flex flex-wrap gap-1.5 items-center flex-1">
          {selectedItems.length === 0 && !searchTerm && (
            <span className="text-gray-400 ml-1 text-sm">{placeholder}</span>
          )}
          
          {/* Individual Tags as seen in your image */}
          {selectedItems.map(item => (
            <div key={item.id} className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-xs font-medium">
              {item.role_name}
              <button onClick={(e) => removeTag(e, item.id)} className="hover:text-red-900 font-bold ml-1">
                ×
              </button>
            </div>
          ))}

          <input className="outline-none bg-transparent ml-1 text-sm flex-1 min-w-12.5" value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!isOpen) setIsOpen(true);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        {/* Action Icons */}
        <div className="flex items-center gap-2 px-1 border-l ml-2 border-gray-200">
          {selectedValues.length > 0 && (
             <button onClick={clearAll} className="text-gray-400 hover:text-[#991b1b] text-lg">×</button>
          )}
          <span className={`text-gray-400 transition-transform text-xs ${isOpen ? 'rotate-180' : ''}`}>
            {isOpen ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-72 overflow-y-auto py-1">
          
          {/* Selected Section */}
          {selectedItems.length > 0 && (
            <div className="pb-2">
              <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Selected
              </div>
              {selectedItems.map((option) => (
                <div 
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer group"
                >
                  <input 
                    type="checkbox" 
                    checked={true} 
                    readOnly 
                    className="w-4 h-4 rounded border-[#991b1b] text-red-600 focus:ring-0 mr-3 pointer-events-none"
                  />
                  <span className="text-sm text-gray-700 font-medium">{option.role_name}</span>
                </div>
              ))}
              <div className="border-b border-gray-100 my-1 mx-2" />
            </div>
          )}

          {/* Unselected Options */}
          {unselectedItems.length > 0 ? (
            unselectedItems.map((option) => (
              <div 
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer group"
              >
                <div className="w-4 h-4 rounded border border-gray-300 mr-3 group-hover:border-[#991b1b] transition-colors" />
                <span className="text-sm text-gray-600">{option.role_name}</span>
              </div>
            ))
          ) : (
            searchTerm && <div className="p-3 text-sm text-gray-400 text-center">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}