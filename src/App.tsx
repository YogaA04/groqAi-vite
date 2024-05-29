import { useState, useRef, useEffect } from 'react'
import { requestToGroqAi } from './utilities/grog'
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';


interface Message {
  text: string;
  from: 'user' | 'bot';
}

marked.use({
  renderer: {
    code(text) {
      const highlighted = hljs.highlightAuto(text).value;
      return `<pre class="hljs"><code class="hljs mb-4">${highlighted}</code></pre>`;
    },

    text(text) {
      if (/^\s*\[\[gpt\|/.test(text)) {
        const match = text.match(/^\s*\[\[gpt\|(.*?)\|(.*?)\]\]/);
        if (match) {
          const [, command, param] = match;
          return `<button class="poppins" onclick="requestGPT('${command.trim()}', '${param.trim()}')" style="background-color: green; border-radius: 5px;"></button>`;
        }
      }
      return `<span class="poppins">${text}</span>`;
    }
  }
});

const App = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [disabled, setDisabled] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    setDisabled(!disabled)
    const text = inputRef.current?.value

    if (text) {
      const optimisticMessage = { text, from: 'user' as 'user' };
      setMessages(prev => [...prev, optimisticMessage]);
      const response = await requestToGroqAi(text)
      setMessages(prev => [...prev.filter(msg => msg !== optimisticMessage), { text, from: 'user' as 'user' }, { text: response || "Maaf, saya tidak mengerti.", from: 'bot' as 'bot' }])
      setDisabled((prev) => !prev)

      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className='min-h-[92.5vh] bg-gray-100 p-4 poppins'>
      <div className='bg-white rounded-lg shadow max-w-xl mx-auto'>

        <header className='bg-blue-600 text-white text-lg p-3 rounded-t-lg font-bold'>
          Bot Ai
        </header>

        <ul className='p-3 pb-0 h-[70vh] overflow-y-auto'>
          {messages.map((msg, index) => (
            <li key={index} className={` p-2 pb-0 rounded-lg m-2 ${msg.from === 'user' ? 'bg-blue-200 text-right ' : 'bg-gray-100 text-start'}`}>
              <div className={`p-2 pb-0 ${msg.from === 'bot' ? 'text-sm rounded-md' : ''}`}>
                <pre className={`whitespace-pre-wrap ${msg.from === 'bot' ? 'p-2 pb-0 rounded-md' : ''}`}>
                  <code dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
                </pre>
              </div>
            </li>
          ))}
          <div ref={messagesEndRef} />
        </ul>
        <div className='p-3 flex gap-2'>
          <input type="text" ref={inputRef} placeholder="Ketik pesan..." className='w-full flex p-2 border-none shadow-md rounded-3xl px-5 bg-gray-200' />
          <button disabled={disabled} onClick={handleSend} className={`text-white p-2 rounded-2xl ${disabled ? "bg-blue-400" : "bg-blue-600"}`}>
            Kirim
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
