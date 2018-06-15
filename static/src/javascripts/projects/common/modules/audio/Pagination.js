// @flow

const range = (from, to) => {
  const res = [];
  while(from < to) {
    res.push(from++);
  }
  return res;
}

export default function({ from, to, value, maxRange = Math.Infinity }) {
  const fp = Math.max(from, value - maxRange)
  const lp = Math.min(to, value + maxRange + 1);

  return (
    <ol class="pagination">
      {fp > from ? (<li><a href="#">First</a></li>) : ""}
      {range(fp, value).map(p => (
        <li><a href="#">{p}</a></li>
      ))}
      <li>{value}</li>
      {range(value + 1, lp).map(p => (
        <li><a href="#">{p}</a></li>
      ))}
      {lp < to ? ( <li><a href="#">Last</a></li>) : ""}
    </ol>
  )
}