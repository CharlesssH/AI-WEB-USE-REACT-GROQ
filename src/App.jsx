import React from 'react';
import './App.css';
import {requestToGroqAI} from "./utils/groq"
import { useState } from 'react';
import { Prism as SyntaxHighlight } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';

function App() {
  const [data, setData] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isCopied, setIsCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const input = document.getElementById('content')
    
    if (!input.value.trim()) {
      setError('Input tidak boleh kosong')
      return
    }
    
    setIsLoading(true)
    setError(null)
    setData("")
    
    try {
      const ai = await requestToGroqAI(input.value)
      setData(ai)
      input.value = ''
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'Terjadi kesalahan saat memproses permintaan')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Gagal menyalin teks:', err)
    }
  }

  const renderCodeBlock = (codeContent, index) => (
    <div key={index} className='my-4 bg-gray-900/80 rounded-xl overflow-hidden border border-purple-500/20 shadow-xl'>
      <div className='flex justify-between items-center px-4 py-3 bg-gray-800/80 border-b border-purple-500/20'>
        <span className='text-gray-300 text-sm'>Kode</span>
        <button
          onClick={() => handleCopy(codeContent)}
          className='flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-colors px-3 py-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700/80'
        >
          {isCopied ? (
            <span className='text-sm'>✓ Tersalin!</span>
          ) : (
            <span className='text-sm'>📋 Salin</span>
          )}
        </button>
      </div>
      <SyntaxHighlight 
        language='javascript'
        style={darcula}
        customStyle={{
          padding: '1rem',
          margin: 0,
          width: '100%',
          maxWidth: '100%',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          backgroundColor: 'transparent',
          fontSize: '0.9rem',
          lineHeight: '1.5'
        }}
      >
        {codeContent}
      </SyntaxHighlight>
    </div>
  )

  const renderContent = () => {
    if (!data) return null

    const segments = data.split(/(```[\s\S]*?```)/g)
    return segments.map((segment, index) => {
      if (segment.startsWith('```') && segment.endsWith('```')) {
        const codeContent = segment.slice(3, -3).trim()
        return renderCodeBlock(codeContent, index)
      }
      
      return segment.trim() ? (
        <p key={index} className='text-gray-300 leading-relaxed px-2'>
          {segment}
        </p>
      ) : null
    }).filter(Boolean)
  }

  return (
    <main className='flex flex-col min-h-[80vh] justify-center items-center max-w-2xl w-full mx-auto p-4'>
      <h1 className='text-4xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent mb-8'>
        REACT|GROQ AI
      </h1>
      
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 py-4 w-full'>
        <input
          placeholder='Ketik permintaan mu disini....'
          className='w-full py-3 px-4 rounded-xl border border-purple-400/20 bg-gray-900/50 
                     text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40 
                     transition-all duration-300'
          id='content'
          type='text'
          disabled={isLoading}
        />
        <button
          type='submit'
          className='bg-gradient-to-r from-purple-600 to-indigo-600 py-3 px-6 
                     rounded-xl font-medium text-white hover:opacity-90 
                     transition-all duration-300 disabled:opacity-50 
                     disabled:cursor-not-allowed shadow-lg shadow-purple-500/20'
          disabled={isLoading}
        >
          {isLoading ? 'Memproses...' : 'Kirim'}
        </button>
      </form>

      {isLoading && (
        <div className='mt-6 text-purple-400'>
          Sedang memproses permintaan...
        </div>
      )}

      {error && (
        <div className='mt-4 text-red-400 bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20'>
          {error}
        </div>
      )}

      {data && (
        <div className='w-full mt-6 space-y-4'>
          {renderContent()}
        </div>
      )}
    </main>
  )
}

export default App
