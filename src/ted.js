const fetch = require('node-fetch');
// import fetch from 'node-fetch';
async function getTranscript(title, lang) {
  return await fetch(
    'https://www.ted.com/graphql?' +
      new URLSearchParams({
        operationName: 'Transcript',
        variables: `{"id":"${title}","language":"${lang}"}`,
        extensions: `{"persistedQuery":{"version":1,"sha256Hash":"18f8e983b84c734317ae9388c83a13bc98702921b141c2124b3ce4aeb6c48ef6"}}`,
      })
  ).then((res) => res.json());
}

function joinCues(cues, joiner = ' ') {
  const isEn = !!joiner;
  return (
    cues
      .map((cue) => cue.text)
      .join(joiner)
      .replace(/\n/g, isEn ? ' ' : '')
      // replace double spaces
      .replace(/\s{2,}/g, ' ')
  );
}
async function getBilingual(
  id = 'brittney_cooper_the_racial_politics_of_time',
  lang = ['en', 'zh-cn']
) {
  try {
    let [origin, target] = await Promise.all([
      getTranscript(id, lang[0]),
      getTranscript(id, lang[1]),
    ]);
    // 有英文 但没有中文，尝试台湾
    // 第二种情况：都有，但是无法配对
    if (origin.data.translation && target.data.translation === null) {
      // try to get zh-tw
      target = await getTranscript(id, 'zh-tw');
    }
    let originParagraphs = origin.data.translation.paragraphs;
    let targetParagraphs = target.data.translation.paragraphs;
    // failed
    if (originParagraphs.length !== targetParagraphs.length) {
      return [];
    }
    return originParagraphs.map((originParagraph, i) => {
      return [
        joinCues(originParagraph.cues),
        joinCues(targetParagraphs[i].cues, ''),
      ];
    });
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function getDetail(id = 'brittney_cooper_the_racial_politics_of_time') {
  const html = await fetch('https://www.ted.com/talks/' + id).then((res) =>
    res.text()
  );
  // match content in <title></title>
  const [author, title] = html.match(/<title>(.*)<\/title>/)[1].split(':');
  return {
    author,
    title: title.split('|')[0],
  };
}

async function getBilingualDetail(
  id = 'brittney_cooper_the_racial_politics_of_time',
  lang = ['en', 'zh-cn']
) {
  const [detail, paragraphs] = await Promise.all([
    getDetail(id),
    getBilingual(id, lang),
  ]);
  return {
    ...detail,
    paragraphs,
    id,
  };
}

module.exports = {
  getBilingual,
  getBilingualDetail,
  getDetail,
};
