import axios from 'axios'
import ffmpeg from 'fluent-ffmpeg'
import installer from '@ffmpeg-installer/ffmpeg'
import { unlink } from 'fs/promises'

import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { createWriteStream } from 'fs'

const DIRNAME = dirname(fileURLToPath(import.meta.url))
const OGG_FORMAT = 'ogg'
const MP3_FORMAT = 'mp3'

class AudioFileService{
    constructor() {
        ffmpeg.setFfmpegPath(installer.path)
    }

    convertToMp3Format(inputPath, output){
        try {
            const outputPath = resolve(dirname(inputPath), `${output}.${MP3_FORMAT}`)
            return new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .inputOption('-t 30')
                    .output(outputPath)
                    .on('end', () => {
                        this.removeFile(inputPath)
                        resolve(outputPath)
                    })
                    .on('error', error => reject(error.message))
                    .run()
            })
        } catch (error) {
            console.log('Error on convertToMp3Format', error)            
        }
    }

    async createFile(url, fileName) {
        try {
            const oggFilePath = resolve(DIRNAME, '../../messages/voice', `${fileName}.${OGG_FORMAT}`)
            console.log(oggFilePath, url)
            const response = await axios({
                method: 'get',
                url,
                responseType: 'stream'
            })
            return new Promise((resolve) => {
                const stream = createWriteStream(oggFilePath)
                response.data.pipe(stream)
                stream.on('finish', () => resolve(oggFilePath))
            })
        } catch (error) {
            console.log('Error on createFile')
        }
    }

    async removeFile(filePath) {
        try {
            await unlink(filePath)
        } catch (error) {
            console.error('Error on file remove')
        }
    }
}

export const audioFileService = new AudioFileService()