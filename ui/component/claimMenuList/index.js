import { connect } from 'react-redux';
import {
  doCollectionEdit,
  makeSelectClaimForUri,
  makeSelectClaimIsMine,
  makeSelectCollectionForIdHasClaimUrl,
  makeSelectNameForCollectionId,
  makeSelectCollectionIsMine,
  COLLECTIONS_CONSTS,
  makeSelectFileInfoForUri,
  doPrepareEdit,
} from 'lbry-redux';
import { makeSelectChannelIsMuted } from 'redux/selectors/blocked';
import { doChannelMute, doChannelUnmute } from 'redux/actions/blocked';
import { doSetActiveChannel, doSetIncognito, doOpenModal } from 'redux/actions/app';
import { doCommentModBlock, doCommentModUnBlock } from 'redux/actions/comments';
import { makeSelectChannelIsBlocked } from 'redux/selectors/comments';
import { doToast } from 'redux/actions/notifications';
import { makeSelectUserPropForProp } from 'redux/selectors/user';

import { makeSelectSigningIsMine } from 'redux/selectors/content';
import { doChannelSubscribe, doChannelUnsubscribe } from 'redux/actions/subscriptions';
import { makeSelectIsSubscribed } from 'redux/selectors/subscriptions';
import ClaimPreview from './view';
import * as USER from 'constants/user';
import fs from 'fs';

const select = (state, props) => {
  const claim = makeSelectClaimForUri(props.uri)(state);
  const permanentUri = claim && claim.permanent_url;
  return {
    claim,
    claimIsMine: props.channelIsMine
      ? props.isRepost
        ? makeSelectClaimIsMine(props.uri)(state)
        : true
      : makeSelectClaimIsMine(props.uri)(state),
    hasClaimInWatchLater: makeSelectCollectionForIdHasClaimUrl(COLLECTIONS_CONSTS.WATCH_LATER_ID, permanentUri)(state),
    channelIsMuted: makeSelectChannelIsMuted(props.uri)(state),
    channelIsBlocked: makeSelectChannelIsBlocked(props.uri)(state),
    claimInCollection: makeSelectCollectionForIdHasClaimUrl(props.collectionId, permanentUri)(state),
    collectionName: makeSelectNameForCollectionId(props.collectionId)(state),
    isMyCollection: makeSelectCollectionIsMine(props.collectionId)(state),
    hasExperimentalUi: makeSelectUserPropForProp(USER.EXPERIMENTAL_UI)(state),
    fileInfo: makeSelectFileInfoForUri(props.uri)(state),
    isSubscribed: makeSelectIsSubscribed(props.channelUri, true)(state),
  };
};

const perform = (dispatch) => ({
  prepareEdit: (publishData, uri, fileInfo) => {
    if (publishData.signing_channel) {
      dispatch(doSetIncognito(false));
      dispatch(doSetActiveChannel(publishData.signing_channel.claim_id));
    } else {
      dispatch(doSetIncognito(true));
    }

    dispatch(doPrepareEdit(publishData, uri, fileInfo, fs));
  },
  openModal: (modal, props) => dispatch(doOpenModal(modal, props)),
  doChannelMute: (channelUri) => dispatch(doChannelMute(channelUri)),
  doChannelUnmute: (channelUri) => dispatch(doChannelUnmute(channelUri)),
  doCommentModBlock: (channelUri) => dispatch(doCommentModBlock(channelUri)),
  doCommentModUnBlock: (channelUri) => dispatch(doCommentModUnBlock(channelUri)),
  doChannelSubscribe: (subscription) => dispatch(doChannelSubscribe(subscription)),
  doChannelUnsubscribe: (subscription) => dispatch(doChannelUnsubscribe(subscription)),
  doCollectionEdit: (id, params) => dispatch(doCollectionEdit(id, params)),
  doToast: (params) => dispatch(doToast(params)),
});

export default connect(select, perform)(ClaimPreview);
