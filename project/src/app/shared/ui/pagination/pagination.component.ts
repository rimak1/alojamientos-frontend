import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <nav *ngIf="totalPages > 1" class="flex items-center justify-between" aria-label="Paginación">
      <div class="text-sm text-gray-700">
        Mostrando {{ startItem }} - {{ endItem }} de {{ total }} resultados
      </div>
      
      <div class="flex items-center space-x-2">
        <app-button
          variant="ghost"
          size="sm"
          [disabled]="currentPage <= 1"
          (clicked)="goToPage(currentPage - 1)"
          ariaLabel="Página anterior"
        >
          ← Anterior
        </app-button>

        <div class="flex items-center space-x-1">
          <button
            *ngFor="let page of visiblePages"
            [class]="getPageButtonClasses(page)"
            [disabled]="page === '...'"
            (click)="page !== '...' && goToPage(+page)"
            [attr.aria-label]="'Ir a página ' + page"
          >
            {{ page }}
          </button>
        </div>

        <app-button
          variant="ghost"
          size="sm"
          [disabled]="currentPage >= totalPages"
          (clicked)="goToPage(currentPage + 1)"
          ariaLabel="Página siguiente"
        >
          Siguiente →
        </app-button>
      </div>
    </nav>
  `
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() total = 0;
  
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.total);
  }

  get visiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }

  getPageButtonClasses(page: number | string): string {
    const baseClasses = 'px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200';
    
    if (page === '...') {
      return `${baseClasses} text-gray-500 cursor-default`;
    }
    
    if (+page === this.currentPage) {
      return `${baseClasses} bg-primary text-white`;
    }
    
    return `${baseClasses} text-gray-700 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50`;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}