import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, List, IconButton, Snackbar, Alert } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRevokeOneAccessMutation } from '../../app/appSlice';
import './AuthorizedUsersList.css';

interface AuthorizedUsersListProps {
  authorizedUsers: string[];
  count: number;
  pageSize: number;
  page: number;
  onPageChanged: (newPage: number) => void;
}

export default function AuthorizedUsersList(props: AuthorizedUsersListProps) {
  const { authorizedUsers, count, pageSize, page, onPageChanged } = props;
  const { ProtectedDataId } = useParams();

  const paginationModel = {
    pageSize,
    page,
  };

  const users = authorizedUsers.map((user) => ({ id: user }));

  //query RTK API as mutation hook
  const [revokeOneAccess] = useRevokeOneAccessMutation();

  // Snackbar notifications
  const [isSnackbarVisible, setSnackbarVisible] = useState(false);
  const [isErrorSnackbarVisible, setErrorSnackbarVisible] = useState(false);

  const handleDelete = (value: string) => async () => {
    if (ProtectedDataId !== undefined) {
      revokeOneAccess({
        protectedData: ProtectedDataId,
        authorizedUser: value,
      })
        .unwrap()
        .then(() => {
          setSnackbarVisible(true);
        })
        .catch(() => {
          setErrorSnackbarVisible(true);
        });
    }
  };

  const handleCloseSnackbar = (
    _: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarVisible(false);
  };

  const handleCloseErrorSnackbar = (
    _: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setErrorSnackbarVisible(false);
  };

  const columns: GridColDef[] = [
    {
      field: 'avatar',
      sortable: false,
      width: 60,
      renderHeader: () => null,
      renderCell: () => <Avatar alt={`Avatar`} />,
    },
    {
      field: 'id',
      sortable: false,
      type: 'string',
      flex: 1,
    },
    {
      field: 'Actions',
      sortable: false,
      width: 60,
      renderCell: (params) => (
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={handleDelete(params.value)}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <List>
        <DataGrid
          disableColumnMenu
          autoHeight
          rows={users}
          columns={columns}
          paginationMode="server"
          paginationModel={paginationModel}
          pageSizeOptions={[pageSize]}
          rowCount={count}
          onPaginationModelChange={({ page: newPage }) =>
            onPageChanged(newPage)
          }
          sx={{ border: 'none' }}
          disableRowSelectionOnClick={true}
        />

        <Snackbar
          open={isSnackbarVisible}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            sx={{ width: '100%' }}
          >
            The granted access has been successfully revoked!
          </Alert>
        </Snackbar>

        <Snackbar
          open={isErrorSnackbarVisible}
          autoHideDuration={6000}
          onClose={handleCloseErrorSnackbar}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        >
          <Alert
            onClose={handleCloseErrorSnackbar}
            severity="error"
            sx={{ width: '100%' }}
          >
            Failed to revoke access
          </Alert>
        </Snackbar>
      </List>
    </>
  );
}