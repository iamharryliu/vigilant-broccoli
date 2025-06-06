import { TextArea } from '@radix-ui/themes';
import { Layout } from '../layout/Layout';
import { useState } from 'react';
import { Button } from '../../lib/components/Button';
import { CopyPastable } from '../../lib/components/CopyPastable';

export const AIDemoPage = () => {
  const [userPrompt, setUserPrompt] = useState('Who is the Prime Minister of Canada?');
  const [isLoading, setIsLoading] = useState(false);
  const [userPromptResult, setUserPromptResult] = useState('');

  async function prompt() {
    setIsLoading(true);
    try{
        const response = await fetch('http://localhost:3000/prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userPrompt }),
        });
        const result = await response.json()
        setUserPromptResult(result.data)
    }
    catch(e){
        alert(`error ${e}`)
    }
    finally{
        setIsLoading(false);
    }
  }

  return (
    <Layout>
      <span>User Prompt</span>
      <div className="flex w-full space-x-4">
        <div className='w-1/2'>
          <TextArea
            value={userPrompt}
            onChange={e => setUserPrompt(e.target.value)}
          ></TextArea>
          <Button onClick={prompt} isLoading={isLoading}>
            Submit
          </Button>
        </div>
        <div className='w-1/2'>
            <CopyPastable text={userPromptResult} />
        </div>
      </div>
    </Layout>
  );
};
