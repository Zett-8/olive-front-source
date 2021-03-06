import React from 'react'
import API from '../utils/api'

class PasswordReset extends React.Component {
  componentDidMount() {
    this.set
  }

  componentWillMount() {
    this.setState({ email: this.props.match.params.email })
  }

  resetPassword = async () => {
    const err = await API.resetPassword(this.state.email)

    if (err) return null

    this.props.history.push('/message/sent-email')
  }

  render() {
    return (
      <div className="confirmPasswordReset">
        <div>
          Email: {this.state.email}
          <br />
          上記のメールアドレスに仮パスワードを送信します。
          <br />
          よろしければ、「OK」を押してください。
        </div>
        <button className="b_btn b_btn__8rem" type="button" onClick={this.resetPassword}>OK</button>
        <button className="w_btn w_btn__8rem" type="button" onClick={() => this.props.history.push('/login')}>Cancel</button>
      </div>
    )
  }
}

export default PasswordReset
