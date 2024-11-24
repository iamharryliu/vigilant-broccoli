import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { createGmailTransport } from './email.utils';

jest.mock('nodemailer');
const mockedCreateTransport = nodemailer.createTransport as jest.MockedFunction<
  typeof nodemailer.createTransport
>;

describe('createGmailTransport', () => {
  it('should call createTransport with the correct transport options', () => {
    const user = 'test@gmail.com';
    const pass = 'testpassword';

    const mockTransport = {} as Transporter<SMTPTransport.SentMessageInfo>;
    mockedCreateTransport.mockReturnValue(mockTransport);

    const result = createGmailTransport(user, pass);

    expect(mockedCreateTransport).toHaveBeenCalled();
    expect(result).toBe(mockTransport);
  });
});
