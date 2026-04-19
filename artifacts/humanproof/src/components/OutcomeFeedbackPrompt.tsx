import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { recordOutcome } from '../../services/swarm/swarmLearningStore';

interface Props {
  companyRoleKey: string;
  predictionDate: string;
}

export const OutcomeFeedbackPrompt: React.FC<Props> = ({ companyRoleKey, predictionDate }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // We ask if the predicted layoff risk materialized
  const handleFeedback = (materialized: boolean) => {
    // 0 = false alarm / safe, 100 = layoff occurred
    const rawOutcome = materialized ? 100 : 0;
    recordOutcome(companyRoleKey, rawOutcome);
    setSubmitted(true);
    setTimeout(() => setIsVisible(false), 3000);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed bottom-6 right-6 z-50 w-full max-w-sm bg-neutral-900 border border-neutral-700/50 rounded-xl shadow-2xl p-4 overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-blue-500/5 rounded-xl pointer-events-none" />

        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-3 text-emerald-400 font-medium py-2"
          >
            <CheckCircle className="w-5 h-5" />
            <p>Thank you. AI model weights updated.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start space-x-3 pr-6">
              <div className="p-2 bg-blue-500/10 rounded-lg shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Help Improve the AI</h4>
                <p className="text-xs text-neutral-400 leading-snug">
                  You checked this role on {new Date(predictionDate).toLocaleDateString()}. 
                  To help train our Swarm Intelligence layer, did a layoff occur?
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleFeedback(true)}
                className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors border border-red-500/20 text-xs font-medium"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Yes, Layoff Occurred</span>
              </button>
              
              <button
                onClick={() => handleFeedback(false)}
                className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-500/20 text-xs font-medium"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>No, Role is Safe</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
