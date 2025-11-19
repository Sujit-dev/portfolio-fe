import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';
import { ServerWindowComponent } from '../server-window/server-window.component';

export interface TestCase {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  executionTime?: number;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, ServerWindowComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit, AfterViewInit {
  portfolioData: any;
  isQA: boolean = false;

  // Automation demo properties (for QA only)
  demoUrls = [
    'https://example.com',
    'https://www.w3.org',
    'https://httpbin.org/html',
    'https://jsonplaceholder.typicode.com',
    'https://www.iana.org'
  ];
  
  currentUrlIndex: number = 0;
  targetUrl: string = '';
  testCases: TestCase[] = [];
  isRunning: boolean = false;
  showProfileImage: boolean = true;
  showBackgroundImage: boolean = false;
  firstTestCompleted: boolean = false;
  testResults: {
    total: number;
    passed: number;
    failed: number;
  } = {
    total: 0,
    passed: 0,
    failed: 0
  };

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit() {
    this.portfolioData = this.portfolioService.getPortfolioData();
    this.isQA = this.portfolioService.getCurrentPortfolioType() === 'qa';
    
    if (this.isQA) {
      // Start with first URL
      this.targetUrl = this.demoUrls[0];
      
      // Initialize with predefined test cases
      this.initializeTestCases();
    }
  }

  ngAfterViewInit() {
    if (this.isQA) {
      // Auto-run tests after a short delay
      setTimeout(() => {
        this.startAutomatedTesting();
      }, 1000);
    }
  }

  initializeTestCases() {
    const testCases = [
      { name: 'Page Load Test' },
      { name: 'Title Verification' },
      { name: 'Navigation Links' },
      { name: 'Responsive Layout' },
      { name: 'Performance Check' }
    ];
    
    this.testCases = testCases.map((tc, index) => ({
      id: index + 1,
      name: tc.name,
      status: 'pending' as const
    }));
  }

  async startAutomatedTesting() {
    // Start the automated testing cycle
    while (this.isQA) {
      await this.runTestsForCurrentUrl();
      
      // Move to next URL
      this.currentUrlIndex = (this.currentUrlIndex + 1) % this.demoUrls.length;
      this.targetUrl = this.demoUrls[this.currentUrlIndex];
      
      // Small delay before starting next URL
      await this.delay(1000);
    }
  }

  async runTestsForCurrentUrl() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Reset all test cases
    this.testCases.forEach(tc => {
      tc.status = 'pending';
      tc.executionTime = undefined;
    });
    
    // Reset image visibility for new test cycle
    this.showProfileImage = true;
    this.showBackgroundImage = false;
    this.firstTestCompleted = false;

    // Run tests sequentially
    for (let i = 0; i < this.testCases.length; i++) {
      const testCase = this.testCases[i];
      testCase.status = 'running';
      
      // Simulate test execution
      const executionTime = Math.random() * 1500 + 800; // 0.8-2.3 seconds
      await this.delay(executionTime);
      
      // Random pass/fail (50% chance for each)
      const passed = Math.random() > 0.5;
      testCase.status = passed ? 'passed' : 'failed';
      testCase.executionTime = Math.round(executionTime);
      
      // Small delay between tests
      await this.delay(200);
    }

    // Calculate results
    this.testResults = {
      total: this.testCases.length,
      passed: this.testCases.filter(tc => tc.status === 'passed').length,
      failed: this.testCases.filter(tc => tc.status === 'failed').length
    };

    this.isRunning = false;

    // After all 5 tests complete, wait a few seconds, then show background image
    await this.delay(2000);
    
    // Stop loader, hide profile image, show background image
    this.showProfileImage = false;
    this.showBackgroundImage = true;
    this.firstTestCompleted = true;
    
    // After 3 seconds, hide background image and show profile image with loader for next cycle
    await this.delay(3000);
    this.showBackgroundImage = false;
    this.showProfileImage = true;
    this.firstTestCompleted = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getSafeUrl(): string {
    return this.targetUrl;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

