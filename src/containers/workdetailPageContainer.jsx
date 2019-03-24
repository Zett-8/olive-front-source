import React from 'react'
import { connect } from 'react-redux'
import NotificationSystem from 'react-notification-system'
import { injectStripe } from 'react-stripe-elements'

import WorkDetail from '../components/workDetail'
import PurchaseModalWindow from '../components/modal/purchaseModalWindow'
import { errorNotificationBody, successNotificationBody } from '../utils/notification'

import { clearWorkDetail, getWorkDetail, purchaseWork, workWasBought, toggleFavorite } from '../actions/workDetail'

class WorkDetailPageContainer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      modalIsOpen: false,
    }

    this.notificationSystem = React.createRef()
    this.mainImageRef = React.createRef()
  }

  async componentWillMount() {
    await this.props.clearWorkDetail()
    await this.props.getWorkDetail(this.props.match.params.id)

    const w = this.props.workDetail.contents,
      login = this.props.loginStatus

    if (w.sold && (w.artist.id === login.user_id || w.buyer.id === login.user_id)) {
      this.setState({ bought: true })
    }
  }

  openModal = () => this.setState({ modalIsOpen: true })
  closeModal = () => this.setState({ modalIsOpen: false })

  toggleFavorite = () => {
    if (!Object.keys(this.props.loginStatus).length) {
      const notification = this.notificationSystem.current

      notification.addNotification({
        message: 'お気に入りに追加するにはログインしてください',
        level: 'error',
        autoDismiss: 4,
        position: 'tc',
      })

      return
    }

    const err = this.props.toggleFavorite(this.props.workDetail.contents.id, this.props.loginStatus.user_id)
  }

  chosePaymentMethod = () => {
    // buyer情報が登録できていない場合
    if (!this.props.loginStatus.buyer) {
      const notification = this.notificationSystem.current

      notification.addNotification({
        message: '購入者情報を登録してください',
        level: 'error',
        autoDismiss: 4,
        position: 'tc',
      })

      return null
    }

    // 自分の作品は購入できない
    if (this.props.loginStatus.user_id === this.props.workDetail.contents.artist.user_id) {
      const notification = this.notificationSystem.current

      notification.addNotification({
        message: '自分の作品は購入できません',
        level: 'error',
        autoDismiss: 4,
        position: 'tc',
      })

      return null
    }

    this.setState({ modalIsOpen: true})
  }

  purchaseWithBankTransfer = async () => {

  }

  purchaseWithCredit = async () => {
    const notification = this.notificationSystem.current

    const detail = this.props.userDetail.contents
    let { token } = await this.props.stripe.createToken({name: `${detail.last_name} ${detail.first_name}`})
    const description = `[ID: ${this.props.workDetail.contents.id}] ${this.props.workDetail.contents.name}`
    const price = this.props.workDetail.contents.price
    const receipt = this.props.loginStatus.email

    let err = await this.props.purchaseWork(description, token.id, price, receipt)
    if (err) {
      errorNotificationBody.title = 'エラーID: ' + err.response.data.errorID
      errorNotificationBody.message = err.response.data.message
      notification.addNotification(errorNotificationBody)
      return null
    }

    err = await this.props.workWasBought(this.props.loginStatus.uuid, this.props.workDetail.contents.id, '3')
    if (err) {
      errorNotificationBody.title = 'エラーID: ' + err.response.data.errorID
      errorNotificationBody.message = err.response.data.message
      notification.addNotification(errorNotificationBody)
    }

    this.setState({ bought: true })
  }

  changeMainImage = url => (this.mainImageRef.current.style.backgroundImage = `url(${url})`)

  render() {
    if (this.props.workDetail.pristine) return null

    return (
      <React.Fragment>
        <NotificationSystem ref={this.notificationSystem} />
        <PurchaseModalWindow
          closeModal={this.closeModal}
          modalIsOpen={this.state.modalIsOpen}
          purchaseWithCredit={this.purchaseWithCredit}
        />

        <div className="workDetail">
          <WorkDetail
            self={{ user_id: this.props.loginStatus.user_id, UUID: this.props.loginStatus.uuid }}
            detail={this.props.workDetail.contents}
            chosePaymentMethod={this.chosePaymentMethod}
            toggleFavorite={this.toggleFavorite}
            bought={this.state.bought}
            mainImageRef={this.mainImageRef}
            changeMainImage={this.changeMainImage}
          />
        </div>
      </React.Fragment>
    )
  }
}

WorkDetailPageContainer = connect(
  state => ({
    loginStatus: state.loginStatus,
    workDetail: state.workDetail,
    userDetail: state.userDetail
  }),
  dispatch => ({
    clearWorkDetail: () => dispatch(clearWorkDetail()),
    workWasBought: (buyerUUID, workId, status) => dispatch(workWasBought(buyerUUID, workId, status)),
    purchaseWork: (description, token, price, receipt) => dispatch(purchaseWork(description, token, price, receipt)),
    toggleFavorite: (workId, userId) => dispatch(toggleFavorite(workId, userId)),
    getWorkDetail: id => dispatch(getWorkDetail(id)),
  })
)(WorkDetailPageContainer)

export default injectStripe(WorkDetailPageContainer)
