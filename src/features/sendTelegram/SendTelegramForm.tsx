import { useMutation } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { ChevronLeft, Loader } from 'react-feather';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { DocLink } from '@/components/DocLink.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { useToast } from '@/components/ui/use-toast.ts';
import { getWeb3telegramClient } from '@/externals/web3telegramClient.ts';
import { pluralize } from '@/utils/pluralize.ts';

const MAX_CHARACTERS_SENDER_NAME = 20;

export default function SendTelegramForm() {
  const { receiverAddress, protectedDataAddress } = useParams();

  const navigate = useNavigate();
  const { toast } = useToast();

  const [senderName, setSenderName] = useState('');
  const charactersRemainingSenderName =
    MAX_CHARACTERS_SENDER_NAME - senderName.length;

  const [message, setMessage] = useState('');
  const charactersRemainingMessage = 512000 - message.length;

  const sendTelegramMutation = useMutation({
    mutationKey: ['sendEmail'],
    mutationFn: async () => {
      const { web3telegram } = await getWeb3telegramClient();
      return web3telegram.sendTelegram({
        senderName,
        telegramContent: message,
        protectedData: protectedDataAddress!,
        /**
         * web3telegram iApp not yet published to prod (missing Intel private key signing)
         * Hence using debug learn workerpool
         */
        workerpoolAddressOrEns: 'debug-v8-learn.main.pools.iexec.eth',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Your telegram is being sent.',
      });
      setTimeout(() => {
        navigate('/sendTelegram');
      }, 250);
    },
    onError: (err) => {
      toast({
        variant: 'danger',
        title: err?.message || 'Failed to send telegram.',
      });
    },
  });

  const handleChange = (event: any) => {
    const inputValue = event.target.value;
    setMessage(inputValue);
  };

  const handleSenderNameChange = (event: any) => {
    const inputValue = event.target.value;
    setSenderName(inputValue);
  };

  const handleSendTelegram = (event: FormEvent) => {
    event.preventDefault();

    if (!senderName.trim() || !message.trim()) {
      toast({
        variant: 'danger',
        title: 'Please fill in all required fields.',
      });
      return;
    }

    sendTelegramMutation.mutate();
  };

  return (
    <div className="mx-auto mb-28 w-[70%]">
      <div className="text-left">
        <Button asChild variant="text" size="sm">
          <Link to={`/sendTelegram`} className="pl-2">
            <ChevronLeft size="22" />
            <span className="pl-1">Back</span>
          </Link>
        </Button>
      </div>
      <h2>Send telegram message to {receiverAddress}</h2>

      <form noValidate onSubmit={handleSendTelegram} className="flex flex-col">
        <Label htmlFor="sender-name">
          Sender name * <span className="text-xs">(min 3 chars)</span>
        </Label>
        <Input
          id="sender-name"
          data-cy="sender-name-input"
          required
          value={senderName}
          maxLength={MAX_CHARACTERS_SENDER_NAME}
          className="mt-1"
          onChange={handleSenderNameChange}
        />
        <p className="my-2 text-sm italic">
          {pluralize(charactersRemainingSenderName, 'character')} remaining
        </p>
        <Textarea
          required
          rows={6}
          placeholder="Enter telegram message content *"
          value={message}
          className="mt-6 w-full border p-3"
          onChange={handleChange}
        />
        <p className="my-2 text-sm italic">
          {pluralize(charactersRemainingMessage, 'character')} remaining
        </p>
        <div className="text-right">
          <Button
            type="submit"
            disabled={sendTelegramMutation.isPending}
            data-cy="send-telegram-button"
          >
            {sendTelegramMutation.isPending && (
              <Loader className="-ml-1 mr-2 animate-spin-slow" size="16" />
            )}
            <span>Send</span>
          </Button>
          <div className="mt-1 text-sm">(Expect 3 Metamask interactions)</div>
        </div>
      </form>

      <DocLink className="mt-20">
        web3telegram-sdk / Method called in this page:{' '}
        <a
          href="https://tools.docs.iex.ec/tools/web3telegram/methods/sendTelegram"
          target="_blank"
          rel="noreferrer"
          className="text-link hover:underline"
        >
          sendTelegram()
        </a>
      </DocLink>
    </div>
  );
}
