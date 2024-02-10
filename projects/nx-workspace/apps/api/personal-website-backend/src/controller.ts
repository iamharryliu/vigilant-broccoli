import { HTTP_STATUS_CODES } from '@prettydamntired/test-lib';
import { ResponseError } from './models/error.model';
import { NewsletterService } from './services/newsletter.service';
import { ContactService } from './services/contact.service';
import { GENERAL_ERROR_CODE } from '@prettydamntired/personal-website-lib';

export class Controller {
  static async subscribeEmail(req, res, next) {
    const email = req.body.email;
    try {
      if (!email) {
        const err = new Error(
          GENERAL_ERROR_CODE.EMAIL_IS_REQUIRED,
        ) as ResponseError;
        err.statusCode = HTTP_STATUS_CODES.BAD_REQUEST;
        throw err;
      }
      const message = await NewsletterService.subscribeEmail(email);
      res.status(HTTP_STATUS_CODES.OK).json({
        message: message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifySubscription(req, res, next) {
    const { token } = req.body;
    try {
      if (await NewsletterService.verifyEmail(token)) {
        return res
          .status(HTTP_STATUS_CODES.OK)
          .json({ message: 'Email has been verified.' });
      }
      const err = new Error(
        GENERAL_ERROR_CODE.EMAIL_DOES_NOT_EXIST,
      ) as ResponseError;
      err.statusCode = HTTP_STATUS_CODES.FORBIDDEN;
      throw err;
    } catch (error) {
      next(error);
    }
  }

  static async sendMessage(req, res, next) {
    const { name, email, message } = req.body;
    try {
      await ContactService.sendMessage({ name, email, message });
      res.status(HTTP_STATUS_CODES.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
