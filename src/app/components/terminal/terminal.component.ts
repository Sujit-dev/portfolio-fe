import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terminal.component.html',
  styleUrl: './terminal.component.scss'
})
export class TerminalComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mobileInput') mobileInput?: ElementRef<HTMLInputElement>;
  commands: string[] = [];
  currentLine: string = '';
  currentCommand: string = '';
  cursorPosition: number = 0; // Cursor position within currentCommand
  isTyping: boolean = false;
  showCursor: boolean = true;
  isLoading: boolean = false;
  portfolioLoaded: boolean = false;
  waitingForInput: boolean = false;
  private cursorInterval: any;
  private typingTimeout: any;
  private commandHistory: string[] = []; // Store unique command history
  private historyIndex: number = -1; // Current position in history (-1 means not browsing history)
  private tempCommand: string = ''; // Store current command when navigating history
  private isMobile: boolean = false;
  private selectionChangeListener?: () => void;

  constructor(
    private router: Router,
    private portfolioService: PortfolioService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Only run terminal logic in browser (not during SSR/prerendering)
    if (isPlatformBrowser(this.platformId)) {
      // Check if we're navigating from another page
      // Use sessionStorage to track if this is a navigation from another page
      const fromOtherPage = sessionStorage.getItem('navigatingToTerminal');
      
      if (fromOtherPage === 'true') {
        // Clear the flag and reload the page
        sessionStorage.removeItem('navigatingToTerminal');
        window.location.reload();
        return;
      }
      
      // Clear storage when landing on terminal page
      this.portfolioService.clearStorage();
      
      // Detect mobile device - use user agent AND check for touch capability
      // This ensures desktop with resized window still works with keyboard
      const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      // Only consider it mobile if BOTH user agent says mobile AND has touch screen
      // This prevents desktop Chrome from being detected as mobile
      this.isMobile = userAgentMobile && hasTouchScreen;
      
      // Reset terminal state when component initializes
      this.resetTerminalState();
      this.startTerminal();
      this.startCursorBlink();
      // Focus the window for keyboard input
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.focus();
        }
      }, 100);
    } else {
      // During SSR, just show a simple message
      this.commands.push('Welcome to Portfolio Terminal v2.0');
      this.commands.push('Loading...');
    }
  }
  
  ngAfterViewInit() {
    // Focus appropriate element when terminal is ready for input
    // On actual mobile devices: focus mobile input
    // On desktop (including responsive view): focus terminal container
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (this.isMobile && this.mobileInput && !this.isTyping && !this.waitingForInput) {
          // On actual mobile devices, focus the mobile input
          // Use requestAnimationFrame for better mobile browser compatibility
          requestAnimationFrame(() => {
            if (this.mobileInput) {
              this.mobileInput.nativeElement.focus();
              this.mobileInput.nativeElement.style.pointerEvents = 'auto';
              // Force focus on mobile - sometimes needs a click event
              this.mobileInput.nativeElement.click();
            }
          });
        } else {
          // On desktop (including responsive view), blur mobile input and focus terminal container
          if (this.mobileInput) {
            this.mobileInput.nativeElement.blur();
            // Disable pointer events to prevent mobile input from capturing focus
            this.mobileInput.nativeElement.style.pointerEvents = 'none';
          }
          const terminalContainer = document.querySelector('.terminal-container');
          if (terminalContainer) {
            (terminalContainer as HTMLElement).focus();
            (terminalContainer as HTMLElement).tabIndex = 0;
          }
        }
      }, 500);
    }
  }
  
  resetTerminalState() {
    // Reset all terminal state variables
    this.commands = [];
    this.currentLine = '';
    this.currentCommand = '';
    this.cursorPosition = 0;
    this.isTyping = false;
    this.isLoading = false;
    this.portfolioLoaded = false;
    this.waitingForInput = false;
    (this as any).pendingProfileKey = null;
    // Keep command history across resets (don't clear it)
    // this.commandHistory = [];
    this.historyIndex = -1;
    this.tempCommand = '';
  }
  
  updateCurrentLine() {
    // Update currentLine to show command with cursor position
    this.currentLine = `$ ${this.currentCommand}`;
  }
  
  syncMobileInput() {
    // Sync mobile input value and cursor position
    if (this.mobileInput) {
      this.mobileInput.nativeElement.value = this.currentCommand;
      // Set cursor position in mobile input
      setTimeout(() => {
        if (this.mobileInput) {
          this.mobileInput.nativeElement.setSelectionRange(this.cursorPosition, this.cursorPosition);
        }
      }, 0);
    }
  }

  ngOnDestroy() {
    if (this.cursorInterval) {
      clearInterval(this.cursorInterval);
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    // Remove selection change listener
    if (this.selectionChangeListener && isPlatformBrowser(this.platformId)) {
      document.removeEventListener('selectionchange', this.selectionChangeListener);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // Only handle keyboard events in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const isCharacterKey = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
    
    // Handle Ctrl+C / Cmd+C to exit FIRST (works on both Windows/Linux and Mac)
    // This should work regardless of terminal state (typing, waiting, etc.)
    if ((event.ctrlKey || event.metaKey) && (event.key === 'c' || event.key === 'C')) {
      event.preventDefault();
      this.exitTerminal();
      return;
    }
    
    // On desktop (including responsive view), always handle keyboard events
    // Only skip if it's an actual mobile device AND the mobile input is focused
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      // If it's the mobile input
      if (this.mobileInput && document.activeElement === this.mobileInput.nativeElement) {
        // If we detected it as mobile but user is typing with physical keyboard,
        // handle it here instead of skipping (this covers desktop Chrome in responsive mode)
        // Physical keyboard events always have keyCode > 0 and proper key values
        const isPhysicalKeyboard = event.keyCode > 0 && event.key.length <= 1;
        
        // Only skip if it's actually mobile AND we're sure it's touch input (not physical keyboard)
        // On desktop (even if incorrectly detected), always handle keyboard input here
        if (this.isMobile && isCharacterKey && !isPhysicalKeyboard) {
          return;
        }
        // On desktop or for special keys, handle them here
      } else {
        // If it's a different input/textarea, skip it (but Ctrl+C was already handled above)
        return;
      }
    }
    
    // Ensure we're not in a typing animation or waiting state (unless Enter)
    if (this.isTyping && event.key !== 'Enter') {
      return;
    }
    
    if (this.waitingForInput && event.key !== 'Enter') {
      return;
    }
    
    // Handle Enter key first, even when waiting for input
    if (event.key === 'Enter' || event.keyCode === 13) {
      event.preventDefault();
      // Handle Enter key press
      if (this.portfolioLoaded && this.waitingForInput) {
        // Portfolio is loaded, navigate
        this.commands.push('Navigating to portfolio page...');
        this.waitingForInput = false;
        
        // Navigate to correct route based on profile type
        const profileKey = (this as any).pendingProfileKey || this.portfolioService.getActiveProfileKey();
        const route = profileKey?.includes('-qa') ? '/portfolio-qa' : '/portfolio-dev';
        
        setTimeout(() => {
          this.router.navigate([route]);
        }, 500);
        return;
      } else {
        this.handleMobileSubmit();
        return;
      }
    }
    
    // Handle arrow keys for command history
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigateHistoryUp();
      return;
    }
    
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigateHistoryDown();
      return;
    }
    
    // Handle left arrow key to move cursor left
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (this.cursorPosition > 0) {
        this.cursorPosition--;
        this.updateCurrentLine();
        this.syncMobileInput();
      }
      return;
    }
    
    // Handle right arrow key to move cursor right
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (this.cursorPosition < this.currentCommand.length) {
        this.cursorPosition++;
        this.updateCurrentLine();
        this.syncMobileInput();
      }
      return;
    }
    
    // Handle backspace - delete character before cursor
    if (event.key === 'Backspace') {
      event.preventDefault();
      // Reset history index when user starts typing
      this.historyIndex = -1;
      this.tempCommand = '';
      if (this.cursorPosition > 0) {
        this.currentCommand = this.currentCommand.slice(0, this.cursorPosition - 1) + this.currentCommand.slice(this.cursorPosition);
        this.cursorPosition--;
        this.updateCurrentLine();
        this.syncMobileInput();
      }
      return;
    }
    
    // Handle Delete key - delete character at cursor
    if (event.key === 'Delete') {
      event.preventDefault();
      // Reset history index when user starts typing
      this.historyIndex = -1;
      this.tempCommand = '';
      if (this.cursorPosition < this.currentCommand.length) {
        this.currentCommand = this.currentCommand.slice(0, this.cursorPosition) + this.currentCommand.slice(this.cursorPosition + 1);
        this.updateCurrentLine();
        this.syncMobileInput();
      }
      return;
    }
    
    // Allow typing commands manually (single character keys only)
    if (isCharacterKey) {
      // If mobile input is focused and we're handling it here (physical keyboard),
      // prevent default to stop the input from also receiving the character
      if (this.mobileInput && document.activeElement === this.mobileInput.nativeElement) {
        event.preventDefault();
      }
      
      // Reset history index when user starts typing
      if (this.historyIndex !== -1) {
        this.historyIndex = -1;
        this.tempCommand = '';
      }
      // Insert character at cursor position
      this.currentCommand = this.currentCommand.slice(0, this.cursorPosition) + event.key + this.currentCommand.slice(this.cursorPosition);
      this.cursorPosition++;
      this.updateCurrentLine();
      this.syncMobileInput();
    }
  }
  
  navigateHistoryUp() {
    // If we're at the beginning of history, save current command
    if (this.historyIndex === -1) {
      this.tempCommand = this.currentCommand;
    }
    
    // Move up in history
    if (this.commandHistory.length > 0) {
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.currentCommand = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
        this.cursorPosition = this.currentCommand.length; // Move cursor to end
        this.updateCurrentLine();
        this.syncMobileInput();
      }
    }
  }
  
  navigateHistoryDown() {
    if (this.historyIndex > 0) {
      // Move down in history
      this.historyIndex--;
      this.currentCommand = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
      this.cursorPosition = this.currentCommand.length; // Move cursor to end
      this.updateCurrentLine();
      this.syncMobileInput();
    } else if (this.historyIndex === 0) {
      // Reached the bottom, restore the temporary command
      this.historyIndex = -1;
      this.currentCommand = this.tempCommand;
      this.cursorPosition = this.currentCommand.length; // Move cursor to end
      this.updateCurrentLine();
      this.tempCommand = '';
      this.syncMobileInput();
    }
  }
  
  addToHistory(command: string) {
    // Trim and check if command is not empty
    const trimmedCommand = command.trim();
    if (!trimmedCommand) {
      return;
    }
    
    // Remove the command if it already exists (to avoid duplicates)
    const existingIndex = this.commandHistory.indexOf(trimmedCommand);
    if (existingIndex !== -1) {
      this.commandHistory.splice(existingIndex, 1);
    }
    
    // Add to the end of history
    this.commandHistory.push(trimmedCommand);
    
    // Limit history size to prevent memory issues (keep last 100 commands)
    if (this.commandHistory.length > 100) {
      this.commandHistory.shift();
    }
  }
  
  exitTerminal() {
    // Reset terminal state completely
    this.resetTerminalState();
    
    // Show welcome message
    this.startTerminal();
    
    // Clear any pending navigation
    this.portfolioLoaded = false;
    this.waitingForInput = false;
    (this as any).pendingProfileKey = null;
  }

  startCursorBlink() {
    if (isPlatformBrowser(this.platformId)) {
      this.cursorInterval = setInterval(() => {
        this.showCursor = !this.showCursor;
      }, 530);
    }
  }

  startTerminal() {
    const welcomeMessages = [
      'Welcome to Portfolio Terminal v2.0',
      'Initializing system...',
      'Loading portfolio information...',
      ''
    ];

    let delay = 0;
    welcomeMessages.forEach((msg) => {
      setTimeout(() => {
        this.commands.push(msg);
        if (msg === '') {
          // Show prompt for user to type command
          this.currentLine = '$ ';
          // Focus appropriate element when ready for input
          // On actual mobile devices: focus mobile input
          // On desktop (including responsive): focus terminal container
          if (this.isMobile && this.mobileInput) {
            setTimeout(() => {
              if (this.mobileInput && !this.isTyping) {
                requestAnimationFrame(() => {
                  if (this.mobileInput) {
                    this.mobileInput.nativeElement.focus();
                    this.mobileInput.nativeElement.click();
                  }
                });
              }
            }, 100);
          } else {
            setTimeout(() => {
              if (this.mobileInput) {
                this.mobileInput.nativeElement.blur();
                // Make sure mobile input doesn't capture focus on desktop
                this.mobileInput.nativeElement.style.pointerEvents = 'none';
              }
              const terminalContainer = document.querySelector('.terminal-container');
              if (terminalContainer) {
                (terminalContainer as HTMLElement).focus();
                (terminalContainer as HTMLElement).tabIndex = 0;
              }
            }, 100);
          }
        }
      }, delay);
      delay += 200; // Reduced from 600ms to 200ms
    });
  }

  typeCommand(command: string) {
    this.isTyping = true;
    this.currentCommand = '';
    this.cursorPosition = 0;
    this.currentLine = '';
    let charIndex = 0;

    const typeChar = () => {
      if (charIndex < command.length) {
        this.currentCommand += command[charIndex];
        this.cursorPosition = this.currentCommand.length;
        this.updateCurrentLine();
        charIndex++;
        this.typingTimeout = setTimeout(typeChar, 50); // Reduced from 80ms to 50ms
      } else {
        this.isTyping = false;
        this.commands.push(`$ ${command}`);
        this.currentLine = '';
        this.currentCommand = '';
        this.cursorPosition = 0;
        // Auto-execute the command after a short delay instead of waiting for Enter
        setTimeout(() => {
          this.executeCommand(command);
        }, 300); // Auto-execute after 300ms
      }
    };

    typeChar();
  }

  executeCommand(command: string) {
    if (!command) return;
    
    // Add the command to history (use currentCommand if available, otherwise use command parameter)
    const cmdToExecute = this.currentCommand || command;
    
    // Add command to history (only unique commands)
    this.addToHistory(cmdToExecute);
    
    // Reset history index after executing command
    this.historyIndex = -1;
    this.tempCommand = '';
    
    // Don't add command again if it was already typed
    if (!this.currentCommand) {
      // Command was auto-typed, don't add duplicate
    } else {
      this.commands.push(`$ ${cmdToExecute}`);
    }
    
    this.currentLine = '';
    this.currentCommand = '';
    this.cursorPosition = 0;
    setTimeout(() => {
      // Check for portfolio navigation commands
      // Support format: name-type (e.g., sujit-dev, sujit-developer, mona-qa)
      // Also support old format: portfolio-name-type for backward compatibility
      const portfolioMatchNew = cmdToExecute.match(/^(\w+)-(developer|dev|qa)$/i);
      const portfolioMatchOld = cmdToExecute.match(/^portfolio-(\w+)-(developer|dev|qa)$/i);
      const portfolioMatch = portfolioMatchNew || portfolioMatchOld;
      
      if (portfolioMatch) {
        const name = portfolioMatch[1].toLowerCase();
        let type = portfolioMatch[2].toLowerCase();
        // Normalize "dev" to "developer"
        if (type === 'dev') {
          type = 'developer';
        }
        const profileKey = `${name}-${type}`;
        const portfolioType = type as 'developer' | 'qa';
        
        // Check if profile exists
        if (!this.portfolioService.hasProfile(profileKey)) {
          const availableProfiles = this.portfolioService.getAvailableProfiles();
          const availableCommands = availableProfiles.map(p => {
            const shortKey = p.key.replace('-developer', '-dev');
            return shortKey;
          }).join(', ');
          this.commands.push(`Error: Portfolio not found for ${name}-${type}`);
          this.commands.push(`Available profiles: ${availableCommands}`);
          this.commands.push('');
          this.currentLine = '$ ';
          return;
        }
        
        this.commands.push(`Loading ${type} portfolio for ${name}...`);
        this.isLoading = true;
        
        setTimeout(() => {
          const portfolioData = this.portfolioService.getPortfolioData(portfolioType, profileKey);
          
          // Store profile data in localStorage
          this.portfolioService.setActiveProfile(profileKey, portfolioData);
          
          this.commands.push(`✓ Portfolio data loaded successfully`);
          this.commands.push(`  Name: ${portfolioData.name}`);
          this.commands.push(`  Title: ${portfolioData.title}`);
          this.commands.push(`  Projects: ${portfolioData.portfolio.length}`);
          this.commands.push(`  Experience: ${portfolioData.workExperience.length} positions`);
          this.commands.push(`  Social Links: ${portfolioData.socialLinks.length}`);
        this.commands.push('');
        this.commands.push('Portfolio ready! Press Enter or tap Continue to navigate...');
        this.isLoading = false;
        this.portfolioLoaded = true;
        this.waitingForInput = true;
        this.currentLine = '$ ';
        
        // Store the profile key for navigation (will navigate to standard /portfolio route)
        (this as any).pendingProfileKey = profileKey;
        
        // Focus mobile input when waiting for input
        if (this.isMobile && this.mobileInput) {
          setTimeout(() => {
            if (this.mobileInput) {
              requestAnimationFrame(() => {
                if (this.mobileInput) {
                  this.mobileInput.nativeElement.focus();
                  this.mobileInput.nativeElement.click();
                }
              });
            }
          }, 100);
        }
        }, 800);
        return;
      }
      
      if (cmdToExecute === 'fetch-portfolio') {
        this.commands.push('Fetching portfolio data from server...');
        this.isLoading = true;

        // Simulate API call - reduced delay
        setTimeout(() => {
          // Default to sujit-developer for fetch-portfolio
          const defaultProfileKey = 'sujit-developer';
          const portfolioData = this.portfolioService.getPortfolioData('developer', defaultProfileKey);
          
          // Store profile data in localStorage
          this.portfolioService.setActiveProfile(defaultProfileKey, portfolioData);
          
          this.commands.push(`✓ Portfolio data loaded successfully`);
          this.commands.push(`  Name: ${portfolioData.name}`);
          this.commands.push(`  Title: ${portfolioData.title}`);
          this.commands.push(`  Projects: ${portfolioData.portfolio.length}`);
          this.commands.push(`  Experience: ${portfolioData.workExperience.length} positions`);
          this.commands.push(`  Social Links: ${portfolioData.socialLinks.length}`);
          this.commands.push('');
          this.commands.push('Portfolio ready! Press Enter or tap Continue to navigate...');
          this.isLoading = false;
          this.portfolioLoaded = true;
          this.waitingForInput = true;
          this.currentLine = '$ ';
          (this as any).pendingProfileKey = defaultProfileKey;
          
          // Focus mobile input when waiting for input
          if (this.isMobile && this.mobileInput) {
            setTimeout(() => {
              if (this.mobileInput) {
                this.mobileInput.nativeElement.focus();
              }
            }, 100);
          }
        }, 800); // Reduced from 1500ms to 800ms
      } else if (cmdToExecute === 'help') {
        const availableProfiles = this.portfolioService.getAvailableProfiles();
        this.commands.push('Available commands:');
        this.commands.push('  fetch-portfolio              - Load default portfolio data');
        availableProfiles.forEach(profile => {
          // Show simplified format (name-type)
          const shortKey = profile.key.replace('-developer', '-dev');
          this.commands.push(`  ${shortKey}                 - Load ${profile.name} ${profile.type} portfolio`);
        });
        this.commands.push('  help                        - Show this help message');
        this.commands.push('  clear                       - Clear terminal');
        this.commands.push('  exit                        - Exit terminal');
        this.commands.push('');
        this.currentLine = '$ ';
        // Focus mobile input after command execution
        if (this.isMobile && this.mobileInput && !this.waitingForInput) {
          setTimeout(() => {
            if (this.mobileInput && !this.waitingForInput) {
              requestAnimationFrame(() => {
                if (this.mobileInput) {
                  this.mobileInput.nativeElement.value = '';
                  this.mobileInput.nativeElement.focus();
                  this.mobileInput.nativeElement.click();
                }
              });
            }
          }, 100);
        }
      } else if (cmdToExecute === 'clear') {
        this.commands = [];
        this.currentLine = '$ ';
        this.currentCommand = '';
        this.cursorPosition = 0;
        // Focus mobile input after clear
        if (this.isMobile && this.mobileInput) {
          setTimeout(() => {
            if (this.mobileInput) {
              requestAnimationFrame(() => {
                if (this.mobileInput) {
                  this.mobileInput.nativeElement.value = '';
                  this.mobileInput.nativeElement.focus();
                  this.mobileInput.nativeElement.click();
                }
              });
            }
          }, 100);
        }
      } else if (cmdToExecute === 'exit') {
        this.exitTerminal();
      } else {
        this.commands.push(`Command not found: ${cmdToExecute}. Type 'help' for available commands.`);
        this.commands.push('');
        this.currentLine = '$ ';
        // Focus mobile input after command execution
        if (this.isMobile && this.mobileInput && !this.waitingForInput) {
          setTimeout(() => {
            if (this.mobileInput && !this.waitingForInput) {
              requestAnimationFrame(() => {
                if (this.mobileInput) {
                  this.mobileInput.nativeElement.value = '';
                  this.mobileInput.nativeElement.focus();
                  this.mobileInput.nativeElement.click();
                }
              });
            }
          }, 100);
        }
      }
    }, 50); // Reduced from 100ms to 50ms
  }

  handleContinue() {
    // Handle continue button - navigate to portfolio page
    if (this.portfolioLoaded && this.waitingForInput) {
      this.commands.push('Navigating to portfolio page...');
      this.waitingForInput = false;
      
      // Navigate to correct route based on profile type (data is already stored in localStorage)
      const profileKey = (this as any).pendingProfileKey || this.portfolioService.getActiveProfileKey();
      const route = profileKey?.includes('-qa') ? '/portfolio-qa' : '/portfolio-dev';
      
      setTimeout(() => {
        this.router.navigate([route]);
      }, 500);
    }
  }

  handleMobileSubmit() {
    // Handle mobile submit (equivalent to pressing Enter)
    if (this.portfolioLoaded && this.waitingForInput) {
      // Portfolio is loaded, navigate on button tap
      this.handleContinue();
    } else if (this.waitingForInput && !this.portfolioLoaded) {
      // Execute fetch-portfolio command
      this.waitingForInput = false;
      this.executeCommand('fetch-portfolio');
    } else if (!this.isTyping && !this.waitingForInput && this.currentCommand.trim()) {
      // Manual command entry
      this.executeCommand(this.currentCommand.trim());
      this.currentCommand = '';
      this.cursorPosition = 0;
      this.currentLine = '';
    }
  }
  
  onMobileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    
    // Only handle mobile input on mobile devices
    // On desktop, the window keydown handler will handle it
    if (!this.isMobile || document.activeElement !== input) {
      return;
    }
    
    // Check if the value matches what we already have (means it was synced by window handler)
    // This prevents duplicate processing when physical keyboard is used
    const selectionStart = input.selectionStart || 0;
    if (input.value === this.currentCommand && selectionStart === this.cursorPosition) {
      return;
    }
    
    this.currentCommand = input.value;
    this.cursorPosition = selectionStart;
    this.updateCurrentLine();
    // Reset history index when user starts typing
    if (this.historyIndex !== -1) {
      this.historyIndex = -1;
      this.tempCommand = '';
    }
  }
  
  onMobilePaste(event: ClipboardEvent) {
    // Enable paste functionality for both mobile and desktop
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    
    // Only process if we're not in typing animation or waiting state
    if (this.isTyping || this.waitingForInput) {
      return;
    }
    
    // Insert pasted text at cursor position
    const textToInsert = pastedText.trim();
    this.currentCommand = this.currentCommand.slice(0, this.cursorPosition) + textToInsert + this.currentCommand.slice(this.cursorPosition);
    this.cursorPosition += textToInsert.length;
    this.updateCurrentLine();
    
    // Sync with mobile input
    if (this.mobileInput) {
      this.mobileInput.nativeElement.value = this.currentCommand;
      setTimeout(() => {
        if (this.mobileInput) {
          this.mobileInput.nativeElement.setSelectionRange(this.cursorPosition, this.cursorPosition);
        }
      }, 0);
    }
    
    // Reset history index when pasting
    if (this.historyIndex !== -1) {
      this.historyIndex = -1;
      this.tempCommand = '';
    }
  }
  
  onDesktopPaste(event: ClipboardEvent) {
    // Handle paste on desktop (when terminal container is focused)
    if (this.isMobile) {
      return; // Let mobile input handle it
    }
    
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    
    // Only process if we're not in typing animation or waiting state
    if (this.isTyping || this.waitingForInput) {
      return;
    }
    
    // Insert pasted text at cursor position
    const textToInsert = pastedText.trim();
    this.currentCommand = this.currentCommand.slice(0, this.cursorPosition) + textToInsert + this.currentCommand.slice(this.cursorPosition);
    this.cursorPosition += textToInsert.length;
    this.updateCurrentLine();
    
    // Sync with mobile input (for consistency)
    if (this.mobileInput) {
      this.mobileInput.nativeElement.value = this.currentCommand;
      setTimeout(() => {
        if (this.mobileInput) {
          this.mobileInput.nativeElement.setSelectionRange(this.cursorPosition, this.cursorPosition);
        }
      }, 0);
    }
    
    // Reset history index when pasting
    if (this.historyIndex !== -1) {
      this.historyIndex = -1;
      this.tempCommand = '';
    }
  }
  
  onMobileKeyDown(event: KeyboardEvent) {
    // Only handle mobile input events on mobile devices
    // On desktop, let the window keydown handler manage it
    if (!this.isMobile) {
      return;
    }
    
    // Handle Ctrl+C / Cmd+C to exit FIRST (works regardless of state)
    if ((event.ctrlKey || event.metaKey) && (event.key === 'c' || event.key === 'C')) {
      event.preventDefault();
      this.exitTerminal();
      return;
    }
    
    // Handle Enter key
    if (event.key === 'Enter' || event.keyCode === 13) {
      event.preventDefault();
      if (this.currentCommand.trim()) {
        this.executeCommand(this.currentCommand.trim());
        this.currentCommand = '';
        this.cursorPosition = 0;
        this.currentLine = '';
        if (this.mobileInput) {
          this.mobileInput.nativeElement.value = '';
        }
      }
      return;
    }
    
    // Handle left arrow key to move cursor left
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (this.cursorPosition > 0) {
        this.cursorPosition--;
        this.updateCurrentLine();
        this.syncMobileInput();
      }
      return;
    }
    
    // Handle right arrow key to move cursor right
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (this.cursorPosition < this.currentCommand.length) {
        this.cursorPosition++;
        this.updateCurrentLine();
        this.syncMobileInput();
      }
      return;
    }
    
    // Handle backspace - delete character before cursor
    if (event.key === 'Backspace') {
      // Reset history index when user starts typing
      this.historyIndex = -1;
      this.tempCommand = '';
      if (this.cursorPosition > 0) {
        this.currentCommand = this.currentCommand.slice(0, this.cursorPosition - 1) + this.currentCommand.slice(this.cursorPosition);
        this.cursorPosition--;
        this.updateCurrentLine();
        this.syncMobileInput();
      }
      return;
    }
    
    // Handle Delete key - delete character at cursor
    if (event.key === 'Delete') {
      event.preventDefault();
      // Reset history index when user starts typing
      this.historyIndex = -1;
      this.tempCommand = '';
      if (this.cursorPosition < this.currentCommand.length) {
        this.currentCommand = this.currentCommand.slice(0, this.cursorPosition) + this.currentCommand.slice(this.cursorPosition + 1);
        this.updateCurrentLine();
        this.syncMobileInput();
      }
      return;
    }
    
    // Handle arrow keys for command history
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigateHistoryUp();
      return;
    }
    
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigateHistoryDown();
      return;
    }
  }
  
  onMobileInputBlur() {
    // Remove selection change listener when input loses focus
    if (this.selectionChangeListener && isPlatformBrowser(this.platformId)) {
      document.removeEventListener('selectionchange', this.selectionChangeListener);
      this.selectionChangeListener = undefined;
    }
    
    // Refocus on mobile when user taps away (to keep keyboard open)
    if (this.isMobile && !this.isTyping && !this.waitingForInput && this.mobileInput) {
      setTimeout(() => {
        if (this.mobileInput && !this.isTyping && !this.waitingForInput) {
          // Use requestAnimationFrame for better mobile compatibility
          requestAnimationFrame(() => {
            if (this.mobileInput) {
              this.mobileInput.nativeElement.focus();
            }
          });
        }
      }, 100);
    }
  }
  
  onMobileInputFocus() {
    // Ensure input is ready when focused on mobile
    if (this.isMobile && this.mobileInput) {
      this.mobileInput.nativeElement.style.pointerEvents = 'auto';
      // Add selection change listener for mobile cursor tracking
      if (isPlatformBrowser(this.platformId)) {
        this.selectionChangeListener = () => {
          if (this.mobileInput && document.activeElement === this.mobileInput.nativeElement) {
            this.updateCursorFromMobileInput();
          }
        };
        document.addEventListener('selectionchange', this.selectionChangeListener);
      }
    }
  }
  
  onMobileInputClick() {
    // Ensure input gets focus when clicked on mobile
    if (this.isMobile && this.mobileInput) {
      requestAnimationFrame(() => {
        if (this.mobileInput) {
          this.mobileInput.nativeElement.focus();
          // Update cursor position based on tap location
          // Use multiple attempts to catch cursor position after tap
          setTimeout(() => {
            this.updateCursorFromMobileInput();
          }, 0);
          setTimeout(() => {
            this.updateCursorFromMobileInput();
          }, 50);
        }
      });
    }
  }
  
  onMobileInputSelectionChange() {
    // Handle cursor position changes when user taps to move cursor
    if (this.isMobile && this.mobileInput) {
      // Use setTimeout to ensure selection is updated after the event
      setTimeout(() => {
        this.updateCursorFromMobileInput();
      }, 0);
    }
  }
  
  updateCursorFromMobileInput() {
    // Update cursor position from mobile input selection
    if (this.mobileInput) {
      const input = this.mobileInput.nativeElement;
      const selectionStart = input.selectionStart || 0;
      if (selectionStart !== this.cursorPosition) {
        this.cursorPosition = selectionStart;
        this.updateCurrentLine();
      }
    }
  }

  focusTerminal() {
    // Focus appropriate element when terminal is clicked
    // On actual mobile devices: focus mobile input
    // On desktop (including responsive view): focus terminal container
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (this.isMobile && this.mobileInput && !this.isTyping && !this.waitingForInput) {
          // On actual mobile devices, focus the mobile input
          requestAnimationFrame(() => {
            if (this.mobileInput) {
              this.mobileInput.nativeElement.focus();
              this.mobileInput.nativeElement.style.pointerEvents = 'auto';
              this.mobileInput.nativeElement.click();
            }
          });
        } else {
          // On desktop (including responsive view), focus the terminal container
          if (this.mobileInput) {
            this.mobileInput.nativeElement.blur();
            // Disable pointer events to prevent mobile input from capturing focus
            this.mobileInput.nativeElement.style.pointerEvents = 'none';
          }
          const terminalContainer = document.querySelector('.terminal-container');
          if (terminalContainer) {
            (terminalContainer as HTMLElement).focus();
            (terminalContainer as HTMLElement).tabIndex = 0;
          }
        }
      }, 50);
    }
  }
}
