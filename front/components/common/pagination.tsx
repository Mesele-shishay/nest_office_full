'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal 
} from 'lucide-react';
import { PaginationProps } from '@/lib/types';

export function PagePagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    onPageChange(1);
  };

  const handleLast = () => {
    onPageChange(totalPages);
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="w-full">
      {/* Results Summary */}
      <div className="flex justify-center mb-4">
        <Button className="bg-primary-600 hover:bg-primary-700 text-white">
          Showing 9 results in All
        </Button>
      </div>

      {/* Pagination Controls */}
      <Card className="w-fit mx-auto">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {/* Previous Page */}
            <Button 
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getVisiblePages().map((page, index) => {
                if (page === '...') {
                  return (
                    <div key={`dots-${index}`} className="px-2 py-1">
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </div>
                  );
                }

                const pageNum = page as number;
                const isCurrentPage = pageNum === currentPage;

                return (
                  <Button
                    key={pageNum}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className={`w-10 h-10 ${
                      isCurrentPage 
                        ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            {/* Next Page */}
            <Button 
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Page Info */}
          <div className="flex items-center justify-center mt-3">
            <Badge variant="secondary" className="text-sm">
              Page {currentPage} of {totalPages}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
