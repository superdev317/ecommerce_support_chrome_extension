import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

export default class ConfirmModal extends React.Component {

  static propTypes = {
    message: PropTypes.string.isRequired,
    confirmModalIsOpen: PropTypes.bool.isRequired,
    handleCancel: PropTypes.func.isRequired,
    handleConfirm: PropTypes.func.isRequired,
  };

  render() {
    const { message, handleCancel, handleConfirm } = this.props;
    return (
      <div>
        <Dialog
          disableBackdropClick
          disableEscapeKeyDown
          open
          onClose={handleCancel}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <DialogContentText id="alert-dialog-description" dangerouslySetInnerHTML={{ __html: `${message}` }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirm} color="primary">
              Yes
            </Button>
            <Button onClick={handleCancel} color="primary">
              No
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
