import { useState } from 'react';
import { Type, Mic, Receipt } from 'lucide-react';
import type { ExpenseInsert } from '../../types';
import ManualForm from './ManualForm';
import VoiceInput from './VoiceInput';
import ReceiptUpload from './ReceiptUpload';

type Tab = 'text' | 'voice' | 'receipt';

interface ExpenseInputProps {
  onAdd: (expense: ExpenseInsert) => Promise<boolean>;
}

export default function ExpenseInput({ onAdd }: ExpenseInputProps) {
  const [activeTab, setActiveTab] = useState<Tab>('text');

  const tabs: { id: Tab; label: string; icon: typeof Type }[] = [
    { id: 'text', label: 'Manual', icon: Type },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'receipt', label: 'Receipt', icon: Receipt },
  ];

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-1 p-2 border-b border-obsidian-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`tab-btn flex-1 sm:flex-none justify-center ${
              activeTab === id ? 'tab-btn-active' : 'tab-btn-inactive'
            }`}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5 sm:p-6 animate-fade-in">
        {activeTab === 'text' && <ManualForm onAdd={onAdd} />}
        {activeTab === 'voice' && <VoiceInput onAdd={onAdd} />}
        {activeTab === 'receipt' && <ReceiptUpload onAdd={onAdd} />}
      </div>
    </div>
  );
}
