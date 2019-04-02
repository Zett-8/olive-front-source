import Api from '../utils/api'

export const actionTypes = {
  GET_POPULAR_WORKS: 'GET_POPULAR_WORKS',
  GET_NEW_WORKS: 'GET_NEW_WORKS',
  GET_FAVORITE_WORKS: 'GET_FAVORITE_WORKS',
  CLEAR_WORKS_OF_ARTIST: 'CLEAR_WORKS_OF_ARTIST',
  GET_WORKS_OF_ARTIST: 'GET_WORKS_OF_AN_ARTIST',
  GET_FILTERED_WORKS: 'GET_FILTERED_WORKS',
  GET_PURCHASED_HISTORY: 'GET_PURCHASED_HISTORY'
}

export const getPopularWorks = () => dispatch => {
  return Api.getPopularWorks()
    .then(res => {
      dispatch({
        type: actionTypes.GET_POPULAR_WORKS,
        payload: res.data,
      })
    })
    .catch(res => res)
}

export const getNewWorks = () => dispatch => {
  return Api.getNewWorks()
    .then(res => {
      dispatch({
        type: actionTypes.GET_NEW_WORKS,
        payload: res.data,
      })
    })
    .catch(res => res)
}

export const getFavoriteWorks = (userId) => dispatch => {
  return Api.getFavoriteWorks(userId)
    .then(res => {
      dispatch({
        type: actionTypes.GET_FAVORITE_WORKS,
        payload: res.data
      })
    })
    .catch(res => res)
}

export const clearWorksOfArtist = () => dispatch => dispatch({ type: actionTypes.CLEAR_WORKS_OF_ARTIST })

export const getWorksOfAnArtist = (id) => dispatch => {
  return Api.getWorksOfAnArtist(id)
    .then(res => {
      dispatch({
        type: actionTypes.GET_WORKS_OF_ARTIST,
        payload: res.data
      })
    })
    .catch(res => res)
}

export const getFilteredWorks = q => dispatch => {
  return Api.getFilteredWorks(q)
    .then(res => {
      dispatch({
        type: actionTypes.GET_FILTERED_WORKS,
        payload: res.data
      })
    })
    .catch(res => res)
}

export const getPurchasedHistory = (userId) => dispatch => {
  return Api.getPurchasedHistory(userId)
    .then(res => {
      dispatch({
        type: actionTypes.GET_PURCHASED_HISTORY,
        payload: res.data
      })
    })
    .catch(res => res)
}
