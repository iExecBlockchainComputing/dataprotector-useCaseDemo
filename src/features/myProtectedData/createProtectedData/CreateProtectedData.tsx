import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useRef, useState } from 'react';
import { CheckCircle, ChevronLeft } from 'react-feather';
import { Link } from 'react-router-dom';
import { CircularLoader } from '@/components/CircularLoader.tsx';
import { DocLink } from '@/components/DocLink.tsx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
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
import { useToast } from '@/components/ui/use-toast.ts';
import { getDataProtectorClient } from '@/externals/dataProtectorClient.ts';
import { cn } from '@/utils/style.utils.ts';
import { createArrayBufferFromFile } from '@/utils/utils.ts';

export default function CreateProtectedData() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const fileInput = useRef<HTMLInputElement>(null);

  //for name et dataType
  const [name, setName] = useState('');
  const [dataType, setDataType] = useState<'email' | 'telegram' | 'file'>();

  //for email
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);

  //for telegram chat id
  const [telegram, setTelegram] = useState('');
  const [isValidTelegram, setIsValidTelegram] = useState(true);

  //for file
  const [filePath, setFilePath] = useState('');
  const [file, setFile] = useState<File | undefined>();

  const [showBackToListLink, setShowBackToListLink] = useState(false);

  //handle functions
  const onChangeDataType = (chosenDataType: 'email' | 'file') => {
    setDataType(chosenDataType);
  };

  const handleEmailChange = (event: any) => {
    setEmail(event.target.value);
    setIsValidEmail(event.target.validity.valid);
  };

  const handleTelegramChange = (event: any) => {
    setTelegram(event.target.value);
    setIsValidTelegram(event.target.validity.valid);
  };

  const handleFileChange = (event: any) => {
    setFilePath(event.target.value);
    setFile(event.target.files?.[0]);
  };

  const handleNameChange = (event: any) => {
    setName(event.target.value);
  };

  const createProtectedDataMutation = useMutation({
    mutationKey: ['protectData'],
    mutationFn: async ({
      name,
      data,
    }: {
      name: string;
      data: {
        email?: string;
        chatId?: string;
        file?: Uint8Array;
      };
    }) => {
      const { dataProtector } = await getDataProtectorClient();
      return dataProtector.protectData({ name, data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProtectedData'] });

      setTimeout(() => {
        setShowBackToListLink(true);
      }, 1500);
    },
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const data: {
      email?: string;
      chatId?: string;
      file?: Uint8Array;
    } = {};
    let bufferFile: Uint8Array;
    switch (dataType) {
      case 'email':
        data.email = email;
        break;
      case 'telegram':
        data.chatId = telegram;
        break;
      case 'file':
        if (!file) {
          toast({
            variant: 'danger',
            title: 'Please upload a file.',
          });
          return;
        }
        bufferFile = await createArrayBufferFromFile(file);
        data.file = bufferFile;
        break;
    }

    if (
      !dataType ||
      !name ||
      (dataType === 'email' && !email.trim()) ||
      (dataType === 'telegram' && !telegram.trim()) ||
      (dataType === 'file' && !file)
    ) {
      toast({
        variant: 'danger',
        title: 'Please fill in all required fields.',
      });
      return;
    }

    if (dataType === 'email' && !!email && !isValidEmail) {
      toast({
        variant: 'danger',
        title: 'Please enter a valid email address',
      });
      return;
    }

    if (dataType === 'telegram' && !!telegram && !isValidTelegram) {
      toast({
        variant: 'danger',
        title: 'Please enter a valid telegram chat ID',
      });
      return;
    }

    createProtectedDataMutation.mutate({ data, name });
  };

  return (
    <div className="mx-auto mb-28 w-[70%]">
      <div className="text-left">
        <Button asChild variant="text" size="sm">
          <Link to={`/protectedData`} className="pl-2">
            <ChevronLeft size="22" />
            <span className="pl-1">Back</span>
          </Link>
        </Button>
      </div>

      <h2>Protect New Data</h2>
      <p className="-mt-3 mb-4">
        Protect new email or file: encrypt, monetize and control access.
      </p>

      {(!createProtectedDataMutation.data ||
        createProtectedDataMutation.error) && (
        <>
          <form noValidate className="mt-6 w-full" onSubmit={handleSubmit}>
            <Label htmlFor="dataType">Select your data type *</Label>
            <Select onValueChange={onChangeDataType}>
              <SelectTrigger id="dataType" className="mt-1 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email" data-cy="email-address-select-item">
                  Email Address
                </SelectItem>
                <SelectItem value="telegram" data-cy="telegram-select-item">
                  Telegram
                </SelectItem>
                <SelectItem value="file" data-cy="file-select-item">
                  File
                </SelectItem>
              </SelectContent>
            </Select>

            {dataType === 'email' && (
              <div className="mt-6">
                <Label htmlFor="email-address">Email *</Label>
                <Input
                  id="email-address"
                  data-cy="email-address-input"
                  type="email"
                  value={email}
                  aria-label="Email Address"
                  className="mt-1"
                  onChange={handleEmailChange}
                />
              </div>
            )}

            {dataType === 'telegram' && (
              <div className="mt-6">
                <Label htmlFor="telegram">Telegram Chat ID *</Label>
                <Input
                  id="telegram"
                  data-cy="telegram-input"
                  type="text"
                  value={telegram}
                  placeholder="0123456789"
                  aria-label="Telegram Chat ID"
                  className="mt-1"
                  onChange={handleTelegramChange}
                />
                <div className="relative flex justify-between p-4">
                  <div>
                    <span className="">
                      Initiate a conversation with the bot
                      <Link
                        to="https://t.me/Web3Telegram_Bot"
                        className="font-semibold text-blue-700"
                      >
                        {' '}
                        @Web3Telegram_Bot{' '}
                      </Link>
                      or you will be unable to receive messages.
                    </span>
                    <br />
                    <br />
                    <span className="">
                      You can retrieve your{' '}
                      <span className="font-semibold">chat ID</span> using the
                      following bot :
                      <Link
                        to="https://t.me/getmyid_bot"
                        className="font-semibold text-blue-700"
                      >
                        {' '}
                        @getmyid_bot{' '}
                      </Link>
                      on Telegram.
                    </span>
                  </div>
                  <a
                    href="https://beta.tools.docs.iex.ec/tools/web3mail/getting-started.html"
                    target="_blank"
                  >
                    <span className="absolute bottom-0 right-0 rounded-xl bg-primary p-2">
                      {' '}
                      Learn more{' '}
                    </span>
                  </a>
                </div>
              </div>
            )}

            {dataType === 'file' && (
              <Button
                variant="secondary"
                className="mt-5 w-full"
                onClick={() => fileInput.current?.click()}
              >
                {!filePath ? 'Upload' : 'Updated File'}
                <input
                  ref={fileInput}
                  hidden
                  multiple
                  type="file"
                  onChange={(e) => handleFileChange(e)}
                />
              </Button>
            )}
            {filePath && dataType === 'file' && (
              <div className="mt-2 flex items-center gap-x-2">
                {filePath.split('\\').slice(-1)}
                <CheckCircle size="20" className="text-success-foreground" />
              </div>
            )}

            {dataType && (
              <div className="mt-6">
                <Label htmlFor="protected-data-name">
                  Name of your Protected Data *
                </Label>
                <Input
                  id="protected-data-name"
                  data-cy="protected-data-name-input"
                  value={name}
                  aria-label="Name of your Protected Data"
                  className="mt-1"
                  onChange={handleNameChange}
                />
              </div>
            )}

            {dataType && !createProtectedDataMutation.isPending && (
              <div className="text-center">
                <Button type="submit" data-cy="create-button" className="mt-6">
                  Create Protected Data
                </Button>
              </div>
            )}
          </form>

          {createProtectedDataMutation.isPending && (
            <div className="flex flex-col items-center gap-y-4">
              <CircularLoader className="mt-10" />
              Your protected data is currently being created. Please wait a few
              moments.
            </div>
          )}

          {createProtectedDataMutation.error && (
            <Alert variant="error" className="mb-3 mt-6">
              <AlertTitle>
                Oops, something went wrong while creating your protected data.
              </AlertTitle>
              <AlertDescription>
                {createProtectedDataMutation.error.toString()}
              </AlertDescription>
            </Alert>
          )}

          <DocLink className="mt-20">
            dataprotector-sdk / Method called in this page:{' '}
            <a
              href="https://beta.tools.docs.iex.ec/tools/dataProtector/dataProtectorCore/protectData.html"
              target="_blank"
              rel="noreferrer"
              className="text-link hover:underline"
            >
              protectData()
            </a>
          </DocLink>
        </>
      )}

      {createProtectedDataMutation.data &&
        !createProtectedDataMutation.error && (
          <>
            <div className="my-6 flex flex-col items-center">
              <Alert variant="success" className="mt-6">
                <AlertTitle>Your data has been protected!</AlertTitle>
                <AlertDescription>
                  <a
                    href={`https://explorer.iex.ec/bellecour/dataset/${createProtectedDataMutation.data.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline"
                  >
                    See Details
                  </a>
                  <p className="text-sm">
                    Your protected data address:{' '}
                    {createProtectedDataMutation.data.address}
                  </p>
                </AlertDescription>
              </Alert>
            </div>

            <div
              className={cn(
                'text-center transition-opacity',
                showBackToListLink ? 'opacity-1' : 'opacity-0'
              )}
            >
              <Link to={`/protectedData`} className="p-2 underline">
                See my protected data
              </Link>
            </div>
          </>
        )}
    </div>
  );
}
