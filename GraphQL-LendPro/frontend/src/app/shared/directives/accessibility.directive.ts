import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appA11y]',
  standalone: true
})
export class AccessibilityDirective implements OnInit, OnDestroy {
  @Input() appA11y: 'button' | 'link' | 'form-field' | 'navigation' | 'landmark' | 'custom' = 'custom';
  @Input() ariaLabel: string = '';
  @Input() ariaDescription: string = '';
  @Input() skipLink: boolean = false;
  @Input() focusTrap: boolean = false;
  @Input() announceChanges: boolean = false;

  private focusableElements: HTMLElement[] = [];
  private firstFocusable: HTMLElement | null = null;
  private lastFocusable: HTMLElement | null = null;
  private announceElement: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.setupAccessibility();
  }

  ngOnDestroy() {
    if (this.announceElement) {
      document.body.removeChild(this.announceElement);
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.focusTrap) {
      this.handleFocusTrap(event);
    }

    // Handle common keyboard interactions
    switch (event.key) {
      case 'Enter':
      case ' ':
        if (this.appA11y === 'button' && !this.el.nativeElement.disabled) {
          event.preventDefault();
          this.el.nativeElement.click();
        }
        break;

      case 'Escape':
        if (this.appA11y === 'form-field' || this.appA11y === 'navigation') {
          this.handleEscape();
        }
        break;
    }
  }

  @HostListener('focus')
  onFocus() {
    if (this.skipLink) {
      this.showSkipLink();
    }
  }

  @HostListener('blur')
  onBlur() {
    if (this.skipLink) {
      this.hideSkipLink();
    }
  }

  private setupAccessibility() {
    const element = this.el.nativeElement;

    switch (this.appA11y) {
      case 'button':
        this.setupButton();
        break;
      case 'link':
        this.setupLink();
        break;
      case 'form-field':
        this.setupFormField();
        break;
      case 'navigation':
        this.setupNavigation();
        break;
      case 'landmark':
        this.setupLandmark();
        break;
    }

    // Common accessibility attributes
    if (this.ariaLabel) {
      this.renderer.setAttribute(element, 'aria-label', this.ariaLabel);
    }

    if (this.ariaDescription) {
      const descId = this.generateId('desc');
      const descElement = this.renderer.createElement('span');
      this.renderer.setAttribute(descElement, 'id', descId);
      this.renderer.setAttribute(descElement, 'class', 'sr-only');
      this.renderer.setProperty(descElement, 'textContent', this.ariaDescription);
      this.renderer.appendChild(document.body, descElement);
      this.renderer.setAttribute(element, 'aria-describedby', descId);
    }

    if (this.focusTrap) {
      this.setupFocusTrap();
    }

    if (this.announceChanges) {
      this.setupAnnouncements();
    }
  }

  private setupButton() {
    const element = this.el.nativeElement;
    
    if (!element.hasAttribute('role')) {
      this.renderer.setAttribute(element, 'role', 'button');
    }
    
    if (!element.hasAttribute('tabindex')) {
      this.renderer.setAttribute(element, 'tabindex', '0');
    }

    // Ensure proper cursor
    this.renderer.setStyle(element, 'cursor', 'pointer');
  }

  private setupLink() {
    const element = this.el.nativeElement;
    
    if (!element.hasAttribute('tabindex')) {
      this.renderer.setAttribute(element, 'tabindex', '0');
    }

    // Add focus indicators
    this.addFocusStyles(element);
  }

  private setupFormField() {
    const element = this.el.nativeElement;
    
    // Find associated label
    const label = element.previousElementSibling;
    if (label && label.tagName === 'LABEL') {
      const fieldId = element.id || this.generateId('field');
      if (!element.id) {
        this.renderer.setAttribute(element, 'id', fieldId);
      }
      this.renderer.setAttribute(label, 'for', fieldId);
    }

    // Add required indicator
    if (element.hasAttribute('required') && !element.hasAttribute('aria-required')) {
      this.renderer.setAttribute(element, 'aria-required', 'true');
    }
  }

  private setupNavigation() {
    const element = this.el.nativeElement;
    
    if (!element.hasAttribute('role')) {
      this.renderer.setAttribute(element, 'role', 'navigation');
    }

    // Add keyboard navigation
    this.setupKeyboardNavigation();
  }

  private setupLandmark() {
    const element = this.el.nativeElement;
    
    const landmarks = {
      'main': 'main',
      'nav': 'navigation',
      'aside': 'complementary',
      'header': 'banner',
      'footer': 'contentinfo',
      'section': 'region'
    };

    const tagName = element.tagName.toLowerCase();
    const role = landmarks[tagName as keyof typeof landmarks];
    
    if (role && !element.hasAttribute('role')) {
      this.renderer.setAttribute(element, 'role', role);
    }
  }

  private setupFocusTrap() {
    this.updateFocusableElements();
    
    if (this.focusableElements.length > 0) {
      this.firstFocusable = this.focusableElements[0];
      this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
    }
  }

  private setupKeyboardNavigation() {
    const element = this.el.nativeElement;
    const items = element.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    
    items.forEach((item: HTMLElement, index: number) => {
      this.renderer.listen(item, 'keydown', (event: KeyboardEvent) => {
        switch (event.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            event.preventDefault();
            const nextIndex = (index + 1) % items.length;
            (items[nextIndex] as HTMLElement).focus();
            break;

          case 'ArrowUp':
          case 'ArrowLeft':
            event.preventDefault();
            const prevIndex = (index - 1 + items.length) % items.length;
            (items[prevIndex] as HTMLElement).focus();
            break;

          case 'Home':
            event.preventDefault();
            (items[0] as HTMLElement).focus();
            break;

          case 'End':
            event.preventDefault();
            (items[items.length - 1] as HTMLElement).focus();
            break;
        }
      });
    });
  }

  private setupAnnouncements() {
    if (!this.announceElement) {
      this.announceElement = this.renderer.createElement('div');
      this.renderer.setAttribute(this.announceElement, 'aria-live', 'polite');
      this.renderer.setAttribute(this.announceElement, 'aria-atomic', 'true');
      this.renderer.addClass(this.announceElement, 'sr-only');
      this.renderer.appendChild(document.body, this.announceElement);
    }
  }

  private handleFocusTrap(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusable) {
        event.preventDefault();
        this.lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusable) {
        event.preventDefault();
        this.firstFocusable?.focus();
      }
    }
  }

  private handleEscape() {
    // Custom escape handling - emit event or call method
    const element = this.el.nativeElement;
    if (element.close && typeof element.close === 'function') {
      element.close();
    } else {
      // Dispatch custom event
      const escapeEvent = new CustomEvent('escape', { bubbles: true });
      element.dispatchEvent(escapeEvent);
    }
  }

  private showSkipLink() {
    const element = this.el.nativeElement;
    this.renderer.setStyle(element, 'position', 'absolute');
    this.renderer.setStyle(element, 'top', '0');
    this.renderer.setStyle(element, 'left', '0');
    this.renderer.setStyle(element, 'z-index', '9999');
    this.renderer.setStyle(element, 'background', 'white');
    this.renderer.setStyle(element, 'padding', '8px');
    this.renderer.setStyle(element, 'border', '2px solid #0066cc');
  }

  private hideSkipLink() {
    const element = this.el.nativeElement;
    this.renderer.setStyle(element, 'position', 'absolute');
    this.renderer.setStyle(element, 'left', '-9999px');
    this.renderer.setStyle(element, 'top', 'auto');
    this.renderer.setStyle(element, 'width', '1px');
    this.renderer.setStyle(element, 'height', '1px');
    this.renderer.setStyle(element, 'overflow', 'hidden');
  }

  private updateFocusableElements() {
    const element = this.el.nativeElement;
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    this.focusableElements = Array.from(element.querySelectorAll(focusableSelectors));
  }

  private addFocusStyles(element: HTMLElement) {
    this.renderer.setStyle(element, 'outline', 'none');
    
    this.renderer.listen(element, 'focus', () => {
      this.renderer.setStyle(element, 'box-shadow', '0 0 0 3px rgba(102, 126, 234, 0.3)');
    });

    this.renderer.listen(element, 'blur', () => {
      this.renderer.removeStyle(element, 'box-shadow');
    });
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for programmatic announcements
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (this.announceElement) {
      this.renderer.setAttribute(this.announceElement, 'aria-live', priority);
      this.renderer.setProperty(this.announceElement, 'textContent', message);
      
      // Clear after announcement
      setTimeout(() => {
        this.renderer.setProperty(this.announceElement, 'textContent', '');
      }, 1000);
    }
  }
}

// Screen reader only class (should be added to global styles)
export const screenReaderOnlyStyles = `
  .sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  .sr-only-focusable:active,
  .sr-only-focusable:focus {
    position: static !important;
    width: auto !important;
    height: auto !important;
    padding: inherit !important;
    margin: inherit !important;
    overflow: visible !important;
    clip: auto !important;
    white-space: inherit !important;
  }
`;