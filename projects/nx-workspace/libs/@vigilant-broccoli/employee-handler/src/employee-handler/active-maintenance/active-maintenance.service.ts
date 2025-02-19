import crypto from 'crypto';
import { EmployeeHandlerConfig } from '../../employee-handler/employee-handler.models';
import {
  ALL_GENERATED_SIGNATURES_FILENAME,
  ALL_GENERATED_SIGNATURES_FILEPATH,
  SIGNATURE_CACHE_FILEPATH,
  ZIPPED_GENERATED_SIGNATURES_FILENAME,
  ZIPPED_GENERATED_SIGNATURES_FILEPATH,
} from './signatures.const';
import { Attachment } from 'nodemailer/lib/mailer';
import {
  getEmailSignatureFilepath,
  SIGNATURE_TMP_DIR,
} from '@vigilant-broccoli/google-workspace';
import { FileSystemUtils } from '@vigilant-broccoli/common-node';

// TODO: kind of awkward with caching, refactor later.
export const updateEmailSignatures = async (
  handlerConfig: EmployeeHandlerConfig,
): Promise<void> => {
  let signaturesCache = FileSystemUtils.getObjectFromFilepath(
    SIGNATURE_CACHE_FILEPATH,
  );
  const signatures =
    await handlerConfig.activeMaintenanceUtilities.fetchEmailSignatures();
  const signaturesToUpdate = handlerConfig.activeMaintenanceUtilities
    .useSignatureCaching
    ? signatures.filter(
        signature =>
          !signaturesCache[signature.email] ||
          signaturesCache[signature.email] === signature.signatureString,
      )
    : signatures;

  if (signaturesToUpdate.length > 0) {
    await handlerConfig.activeMaintenanceUtilities.processEmailSignatures(
      signatures,
    );
    if (handlerConfig.activeMaintenanceUtilities.useSignatureCaching) {
      signaturesCache = Object.assign(
        signaturesCache,
        signaturesToUpdate.reduce((cache, signature) => {
          cache[signature.email] = crypto
            .createHash('sha256')
            .update(signature.signatureString)
            .digest('hex');
          return cache;
        }, {}),
      );
      await FileSystemUtils.writeJSON(
        SIGNATURE_CACHE_FILEPATH,
        signaturesCache,
      );
    }
  }
};

export const generateLocalSignatures = async (
  handlerConfig: EmployeeHandlerConfig,
): Promise<void> => {
  const signatures =
    await handlerConfig.activeMaintenanceUtilities.fetchEmailSignatures();
  let combinedSignatures = '';
  for (const signature of signatures) {
    combinedSignatures += `${signature.signatureString}\n`;
    const emailSignatureFilepath = getEmailSignatureFilepath(signature.email);
    await FileSystemUtils.writeFile(
      emailSignatureFilepath,
      signature.signatureString,
    );
  }
  await FileSystemUtils.writeFile(
    ALL_GENERATED_SIGNATURES_FILEPATH,
    combinedSignatures,
  );
  await FileSystemUtils.zipFolder(
    SIGNATURE_TMP_DIR,
    ZIPPED_GENERATED_SIGNATURES_FILEPATH,
  );
};

export const emailZippedSignatures = async (
  handlerConfig: EmployeeHandlerConfig,
): Promise<void> => {
  await generateLocalSignatures(handlerConfig);
  const attachments = [
    {
      filename: ZIPPED_GENERATED_SIGNATURES_FILENAME,
      path: ZIPPED_GENERATED_SIGNATURES_FILEPATH,
    },
    {
      filename: ALL_GENERATED_SIGNATURES_FILENAME,
      path: ALL_GENERATED_SIGNATURES_FILEPATH,
    },
  ] as Attachment[];
  await handlerConfig.activeMaintenanceUtilities.emailZippedSignatures(
    attachments,
  );
  FileSystemUtils.deletePath(ALL_GENERATED_SIGNATURES_FILEPATH);
  FileSystemUtils.deletePath(ZIPPED_GENERATED_SIGNATURES_FILEPATH);
};

export const manualRecoverUsers = async (
  handlerConfig: EmployeeHandlerConfig,
): Promise<void> => {
  const emails = process.argv.slice(3);
  if (emails.length === 0) {
    console.warn('No emails provided.');
    return;
  }
  await handlerConfig.activeMaintenanceUtilities.recoverUsers(emails);
};

export const syncData = async (
  handlerConfig: EmployeeHandlerConfig,
): Promise<void> => {
  await handlerConfig.activeMaintenanceUtilities.syncData();
};
