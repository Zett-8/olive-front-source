import React from 'react'
import PropTypes from 'prop-types'
import ModalSetting from 'react-modal'
import { CardElement } from 'react-stripe-elements'
import { BANK_INFO } from '../../utils/settings'

import Loading from '../../assets/loading.gif'

const customStyles = {
  content: {
    zIndex: '100',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-20%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '40rem'
  },
  // overlay : {
  //   backgroundColor: '#f6f6f6'
  // }
}

const purchaseModalWindow = props => {
  return (
    <ModalSetting
      isOpen={props.modalIsOpen}
      // onAfterOpen={props.afterOpenModal}
      onRequestClose={props.closeModal}
      style={customStyles}
      contentLabel="Purchase Work"
    >
      <div className="checkout-modal">
        <h2>支払方法を選択</h2>
        {BANK_INFO()}
        {props.buyTransferButtonIsWorking ? (
          <button className="w_btn b_btn__20rem" type="button" onClick={() => null}>
            <p><img alt="" src={Loading} height="10px" /></p>
          </button>
        ) : (
          <button className="b_btn b_btn__20rem" type="button" onClick={props.purchaseWithBankTransfer}>
            銀行振込で支払う
          </button>
        )}

        <CardElement />
        <p style={{ marginTop: '-1.4rem' }}>[ 対応カード: VISA, MasterCard, AMEX ]</p>
        {props.buyCreditButtonIsWorking ? (
          <button className="w_btn b_btn__20rem" type="button" onClick={() => null}>
            <p><img alt="" src={Loading} height="10px" /></p>
          </button>
        ) : (
          <button className="b_btn b_btn__20rem" type="button" onClick={props.purchaseWithCredit}>
            カードで支払う
          </button>
        )}
      </div>
    </ModalSetting>
  )
}

purchaseModalWindow.propTypes = {
  modalIsOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  purchaseWithCredit: PropTypes.func.isRequired,
  purchaseWithBankTransfer: PropTypes.func.isRequired,
  buyTransferButtonIsWorking: PropTypes.bool,
  buyCreditButtonIsWorking: PropTypes.bool
}

export default purchaseModalWindow
