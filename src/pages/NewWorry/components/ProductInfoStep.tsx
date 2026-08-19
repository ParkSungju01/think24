import {
  useEffect,
  useMemo,
  useRef,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { ImagePlus, X } from 'lucide-react';
import { CategoryDropdown } from './CategoryDropdown';
import { formatWon, parseWon } from '../../../utils/format';
import type { ProductInfoInput } from '../../../types/newWorry';

interface ProductInfoStepProps {
  productInfo: ProductInfoInput;
  onChange: (patch: Partial<ProductInfoInput>) => void;
  onSubmit: () => void;
}

/**
 * docs/plans/new-worry.md "상품 정보 입력 필드 상세" (`290:516`/`292:641` 웹 실측 스펙).
 * 콘텐츠 폭은 MyPage와 동일한 max-w-377.75(=1511px) 기준을 재사용한다.
 */
export function ProductInfoStep({
  productInfo,
  onChange,
  onSubmit,
}: ProductInfoStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(
    () =>
      productInfo.imageFile
        ? URL.createObjectURL(productInfo.imageFile)
        : null,
    [productInfo.imageFile],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const canSubmit =
    productInfo.name.trim().length > 0 &&
    productInfo.price !== null &&
    productInfo.price > 0 &&
    productInfo.category.length > 0;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onChange({ imageFile: file });
    // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 초기화
    event.target.value = '';
  };

  const handlePriceChange = (raw: string) => {
    const digitsOnly = raw.replace(/[^0-9]/g, '');
    onChange({ price: digitsOnly === '' ? null : parseWon(digitsOnly) });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit();
  };

  return (
    <div className="mx-auto flex w-full max-w-377.75 flex-col px-4 pt-6 pb-24">
      <h1 className="text-[26px] font-semibold text-black">새 고민 생성</h1>
      <p className="mt-2 text-[14px] text-[#666]">
        사고 싶은 물건에 대한 정보를 입력해주세요.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 flex flex-col gap-8"
      >
        {/* 이미지 업로드 카드 (325×611, 확인 완료 2번: 빈 상태 아이콘은 lucide ImagePlus) */}
        <div className="mx-auto w-full max-w-81.25 shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative flex aspect-325/611 w-full cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-[14px] bg-[#efefef]"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="선택한 상품 이미지"
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                <ImagePlus
                  className="h-18 w-18 text-[#a9a9a9]"
                  aria-hidden="true"
                />
                <span className="text-[15px] font-medium text-[#757575]">
                  사진 추가
                </span>
              </>
            )}
          </button>
          {previewUrl && (
            <button
              type="button"
              onClick={() => onChange({ imageFile: null })}
              aria-label="선택한 이미지 제거"
              className="mt-2 flex cursor-pointer items-center gap-1 text-[13px] text-[#899086]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              사진 제거
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="mt-2 text-center text-[12px] text-[#a9a9a9]">
            사진을 첨부하지 않으면 기본 사진으로 등록됩니다.
          </p>
        </div>

        {/* 상품명 / 가격 / 카테고리 / 구매 URL */}
        <div className="flex w-full flex-col gap-6">
          <div>
            <label
              htmlFor="worry-name"
              className="text-[15px] font-semibold text-black"
            >
              상품명
            </label>
            <input
              id="worry-name"
              value={productInfo.name}
              onChange={(event) => onChange({ name: event.target.value })}
              placeholder="상품명을 입력해주세요"
              className="mt-2 h-11 w-full rounded-[7px] border border-[#757575] bg-white px-4 text-[15px] text-black outline-none placeholder:text-[#a9a9a9]"
            />
          </div>

          <div>
            <label
              htmlFor="worry-price"
              className="text-[15px] font-semibold text-black"
            >
              상품 가격
            </label>
            <div className="mt-2 flex h-11 items-center rounded-[7px] border border-[#757575] bg-white px-4">
              <input
                id="worry-price"
                inputMode="numeric"
                value={productInfo.price === null ? '' : formatWon(productInfo.price)}
                onChange={(event) => handlePriceChange(event.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-[15px] text-black outline-none placeholder:text-[#a9a9a9]"
              />
              <span className="ml-2 shrink-0 text-[14px] text-[#899086]">
                원
              </span>
            </div>
          </div>

          <div>
            <span className="text-[15px] font-semibold text-black">
              카테고리
            </span>
            <div className="mt-2">
              <CategoryDropdown
                value={productInfo.category}
                onChange={(category) => onChange({ category })}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="worry-purchase-url"
              className="text-[15px] font-semibold text-black"
            >
              구매 사이트 URL{' '}
              <span className="font-normal text-[#a9a9a9]">(선택)</span>
            </label>
            <input
              id="worry-purchase-url"
              type="url"
              value={productInfo.purchaseUrl}
              onChange={(event) =>
                onChange({ purchaseUrl: event.target.value })
              }
              placeholder="https://"
              className="mt-2 h-11 w-full rounded-[7px] border border-[#757575] bg-white px-4 text-[15px] text-black outline-none placeholder:text-[#a9a9a9]"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`mt-4 h-11 w-full rounded-[9px] text-[15px] font-medium transition-colors ${
              canSubmit
                ? 'cursor-pointer bg-[#e9f6e4] text-[#4fb75b]'
                : 'cursor-not-allowed bg-[#e7eae4] text-[#a9a9a9]'
            }`}
          >
            다음
          </button>
        </div>
      </form>
    </div>
  );
}
