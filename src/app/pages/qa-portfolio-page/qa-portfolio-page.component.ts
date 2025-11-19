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
  selector: 'app-qa-portfolio-page',
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
  templateUrl: './qa-portfolio-page.component.html',
  styleUrl: './qa-portfolio-page.component.scss'
})
export class QAPortfolioPageComponent implements OnInit {
  showScrollTop = false;
  portfolioType: PortfolioType = 'qa';
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
      
      // Always ensure QA profile is set and active before components load
      // This prevents components from loading developer data
      const storedData = this.portfolioService.getPortfolioDataFromStorage();
      
      if (activeProfileKey && activeProfileKey.includes('-qa')) {
        // QA profile is already set, verify it's active
        this.portfolioService.setActiveProfile(activeProfileKey);
      } else {
        // No QA profile set or developer profile is active, clear and set QA profile
        this.portfolioService.clearStorage();
        this.portfolioService.setActiveProfile('mona-qa');
      }
      
      // Ensure portfolio type is set to QA
      this.portfolioType = 'qa';
      this.portfolioService.setPortfolioType('qa');
      
      // Remove terminal mode for QA
      if (typeof document !== 'undefined') {
        document.body.classList.remove('terminal-mode');
        this.checkScrollPosition();
      }
      
      // Allow rendering after verification
      this.isChecking = false;
    } else {
      // SSR fallback
      this.portfolioType = 'qa';
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
    this.showScrollTop = scrollPosition > 300;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

