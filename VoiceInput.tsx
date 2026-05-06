import { useState, useRef } from 'react';
import { Mic, MicOff, X, Check, AlertCircle } from 'lucide-react';
import type { ExpenseInsert, Category, VoiceParsedResult } from '../../types';
import { parseVoiceInput, CATEGORIES } from '../../lib/utils';

interface VoiceInputProps {
  onAdd: (expense: ExpenseInsert) => Promise<boolean>;
}

interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

export default function VoiceInput({ onAdd }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsed, setParsed] = useState<VoiceParsedResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState<Category>('Other');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = () => {
    if (!isSupported) {
      setError('Voice recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    setError(null);
    setTranscript('');

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      const result = parseVoiceInput(text);
      setParsed(result);
      setEditAmount(result.amount !== null ? String(result.amount) : '');
      setEditDesc(result.description);
      setEditCategory('Other');
      setShowModal(true);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setListening(false);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone permissions.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else {
        setError(`Voice recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const handleConfirm = async () => {
    const numAmount = parseFloat(editAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (!editDesc.trim()) return;

    setSaving(true);
    const success = await onAdd({
      amount: numAmount,
      description: editDesc.trim(),
      category: editCategory,
      input_method: 'voice',
    });

    if (success) {
      setShowModal(false);
      setParsed(null);
      setTranscript('');
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {!isSupported && (
        <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3 text-sm w-full">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>Voice recognition requires Chrome, Edge, or Safari on mobile.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-crimson-400 bg-crimson-500/10 border border-crimson-500/20 rounded-xl px-4 py-3 text-sm w-full">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        {/* Mic button with pulse ring */}
        <div className="relative">
          {listening && (
            <>
              <div className="absolute inset-0 rounded-full bg-crimson-500/30 ping-slow" />
              <div className="absolute inset-0 rounded-full bg-crimson-500/15 animate-ping" style={{ animationDuration: '2s' }} />
            </>
          )}
          <button
            onClick={listening ? stopListening : startListening}
            disabled={!isSupported}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
              listening
                ? 'bg-crimson-500 shadow-lg shadow-crimson-500/30'
                : 'bg-obsidian-800 border-2 border-obsidian-600 hover:border-lime-400/50 hover:bg-obsidian-700'
            }`}
          >
            {listening ? (
              <MicOff size={28} className="text-white" />
            ) : (
              <Mic size={28} className="text-obsidian-300" />
            )}
          </button>
        </div>

        <div className="text-center">
          {listening ? (
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-crimson-400 rounded-full animate-pulse" />
              <span className="text-crimson-400 font-500 text-sm">Listening... tap to stop</span>
            </div>
          ) : (
            <p className="text-obsidian-500 text-sm">
              {isSupported ? 'Tap the mic and speak your expense' : 'Not supported in this browser'}
            </p>
          )}
        </div>

        {!listening && (
          <div className="text-center space-y-1">
            <p className="text-xs text-obsidian-600">Try saying:</p>
            <p className="text-xs text-obsidian-500 font-mono bg-obsidian-900 rounded-lg px-3 py-1.5">
              "forty dollars on lunch"
            </p>
            <p className="text-xs text-obsidian-500 font-mono bg-obsidian-900 rounded-lg px-3 py-1.5">
              "12.50 for coffee"
            </p>
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {showModal && parsed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div
            className="absolute inset-0 bg-obsidian-950/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-md animate-slide-up border border-obsidian-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-700 text-lg">Confirm Expense</h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1">
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-obsidian-900 rounded-xl">
              <p className="text-xs text-obsidian-500 mb-1">Transcribed:</p>
              <p className="text-obsidian-300 text-sm italic">"{transcript}"</p>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="label">Amount ($)</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={e => setEditAmount(e.target.value)}
                  className="input-field"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  autoFocus
                />
                {parsed.amount === null && (
                  <p className="text-xs text-amber-400 mt-1">⚠ Could not parse amount — please enter manually</p>
                )}
              </div>
              <div>
                <label className="label">Description</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="input-field"
                  placeholder="Description"
                />
              </div>
              <div>
                <label className="label">Category</label>
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value as Category)}
                  className="input-field appearance-none cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="btn-ghost flex-1 border border-obsidian-700">
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving || !editAmount || !editDesc}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 rounded-full border-2 border-obsidian-950 border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Check size={15} strokeWidth={2.5} />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
