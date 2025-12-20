import { MongoClient } from 'mongodb';
import 'dotenv-defaults/config';
import OpenAI from 'openai';
import {
  MONGO_DB_SERVER,
  PERSONAL_WEBSITE_DB_COLLECTIONS,
} from '@prettydamntired/personal-website-api-lib';
import { Location } from '@vigilant-broccoli/common-js';
import {
  DEFAULT_EMAIL_REQUEST,
  EmailService,
  logger,
  getEnvironmentVariable,
} from '@vigilant-broccoli/common-node';

export class VibecheckLite {
  private openai: OpenAI;
  private openWeatherApiKey: string;

  constructor(openAiApiKey = undefined, openWeatherApiKey = undefined) {
    this.openWeatherApiKey = (openWeatherApiKey ||
      getEnvironmentVariable('OPENWEATHER_API_KEY')) as string;
    this.openai = new OpenAI({
      apiKey: openAiApiKey || getEnvironmentVariable('OPENAI_API_KEY'),
      dangerouslyAllowBrowser: true,
    });
  }

  async getOutfitRecommendation(location: Location): Promise<string> {
    try {
      const requestData = await this.getWeatherDataForOutfitRecommendation(
        location,
      );
      const requestString = this.buildRequestString(requestData);
      const completion = await this.openai.chat.completions.create({
        messages: [{ role: 'system', content: requestString }],
        model: 'gpt-3.5-turbo',
      });
      const res = completion.choices[0].message.content as string;
      return res;
    } catch (err) {
      logger.error(err);
      return 'Something went wrong.';
    }
  }

  async getOutfitRecommendationStream(location: Location) {
    const requestData = await this.getWeatherDataForOutfitRecommendation(
      location,
    );
    const requestString = this.buildRequestString(requestData);
    return this.openai.chat.completions.create({
      messages: [{ role: 'system', content: requestString }],
      model: 'gpt-3.5-turbo',
      stream: true,
    });
  }

  private buildRequestString(requestData: any): string {
    return `Can you recommend complete outfits to wear with the following json data for the 4 separate times. Please use the "dt_txt" parameter for the time, it is in GMT, please convert it to EST. Please use the "temp" parameter, it is in degrees Kelvin (K), please convert it to degrees Celsius (C).${JSON.stringify(
      requestData,
    )}. Convert the date and time from GMT to EST for the answer. Convert the temperature to celsius instead of Kelvin for the answer. Reply using the following template: \nTime {h:mm EST}:\n- Temperature: {temperature in celsius to nearest integer}\n- Weather: {weather}\n- Recommendation: {recommended outfit}.`;
  }

  private async getWeatherDataForOutfitRecommendation(
    location: Location,
  ): Promise<any> {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${this.openWeatherApiKey}`,
      );
      const data = await res.json();
      const requestData = data.list.slice(0, 4);
      return requestData;
    } catch (err) {
      logger.error(err);
    }
  }

  async emailSubscribedUsers() {
    logger.info('Vibecheck lite recommendation script start.');
    const MONGO_DB_CLIENT = new MongoClient(MONGO_DB_SERVER);
    const database = MONGO_DB_CLIENT.db('vibecheck-lite');
    const emailSubscriptionsCollection = database.collection(
      PERSONAL_WEBSITE_DB_COLLECTIONS.EMAIL_SUBSCRIPTIONS,
    );
    const emailSubscriptions = (
      await emailSubscriptionsCollection.find({}).toArray()
    ).map(data => {
      return {
        email: data.email,
        latitude: data.latitude,
        longitude: data.longitude,
      };
    });

    const emailPromises = emailSubscriptions.map(async emailSubscription => {
      const { email, latitude, longitude } = emailSubscription;
      logger.info(`Getting outfit recommendation for ${email}`);
      const subject = 'Vibecheck Lite Outfit Recommendation';
      const request = {
        ...DEFAULT_EMAIL_REQUEST,
        from: `nickname <${getEnvironmentVariable('MY_EMAIL')}>`,
        to: email,
        subject,
      };
      const recommendation = (await this.getOutfitRecommendation({
        latitude: latitude as number,
        longitude: longitude as number,
      })) as string;
      const template = {
        path: `${__dirname}/assets/vibecheck-lite.ejs`,
        data: {
          recommendation: recommendation,
          url: `https://harryliu.dev/unsubscribe-vibecheck-lite?token=${email}`,
        },
      };
      logger.info(`Sending email to ${email}`);
      const mailService = new EmailService();
      return mailService.sendEjsEmail(request, template);
    });

    await Promise.all(emailPromises);
    await MONGO_DB_CLIENT.close();
  }
}
