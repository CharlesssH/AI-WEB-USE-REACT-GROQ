import { Groq } from "groq-sdk"

const GROQ_API = import.meta.env.VITE_GROQ

console.log('API Key tersedia:', !!GROQ_API)

if (!GROQ_API) {
  throw new Error('GROQ API key tidak ditemukan di environment variables')
}

const groq = new Groq({
  apiKey: GROQ_API,
  dangerouslyAllowBrowser: true
})

export const requestToGroqAI = async (content) => {
  try {
    if (!content.trim()) {
      throw new Error('Input tidak boleh kosong')
    }

    console.log('Mengirim permintaan ke API...')

    const reply = await groq.chat.completions.create({
      messages: [{
        role: "user",
        content: content.trim(),
      }],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 1000,
    })
    
    console.log('Respons diterima:', reply)
    
    if (!reply?.choices?.[0]?.message?.content) {
      throw new Error('Respons tidak valid dari API')
    }
    
    return reply.choices[0].message.content
  } catch (error) {
    console.error('Error detail:', error)
    throw error
  }
}