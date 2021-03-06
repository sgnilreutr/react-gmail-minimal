import { loadEmails } from '../Store/metaListSlice'
import * as local from '../constants/emailListConstants'

const loadNextPage = ({ nextPageToken, labelIds, dispatch }) => {
  if (labelIds && nextPageToken) {
    const params = {
      labelIds,
      nextPageToken,
      maxResults: local.MAX_RESULTS,
    }
    dispatch(loadEmails(params))
  }
}

export default loadNextPage
