import React from 'react'
import PropTypes from 'prop-types'

const registrationDone = props => {
  return (
    <React.Fragment>
      <div>
        ユーザー登録が完了しました。
        <br />
        ログインページからログインしてご利用ください。
      </div>
      <button className="w_btn w_btn__20rem" type="button" onClick={() => props.history.push('/login')}>Login Page</button>
    </React.Fragment>
  )
}

registrationDone.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
}

export default registrationDone
