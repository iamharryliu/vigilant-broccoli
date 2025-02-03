import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { Service } from './service';

export class Controller {
  static async getOutfitRecommendation(req, res) {
    const location = {
      latitude: Number(req.query.lat),
      longitude: Number(req.query.lon),
    };
    try {
      const recommendation = await Service.getOutfitRecommendation(location);
      return res.json({ data: recommendation });
    } catch {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send();
    }
  }

  static async subscribe(req, res) {
    const { email } = req.body;
    if (!email) {
      return res
        .status(HTTP_STATUS_CODES.BAD_REQUEST)
        .json({ error: 'Email is required.' });
    }
    const isSubscribed = await Service.getIsSubscribed(email);
    const location = {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    };
    if (!isSubscribed) {
      await Service.subscribe(email, location);
    } else {
      await Service.updateSubscription(email, location);
    }
    return res.status(HTTP_STATUS_CODES.OK).json({});
  }

  static async unsubscribe(req, res) {
    const email = req.params.email;
    try {
      await Service.unsubscribe(email);
      return res.json({});
    } catch {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send();
    }
  }
}
