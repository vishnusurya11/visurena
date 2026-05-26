// CloudFront Function (viewer-request) for the visurena.com distribution (E19J2MV0E1W0DD).
// The site is a static export (trailingSlash: true) on an S3 REST origin, so folder
// URLs like /about/ or /stories/slack-water/ must be rewritten to their index.html —
// CloudFront does NOT do this automatically for a REST origin. Attach this to the
// default cache behavior's "Viewer request" event.
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.endsWith('/')) {
    request.uri += 'index.html';          // /about/  ->  /about/index.html
  } else if (!uri.includes('.')) {
    request.uri += '/index.html';         // /about   ->  /about/index.html
  }
  // requests with an extension (/cover.png, /_next/...js) pass through untouched
  return request;
}
