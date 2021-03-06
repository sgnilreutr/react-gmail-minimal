/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import labelApi from '../data/labelApi'
import { setServiceUnavailable } from './utilsSlice'

const api = labelApi()

export const labelsSlice = createSlice({
  name: 'labels',
  initialState: {
    labelIds: '',
    loadedInbox: [],
    storageLabels: [],
  },
  reducers: {
    setCurrentLabels: (state, action) => {
      state.labelIds = action.payload
    },
    setLoadedInbox: (state, action) => {
      const labelArray = Array.isArray(action.payload)
        ? action.payload
        : [action.payload]
      if (!state.loadedInbox.includes(labelArray)) {
        state.loadedInbox = [...new Set([...state.loadedInbox, labelArray])]
      }
    },
    setStorageLabels: (state, action) => {
      if (!Array.isArray(action.payload)) {
        const labelIdName = {
          id: action.payload.id,
          name: action.payload.name,
        }
        state.storageLabels = [...state.storageLabels, labelIdName]
      }
      const labelIdNameArray = action.payload.map((label) => ({
        id: label[0].id,
        name: label[0].name,
      }))
      state.storageLabels = [...state.storageLabels, ...labelIdNameArray]
    },
  },
})

export const { setCurrentLabels, setLoadedInbox, setStorageLabels } =
  labelsSlice.actions

export const createLabel = (label) => {
  return async (dispatch) => {
    try {
      const body = {
        labelVisibility: label.labelVisibility ?? 'labelShow',
        messageListVisibility: label.messageListVisibility ?? 'show',
        name: label.name ?? label,
      }
      return axios
        .post(`/api/labels`, body)
        .then((res) => {
          if (res.status === 200) {
            dispatch(setStorageLabels(res.data.message))
          } else {
            dispatch(setServiceUnavailable('Error creating label.'))
          }
        })
        .catch((err) => console.log(err))
    } catch (err) {
      console.log(err)
      dispatch(setServiceUnavailable('Error creating label.'))
    }
    return null
  }
}

export const fetchLabelIds = (LABEL) => {
  return async (dispatch) => {
    try {
      const listAllLabels = await api.fetchLabel()
      const {
        message: { labels },
      } = listAllLabels
      if (labels) {
        const labelObject = labels.filter((label) => label.name === LABEL)
        if (labelObject.length > 0) {
          // console.log(labelObject)
          dispatch(setCurrentLabels([labelObject[0].id]))
          dispatch(setStorageLabels([labelObject[0].id]))
        } else {
          dispatch(setServiceUnavailable('Error fetching label.'))
        }
      } else {
        dispatch(setServiceUnavailable('Error fetching label.'))
      }
    } catch (err) {
      console.log(err)
      dispatch(setServiceUnavailable('Error fetching label.'))
    }
    // TO-DO: What if multiple labels are used
  }
}

export const selectLabelIds = (state) => state.labels.labelIds
export const selectLoadedInbox = (state) => state.labels.loadedInbox
export const selectStorageLabels = (state) => state.labels.storageLabels

export default labelsSlice.reducer
