import { type FormEvent, useState } from 'react';
import { ZeroAddress } from 'ethers';
import './GrantAccessModal.css';
import { TextField, Modal, Typography } from '@mui/material';
import { Loader } from 'react-feather';
import { Button } from '@/components/ui/button.tsx';
import { useToast } from '@/components/ui/use-toast.ts';
import { useGrantNewAccessMutation } from '@/app/appSlice.ts';
import { SMART_CONTRACT_WEB3MAIL_WHITELIST } from '@/config/config.ts';

type GrantAccessModalParams = {
  protectedData: string;
  open: boolean;
  handleClose: () => void;
};

export default function GrantAccessModal(props: GrantAccessModalParams) {
  const { toast } = useToast();

  //rtk mutation
  const [grantNewAccess, result] = useGrantNewAccessMutation();

  //for ethAddress
  const [ethAddress, setEthAddress] = useState('');
  const [isValidEthAddress, setIsValidEthAddress] = useState(true);
  const handleEthAddressChange = (event: any) => {
    setEthAddress(event.target.value);
    setIsValidEthAddress(event.target.validity.valid);
  };

  //for NbOfAccess
  const [NbOfAccess, setNbOfAccess] = useState(1);
  const handleNbOfAccessChange = (event: any) => {
    setNbOfAccess(event.target.value);
  };

  const handleGrantAccess = (event: FormEvent) => {
    event.preventDefault();
    if (!ethAddress.trim()) {
      toast({
        variant: 'danger',
        title: 'Please fill in all required fields.',
      });
      return;
    }
    const protectedData = props.protectedData;
    grantNewAccess({
      protectedData,
      authorizedApp: SMART_CONTRACT_WEB3MAIL_WHITELIST,
      authorizedUser: ethAddress,
      numberOfAccess: NbOfAccess,
    })
      .unwrap()
      .then(() => {
        toast({
          title: 'New access granted!',
        });
        setEthAddress('');
        setNbOfAccess(1);
        props.handleClose();
      })
      .catch((err) => {
        toast({
          variant: 'danger',
          title: err || 'Failed to grant access!',
        });
      });
  };

  return (
    <Modal open={props.open} onClose={props.handleClose}>
      <div id="modalBox" className="w-[520px] rounded-md bg-white p-8">
        <Typography
          component="h1"
          variant="h5"
          sx={{ alignSelf: 'flex-start' }}
        >
          New user
        </Typography>
        <form
          noValidate
          className="flex w-full flex-col gap-4"
          onSubmit={handleGrantAccess}
        >
          <div>
            <TextField
              required
              fullWidth
              id="ethAddress"
              label="Ethereum Address"
              variant="outlined"
              sx={{ mt: 3 }}
              value={ethAddress}
              onChange={handleEthAddressChange}
              type="ethAddress"
              error={!isValidEthAddress}
              helperText={
                !isValidEthAddress && 'Please enter a valid ethereum Address'
              }
            />
            <div className="ml-0.5 mt-1 text-xs">
              Authorize any user:{' '}
              <button
                type="button"
                className="bg-transparent underline"
                onClick={() => {
                  setEthAddress(ZeroAddress);
                  setIsValidEthAddress(true);
                }}
              >
                0x000...
              </button>
            </div>
          </div>
          <TextField
            fullWidth
            type="NbOfAccess"
            id="age"
            label="Number of Access"
            variant="outlined"
            value={NbOfAccess}
            InputProps={{ inputProps: { min: 1 } }}
            onChange={handleNbOfAccessChange}
            sx={{ mt: 2 }}
          />
          <div className="mt-2 flex justify-center">
            <Button type="submit" disabled={result.isLoading}>
              {result.isLoading && (
                <Loader className="-ml-1 mr-2 animate-spin-slow" size="16" />
              )}
              <span>Validate</span>
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
