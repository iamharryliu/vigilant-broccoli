import { FastifyPluginAsync } from 'fastify';
import { Readable } from 'stream';
import { AudioService } from '@vigilant-broccoli/common-node';
import {
  CONTENT_TYPE_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';

const ERROR_TEXT_REQUIRED = 'Text is required';
const ERROR_TTS_FAILED = 'Failed to generate speech';
const AUDIO_CONTENT_TYPE = 'audio/mpeg';
const CACHE_CONTROL_HEADER = 'Cache-Control';
const NO_STORE = 'no-store';

type TextToSpeechBody = {
  text?: string;
  voiceId?: string;
  languageCode?: string;
};

const textToSpeechRoutes: FastifyPluginAsync = async app => {
  app.post('/', async (req, reply) => {
    const { text, voiceId, languageCode } = req.body as TextToSpeechBody;

    if (!text?.trim()) {
      return reply
        .code(HTTP_STATUS_CODES.BAD_REQUEST)
        .send({ error: ERROR_TEXT_REQUIRED });
    }

    try {
      const audioStream = await AudioService.streamTextToSpeech(text.trim(), {
        ...(voiceId?.trim() && { voiceId: voiceId.trim() }),
        ...(languageCode?.trim() && { languageCode: languageCode.trim() }),
      });

      reply.header(CONTENT_TYPE_HEADER, AUDIO_CONTENT_TYPE);
      reply.header(CACHE_CONTROL_HEADER, NO_STORE);
      return reply.send(
        Readable.fromWeb(audioStream as Parameters<typeof Readable.fromWeb>[0]),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : ERROR_TTS_FAILED;
      return reply
        .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .send({ error: message });
    }
  });
};

export default textToSpeechRoutes;
