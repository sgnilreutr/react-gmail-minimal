import React, { useEffect, useMemo } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import EmailListItem from '../EmailListItem/EmailListItem'
import {
  // loadDraftList,
  loadEmails,
  refreshEmailFeed,
} from '../../Store/metaListSlice'
import { loadDraftList } from '../../Store/draftsSlice'
import { selectEmailList } from '../../Store/emailListSlice'
import { selectLabelIds, selectLoadedInbox } from '../../Store/labelsSlice'
import { selectIsLoading } from '../../Store/utilsSlice'
import Emptystate from '../Elements/EmptyState'
import LoadingState from '../Elements/LoadingState'
import * as local from '../../constants/emailListConstants'
import * as draft from '../../constants/draftConstants'
import { CustomButtonText } from '../Elements/Buttons'
import * as S from './EmailListStyles'
import * as GS from '../../styles/globalStyles'
import loadNextPage from '../../utils/loadNextPage'

const EmailList = () => {
  const emailList = useSelector(selectEmailList)
  const isLoading = useSelector(selectIsLoading)
  const labelIds = useSelector(selectLabelIds)
  const loadedInbox = useSelector(selectLoadedInbox)
  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => {
    if (
      labelIds &&
      labelIds.some((val) => loadedInbox.flat(1).indexOf(val) === -1)
    ) {
      const params = {
        labelIds,
        maxResults: local.MAX_RESULTS,
      }
      dispatch(loadEmails(params))
      if (labelIds.includes(draft.LABEL)) {
        dispatch(loadDraftList())
      }
    }
  }, [labelIds])

  useEffect(() => {
    if (
      !location.pathname.includes('/inbox') &&
      labelIds &&
      labelIds.some((val) => loadedInbox.flat(1).indexOf(val) > -1)
    ) {
      const params = {
        labelIds,
        maxResults: 500,
      }
      dispatch(refreshEmailFeed(params))
    }
  }, [location])

  const renderEmailList = (filteredOnLabel) => {
    const { threads, nextPageToken } = filteredOnLabel && filteredOnLabel
    return (
      <>
        <S.Scroll>
          <GS.OuterContainer>
            <S.ThreadList>
              {threads.length > 0 && (
                <div className="base">
                  {threads.map((email) => (
                    <EmailListItem key={email.id} email={email} />
                  ))}
                </div>
              )}
              {threads.length === 0 && <Emptystate />}
            </S.ThreadList>
            {nextPageToken ? (
              <S.LoadMoreContainer>
                {!isLoading && (
                  <CustomButtonText
                    className="button button-small button-light"
                    disabled={isLoading}
                    onClick={() =>
                      loadNextPage({ nextPageToken, labelIds, dispatch })
                    }
                    label={local.LOAD_OLDER}
                  />
                )}
                {isLoading && <CircularProgress />}
              </S.LoadMoreContainer>
            ) : (
              <S.LoadMoreContainer>
                <small className="text_muted">{local.NO_MORE_RESULTS}</small>
              </S.LoadMoreContainer>
            )}
          </GS.OuterContainer>
        </S.Scroll>
      </>
    )
  }

  const filteredOnLabel = useMemo(
    () =>
      emailList.findIndex((threadList) =>
        threadList.labels.includes(...labelIds)
      ),
    [emailList, labelIds]
  )

  const labeledInbox = () => {
    if (labelIds) {
      return renderEmailList(emailList[filteredOnLabel])
    }
    return null
  }

  return (
    <>
      {labelIds &&
        labelIds.some((val) => loadedInbox.flat(1).indexOf(val) > -1) &&
        labeledInbox({ labelIds, emailList })}
      {isLoading &&
        labelIds &&
        labelIds.some((val) => loadedInbox.flat(1).indexOf(val) === -1) && (
          <LoadingState />
        )}
    </>
  )
}

export default EmailList
