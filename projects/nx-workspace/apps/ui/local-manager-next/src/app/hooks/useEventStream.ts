'use client';

import { useEffect, useRef, useState } from 'react';
import {
  SOCKET_EVENTS,
  SOCKET_SERVER_PATHS,
  SOCKET_SUBSCRIPTION_PARAMS,
} from '@vigilant-broccoli/common-js';
import { dismissCertTrustToast, showCertTrustToast } from './certTrustToast';

// EventSource errors carry no detail, so a run of failures without an open is the only cert-trust signal.
const ERRORS_BEFORE_CERT_PROMPT = 3;

export const EVENT_STREAM_STATUS = {
  CONNECTING: 'connecting',
  OPEN: 'open',
  CLOSED: 'closed',
} as const;

export type EventStreamStatus =
  (typeof EVENT_STREAM_STATUS)[keyof typeof EVENT_STREAM_STATUS];

export interface EventStreamMessage<T> {
  app: string;
  receiverId: string;
  payload: T;
}

export function useEventStream<T>(
  url: string | undefined,
  app: string,
  receiverId: string,
  onMessage: (message: EventStreamMessage<T>) => void,
) {
  const [status, setStatus] = useState<EventStreamStatus>(
    url ? EVENT_STREAM_STATUS.CONNECTING : EVENT_STREAM_STATUS.CLOSED,
  );
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!url) {
      setStatus(EVENT_STREAM_STATUS.CLOSED);
      return;
    }
    const params = new URLSearchParams({
      [SOCKET_SUBSCRIPTION_PARAMS.APP]: app,
      [SOCKET_SUBSCRIPTION_PARAMS.RECEIVER_ID]: receiverId,
    });
    const source = new EventSource(
      `${url}${SOCKET_SERVER_PATHS.EVENTS}?${params}`,
    );
    let errorsWithoutOpen = 0;
    let certPromptShown = false;
    setStatus(EVENT_STREAM_STATUS.CONNECTING);

    source.onopen = () => {
      errorsWithoutOpen = 0;
      setStatus(EVENT_STREAM_STATUS.OPEN);
      if (certPromptShown) {
        dismissCertTrustToast();
        certPromptShown = false;
      }
    };

    source.onerror = () => {
      setStatus(EVENT_STREAM_STATUS.CLOSED);
      errorsWithoutOpen += 1;
      if (certPromptShown || errorsWithoutOpen < ERRORS_BEFORE_CERT_PROMPT) {
        return;
      }
      certPromptShown = true;
      showCertTrustToast(url);
    };

    source.addEventListener(SOCKET_EVENTS.MESSAGE, event =>
      onMessageRef.current(JSON.parse(event.data)),
    );

    return () => {
      source.close();
      if (certPromptShown) dismissCertTrustToast();
    };
  }, [url, app, receiverId]);

  return status;
}
