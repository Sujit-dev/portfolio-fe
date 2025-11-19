import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';
import { ServerWindowComponent } from '../server-window/server-window.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, ServerWindowComponent],
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

