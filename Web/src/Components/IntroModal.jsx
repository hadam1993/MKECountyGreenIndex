import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const IntroModal = ({ show, hide }) => {
  return (
    <Modal isOpen={show} toggle={hide}>
      <ModalHeader toggle={hide}>MKE County Green Index</ModalHeader>
      <ModalBody>
        <div className="row">
          <div className="col-md-12">
            test
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <button className="btn btn-sm btn-secondary" onClick={hide}>Close</button>
      </ModalFooter>
    </Modal>
  );
};

IntroModal.propTypes = {
  show: PropTypes.bool.isRequired,
  hide: PropTypes.func.isRequired,
};

export default IntroModal;
