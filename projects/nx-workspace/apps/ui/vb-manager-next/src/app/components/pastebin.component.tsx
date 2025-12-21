'use client';

import { Button, Card, Flex, Heading, Text, TextArea } from '@radix-ui/themes';
import { useState, useEffect } from 'react';
import {
  CopyIcon,
  CheckIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from '@radix-ui/react-icons';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const LLM_PREFERENCES = `# LLM Code Preferences

- Simple code implementation.
- Aboid comment blocks, prefer short inline comments.
- Avoid try catch blocks.
- Avoid string literals throughout the code.`;

type PasteType = 'ssh' | 'llm';

// eslint-disable-next-line complexity
export const PasteBinComponent = () => {
  const [sshKey, setSshKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<PasteType>('ssh');
  const [isCopied, setIsCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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
      const textToCopy = selectedType === 'ssh' ? sshKey : LLM_PREFERENCES;
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTypeChange = (type: PasteType) => {
    setSelectedType(type);
    setIsVisible(false);
    setIsCopied(false);
  };

  const currentContent = selectedType === 'ssh' ? sshKey : LLM_PREFERENCES;
  const isDisabled = selectedType === 'ssh' && (isLoading || !!error);

  return (
    <Card>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Heading size="4">Paste Bin</Heading>
          <Flex gap="2">
            <Button
              onClick={() => setIsVisible(!isVisible)}
              disabled={isDisabled}
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
              disabled={isDisabled}
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

        <Flex gap="2">
          <Button
            variant={selectedType === 'ssh' ? 'solid' : 'outline'}
            onClick={() => handleTypeChange('ssh')}
            size="1"
          >
            SSH Key
          </Button>
          <Button
            variant={selectedType === 'llm' ? 'solid' : 'outline'}
            onClick={() => handleTypeChange('llm')}
            size="1"
          >
            LLM Preferences
          </Button>
        </Flex>

        {selectedType === 'ssh' && error && (
          <Text color="red" size="2">
            {error}
          </Text>
        )}

        {isVisible && (
          <TextArea
            value={currentContent}
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
  );
};
