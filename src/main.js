import config from 'config'

import { code } from 'telegraf/format'
import { message } from 'telegraf/filters'
import { Telegraf } from 'telegraf'

import { audioFileService } from './services/audioFileService.js'
import { openAIService } from './services/openaiService.js'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.on(message('voice'), async (ctx) => {
    try {
        await ctx.reply(code('Получих съобщението :), моля, изчакай отговор :)\r\n ==============================================================='))

        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = ctx.message.from.id
        const oggFilePath = await audioFileService.createFile(link.href, userId)
        const mp3FilePath = await audioFileService.convertToMp3Format(oggFilePath, userId)

        const text = await openAIService.transcriptMessage(mp3FilePath)
        await ctx.reply(code(`Въпрос: ${text}`))
        
        const messages = [{ role: openAIService.roles.User, content: text }]
        const response = await openAIService.chatWithOpenAI(messages)

        audioFileService.removeFile(mp3FilePath)
        await ctx.reply(JSON.stringify(response.content))
    } catch (error) {
        console.log('Error on voice message', error)
    }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
