import type { CategoryStat, OngoingWorry } from '../types/home';
import type { WorryRecord } from './worries';

function isSameMonth(date: Date, targetMonth: Date): boolean {
  return (
    date.getFullYear() === targetMonth.getFullYear() &&
    date.getMonth() === targetMonth.getMonth()
  );
}

export function startOfPreviousMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function previousMonth(targetMonth: Date): Date {
  return new Date(targetMonth.getFullYear(), targetMonth.getMonth() - 1, 1);
}

interface MonthCounts {
  registered: number;
  abandoned: number;
  purchased: number;
}

function countForMonth(worries: WorryRecord[], targetMonth: Date): MonthCounts {
  let registered = 0;
  let abandoned = 0;
  let purchased = 0;

  for (const worry of worries) {
    if (isSameMonth(worry.createdAt, targetMonth)) {
      registered += 1;
    }
    if (worry.decidedAt && isSameMonth(worry.decidedAt, targetMonth)) {
      if (worry.status === 'abandoned') abandoned += 1;
      if (worry.status === 'purchased') purchased += 1;
    }
  }

  return { registered, abandoned, purchased };
}

/**
 * 이번 달 등록/포기/구매 "개수" + 전월 대비 증감을 계산한다.
 * "절약 금액"과 달리 개수의 정의는 명확해(status가 abandoned/purchased인 worry 수)
 * 실제 데이터로 계산한다 (docs/plans/backend-setup.md 보류 섹션 참고).
 */
export function computeCategoryCounts(
  worries: WorryRecord[],
  targetMonth: Date,
): CategoryStat[] {
  const current = countForMonth(worries, targetMonth);
  const previous = countForMonth(worries, previousMonth(targetMonth));

  return [
    {
      key: 'registered',
      label: '등록한 고민',
      count: current.registered,
      diffVsLastMonth: current.registered - previous.registered,
    },
    {
      key: 'abandoned',
      label: '포기한 상품',
      count: current.abandoned,
      diffVsLastMonth: current.abandoned - previous.abandoned,
    },
    {
      key: 'purchased',
      label: '구매한 상품',
      count: current.purchased,
      diffVsLastMonth: current.purchased - previous.purchased,
    },
  ];
}

/** 진행 중인 고민 중 타이머 잔여 시간이 짧은 순으로 최대 2개 */
export function computeOngoingWorries(
  worries: WorryRecord[],
  now: Date,
): OngoingWorry[] {
  return worries
    .filter((worry) => worry.status === 'ongoing')
    .map((worry) => {
      const totalMs = worry.deadlineAt.getTime() - worry.createdAt.getTime();
      const elapsedMs = now.getTime() - worry.createdAt.getTime();
      const remainingSeconds = Math.max(
        0,
        Math.round((worry.deadlineAt.getTime() - now.getTime()) / 1000),
      );
      const progressPercent =
        totalMs > 0
          ? Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100))
          : 100;

      return {
        id: worry.id,
        name: worry.name,
        price: worry.price,
        thumbnailUrl: worry.thumbnailUrl ?? undefined,
        remainingSeconds,
        progressPercent,
      };
    })
    .sort((a, b) => a.remainingSeconds - b.remainingSeconds)
    .slice(0, 2);
}
