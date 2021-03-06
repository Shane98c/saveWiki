var rp = require('request-promise');
var fs = require('fs');

var wit = require('./witSource.js');

let promiseArray = [];
let articles = [];

for (let item of wit) {
  promiseArray.push(requestWiki(item.wiki));
}

Promise.all(promiseArray).then(
  response => {
    parseArticle(response);
    saveArticles(articles);
  }
)

function saveArticles(articles) {
  for (let page of articles) {
    fs.writeFile("./articles/"+page.id+".json", JSON.stringify(page), function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    });
  }
}

function parseArticle(response) {
  for (let article of response) {
    if (article && article["query"]) {
      if (article.query.pages['-1']) {
        console.log('fail', article.query.pages["-1"]);
      } else if (article) {
        for (let page in article.query.pages) {
          let singleArticle = {
            articleText: article.query.pages[page].extract,
            shortText: article.query.pages[page].extract.split('</p>')[0],
            title: article.query.pages[page].title,
            id: article.query.pages[page].title.replace(/ /g,"_")
          }
          articles.push(singleArticle);
        }
      } else { console.log('error'); }
    }
  }
}

function requestWiki(name) {
  var url = ['https://en.wikipedia.org/w/api.php?action=query&prop=extracts&redirects=1&format=json&titles=', name].join('');
  return rp({
    uri: url,
    json: true
  });
}
