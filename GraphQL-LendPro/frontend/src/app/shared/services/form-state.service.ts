import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FormState {
  id: string;
  data: any;
  currentStep?: number;
  totalSteps?: number;
  lastSaved: Date;
  isComplete: boolean;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class FormStateService {
  private readonly STORAGE_KEY = 'rocket-form-states';
  private formsSubject = new BehaviorSubject<FormState[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  get forms$(): Observable<FormState[]> {
    return this.formsSubject.asObservable();
  }

  saveFormState(formId: string, data: any, options?: {
    currentStep?: number;
    totalSteps?: number;
    metadata?: any;
  }): void {
    const currentStates = this.formsSubject.value;
    const existingIndex = currentStates.findIndex(state => state.id === formId);
    
    const formState: FormState = {
      id: formId,
      data: { ...data },
      currentStep: options?.currentStep,
      totalSteps: options?.totalSteps,
      lastSaved: new Date(),
      isComplete: false,
      metadata: options?.metadata
    };

    let updatedStates: FormState[];
    if (existingIndex >= 0) {
      updatedStates = [...currentStates];
      updatedStates[existingIndex] = formState;
    } else {
      updatedStates = [...currentStates, formState];
    }

    this.formsSubject.next(updatedStates);
    this.saveToStorage();
  }

  getFormState(formId: string): FormState | null {
    const states = this.formsSubject.value;
    return states.find(state => state.id === formId) || null;
  }

  hasFormState(formId: string): boolean {
    return this.getFormState(formId) !== null;
  }

  markFormComplete(formId: string): void {
    const currentStates = this.formsSubject.value;
    const stateIndex = currentStates.findIndex(state => state.id === formId);
    
    if (stateIndex >= 0) {
      const updatedStates = [...currentStates];
      updatedStates[stateIndex] = {
        ...updatedStates[stateIndex],
        isComplete: true,
        lastSaved: new Date()
      };
      
      this.formsSubject.next(updatedStates);
      this.saveToStorage();
    }
  }

  deleteFormState(formId: string): void {
    const currentStates = this.formsSubject.value;
    const updatedStates = currentStates.filter(state => state.id !== formId);
    
    this.formsSubject.next(updatedStates);
    this.saveToStorage();
  }

  clearAllFormStates(): void {
    this.formsSubject.next([]);
    this.clearStorage();
  }

  getSavedForms(): FormState[] {
    return this.formsSubject.value.filter(state => !state.isComplete);
  }

  getCompletedForms(): FormState[] {
    return this.formsSubject.value.filter(state => state.isComplete);
  }

  getFormProgress(formId: string): number {
    const state = this.getFormState(formId);
    if (!state || !state.totalSteps) return 0;
    
    const currentStep = state.currentStep || 0;
    return Math.round((currentStep / state.totalSteps) * 100);
  }

  autoSaveFormData(formId: string, formData: any, interval: number = 30000): () => void {
    const saveInterval = setInterval(() => {
      if (formData && Object.keys(formData).length > 0) {
        this.saveFormState(formId, formData);
      }
    }, interval);

    // Return cleanup function
    return () => clearInterval(saveInterval);
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const states: FormState[] = JSON.parse(stored).map((state: any) => ({
          ...state,
          lastSaved: new Date(state.lastSaved)
        }));
        this.formsSubject.next(states);
      }
    } catch (error) {
      console.error('Error loading form states from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const states = this.formsSubject.value;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(states));
    } catch (error) {
      console.error('Error saving form states to storage:', error);
    }
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing form states from storage:', error);
    }
  }
}