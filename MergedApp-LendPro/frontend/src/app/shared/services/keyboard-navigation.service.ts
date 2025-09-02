import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  description: string;
  action: () => void;
}

export interface NavigationConfig {
  enableGlobalShortcuts: boolean;
  enableFocusTrapping: boolean;
  enableSkipLinks: boolean;
  customShortcuts: KeyboardShortcut[];
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardNavigationService {
  private shortcuts: KeyboardShortcut[] = [];
  private focusHistory: HTMLElement[] = [];
  private currentFocusIndex = -1;
  private keyboardEvent$ = new Subject<KeyboardEvent>();

  private defaultConfig: NavigationConfig = {
    enableGlobalShortcuts: true,
    enableFocusTrapping: true,
    enableSkipLinks: true,
    customShortcuts: []
  };

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    // Listen for keyboard events
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Setup default shortcuts
    this.setupDefaultShortcuts();
    
    // Track focus changes
    document.addEventListener('focusin', this.trackFocus.bind(this));
  }

  registerShortcut(shortcut: KeyboardShortcut): void {
    this.shortcuts.push(shortcut);
  }

  unregisterShortcut(key: string): void {
    this.shortcuts = this.shortcuts.filter(s => s.key !== key);
  }

  // Focus management
  focusNext(): void {
    const focusable = this.getFocusableElements();
    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
    const nextIndex = (currentIndex + 1) % focusable.length;
    focusable[nextIndex]?.focus();
  }

  focusPrevious(): void {
    const focusable = this.getFocusableElements();
    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
    const prevIndex = (currentIndex - 1 + focusable.length) % focusable.length;
    focusable[prevIndex]?.focus();
  }

  focusFirst(): void {
    const focusable = this.getFocusableElements();
    focusable[0]?.focus();
  }

  focusLast(): void {
    const focusable = this.getFocusableElements();
    focusable[focusable.length - 1]?.focus();
  }

  // Skip links
  addSkipLink(target: string, label: string): void {
    const skipLink = document.createElement('a');
    skipLink.href = `#${target}`;
    skipLink.textContent = label;
    skipLink.className = 'skip-link sr-only-focusable';
    skipLink.style.cssText = `
      position: absolute;
      left: -9999px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
      z-index: 999999;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.cssText = `
        position: absolute;
        left: 6px;
        top: 6px;
        width: auto;
        height: auto;
        padding: 8px 12px;
        background: white;
        color: #0066cc;
        text-decoration: none;
        border: 2px solid #0066cc;
        border-radius: 4px;
        font-weight: bold;
        z-index: 999999;
      `;
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.cssText = `
        position: absolute;
        left: -9999px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
        z-index: 999999;
      `;
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Focus trapping for modals/dialogs
  trapFocus(element: HTMLElement): () => void {
    const focusable = this.getFocusableElements(element);
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    element.addEventListener('keydown', handleKeydown);
    
    // Focus first element
    firstFocusable?.focus();

    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleKeydown);
    };
  }

  // Roving tabindex for grouped controls
  setupRovingTabindex(container: HTMLElement, items: HTMLElement[]): void {
    let currentIndex = 0;

    // Set initial tabindex
    items.forEach((item, index) => {
      item.tabIndex = index === currentIndex ? 0 : -1;
    });

    const handleKeydown = (event: KeyboardEvent) => {
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          newIndex = (currentIndex + 1) % items.length;
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          newIndex = (currentIndex - 1 + items.length) % items.length;
          break;

        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;

        case 'End':
          event.preventDefault();
          newIndex = items.length - 1;
          break;

        default:
          return;
      }

      // Update tabindex
      items[currentIndex].tabIndex = -1;
      items[newIndex].tabIndex = 0;
      items[newIndex].focus();
      currentIndex = newIndex;
    };

    items.forEach(item => {
      item.addEventListener('keydown', handleKeydown);
      item.addEventListener('focus', () => {
        const index = items.indexOf(item);
        if (index !== -1) {
          items[currentIndex].tabIndex = -1;
          items[index].tabIndex = 0;
          currentIndex = index;
        }
      });
    });
  }

  // Accessible dropdown/menu navigation
  setupMenuNavigation(trigger: HTMLElement, menu: HTMLElement): void {
    const menuItems = this.getFocusableElements(menu);
    let currentIndex = -1;

    const handleTriggerKeydown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'Enter':
        case ' ':
          event.preventDefault();
          this.showMenu(menu);
          menuItems[0]?.focus();
          currentIndex = 0;
          break;
      }
    };

    const handleMenuKeydown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          currentIndex = (currentIndex + 1) % menuItems.length;
          menuItems[currentIndex]?.focus();
          break;

        case 'ArrowUp':
          event.preventDefault();
          currentIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
          menuItems[currentIndex]?.focus();
          break;

        case 'Home':
          event.preventDefault();
          currentIndex = 0;
          menuItems[currentIndex]?.focus();
          break;

        case 'End':
          event.preventDefault();
          currentIndex = menuItems.length - 1;
          menuItems[currentIndex]?.focus();
          break;

        case 'Escape':
          event.preventDefault();
          this.hideMenu(menu);
          trigger.focus();
          break;

        case 'Tab':
          this.hideMenu(menu);
          break;
      }
    };

    trigger.addEventListener('keydown', handleTriggerKeydown);
    menu.addEventListener('keydown', handleMenuKeydown);

    // Close menu on outside click
    document.addEventListener('click', (event) => {
      if (!trigger.contains(event.target as Node) && !menu.contains(event.target as Node)) {
        this.hideMenu(menu);
      }
    });
  }

  private handleKeydown(event: KeyboardEvent): void {
    // Check for registered shortcuts
    for (const shortcut of this.shortcuts) {
      if (this.matchesShortcut(event, shortcut)) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }

    // Handle global navigation
    if (event.altKey && !event.ctrlKey && !event.shiftKey) {
      switch (event.key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          event.preventDefault();
          this.focusHeading(parseInt(event.key));
          break;
      }
    }
  }

  private setupDefaultShortcuts(): void {
    this.shortcuts.push(
      {
        key: '/',
        description: 'Focus search',
        action: () => this.focusSearch()
      },
      {
        key: 'h',
        altKey: true,
        description: 'Go to homepage',
        action: () => window.location.href = '/'
      },
      {
        key: 'm',
        altKey: true,
        description: 'Focus main content',
        action: () => this.focusMain()
      }
    );
  }

  private matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    return event.key.toLowerCase() === shortcut.key.toLowerCase() &&
           !!event.ctrlKey === !!shortcut.ctrlKey &&
           !!event.altKey === !!shortcut.altKey &&
           !!event.shiftKey === !!shortcut.shiftKey;
  }

  private getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors));
  }

  private trackFocus(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    if (target && this.focusHistory[this.focusHistory.length - 1] !== target) {
      this.focusHistory.push(target);
      this.currentFocusIndex = this.focusHistory.length - 1;
    }
  }

  private focusSearch(): void {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLElement;
    searchInput?.focus();
  }

  private focusMain(): void {
    const main = document.querySelector('main, [role="main"]') as HTMLElement;
    if (main) {
      main.tabIndex = -1;
      main.focus();
    }
  }

  private focusHeading(level: number): void {
    const heading = document.querySelector(`h${level}`) as HTMLElement;
    if (heading) {
      heading.tabIndex = -1;
      heading.focus();
    }
  }

  private showMenu(menu: HTMLElement): void {
    menu.style.display = 'block';
    menu.setAttribute('aria-expanded', 'true');
  }

  private hideMenu(menu: HTMLElement): void {
    menu.style.display = 'none';
    menu.setAttribute('aria-expanded', 'false');
  }

  // Get keyboard shortcuts help
  getShortcutsHelp(): KeyboardShortcut[] {
    return [...this.shortcuts];
  }
}