import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';
import { PortfolioItem } from '../../models/portfolio.model';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss'
})
export class PortfolioComponent implements OnInit {
  portfolioItems: PortfolioItem[] = [];
  selectedCategory: string = 'All';
  isQA: boolean = false;

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit() {
    this.portfolioItems = this.portfolioService.getPortfolio();
    this.isQA = this.portfolioService.getCurrentPortfolioType() === 'qa';
  }

  get categories(): string[] {
    const cats = ['All', ...new Set(this.portfolioItems.map(item => item.category))];
    return cats;
  }

  get filteredItems(): PortfolioItem[] {
    if (this.selectedCategory === 'All') {
      return this.portfolioItems;
    }
    return this.portfolioItems.filter(item => item.category === this.selectedCategory);
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  getDuration(startDate: string, endDate?: string): string {
    if (!startDate) return '';
    const start = new Date(startDate + '-01');
    const end = endDate ? new Date(endDate + '-01') : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0 && remainingMonths > 0) {
      return `${years} yr ${remainingMonths} mo`;
    } else if (years > 0) {
      return `${years} yr`;
    } else {
      return `${remainingMonths} mo`;
    }
  }

  resetOverlayScroll(event: Event): void {
    const portfolioItem = event.currentTarget as HTMLElement;
    if (portfolioItem) {
      const overlay = portfolioItem.querySelector('.portfolio-overlay') as HTMLElement;
      if (overlay) {
        overlay.scrollTop = 0;
      }
    }
  }
}

