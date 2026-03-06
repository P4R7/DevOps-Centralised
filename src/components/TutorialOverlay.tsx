import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

export interface TutorialStep {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom';
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  isActive: boolean;
  onClose: () => void;
}

export function TutorialOverlay({ steps, isActive, onClose }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0);
      setTargetRect(null);
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = '';

    let animationFrameId: number;
    const step = steps[currentStep];
    const el = document.getElementById(step.targetId);

    if (el) {
      const rect = el.getBoundingClientRect();
      const isPartiallyVisible = rect.top < window.innerHeight && rect.bottom > 0;
      const isFullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      
      // Only scroll if it's not fully visible, or if it's huge and the top isn't visible
      if (!isFullyVisible && !(rect.height > window.innerHeight && isPartiallyVisible && rect.top <= 0)) {
        if (rect.height > window.innerHeight * 0.8) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      const updateLoop = () => {
        setTargetRect(el.getBoundingClientRect());
        animationFrameId = requestAnimationFrame(updateLoop);
      };
      updateLoop();
    } else {
      setTargetRect(null);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, currentStep, steps]);

  if (!isActive) return null;

  const step = steps[currentStep];

  let tooltipTop = 0;
  let tooltipLeft = 0;
  let transform = 'none';

  if (targetRect) {
    tooltipLeft = targetRect.left;
    if (tooltipLeft + 320 > window.innerWidth) {
      tooltipLeft = window.innerWidth - 340;
    }
    if (tooltipLeft < 20) tooltipLeft = 20;

    const estimatedHeight = 300;
    let position = step.position || 'bottom';

    // Auto-adjust position if it goes off-screen
    if (position === 'bottom' && targetRect.bottom + 20 + estimatedHeight > window.innerHeight) {
      position = 'top';
    } else if (position === 'top' && targetRect.top - 20 - estimatedHeight < 0) {
      position = 'bottom';
    }

    if (position === 'top') {
      tooltipTop = targetRect.top - 20;
      transform = 'translateY(-100%)';
      // Keep within viewport
      if (tooltipTop - estimatedHeight < 20) {
        // Put it at the bottom of the viewport to avoid covering the header
        tooltipTop = window.innerHeight - 20;
        transform = 'translateY(-100%)';
      }
    } else {
      tooltipTop = targetRect.bottom + 20;
      transform = 'none';
      // Keep within viewport
      if (tooltipTop + estimatedHeight > window.innerHeight - 20) {
        // Put it at the bottom of the viewport
        tooltipTop = window.innerHeight - estimatedHeight - 20;
      }
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'auto' }}>
      {targetRect && (
        <div 
          style={{
            position: 'absolute',
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            borderRadius: '8px',
            transition: 'all 0.3s ease-in-out',
            pointerEvents: 'none',
          }}
        />
      )}

      {targetRect && (
        <div 
          className="card"
          style={{
            position: 'absolute',
            top: tooltipTop,
            left: tooltipLeft,
            transform: transform,
            width: '320px',
            transition: 'all 0.3s ease-in-out',
            opacity: 1,
            zIndex: 10000,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <header className="hstack" style={{ justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-2)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>{step.title}</h3>
            <button onClick={onClose} className="ghost" style={{ padding: '0.25rem', margin: 0 }}>
              <X size={16} />
            </button>
          </header>
          <div style={{ padding: '1rem', fontSize: '0.875rem', backgroundColor: 'var(--bg-1)', color: 'var(--text)', maxHeight: '150px', overflowY: 'auto' }}>
            {step.content}
          </div>
          <footer className="hstack" style={{ justifyContent: 'space-between', padding: '1rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-2)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Step {currentStep + 1} of {steps.length}
            </span>
            <div className="hstack" style={{ gap: '0.5rem' }}>
              <button 
                className="small outline" 
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              {currentStep < steps.length - 1 ? (
                <button 
                  className="small" 
                  onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  Next <ChevronRight size={14} />
                </button>
              ) : (
                <button 
                  className="small" 
                  onClick={onClose}
                  style={{ backgroundColor: 'var(--success)', color: 'var(--primary-foreground)' }}
                >
                  Finish
                </button>
              )}
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
