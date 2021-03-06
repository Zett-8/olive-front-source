import React from 'react'
import { connect } from 'react-redux'
import NotificationSystem from 'react-notification-system'

import Progress from '../components/deal/deal_progress'
import Info from '../components/deal/deal_info'
import Messages from '../components/deal/deal_messages'
import Page404 from '../components/404'
import { errorNotificationBody } from '../utils/notification'

import { getWorkDetail, changeWorkStatus } from '../actions/workDetail'
import { getBuyerInfo } from '../actions/buyerDetail'
import { clearMessage, getMessages, sendMessage } from '../actions/messages'

class DealPageContainer extends React.Component {
  constructor(props) {
    super(props)

    this.notificationSystem = React.createRef()

    this.state = {
      verified: false,
      message: '',
      role: '',
    }
  }

  async componentDidMount() {
    document.title = '取引ページ | Olive'

    await this.props.clearMessage()

    const { workId } = this.props.match.params
    const err = await this.props.getWorkDetail(workId)

    const self = this.props.loginStatus
    const work = this.props.workDetail.contents

    // kick out stranger
    if (work.artist.id !== self.user_id && work.buyer.id !== self.user_id) {
      this.props.history.push('/')
      return null
    }

    this.setState({ verified: true })

    this.props.getMessages(this.props.workDetail.contents.id)
    this.props.getBuyerInfo(this.props.loginStatus.token, this.props.workDetail.contents.buyer.id)

    this.setState({ role: work.buyer.id === self.user_id ? 'buyer' : 'artist' })
  }

  notifyPayment = () => this.props.changeWorkStatus(this.props.loginStatus.token, this.props.workDetail.contents.id, 3)
  notifyShipment = () => this.props.changeWorkStatus(this.props.loginStatus.token, this.props.workDetail.contents.id, 6)
  notifyReception = () => this.props.changeWorkStatus(this.props.loginStatus.token, this.props.workDetail.contents.id, 7)

  messageTyped = e => this.setState({ message: e.target.value })

  sendMessage = async e => {
    e.preventDefault()
    if (this.state.message === '') return null

    const work = this.props.workDetail.contents

    const err = await this.props.sendMessage(
      work.id,
      this.props.loginStatus.user_id,
      this.props.loginStatus.user_id === work.buyer.id ? work.artist.id : work.buyer.id,
      this.state.message
    )

    if (err) {
      this.notificationSystem.current.addNotification(errorNotificationBody)
      return null
    }

    this.setState({ message: '' })
  }

  render() {
    if (!this.state.verified) return <Page404 />

    if (this.props.messages.pristine || this.props.buyerDetail.pristine) return null

    return (
      <React.Fragment>
        <NotificationSystem ref={this.notificationSystem} />
        <div className="deal">
          <div className="deal__progress">
            <Progress
              work={this.props.workDetail.contents}
              role={this.state.role}
              notifyPayment={this.notifyPayment}
              notifyShipment={this.notifyShipment}
              notifyReception={this.notifyReception}
            />
          </div>
          <div className="deal__info">
            <Info work={this.props.workDetail.contents} buyerDetail={this.props.buyerDetail.contents} />
          </div>
          <div className="deal__messages">
            <Messages
              userId={this.props.loginStatus.user_id}
              messages={this.props.messages.contents}
              inputMessage={this.state.message}
              messageTyped={this.messageTyped}
              sendMessage={this.sendMessage}
            />
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default connect(
  state => ({
    loginStatus: state.loginStatus,
    workDetail: state.workDetail,
    buyerDetail: state.buyerDetail,
    messages: state.messages,
  }),
  dispatch => ({
    getWorkDetail: id => dispatch(getWorkDetail(id)),
    getBuyerInfo: (token, buyerId) => dispatch(getBuyerInfo(token, buyerId)),
    changeWorkStatus: (token, workId, status) => dispatch(changeWorkStatus(token, workId, status)),
    clearMessage: () => dispatch(clearMessage()),
    getMessages: workId => dispatch(getMessages(workId)),
    sendMessage: (workId, sender, receiver, body) => dispatch(sendMessage(workId, sender, receiver, body)),
  })
)(DealPageContainer)
