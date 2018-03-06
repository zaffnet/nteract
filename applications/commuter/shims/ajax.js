// @flow

import { ajax } from "rxjs/observable/dom/ajax";

function getJSON(url: string) {
  return ajax({
    url,
    responseType: "json",
    createXHR: function() {
      return new XMLHttpRequest();
    }
  });
}

module.exports = {
  getJSON
};
