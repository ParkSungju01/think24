import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { RECORD_PERIOD_OPTIONS } from '../../../types/spendingRecord';
import type { RecordPeriod } from '../../../types/spendingRecord';

interface PeriodDropdownProps {
  value: RecordPeriod;
  onChange: (value: RecordPeriod) => void;
}

/** `CategoryDropdown`(NewWorry)과 동일한 열림/닫힘 + 바깥 클릭 감지 패턴을 재사용하되
 * 옵션 4개(이번 달/최근 3개월/최근 1년/전체)로 교체 (docs/plans/spending-record.md 참고) */
export function PeriodDropdown({ value, onChange }: PeriodDropdownProps) {
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

  const selectedLabel =
    RECORD_PERIOD_OPTIONS.find((option) => option.value === value)?.label ??
    '';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex h-7.5 w-22.25 items-center justify-between rounded-md border-[0.5px] border-[#b3b3b3] bg-white px-3 text-[13px] font-medium text-black"
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute right-0 z-10 mt-2 w-max overflow-hidden rounded-[7px] border border-[#dedede] bg-white py-1 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)]"
        >
          {RECORD_PERIOD_OPTIONS.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full px-4 py-2.5 text-left text-[15px] whitespace-nowrap ${
                  value === option.value
                    ? 'bg-[#e9f6e4] text-[#3e9b48]'
                    : 'text-black hover:bg-[#f7f7f7]'
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
