import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type FormStep = 'calendar' | 'form' | 'assessment' | 'completed';

interface AnalyticsSession {
  id: string | null;
  sessionId: string;
  currentStep: FormStep;
  stepStartedAt: Date;
  fieldsCompleted: Set<string>;
}

export const useFormAnalytics = () => {
  const session = useRef<AnalyticsSession>({
    id: null,
    sessionId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    currentStep: 'calendar',
    stepStartedAt: new Date(),
    fieldsCompleted: new Set(),
  });

  const partialData = useRef<{ email?: string; name?: string }>({});

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data, error } = await supabase
          .from('form_analytics')
          .insert({
            session_id: session.current.sessionId,
            current_step: session.current.currentStep,
            step_started_at: session.current.stepStartedAt.toISOString(),
          })
          .select('id')
          .single();

        if (data && !error) {
          session.current.id = data.id;
        }
      } catch (e) {
        console.error('Failed to init analytics session:', e);
      }
    };

    initSession();

    // Mark as abandoned on page unload
    const handleBeforeUnload = () => {
      if (session.current.id && session.current.currentStep !== 'completed') {
        // Use sendBeacon for reliable delivery on page close
        const payload = JSON.stringify({
          abandoned: true,
          time_on_step_seconds: Math.floor(
            (Date.now() - session.current.stepStartedAt.getTime()) / 1000
          ),
        });
        
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/form_analytics?id=eq.${session.current.id}`,
          new Blob([payload], { type: 'application/json' })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Track step changes
  const trackStep = useCallback(async (step: FormStep) => {
    if (!session.current.id || session.current.currentStep === step) return;

    const timeOnPreviousStep = Math.floor(
      (Date.now() - session.current.stepStartedAt.getTime()) / 1000
    );

    session.current.currentStep = step;
    session.current.stepStartedAt = new Date();
    session.current.fieldsCompleted = new Set();

    try {
      await supabase
        .from('form_analytics')
        .update({
          current_step: step,
          step_started_at: session.current.stepStartedAt.toISOString(),
          time_on_step_seconds: timeOnPreviousStep,
          fields_completed: [],
          completed: step === 'completed',
          abandoned: false,
          partial_email: partialData.current.email || null,
          partial_name: partialData.current.name || null,
        })
        .eq('id', session.current.id);
    } catch (e) {
      console.error('Failed to track step:', e);
    }
  }, []);

  // Track field interactions
  const trackFieldBlur = useCallback(async (fieldName: string, hasValue: boolean) => {
    if (!session.current.id) return;

    if (hasValue) {
      session.current.fieldsCompleted.add(fieldName);
    }

    try {
      await supabase
        .from('form_analytics')
        .update({
          last_field_focused: fieldName,
          fields_completed: Array.from(session.current.fieldsCompleted),
        })
        .eq('id', session.current.id);
    } catch (e) {
      console.error('Failed to track field:', e);
    }
  }, []);

  // Track partial data for potential follow-up
  const trackPartialData = useCallback((field: 'email' | 'name', value: string) => {
    partialData.current[field] = value;
  }, []);

  // Track assessment question progress
  const trackAssessmentQuestion = useCallback(async (questionNumber: number) => {
    if (!session.current.id) return;

    try {
      await supabase
        .from('form_analytics')
        .update({
          assessment_question_number: questionNumber,
        })
        .eq('id', session.current.id);
    } catch (e) {
      console.error('Failed to track question:', e);
    }
  }, []);

  // Mark session as completed
  const trackComplete = useCallback(async () => {
    if (!session.current.id) return;

    try {
      await supabase
        .from('form_analytics')
        .update({
          current_step: 'completed',
          completed: true,
          abandoned: false,
          time_on_step_seconds: Math.floor(
            (Date.now() - session.current.stepStartedAt.getTime()) / 1000
          ),
        })
        .eq('id', session.current.id);
    } catch (e) {
      console.error('Failed to track completion:', e);
    }
  }, []);

  return {
    trackStep,
    trackFieldBlur,
    trackPartialData,
    trackAssessmentQuestion,
    trackComplete,
  };
};
