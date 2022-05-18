/**
 * Created by leon<silenceace@gmail.com> on 22/2/22.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MEMBER_TOKEN_KEY } from '@src/config/constants'
import { logError } from '@src/helper/logger'
import NavigationService from '@src/navigation/NavigationService'
import { RootState } from '@src/store'
import { v2exLib } from '@src/v2ex'
import { Dispatch } from 'redux'
import {
  APP_AUTH,
  APP_AUTH_ERROR,
  APP_AUTH_LOADING,
  APP_AUTH_SUCCESS,
  APP_LOGOUT,
  MEMBER_INSEREST_NODE,
  MEMBER_PROFILE,
  MEMBER_SATE_SETTING,
  MEMBER_TOPICS,
  MEMBER_UNINTEREST_NODE,
  V2exObject
} from '../types'
import { cacheMemberInterestNodes } from './CacheAction'

export const myProfile = () => async (dispatch: Dispatch, getState: () => RootState) => {
  const _member = await v2exLib.member.myProfile()

  dispatch({
    type: MEMBER_PROFILE,
    payload: _member
  })

  dispatch({
    type: MEMBER_SATE_SETTING,
    payload: {
      interestNodes: getState().cache.membersInterestNodes[_member.id],
      followPeoples: getState().cache.membersFollowing[_member.id]
    }
  })
}

export const getToken = () => async (dispatch: Dispatch) => {
  dispatch({
    type: APP_AUTH_SUCCESS,
    payload: {}
  })
}

export const setMyTopics = (topics: V2exObject.Topic[]) => ({
  type: MEMBER_TOPICS,
  payload: topics
})

export const interestNode = (node: V2exObject.Node) => async (dispatch: Dispatch, getState: () => RootState) => {
  dispatch({
    type: MEMBER_INSEREST_NODE,
    payload: node
  })
  dispatch(cacheMemberInterestNodes(getState().member.interestNodes))
}

export const unInterestNode = (node: V2exObject.Node) => async (dispatch: Dispatch, getState: () => RootState) => {
  dispatch({
    type: MEMBER_UNINTEREST_NODE,
    payload: node
  })
  dispatch(cacheMemberInterestNodes(getState().member.interestNodes))
}

export const setCurrentToken = (token?: V2exObject.MToken) => ({
  type: APP_AUTH,
  payload: token
})

export const loginByToken = (token: string) => async (dispatch: Dispatch) => {
  try {
    dispatch({ type: APP_AUTH_LOADING })
    const token_info = await v2exLib.member.token(token)
    dispatch(loginByTokenSuccess(token_info) as any)
  } catch (e: any) {
    logError(e)
    loginByTokenFail(dispatch, e.message)
  }
}

const loginByTokenSuccess = (token: V2exObject.MToken) => async (dispatch: Dispatch, getState: () => RootState) => {
  await AsyncStorage.setItem(MEMBER_TOKEN_KEY, token.token)

  v2exLib.setToken(token.token)

  dispatch(setCurrentToken(token))

  dispatch({ type: APP_AUTH_SUCCESS, payload: token })

  dispatch(myProfile() as any)
}

const loginByTokenFail = (dispatch: Dispatch, message: string) => {
  AsyncStorage.removeItem(MEMBER_TOKEN_KEY)

  dispatch(errorMessage(message))
}
export const errorMessage = (error: string) => ({
  type: APP_AUTH_ERROR,
  payload: error
})

export const logout = () => (dispatch: Dispatch) => {
  AsyncStorage.setItem(MEMBER_TOKEN_KEY, '')
  v2exLib.setToken(undefined)
  dispatch({ type: APP_LOGOUT })

  NavigationService.navigate('SignIn')
}
