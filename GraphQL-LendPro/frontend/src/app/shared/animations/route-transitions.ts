import { trigger, transition, style, animate, query, group } from '@angular/animations';

export const slideInAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], { optional: true }),
    
    query(':enter', [
      style({ transform: 'translateX(100%)', opacity: 0 })
    ], { optional: true }),
    
    group([
      query(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ], { optional: true }),
      
      query(':enter', [
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ], { optional: true })
    ])
  ])
]);

export const fadeInAnimation = trigger('fadeRouteAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], { optional: true }),
    
    query(':enter', [
      style({ opacity: 0 })
    ], { optional: true }),
    
    group([
      query(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ], { optional: true }),
      
      query(':enter', [
        animate('300ms ease-out', style({ opacity: 1 }))
      ], { optional: true })
    ])
  ])
]);

export const scaleInAnimation = trigger('scaleRouteAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], { optional: true }),
    
    query(':enter', [
      style({ transform: 'scale(0.8)', opacity: 0 })
    ], { optional: true }),
    
    group([
      query(':leave', [
        animate('200ms ease-in', style({ transform: 'scale(1.1)', opacity: 0 }))
      ], { optional: true }),
      
      query(':enter', [
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ], { optional: true })
    ])
  ])
]);

// Individual component animations
export const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(30px)' }),
    animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

export const slideInLeft = trigger('slideInLeft', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(-30px)' }),
    animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
  ])
]);

export const slideInRight = trigger('slideInRight', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(30px)' }),
    animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
  ])
]);

export const bounceIn = trigger('bounceIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.3)' }),
    animate('300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', style({ opacity: 1, transform: 'scale(1)' }))
  ])
]);

export const staggerChildren = trigger('staggerChildren', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('{{delay}}ms {{duration}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ], { optional: true })
  ])
]);