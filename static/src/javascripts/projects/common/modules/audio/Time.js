// @flow

import { formatTime } from './utils';

export default function Time({ t }) {
  return (
    <span>{formatTime(t)}</span>
  );
}
