import React from 'react'
import { connect } from 'react-redux'
import { injectStripe } from 'react-stripe-elements'
import NotificationSystem from 'react-notification-system'

import StripeProvider from '../hocs/stripeProvider'
import WorkDetail from '../components/workDetail'
import PurchaseModalWindow from '../components/modal/purchaseModalWindow'
import {
  errorNotificationBody,
  notYetNotificationBody,
  oopsNotificationBody,
  wentWrongNotificationBody
} from '../utils/notification'

import { clearWorkDetail, getWorkDetail, purchaseWork, workWasBought, toggleFavorite } from '../actions/workDetail'

class WorkDetailPageContainer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      modalIsOpen: false,
      buyTransferButtonIsWorking: false,
      buyCreditButtonIsWorking: false
    }

    this.notificationSystem = React.createRef()
    this.mainImageRef = React.createRef()
  }

  componentWillUnmount() { this.props.clearWorkDetail() }

  async componentWillMount() {
    window.scrollTo(0, 0)
    await this.props.getWorkDetail(this.props.match.params.id)

    const w = this.props.workDetail.contents,
      login = this.props.loginStatus

    if (w.sold && (w.artist.id === login.user_id || w.buyer.id === login.user_id)) {
      this.setState({ bought: true })
    }

    document.title = this.props.workDetail.contents.title + ' - ' + this.props.workDetail.contents.artist.artist_name + ' | Olive'
  }

  componentDidMount() {

  }

  openModal = () => this.setState({ modalIsOpen: true })
  closeModal = () => this.setState({ modalIsOpen: false })

  toggleFavorite = async () => {
    if (!Object.keys(this.props.loginStatus).length) {
      notYetNotificationBody.message = 'お気に入りに追加するにはログインしてください'
      this.notificationSystem.current.addNotification(notYetNotificationBody)
      return null
    }

    const err = await this.props.toggleFavorite(this.props.workDetail.contents.id, this.props.loginStatus.user_id)

    if (err) this.notificationSystem.current.addNotification(errorNotificationBody)
  }

  chosePaymentMethod = () => {
    // buyer情報が登録できていない場合
    if (!this.props.loginStatus.buyer) {
      notYetNotificationBody.message = '購入者情報を登録してください'
      this.notificationSystem.current.addNotification(notYetNotificationBody)
      return null
    }

    // 自分の作品は購入できない
    if (this.props.loginStatus.user_id === this.props.workDetail.contents.artist.user_id) {
      oopsNotificationBody.message = '自分の作品は購入できません'
      this.notificationSystem.current.addNotification(oopsNotificationBody)
      return null
    }

    this.setState({ modalIsOpen: true})
  }

  purchaseWithBankTransfer = async () => {
    this.setState({ buyTransferButtonIsWorking: true })

    const err = await this.props.workWasBought(
      this.props.loginStatus.token,
      this.props.loginStatus.uuid,
      this.props.workDetail.contents.id,
      '2'
    )

    if (err) {
      this.notificationSystem.current.addNotification(errorNotificationBody)
      this.setState({ buyTransferButtonIsWorking: false })
      return null
    }

    this.closeModal()
    this.setState({ bought: true })

    this.props.history.push(`/work/${this.props.workDetail.contents.id}/deal`)

    this.setState({ buyTransferButtonIsWorking: false })
  }

  purchaseWithCredit = async () => {
    this.setState({ buyCreditButtonIsWorking: true })

    const detail = this.props.userDetail.contents
    let { token } = await this.props.stripe.createToken({name: `${detail.last_name} ${detail.first_name}`})
    if (token === undefined) {
      oopsNotificationBody.message = '無効なカード情報、または未対応のカードです'
      this.notificationSystem.current.addNotification(oopsNotificationBody)
      this.setState({ buyCreditButtonIsWorking: false })
      return null
    }

    const description = `[ID: ${this.props.workDetail.contents.id}] ${this.props.workDetail.contents.title}`
    const price = this.props.workDetail.contents.price
    const receipt = this.props.loginStatus.email

    let err = await this.props.purchaseWork(description, token.id, price, receipt)
    if (err) {
      this.notificationSystem.current.addNotification(errorNotificationBody)
      this.setState({ buyCreditButtonIsWorking: false })
      return null
    }

    err = await this.props.workWasBought(
      this.props.loginStatus.token,
      this.props.loginStatus.uuid,
      this.props.workDetail.contents.id,
      '4'
    )
    if (err) {
      wentWrongNotificationBody.children = (<div><p>購入は完了しましたが、更新に失敗しました。</p><br /><p>お手数ですが、お問い合わせをお願いします。</p></div>)
      this.notificationSystem.current.addNotification(wentWrongNotificationBody)
      this.setState({ buyCreditButtonIsWorking: false })
      return null
    }

    this.closeModal()
    this.setState({ bought: true })

    this.props.history.push(`/work/${this.props.workDetail.contents.id}/deal`)

    this.setState({ buyCreditButtonIsWorking: false })
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
          purchaseWithBankTransfer={this.purchaseWithBankTransfer}
          buyTransferButtonIsWorking={this.state.buyTransferButtonIsWorking}
          buyCreditButtonIsWorking={this.state.buyCreditButtonIsWorking}
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

const WrappedWorkDetail = StripeProvider(injectStripe(WorkDetailPageContainer))

export default connect(
  state => ({
    loginStatus: state.loginStatus,
    workDetail: state.workDetail,
    userDetail: state.userDetail
  }),
  dispatch => ({
    clearWorkDetail: () => dispatch(clearWorkDetail()),
    workWasBought: (token, buyerUUID, workId, status) => dispatch(workWasBought(token, buyerUUID, workId, status)),
    purchaseWork: (description, token, price, receipt) => dispatch(purchaseWork(description, token, price, receipt)),
    toggleFavorite: (workId, userId) => dispatch(toggleFavorite(workId, userId)),
    getWorkDetail: id => dispatch(getWorkDetail(id)),
  })
)(WrappedWorkDetail)


