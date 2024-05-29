import { Groq } from "groq-sdk"

const grogApi = import.meta.env.VITE_GROQ_KEY

const groq = new Groq({
    apiKey: grogApi,
    dangerouslyAllowBrowser: true,
})

export const requestToGroqAi = async (content: string) => {

    const reply = await groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content,
            }
        ],
        model: "llama3-8b-8192"
    })
    return reply.choices[0].message.content
}