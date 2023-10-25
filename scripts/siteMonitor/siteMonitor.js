var https = require('https');

const sites = ['https://harryliu.design/'];

checkSiteStatuses().then(() => process.exit());

async function checkSiteStatuses() {
  for (let site of sites) {
    const status = await getSiteStatus(site);
    console.log(`Status for ${site}: ${status}`);
  }
}

function getSiteStatus(url) {
  return new Promise((resolve, _) => {
    https
      .get(url, function (res) {
        console.log(url, res.statusCode);
        resolve(res.statusCode === 200);
      })
      .on('error', function (_) {
        resolve(false);
      });
  });
}
