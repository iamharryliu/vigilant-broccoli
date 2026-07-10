import { FastifyPluginAsync } from 'fastify';
import { AudioService } from '@vigilant-broccoli/common-node';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

const ERROR_NO_AUDIO = 'No audio file provided';
const ERROR_TRANSCRIPTION_FAILED = 'Transcription failed';

const speechToTextRoutes: FastifyPluginAsync = async app => {
  app.post('/', async (req, reply) => {
    try {
      const file = await req.file();
      if (!file) throw new Error(ERROR_NO_AUDIO);
      const blob = new Blob([new Uint8Array(await file.toBuffer())], {
        type: file.mimetype,
      });
      const transcript = await AudioService.getTranscriptText(blob);
      return { transcript };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : ERROR_TRANSCRIPTION_FAILED;
      return reply
        .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .send({ error: message });
    }
  });
};

export default speechToTextRoutes;
