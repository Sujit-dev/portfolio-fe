import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  portfolioType: 'developer' | 'qa' = 'developer';
  portfolioName: string = '';
  portfolioTitle: string = '';
  profileImage: string = '';
  private routerSubscription?: Subscription;

  constructor(
    private portfolioService: PortfolioService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.updatePortfolioInfo();
      
      // Subscribe to route changes to update header dynamically
      this.routerSubscription = this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          this.updatePortfolioInfo();
        });
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  updatePortfolioInfo() {
    const storedData = this.portfolioService.getPortfolioDataFromStorage();
    const activeProfileKey = this.portfolioService.getActiveProfileKey();
    
    if (storedData) {
      this.portfolioName = storedData.name;
      this.portfolioTitle = storedData.title;
      this.profileImage = storedData.profileImage || '';
      this.portfolioType = activeProfileKey?.includes('-qa') ? 'qa' : 'developer';
    } else {
      // Fallback to default
      const defaultData = this.portfolioService.getPortfolioData();
      this.portfolioName = defaultData.name;
      this.portfolioTitle = defaultData.title;
      this.profileImage = defaultData.profileImage || '';
      this.portfolioType = this.portfolioService.getCurrentPortfolioType();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.isMenuOpen = false;
    }
  }

  getLogoIcon(): string {
    return this.portfolioType === 'qa' ? '🧪' : '💻';
  }

  getLogoText(): string {
    // Extract first name only
    const firstName = this.portfolioName ? this.portfolioName.split(' ')[0] : '';
    
    if (this.portfolioType === 'qa') {
      return firstName ? `${firstName} - QA Portfolio` : 'QA Portfolio';
    } else {
      return firstName ? `${firstName} - Developer Portfolio` : 'Developer Portfolio';
    }
  }

  navigateToLanding(): void {
    // Clear all localStorage
    this.portfolioService.clearStorage();
    
    // Set flag to indicate we're navigating to terminal from another page
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('navigatingToTerminal', 'true');
    }
    
    // Navigate to terminal page - it will reload automatically
    this.router.navigate(['/']);
  }
}

