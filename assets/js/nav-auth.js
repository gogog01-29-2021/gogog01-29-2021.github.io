// Top-nav sign-in status. gh_user is set (Domain=zavis.chat) by paywall-worker's
// /auth/github/callback on gate.zavis.chat, so it's readable from any page here too --
// this is what lets the nav reflect sign-in state without a page reload after /write/
// redirects back. Signed-in only ever means the single admin account (see
// paywall-worker/src/index.js ADMIN_GITHUB_LOGIN); there is no other role.
(function () {
  function getGhUser() {
    var m = document.cookie.match(/(?:^|; )gh_user=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function init() {
    var item = document.getElementById("nav-auth-item");
    var link = document.getElementById("nav-auth-link");
    var text = document.getElementById("nav-auth-text");
    if (!item || !link || !text) return;
    var user = getGhUser();
    if (user) {
      text.textContent = "@" + user;
      link.href = "/write/";
      link.title = "Signed in as @" + user + " — go to /write/";
    } else {
      text.textContent = "Sign in";
      link.href = "https://gate.zavis.chat/auth/github?next=" + encodeURIComponent(location.href);
      link.title = "Sign in with GitHub (admin only, for /write/)";
    }
    item.style.display = "";
  }
  document.addEventListener("DOMContentLoaded", init);
})();
