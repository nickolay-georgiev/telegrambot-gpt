import config from 'config'
import { createReadStream } from 'fs'
import { Configuration, OpenAIApi } from 'openai'

class OpenAIService{
    constructor(apiKey){
        const configuration = new Configuration({ apiKey });
        this.openAI = new OpenAIApi(configuration);
        this.roles = { Assistant: 'assistant', User: 'user', System: 'system' }
    }

    async chatWithOpenAI(messages) {
        try {
            const chatResponse = await this.openAI.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages
            })
            return chatResponse.data.choices[0].message
        } catch (error) {
            console.log('Error on send message', error)
        }
    }

    async transcriptMessage(file) {
        try {
            const transcriptionResponse = await this.openAI.createTranscription(
                createReadStream(file),
                'whisper-1'
            )
            return transcriptionResponse.data.text
        } catch (error) {
            console.log('Error on message transcription', error.message)
        }
    }
}

export const openAIService = new OpenAIService(config.get('OPENAI_API_KEY'))