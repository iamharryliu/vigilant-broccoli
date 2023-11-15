import OpenAI from 'openai';
import { logger } from '../middlewares/loggers';
import { Location } from '../models/vibecheck-lite.model';
import { NewsletterService } from './newsletter.service';
import { EmailSubscription } from '../models/subscription.model';
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export class VibecheckLiteService {
  static async getWeatherDataForOutfitRecommendation(location: Location) {
    const { latitude, longitude } = location;
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`,
      );
      const data = await res.json();
      const requestData = data.list.slice(0, 4);
      return requestData;
    } catch (err) {
      logger.log(err);
    }
  }

  static async getOutfitRecommendation(location: Location) {
    let recommendation = '';
    try {
      const requestData = await this.getWeatherDataForOutfitRecommendation(
        location,
      );
      const requestString = `Can you recommend what to wear today with the following json data. Please use the "dt_txt" parameter, it is in GMT, please convert it to EST for display. Please use the "temp" parameter, it is in degrees Kelvin (K), please convert it to degrees Celsius (C).${JSON.stringify(
        requestData,
      )}. Convert the date and time from GMT to EST for the answer. Convert the temperature to celsius instead of Kelvin for the answer.`;
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'system', content: requestString }],
        model: 'gpt-3.5-turbo',
      });
      recommendation = completion.choices[0].message.content;
      return recommendation;
    } catch (err) {
      logger.log(err);
    }
  }

  static async subscribeEmail(data) {
    const { email, latitude, longitude } = data;
    const emailSubscription = await EmailSubscription.findOne({
      email: email,
    });
    const isSubscribed = !!emailSubscription;
    if (!isSubscribed) {
      const newEmailAlert = new EmailSubscription({
        email,
        isVerified: false,
        vibecheckLiteSubscription: {
          vibecheckLiteSubscription: true,
          latitude,
          longitude,
        },
      });
      await newEmailAlert.save();
      return NewsletterService.sendVerificationEmail(email);
    }
    await EmailSubscription.findOneAndUpdate(
      {
        email: email,
      },
      {
        $set: {
          vibecheckLiteSubscription: {
            vibecheckLiteSubscription: true,
            latitude,
            longitude,
          },
        },
      },
      { new: true },
    );
    return NewsletterService.subscribeEmail(email);
  }
}
