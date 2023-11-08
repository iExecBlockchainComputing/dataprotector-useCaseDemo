import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Snackbar,
  TextField,
  TextareaAutosize,
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { Button } from '@/components/ui/button';
import './SendEmail.css';
import { useParams } from 'react-router-dom';
import { useSendEmailMutation } from '@/app/appSlice';

const MAX_CHARACTERS_SENDER_NAME = 20;
const MAX_CHARACTERS_MESSAGE_SUBJECT = 78;

export default function SendEmail() {
  const { receiverAddress, protectedDataAddress } = useParams();

  //RTK Mutation hook
  const [sendEmail, result] = useSendEmailMutation();

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

  //handle functions
  const handleMessageSubjectChange = (event: any) => {
    const inputValue = event.target.value;
    setMessageSubject(inputValue);
  };

  const handleChange = (event: any) => {
    const inputValue = event.target.value;
    setMessage(inputValue);
  };

  const sendEmailHandle = () => {
    if (!protectedDataAddress) return;
    sendEmail({
      senderName,
      contentType,
      emailSubject: messageSubject,
      emailContent: message,
      protectedData: protectedDataAddress,
    });
  };

  //snackbar notification
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (result.isSuccess || result.isError) {
      setSuccess(result.isSuccess);
      setOpen(true);
    }
  }, [result]);

  const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleSelectContentType = (event: SelectChangeEvent) => {
    setContentType(event.target.value as string);
  };

  const handleSenderNameChange = (event: any) => {
    const inputValue = event.target.value;
    setSenderName(inputValue);
  };
  return (
    <Box sx={{ m: 6, mx: 20 }}>
      <h2>Send Mail to {receiverAddress}</h2>
      <Box sx={{ my: 2, display: 'flex', flexDirection: 'column' }}>
        <TextField
          fullWidth
          id="sender-name"
          label="Sender name"
          variant="outlined"
          value={senderName}
          onChange={handleSenderNameChange}
          className="mt-6"
          inputProps={{ maxLength: MAX_CHARACTERS_SENDER_NAME }}
        />
        <p className="italic text-sm my-2">
          {charactersRemainingSenderName >= 0
            ? charactersRemainingSenderName
            : 0}{' '}
          {charactersRemainingSenderName > 1 ? 'characters' : 'character'}{' '}
          remaining
        </p>
        <TextField
          fullWidth
          id="Message subject"
          label="Message subject"
          variant="outlined"
          required
          value={messageSubject}
          onChange={handleMessageSubjectChange}
          inputProps={{ maxLength: MAX_CHARACTERS_MESSAGE_SUBJECT }}
          className="mt-6"
        />
        <p className="italic text-sm my-2">
          {charactersRemainingSubject >= 0 ? charactersRemainingSubject : 0}{' '}
          {charactersRemainingSubject > 1 ? 'characters' : 'character'}{' '}
          remaining
        </p>
        <FormControl sx={{ textAlign: 'left', mt: 3 }} fullWidth>
          <InputLabel id="content-type-label">Content Type</InputLabel>
          <Select
            labelId="content-type-label"
            id="content-type-select"
            value={contentType}
            label="Content type"
            onChange={handleSelectContentType}
          >
            <MenuItem value="text/plain">text/plain</MenuItem>
            <MenuItem value="text/html">text/html</MenuItem>
          </Select>
        </FormControl>
        <TextareaAutosize
          required
          placeholder="Enter email content"
          value={message}
          onChange={handleChange}
          id="textArea"
          className="w-full border mt-4 !h-[200px] p-3"
        />
        <p className="italic text-sm my-2">
          {charactersRemainingMessage} characters remaining
        </p>
        <Button className="sendEmailButton" onClick={sendEmailHandle}>
          Send
        </Button>
      </Box>

      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Alert
          onClose={handleClose}
          severity={success ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {success ? 'The email has been sent!' : 'Failed to send the Email!'}
        </Alert>
      </Snackbar>
    </Box>
  );
}
