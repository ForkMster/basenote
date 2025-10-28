import { useState } from 'react';

export type TransactionStep = {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  message?: string;
};

export function useTransactions() {
  const [steps, setSteps] = useState<TransactionStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize transaction steps
  const initTransaction = (transactionSteps: Omit<TransactionStep, 'status'>[]) => {
    const initializedSteps = transactionSteps.map(step => ({
      ...step,
      status: 'pending' as const
    }));
    
    setSteps(initializedSteps);
    setCurrentStep(0);
    setIsComplete(false);
    setError(null);
    
    return initializedSteps;
  };

  // Start a step
  const startStep = (stepIndex: number) => {
    setSteps(prev => {
      const newSteps = [...prev];
      if (newSteps[stepIndex]) {
        newSteps[stepIndex] = {
          ...newSteps[stepIndex],
          status: 'processing'
        };
      }
      return newSteps;
    });
    
    setCurrentStep(stepIndex);
  };

  // Complete a step and move to the next one
  const completeStep = (stepIndex: number, message?: string) => {
    setSteps(prev => {
      const newSteps = [...prev];
      if (newSteps[stepIndex]) {
        newSteps[stepIndex] = {
          ...newSteps[stepIndex],
          status: 'success',
          message
        };
      }
      return newSteps;
    });
    
    // Move to next step if available
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  // Set a step to error state
  const errorStep = (stepIndex: number, errorMessage: string) => {
    setSteps(prev => {
      const newSteps = [...prev];
      if (newSteps[stepIndex]) {
        newSteps[stepIndex] = {
          ...newSteps[stepIndex],
          status: 'error',
          message: errorMessage
        };
      }
      return newSteps;
    });
    
    setError(errorMessage);
  };

  // Reset the transaction
  const resetTransaction = () => {
    setSteps([]);
    setCurrentStep(0);
    setIsComplete(false);
    setError(null);
  };

  return {
    steps,
    currentStep,
    isComplete,
    error,
    initTransaction,
    startStep,
    completeStep,
    errorStep,
    resetTransaction
  };
}