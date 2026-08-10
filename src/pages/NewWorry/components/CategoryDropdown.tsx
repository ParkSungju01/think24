import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { WORRY_CATEGORIES } from '../../../types/newWorry';

interface CategoryDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

/** 상품 정보 입력 필드 상세 5번: "스크롤 가능한 드롭다운", 9개 카테고리 고정 순서.
 * 네이티브 select는 커스텀 스타일(테두리/라운드 톤)을 맞추기 어려워 버튼 + 리스트박스로 구현. */
export function CategoryDropdown({ value, onChange }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex h-11 w-full items-center justify-between rounded-[7px] border border-[#757575] bg-white px-4 text-[15px] outline-none xl:h-15 xl:px-8 xl:text-[30px] ${
          value ? 'text-black' : 'text-[#a9a9a9]'
        }`}
      >
        <span>{value || '카테고리를 선택해주세요'}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform xl:h-7 xl:w-7 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-[7px] border border-[#dedede] bg-white py-1 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)]"
        >
          {WORRY_CATEGORIES.map((category) => (
            <li key={category}>
              <button
                type="button"
                role="option"
                aria-selected={value === category}
                onClick={() => {
                  onChange(category);
                  setIsOpen(false);
                }}
                className={`block w-full px-4 py-2.5 text-left text-[15px] xl:px-8 xl:py-3.5 xl:text-[28px] ${
                  value === category
                    ? 'bg-[#e9f6e4] text-[#3e9b48]'
                    : 'text-black hover:bg-[#f7f7f7]'
                }`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
