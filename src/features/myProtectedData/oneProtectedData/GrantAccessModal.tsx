import { useUserStore } from '@/stores/user.store.ts';
import { ProtectedData, WorkflowError } from '@iexec/dataprotector';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ZeroAddress } from 'ethers';
import { type FormEvent, useState } from 'react';
import { Loader } from 'react-feather';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { useToast } from '@/components/ui/use-toast.ts';
import {
  WEB3MAIL_IAPPS_WHITELIST_SC,
  WEB3TELEGRAM_IAPP_ADDRESS,
} from '@/config/config.ts';
import { getDataProtectorClient } from '@/externals/dataProtectorClient.ts';
import { isKeyInDataSchema } from '@/utils/utils.ts';

type GrantAccessModalParams = {
  protectedData: ProtectedData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function GrantAccessModal(props: GrantAccessModalParams) {
  const { address } = useUserStore();

  const { toast } = useToast();

  const queryClient = useQueryClient();

  const [error, setError] = useState('');
  const [subError, setSubError] = useState('');

  //for ethAddress
  const [ethAddress, setEthAddress] = useState('');
  const handleEthAddressChange = (event: any) => {
    setEthAddress(event.target.value);
  };

  //for NbOfAccess
  const [nbOfAccess, setNbOfAccess] = useState(1);
  const handleNbOfAccessChange = (event: any) => {
    setNbOfAccess(event.target.value);
  };

  const grantNewAccessMutation = useMutation({
    mutationKey: ['grantAccess'],
    mutationFn: async () => {
      const { dataProtector } = await getDataProtectorClient();

      let appOrWhitelistAddress = '';
      if (isKeyInDataSchema(props.protectedData.schema, 'email')) {
        appOrWhitelistAddress = WEB3MAIL_IAPPS_WHITELIST_SC;
      } else if (isKeyInDataSchema(props.protectedData.schema, 'chatId')) {
        appOrWhitelistAddress = WEB3TELEGRAM_IAPP_ADDRESS;
      } else {
        // appOrWhitelistAddress = ''; // TODO Put delivery iApp here?
        throw new Error(
          "Can't grant access to a file. Not sure which iApp to use..."
        );
      }
      console.log('appOrWhitelistAddress', appOrWhitelistAddress);

      return dataProtector.grantAccess({
        protectedData: props.protectedData.address,
        authorizedApp: appOrWhitelistAddress,
        authorizedUser: ethAddress,
        numberOfAccess: nbOfAccess,
      });
    },
    onSuccess: () => {
      toast({
        title: 'New access granted!',
      });
      setEthAddress('');
      setNbOfAccess(1);
      props.onOpenChange(false);
      queryClient.invalidateQueries({
        queryKey: ['grantedAccess', props.protectedData],
      });
    },
    // TODO When ValidationError will be exposed by SDKs
    // onError: (err: ValidationError | WorkflowError | Error) => {
    onError: (err: WorkflowError | Error) => {
      // logs and rollbar alert handled by tanstack query config in initQueryClient()
      toast({
        variant: 'danger',
        title:
          (err.cause as Error)?.message ||
          err?.message ||
          'Failed to grant access!',
      });
      if (
        err.message === 'Failed to sign data access' &&
        !(err.cause as Error).message.startsWith('ethers-user-denied')
      ) {
        setError((err.cause as Error).message);
        setSubError(
          'Are you sure your protected data was created in the same environment?'
        );
      }
    },
  });

  const handleGrantAccess = (event: FormEvent) => {
    event.preventDefault();

    if (!ethAddress.trim()) {
      toast({
        variant: 'danger',
        title: 'Please fill in all required fields.',
      });
      return;
    }

    grantNewAccessMutation.mutate();
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-[550px] rounded-md bg-white p-8">
        <DialogTitle>New user</DialogTitle>

        {/* Description for accessibility */}
        <DialogDescription className="hidden">
          Allow a new user to access your protected data
        </DialogDescription>

        <form
          noValidate
          className="mt-6 flex w-full flex-col"
          onSubmit={handleGrantAccess}
        >
          <div>
            <Label htmlFor="user-ethereum-address">
              User Ethereum Address *
            </Label>
            <Input
              id="user-ethereum-address"
              value={ethAddress}
              aria-label="User Ethereum Address"
              className="mt-1"
              onChange={handleEthAddressChange}
            />
            <div className="ml-0.5 mt-1">
              <span className="text-sm">Authorize any user: </span>
              <Button
                variant="chip"
                size="xs"
                onClick={() => {
                  setEthAddress(ZeroAddress);
                }}
              >
                {ZeroAddress}
              </Button>
            </div>
            {address && (
              <div className="ml-0.5 mt-1">
                <span className="text-sm">Authorize myself: </span>
                <Button
                  variant="chip"
                  size="xs"
                  onClick={() => {
                    setEthAddress(address);
                  }}
                >
                  {address}
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4">
            <Label htmlFor="numberOfAccess">Number of Access *</Label>
            <Input
              id="numberOfAccess"
              value={nbOfAccess}
              aria-label="Number of Access"
              className="mt-1"
              onChange={handleNbOfAccessChange}
            />
          </div>

          {!!error && !!subError && (
            <Alert variant="error" className="mt-6">
              <AlertTitle>{error}</AlertTitle>
              <AlertDescription>{subError}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 flex justify-center">
            <Button type="submit" disabled={grantNewAccessMutation.isPending}>
              {grantNewAccessMutation.isPending && (
                <Loader className="-ml-1 mr-2 animate-spin-slow" size="16" />
              )}
              <span>Validate</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
