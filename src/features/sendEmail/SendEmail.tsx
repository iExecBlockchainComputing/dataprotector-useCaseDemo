import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Address, Contact, TimeStamp } from '@iexec/web3mail';
import SearchIcon from '@mui/icons-material/Search';
import { Box, CircularProgress, InputBase } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import SendIcon from '@mui/icons-material/Send';
import { Slash } from 'react-feather';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button.tsx';
import Alert from '@/components/Alert.tsx';
import { useFetchMyContactsQuery } from '@/app/appSlice.ts';
import { getLocalDateFromTimeStamp } from '@/utils/utils.ts';
import './SendEmail.css';

type Row = {
  id: string;
  owner: Address;
  protectedDataAddress: Address;
  accessGrantTimestamp: TimeStamp;
};

export default function SendEmail() {
  const navigate = useNavigate();
  const { address } = useAccount();

  //query RTK API as query hook
  const {
    data: myContacts = [],
    isLoading,
    isError,
  } = useFetchMyContactsQuery(address as string);

  //for search bar
  const [searchTerm, setSearchTerm] = useState('');

  const columns: GridColDef[] = [
    {
      field: 'owner',
      headerName: 'Eth Address',
      type: 'string',
      flex: 2,
    },
    {
      field: 'protectedDataAddress',
      headerName: 'Protected Data',
      type: 'string',
      flex: 2,
    },
    { field: 'accessGrantTimestamp', headerName: 'Access granted on', flex: 1 },
    {
      field: 'Actions',
      headerName: 'Actions',
      sortable: false,
      width: 175,
      renderCell: (params) => (
        <Button
          size="sm"
          className="pl-3.5"
          onClick={() =>
            navigate(`./${params.row.owner}/${params.row.protectedDataAddress}`)
          }
        >
          <SendIcon className="text-sm" />
          <span className="pl-1.5">Send web3 email</span>
        </Button>
      ),
    },
  ];

  //modified the return of fetchMyContact in the web3Mail SDK to order them by timestamp
  const rows: Row[] = [...myContacts]
    .sort(
      (a: Contact, b: Contact) =>
        Date.parse(b.accessGrantTimestamp) - Date.parse(a.accessGrantTimestamp)
    )
    .map((contact: Contact, index: number) => {
      return {
        id: index.toString(),
        owner: contact.owner.toLowerCase(),
        protectedDataAddress: contact.address.toLowerCase(),
        accessGrantTimestamp: getLocalDateFromTimeStamp(
          contact.accessGrantTimestamp
        ),
      };
    });

  const filteredRows: Row[] = rows.filter((row: { owner: string }) =>
    row.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Box>
      <h2>Contacts List</h2>
      <p>
        These are contacts that have protected their email address data and have
        allowed you to use it. You can send them a message, without knowing
        their email address.
      </p>

      <Box id="search" sx={{ mt: 5 }}>
        <div id="iconWrapper">
          <SearchIcon sx={{ color: '#788896' }} />
        </div>
        <InputBase
          placeholder="Search address"
          inputProps={{ 'aria-label': 'search' }}
          id="inputSearch"
          sx={{ width: '100%' }}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Box>

      {isLoading && (
        <div className="flex flex-col items-center gap-y-4">
          <CircularProgress className="mt-10"></CircularProgress>
          Fetching your contacts...
        </div>
      )}

      {isError && (
        <div className="mt-10 flex flex-col items-center">
          <Alert variant="error">
            Oops, something went wrong while fetching protected data shared with
            you.
          </Alert>
        </div>
      )}

      {!isLoading && !isError && filteredRows.length === 0 && (
        <div className="my-10 flex items-center justify-center gap-x-2">
          <Slash size="18" className="inline" />
          So far, nobody shared their protected data with you.
        </div>
      )}

      {filteredRows.length > 0 && !isLoading && (
        <div className="mt-8 w-full">
          <DataGrid
            disableColumnMenu
            rows={filteredRows}
            columns={columns}
            sx={{ border: 'none' }}
          />
        </div>
      )}
    </Box>
  );
}
