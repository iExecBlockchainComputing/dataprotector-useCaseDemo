// import { ValidationError } from '@iexec/web3mail';
import { useMutation } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { ChevronLeft, Loader } from 'react-feather';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { DocLink } from '@/components/DocLink.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { useToast } from '@/components/ui/use-toast.ts';
import { getWeb3mailClient } from '@/externals/web3mailClient.ts';
import { pluralize } from '@/utils/pluralize.ts';

const MAX_CHARACTERS_SENDER_NAME = 20;
const MAX_CHARACTERS_MESSAGE_SUBJECT = 78;

export default function SendEmailForm() {
  const { receiverAddress, protectedDataAddress } = useParams();

  const navigate = useNavigate();
  const { toast } = useToast();

  //for textarea
  const [message, setMessage] = useState('');
  const charactersRemainingMessage = 512000 - message.length;

  //for name et dataType
  const [messageSubject, setMessageSubject] = useState('');
  const charactersRemainingSubject =
    MAX_CHARACTERS_MESSAGE_SUBJECT - messageSubject.length;

  const [contentType, setContentType] = useState('text/plain');

  const [senderName, setSenderName] = useState('');
  const charactersRemainingSenderName =
    MAX_CHARACTERS_SENDER_NAME - senderName.length;

  const sendEmailMutation = useMutation({
    mutationKey: ['sendEmail'],
    mutationFn: async () => {
      const { web3mail } = await getWeb3mailClient();
      return web3mail.sendEmail({
        senderName,
        contentType,
        emailSubject: messageSubject,
        emailContent: message,
        protectedData: protectedDataAddress!,
        /**
         * this demo uses a workerpool offering free computing power dedicated to learning
         * this resource is shared and may be throttled, it should not be used for production applications
         * remove the `workerpoolAddressOrEns` option to switch back to a production ready workerpool
         */
        workerpoolAddressOrEns: 'prod-v8-learn.main.pools.iexec.eth',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Your email is being sent.',
      });
      setTimeout(() => {
        navigate('/sendEmail');
      }, 250);
    },
    onError: (err) => {
      // TODO Export yup ValidationError from SDKs
      // if (err instanceof ValidationError) {
      //   console.log('err.errors', (err as ValidationError).errors);
      //   toast({
      //     variant: 'danger',
      //     title: err.message,
      //   });
      //   return;
      // }
      // logs and rollbar alert handled by tanstack query config in initQueryClient()
      toast({
        variant: 'danger',
        title: err?.message || 'Failed to send email.',
      });
    },
  });

  const handleMessageSubjectChange = (event: any) => {
    const inputValue = event.target.value;
    setMessageSubject(inputValue);
  };

  const handleChange = (event: any) => {
    const inputValue = event.target.value;
    setMessage(inputValue);
  };

  const handleSelectContentType = (
    contentTypeValue: 'text/plain' | 'text/html'
  ) => {
    setContentType(contentTypeValue);
  };

  const handleSenderNameChange = (event: any) => {
    const inputValue = event.target.value;
    setSenderName(inputValue);
  };

  const handleSendEmail = (event: FormEvent) => {
    event.preventDefault();

    if (!senderName.trim() || !messageSubject.trim() || !message.trim()) {
      toast({
        variant: 'danger',
        title: 'Please fill in all required fields.',
      });
      return;
    }

    sendEmailMutation.mutate();
  };

  return (
    <div className="mx-auto mb-28 w-[70%]">
      <div className="text-left">
        <Button asChild variant="text" size="sm">
          <Link to={`/sendEmail`} className="pl-2">
            <ChevronLeft size="22" />
            <span className="pl-1">Back</span>
          </Link>
        </Button>
      </div>
      <h2>Send email to {receiverAddress}</h2>

      <form noValidate onSubmit={handleSendEmail} className="flex flex-col">
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

        <Label htmlFor="message-subject" className="mt-4">
          Message subject *
        </Label>
        <Input
          id="message-subject"
          data-cy="message-subject-input"
          required
          value={messageSubject}
          maxLength={MAX_CHARACTERS_MESSAGE_SUBJECT}
          className="mt-1"
          onChange={handleMessageSubjectChange}
        />
        <p className="my-2 text-sm italic">
          {pluralize(charactersRemainingSubject, 'character')} remaining
        </p>

        <Label
          htmlFor="content-type"
          data-cy="email-content-type-select"
          className="mt-4"
        >
          Content Type *
        </Label>
        <Select
          defaultValue="text/plain"
          onValueChange={handleSelectContentType}
        >
          <SelectTrigger id="content-type" className="mt-1 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text/plain">text/plain</SelectItem>
            <SelectItem value="text/html">text/html</SelectItem>
          </SelectContent>
        </Select>

        <Textarea
          required
          rows={6}
          placeholder="Enter email content *"
          value={message}
          data-cy="message-content-textarea"
          className="mt-6 w-full border p-3"
          onChange={handleChange}
        />
        <p className="my-2 text-sm italic">
          {pluralize(charactersRemainingMessage, 'character')} remaining
        </p>

        <div className="text-right">
          <Button
            type="submit"
            disabled={sendEmailMutation.isPending}
            data-cy="send-email-button"
          >
            {sendEmailMutation.isPending && (
              <Loader className="-ml-1 mr-2 animate-spin-slow" size="16" />
            )}
            <span>Send</span>
          </Button>
        </div>
      </form>

      <DocLink className="mt-20">
        web3mail-sdk / Method called in this page:{' '}
        <a
          href="https://beta.tools.docs.iex.ec/tools/web3mail/methods/sendEmail.html"
          target="_blank"
          rel="noreferrer"
          className="text-link hover:underline"
        >
          sendEmail()
        </a>
      </DocLink>
    </div>
  );
}
