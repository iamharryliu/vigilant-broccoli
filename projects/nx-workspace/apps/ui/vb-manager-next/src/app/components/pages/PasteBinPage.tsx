import { Button, Card, Flex, Heading, Text, TextArea } from '@radix-ui/themes';
import { useState, useEffect } from 'react';
import {
  CopyIcon,
  CheckIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from '@radix-ui/react-icons';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

const LLM_PREFERENCES = `# LLM Code Preferences

- Simple code implementation.
- Aboid comment blocks, prefer short inline comments.
- Avoid try catch blocks.
- Avoid string literals throughout the code.`;

// eslint-disable-next-line complexity
export const PasteBinPage = () => {
  const [sshKey, setSshKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [isCopiedLlm, setIsCopiedLlm] = useState(false);
  const [isVisibleLlm, setIsVisibleLlm] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);

      const sshKeyResponse = await fetch(API_ENDPOINTS.SSH_KEY)
        .then(res => res.json())
        .catch(() => ({ success: false, error: 'Failed to load SSH key' }));

      // Handle SSH key result
      if (sshKeyResponse.success) {
        setSshKey(sshKeyResponse.key);
      } else {
        setError(sshKeyResponse.error);
      }
      setIsLoading(false);
    }

    fetchData();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sshKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyLlm = async () => {
    try {
      await navigator.clipboard.writeText(LLM_PREFERENCES);
      setIsCopiedLlm(true);
      setTimeout(() => setIsCopiedLlm(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <Heading size="6" mb="4">
        Paste Bin
      </Heading>

      <Card>
        <Flex direction="column" gap="4">
          <Flex justify="between" align="center">
            <Heading size="4">SSH Public Key</Heading>
            <Flex gap="2">
              <Button
                onClick={() => setIsVisible(!isVisible)}
                disabled={isLoading || !!error}
                variant="soft"
              >
                {isVisible ? (
                  <>
                    <EyeClosedIcon /> Hide
                  </>
                ) : (
                  <>
                    <EyeOpenIcon /> Show
                  </>
                )}
              </Button>
              <Button
                onClick={handleCopy}
                disabled={isLoading || !!error}
                variant="soft"
              >
                {isCopied ? (
                  <>
                    <CheckIcon /> Copied!
                  </>
                ) : (
                  <>
                    <CopyIcon /> Copy
                  </>
                )}
              </Button>
            </Flex>
          </Flex>

          {error && (
            <Text color="red" size="2">
              {error}
            </Text>
          )}

          {!isLoading && !error && sshKey && isVisible && (
            <TextArea
              value={sshKey}
              readOnly
              rows={8}
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                resize: 'vertical',
              }}
            />
          )}
        </Flex>
      </Card>

      <Card>
        <Flex direction="column" gap="4">
          <Flex justify="between" align="center">
            <Heading size="4">LLM Code Preferences</Heading>
            <Flex gap="2">
              <Button
                onClick={() => setIsVisibleLlm(!isVisibleLlm)}
                variant="soft"
              >
                {isVisibleLlm ? (
                  <>
                    <EyeClosedIcon /> Hide
                  </>
                ) : (
                  <>
                    <EyeOpenIcon /> Show
                  </>
                )}
              </Button>
              <Button
                onClick={handleCopyLlm}
                variant="soft"
              >
                {isCopiedLlm ? (
                  <>
                    <CheckIcon /> Copied!
                  </>
                ) : (
                  <>
                    <CopyIcon /> Copy
                  </>
                )}
              </Button>
            </Flex>
          </Flex>

          {isVisibleLlm && (
            <TextArea
              value={LLM_PREFERENCES}
              readOnly
              rows={8}
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                resize: 'vertical',
              }}
            />
          )}
        </Flex>
      </Card>
    </>
  );
};
