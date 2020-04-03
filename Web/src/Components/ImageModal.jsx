import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Slider from 'rc-slider';

const ImageModal = ({ show, selectedMarker, hide }) => {
  const [opacity, setOpacity] = useState(0);
  const { imageId } = selectedMarker || {};
  return (
    <Modal isOpen={show} toggle={hide} className="modal-width">
      <ModalHeader toggle={hide}>Location Details</ModalHeader>
      <ModalBody>
        <div className="row">
          <div className="col-md-12">
            <div className="image-modal-c">
              <img className="img-fluid unselectable" src={`https://adamjhonts.blob.core.windows.net/greenindex/Stitched/Non-Filtered/${imageId}.jpg`} />
              <img className="img-fluid unselectable" src={`https://adamjhonts.blob.core.windows.net/greenindex/Stitched/Filtered/${imageId}.jpg`} style={{ opacity: opacity / 100 }} />
            </div>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-md-12">
            <Slider min={0} max={100} value={opacity} onChange={setOpacity} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="unselectable text-center">{opacity}% Mix</div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter />
    </Modal>
  );
};

ImageModal.propTypes = {
  show: PropTypes.bool.isRequired,
  selectedMarker: PropTypes.object,
  hide: PropTypes.func.isRequired,
};

export default ImageModal;
