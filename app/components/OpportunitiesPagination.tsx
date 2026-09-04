import { ChevronLeft, ChevronRight } from 'lucide-react';

function paginationItems(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const pages = new Set([1, total, current]);
  if (current > 2) pages.add(current - 1);
  if (current < total - 1) pages.add(current + 1);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 3);
    pages.add(total - 2);
    pages.add(total - 1);
  }
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const items: Array<number | 'ellipsis'> = [];
  for (let index = 0; index < sorted.length; index += 1) {
    if (index > 0 && sorted[index]! - sorted[index - 1]! > 1) {
      items.push('ellipsis');
    }
    items.push(sorted[index]!);
  }
  return items;
}

export default function OpportunitiesPagination({
  page,
  pageCount,
  rangeFrom,
  rangeTo,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  rangeFrom: number;
  rangeTo: number;
  total: number;
  onPage: (page: number) => void;
}) {
  if (pageCount <= 1 || total === 0) {
    return null;
  }
  const pages = paginationItems(page, pageCount);

  return (
    <nav className="opportunity-pagination" aria-label="Opportunity pages">
      <p className="page-range">
        Showing {rangeFrom}–{rangeTo} of {total}
      </p>
      <button
        type="button"
        className="page-nav secondary-button on-light"
        disabled={page <= 1}
        onClick={() => onPage(Math.max(1, page - 1))}
      >
        <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
        Previous
      </button>
      <div className="page-numbers">
        {pages.map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="page-ellipsis">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`page-num${item === page ? ' is-current' : ''}`}
              onClick={() => onPage(item)}
              aria-current={item === page ? 'page' : undefined}
              aria-label={`Page ${item}`}
            >
              {item}
            </button>
          ),
        )}
      </div>
      <span className="page-status">
        Page {page} of {pageCount}
      </span>
      <button
        type="button"
        className="page-nav secondary-button on-light"
        disabled={page >= pageCount}
        onClick={() => onPage(Math.min(pageCount, page + 1))}
      >
        Next
        <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </nav>
  );
}
