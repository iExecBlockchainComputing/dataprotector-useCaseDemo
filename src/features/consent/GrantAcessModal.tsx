import './GrantAccessModal.css';
import { Button, TextField, Modal, Box } from '@mui/material';
import { useEffect, useState } from 'react';

type GrantAccessModalParams = {
  open: boolean;
  handleClose: () => void;
};

export default function GrantAcessModal(props: GrantAccessModalParams) {
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

  useEffect(() => {
    console.log('open Modal ? ', props.open);
  }, [props.open]);
  
  return (
    <div>
      <Modal open={props.open} onClose={props.handleClose}>
        <Box id="modalBox">
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
          <TextField
            fullWidth
            type="NbOfAccess"
            id="age"
            label="Number of Access"
            variant="outlined"
            value={NbOfAccess}
            InputProps={{ inputProps: { min: 1 } }}
            onChange={handleNbOfAccessChange}
            sx={{ mt: 3 }}
          />
          <Button variant="contained" color="primary">
            Validate
          </Button>
        </Box>
      </Modal>
    </div>
  );
}