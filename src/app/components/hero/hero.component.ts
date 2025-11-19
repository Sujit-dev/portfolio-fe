import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit {
  portfolioData: any;
  isQA: boolean = false;

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit() {
    this.portfolioData = this.portfolioService.getPortfolioData();
    this.isQA = this.portfolioService.getCurrentPortfolioType() === 'qa';
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

