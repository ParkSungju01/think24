import { useEffect, useState } from 'react';
import { WorriesHeader } from './components/WorriesHeader';
import { WorrySummaryCard } from './components/WorrySummaryCard';
import { WorryFilterChips } from './components/WorryFilterChips';
import { WorryCard } from './components/WorryCard';
import { LoadMoreButton } from './components/LoadMoreButton';
import { WorryFilterEmptyNotice } from './components/WorryFilterEmptyNotice';
import { WorryEmptyState } from './components/WorryEmptyState';
import { DecisionSheet } from './components/DecisionSheet';
import { DeleteWorryModal } from './components/DeleteWorryModal';
import { PurchaseConfirmModal } from './components/PurchaseConfirmModal';
import { Toast } from '../../components/Toast';
import { formatWon } from '../../utils/format';
import { useWorriesListData } from './useWorriesListData';

// HomePage/RecordsPage와 동일한 페이지 배경/여백 컨벤션(docs/plans/worries-list.md 공통 전제).
const containerClassName = 'flex flex-col gap-4 px-3 pt-6 pb-24';

export function WorriesPage() {
  const {
    isLoading,
    error,
    filter,
    setFilter,
    counts,
    filteredViews,
    visibleViews,
    hiddenCount,
    loadMore,
    mostUrgentView,
    totalPendingAmount,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    deleteModalWorry,
    openDecisionSheet,
    closeDecisionSheet,
    decideOutcome,
    decisionSheetWorry,
    openPurchaseConfirm,
    closePurchaseConfirm,
    purchaseConfirmWorry,
    openEarlyDecision,
    closeEarlyDecision,
    earlyDecisionWorry,
    highlightedWorryId,
    highlightError,
    dismissHighlightError,
  } = useWorriesListData();

  // "포기하기" 시 절약 금액을 알려주는 토스트. 구매 확정에는 별도 안내가 없으므로 이 페이지
  // 로컬 상태로만 관리한다(훅까지 끌어올릴 필요 없음).
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // 알림 클릭으로 들어와 강조 대상이 정해지면 해당 카드까지 스크롤한다.
  useEffect(() => {
    if (!highlightedWorryId) return;
    document
      .getElementById(`worry-card-${highlightedWorryId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedWorryId]);

  if (isLoading) {
    return (
      <div className={containerClassName}>
        <p className="text-[15px] font-medium text-[#666]">불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClassName}>
        <p className="text-[15px] font-medium text-[#666]">{error}</p>
      </div>
    );
  }

  const isFullyEmpty = filter === 'all' && counts.all === 0;

  return (
    <>
      <div className={containerClassName}>
        {isFullyEmpty ? (
          <WorryEmptyState
            filter={filter}
            counts={counts}
            onFilterChange={setFilter}
          />
        ) : (
          <>
            <WorriesHeader />
            <WorrySummaryCard
              filter={filter}
              totalPendingAmount={totalPendingAmount}
              counts={counts}
              mostUrgentView={mostUrgentView}
            />
            <WorryFilterChips
              filter={filter}
              counts={counts}
              onChange={setFilter}
            />

            {filteredViews.length === 0 && filter !== 'all' ? (
              <WorryFilterEmptyNotice filter={filter} />
            ) : (
              <>
                {visibleViews.map((view) => (
                  <WorryCard
                    key={view.worry.id}
                    view={view}
                    onDelete={openDeleteModal}
                    onDecide={openDecisionSheet}
                    onDecideNow={openEarlyDecision}
                    highlighted={view.worry.id === highlightedWorryId}
                  />
                ))}
                {hiddenCount > 0 && (
                  <LoadMoreButton hiddenCount={hiddenCount} onClick={loadMore} />
                )}
              </>
            )}
          </>
        )}
      </div>

      {decisionSheetWorry && (
        <DecisionSheet
          worry={decisionSheetWorry}
          onAbandon={() => {
            decideOutcome(decisionSheetWorry.id, 'abandoned');
            setSavedToast(
              `${formatWon(decisionSheetWorry.price)}원을 절약했어요!`,
            );
          }}
          onPurchase={() => openPurchaseConfirm(decisionSheetWorry.id)}
          onDismiss={closeDecisionSheet}
        />
      )}

      {purchaseConfirmWorry && (
        <PurchaseConfirmModal
          title="정말 구매하시겠습니까?"
          onCancel={closePurchaseConfirm}
          onConfirmPurchase={() =>
            decideOutcome(purchaseConfirmWorry.id, 'purchased')
          }
        />
      )}

      {earlyDecisionWorry && (
        <PurchaseConfirmModal
          title="지금 결정하시겠어요?"
          subtitle="아직 24시간이 지나지 않았어요."
          onCancel={closeEarlyDecision}
          onConfirmPurchase={() =>
            decideOutcome(earlyDecisionWorry.id, 'purchased')
          }
        />
      )}

      {deleteModalWorry && (
        <DeleteWorryModal
          worryName={deleteModalWorry.name}
          onCancel={closeDeleteModal}
          onConfirmDelete={() => confirmDelete(deleteModalWorry.id)}
        />
      )}

      {highlightError && (
        <Toast
          message={highlightError}
          tone="error"
          onDismiss={dismissHighlightError}
        />
      )}

      {savedToast && (
        <Toast
          message={savedToast}
          tone="success"
          onDismiss={() => setSavedToast(null)}
        />
      )}
    </>
  );
}

export default WorriesPage;
