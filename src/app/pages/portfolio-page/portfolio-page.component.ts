import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { EducationComponent } from '../../components/education/education.component';
import { ExperienceComponent } from '../../components/experience/experience.component';
import { PortfolioComponent } from '../../components/portfolio/portfolio.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { PortfolioService, PortfolioType } from '../../services/portfolio.service';

@Component({
  selector: 'app-portfolio-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeroComponent,
    EducationComponent,
    ExperienceComponent,
    PortfolioComponent,
    ContactComponent,
    FooterComponent
  ],
  templateUrl: './portfolio-page.component.html',
  styleUrl: './portfolio-page.component.scss'
})
export class PortfolioPageComponent implements OnInit {
  showScrollTop = false;
  portfolioType: PortfolioType = 'developer';
  isQAPortfolio = false;
  isChecking = true; // Flag to prevent rendering until route is verified

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
    private portfolioService: PortfolioService
  ) {}

  ngOnInit() {
    // Get portfolio data from storage (set by terminal component)
    if (isPlatformBrowser(this.platformId)) {
      const activeProfileKey = this.portfolioService.getActiveProfileKey();
      
      // Always ensure developer profile is set and active before components load
      // This prevents components from loading QA data
      if (activeProfileKey && !activeProfileKey.includes('-qa')) {
        // Developer profile is already set, verify it's active
        this.portfolioService.setActiveProfile(activeProfileKey);
        this.portfolioType = 'developer';
        this.isQAPortfolio = false;
      } else {
        // No developer profile set or QA profile is active, clear and set developer profile
        this.portfolioService.clearStorage();
        this.portfolioService.setActiveProfile('sujit-developer');
        this.portfolioType = 'developer';
        this.isQAPortfolio = false;
      }
      
      // Ensure portfolio type is set to developer
      this.portfolioService.setPortfolioType('developer');
      
      // Add terminal-style entrance animation only for developer
      if (typeof document !== 'undefined') {
        document.body.classList.add('terminal-mode');
        this.checkScrollPosition();
      }
      
      // Allow rendering after verification
      this.isChecking = false;
    } else {
      // SSR fallback
      this.portfolioType = 'developer';
      this.isQAPortfolio = false;
      this.isChecking = false;
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScrollPosition();
    }
  }

  checkScrollPosition() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showScrollTop = scrollPosition > 300; // Show button after scrolling 300px
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
