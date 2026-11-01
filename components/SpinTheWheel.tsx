import React, { useState } from 'react';
import { X, Gift } from 'lucide-react';

interface SpinTheWheelProps {
  onClose: () => void;
  onApplyCode: (code: string, discount: number) => void;
}

const SpinTheWheel: React.FC<SpinTheWheelProps> = ({ onClose, onApplyCode }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ code: string; discount: number; label: string } | null>(null);

  const coupons = [
    { code: 'SPIN5', discount: 0.05, label: '5% OFF' },
    { code: 'SPIN10', discount: 0.10, label: '10% OFF' },
    { code: 'SPIN15', discount: 0.15, label: '15% OFF' },
    { code: 'SPIN25', discount: 0.25, label: '25% OFF' },
  ];

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * coupons.length);
      setResult(coupons[randomIndex]);
      setSpinning(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl shadow-emerald-500/20">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="w-6 h-6" /></button>
        
        <Gift className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-white mb-2">Spin & Win!</h2>
        <p className="text-zinc-400 mb-8">Get up to 25% off your order.</p>

        {!result ? (
          <button 
            onClick={spin} 
            disabled={spinning}
            className={`w-full py-4 rounded-xl font-black text-lg transition-all ${spinning ? 'bg-zinc-700' : 'bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-105'}`}
          >
            {spinning ? 'Spinning...' : 'SPIN THE WHEEL'}
          </button>
        ) : (
          <div className="space-y-6">
            <div className="text-4xl font-black text-emerald-400">{result.label}</div>
            <p className="text-zinc-300">Use code: <span className="font-mono font-bold text-white bg-zinc-800 px-2 py-1 rounded">{result.code}</span></p>
            <button 
              onClick={() => {
                onApplyCode(result.code, result.discount);
                onClose();
              }}
              className="w-full py-4 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400"
            >
              Apply Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpinTheWheel;
