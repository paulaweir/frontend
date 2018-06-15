// @flow
import { formatTime } from './utils';

import Pagination from './Pagination';

export default function({ currentPage, pageSize, pages, total, episodes }) {
  return (
    <div>
      <h2>Episodes</h2>
      <ol style="list-style: decimal" start={total - (currentPage - 1) * pageSize} reversed>
        {episodes.map(({ webTitle, webUrl, fields: { duration } = {} }) => (
          <li><a href={webUrl}>{webTitle} ({formatTime(duration || 0)})</a></li>
        ))}
      </ol>
      <Pagination from={1} to={pages} value={currentPage} maxRange={2} />
    </div>
  )
}
