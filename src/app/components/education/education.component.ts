import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';
import { Education } from '../../models/portfolio.model';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss'
})
export class EducationComponent implements OnInit {
  education: Education[] = [];
  isQA: boolean = false;

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit() {
    this.education = this.portfolioService.getEducation();
    this.isQA = this.portfolioService.getCurrentPortfolioType() === 'qa';
  }
}

