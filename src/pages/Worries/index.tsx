import { WorriesHeader } from './components/WorriesHeader';
import { WorrySummaryCard } from './components/WorrySummaryCard';
import { WorryFilterChips } from './components/WorryFilterChips';
import { WorryCard } from './components/WorryCard';
import { LoadMoreButton } from './components/LoadMoreButton';
import { PausedHintBanner } from './components/PausedHintBanner';
import { WorryFilterEmptyNotice } from './components/WorryFilterEmptyNotice';
import { WorryEmptyState } from './components/WorryEmptyState';
import { DecisionSheet } from './components/DecisionSheet';
import { DeleteWorryModal } from './components/DeleteWorryModal';
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
    pauseWorry,
    resumeWorry,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    deleteModalWorry,
    openDecisionSheet,
    closeDecisionSheet,
    decideOutcome,
    decisionSheetWorry,
  } = useWorriesListData();

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
                    onPause={pauseWorry}
                    onResume={resumeWorry}
                    onDelete={openDeleteModal}
                    onDecide={openDecisionSheet}
                  />
                ))}
                {filter === 'paused' && <PausedHintBanner />}
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
          onAbandon={() => decideOutcome(decisionSheetWorry.id, 'abandoned')}
          onPurchase={() => decideOutcome(decisionSheetWorry.id, 'purchased')}
          onDismiss={closeDecisionSheet}
        />
      )}

      {deleteModalWorry && (
        <DeleteWorryModal
          worryName={deleteModalWorry.name}
          onCancel={closeDeleteModal}
          onConfirmDelete={() => confirmDelete(deleteModalWorry.id)}
        />
      )}
    </>
  );
}

export default WorriesPage;
