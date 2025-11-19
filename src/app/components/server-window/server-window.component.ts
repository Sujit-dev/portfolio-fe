import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-server-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './server-window.component.html',
  styleUrl: './server-window.component.scss'
})
export class ServerWindowComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('serverBody') serverBody?: ElementRef<HTMLDivElement>;
  logs: string[] = [];
  isMinimized: boolean = false;
  isVisible: boolean = true;
  isHovering: boolean = false;
  private logInterval?: any;
  private autoScroll: boolean = true;
  private userScrolling: boolean = false;
  private allLogsPrinted: boolean = false;
  private restartTimeout?: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private portfolioService: PortfolioService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Only show for developer portfolio
      const portfolioType = this.portfolioService.getCurrentPortfolioType();
      if (portfolioType === 'developer') {
        this.startServerLogs();
      } else {
        this.isVisible = false;
      }
    }
  }

  ngOnDestroy() {
    if (this.logInterval) {
      clearInterval(this.logInterval);
    }
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }
  }

  startServerLogs() {
    // Clear existing intervals and timeouts
    if (this.logInterval) {
      clearInterval(this.logInterval);
      this.logInterval = undefined;
    }
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = undefined;
    }
    
    // Clear existing logs
    this.logs = [];
    this.allLogsPrinted = false;
    this.autoScroll = true;
    this.userScrolling = false;
    
    // Initial server startup logs - slower printing
    this.addLog('🚀 Starting Node.js server...', 0);
    this.addLog('📦 Loading dependencies...', 1500);
    this.addLog('✅ Express server initialized', 3000);
    this.addLog('🌐 Server listening on http://localhost:4000', 4500);
    this.addLog('📡 Handling incoming request...', 6000);
    this.addLog('🔄 Rendering Angular application...', 7500);
    
    // Display server.js code
    this.addLog('', 9000, true);
    this.addLog('// server.js', 9500, true);
    this.addLog('', 10000, true);
    
    // Get portfolio data info
    setTimeout(() => {
      const activeProfile = this.portfolioService.getActiveProfileKey();
      const portfolioData = this.portfolioService.getPortfolioData('developer', activeProfile);
      
      // Display code with developer info
      this.addLog('const developer = \'' + portfolioData.name + '\';', 11000, true);
      this.addLog('', 11500, true);
      
      // Get skills from technologies
      const allTechnologies = portfolioData.workExperience.flatMap(exp => exp.technologies);
      const uniqueSkills = [...new Set(allTechnologies)].slice(0, 8);
      
      // Build skills array code - each skill on separate line
      this.addLog('const skills = [', 12000, true);
      uniqueSkills.forEach((skill, index) => {
        const isLast = index === uniqueSkills.length - 1;
        const comma = isLast ? '' : ',';
        this.addLog(`    '${skill}'${comma}`, 12000 + ((index + 1) * 800), true);
      });
      this.addLog('];', 12000 + ((uniqueSkills.length + 1) * 800), true);
      this.addLog('', 12000 + ((uniqueSkills.length + 2) * 800), true);
      this.addLog('console.log(\'Ready to build!\');', 12000 + ((uniqueSkills.length + 3) * 800), true);
      this.addLog('', 12000 + ((uniqueSkills.length + 4) * 800), true);
      
      // Output execution results
      const outputDelay = 12000 + ((uniqueSkills.length + 5) * 800);
      this.addLog('> Ready to build!', outputDelay, true);
      this.addLog('', outputDelay + 1000, true);
      this.addLog('📊 Developer: ' + portfolioData.name, outputDelay + 2000);
      this.addLog('📝 Title: ' + portfolioData.title, outputDelay + 3500);
      this.addLog('💼 Experience: ' + portfolioData.workExperience.length + ' positions', outputDelay + 5000);
      this.addLog('🎯 Projects: ' + portfolioData.portfolio.length + ' items', outputDelay + 6500);
      this.addLog('🛠️  Skills: ' + uniqueSkills.length + ' technologies', outputDelay + 8000);
      this.addLog('✅ Portfolio data loaded successfully', outputDelay + 9500);
      this.addLog('🎨 Rendering components...', outputDelay + 11000);
      this.addLog('✨ SSR complete - Page ready', outputDelay + 12500);
      
      // Mark as all logs printed and schedule restart
      const totalDelay = outputDelay + 14000;
      setTimeout(() => {
        this.allLogsPrinted = true;
        // Clear and restart after 2 seconds
        this.restartTimeout = setTimeout(() => {
          this.startServerLogs();
        }, 2000);
      }, totalDelay);
    }, 10500);
  }


  addLog(message: string, delay: number = 0, isCode: boolean = false) {
    setTimeout(() => {
      // Code lines don't have timestamps
      if (isCode || message.includes('const') || message.includes('console') || message.includes('//') || message.includes('[') || message.includes(']') || message.includes(';') || message.trim() === '' || message.startsWith('>')) {
        this.logs.push(message);
      } else {
        const timestamp = new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        });
        this.logs.push(`[${timestamp}] ${message}`);
      }
      
      // Auto-scroll if enabled
      if (this.autoScroll && !this.userScrolling) {
        this.scrollToBottom();
      }
    }, delay);
  }

  ngAfterViewChecked() {
    // Auto-scroll on new logs if enabled
    if (this.autoScroll && !this.userScrolling) {
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    if (this.serverBody?.nativeElement) {
      const element = this.serverBody.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  onMouseEnter() {
    // User is hovering, show scrollbar and allow manual scrolling
    this.isHovering = true;
    this.userScrolling = true;
  }

  onMouseLeave() {
    // User left, hide scrollbar and resume auto-scroll
    this.isHovering = false;
    this.userScrolling = false;
    this.autoScroll = true;
    this.scrollToBottom();
  }

  onScroll() {
    if (this.serverBody?.nativeElement) {
      const element = this.serverBody.nativeElement;
      const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
      
      // If user scrolled to bottom, resume auto-scroll
      if (isAtBottom) {
        this.autoScroll = true;
        this.userScrolling = false;
      } else if (this.userScrolling) {
        // User scrolled up, disable auto-scroll
        this.autoScroll = false;
      }
    }
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
  }

  closeWindow() {
    this.isVisible = false;
  }
}

