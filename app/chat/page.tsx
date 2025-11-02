"use client";

import { useState } from 'react';
import { answerQuestion } from '../../lib/chat';

type Msg = { role: 'user' | 'assistant'; text: string };

export default function ChatPage() {
  const [input, setInput] = useState('When is my next cleaning?');
  const [msgs, setMsgs] = useState<Msg[]>([ { role: 'assistant', text: 'Hi! Ask about scheduling, pricing, or reporting.' } ]);

  const send = () => {
    if (!input.trim()) return;
    const q = input.trim();
    const a = answerQuestion(q);
    setMsgs((m)=>[...m, { role:'user', text:q }, { role:'assistant', text:a }]);
    setInput('');
  };

  return (
    <div>
      <h1>Client FAQ Bot</h1>
      <div className="section">
        <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8}}>
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Type your question..." onKeyDown={e=>{ if(e.key==='Enter') send(); }} />
          <button onClick={send}>Send</button>
        </div>
      </div>
      <div className="section">
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {msgs.map((m, i) => (
            <div key={i} style={{alignSelf: m.role==='user'?'flex-end':'flex-start', maxWidth: '75%'}}>
              <div style={{background: m.role==='user'?'#0ea5e9':'#e2e8f0', color: m.role==='user'?'white':'#0f172a', padding: '10px 12px', borderRadius: 12}}>{m.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
