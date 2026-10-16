/* SCORM 2004 3rd Edition API wrapper. Complete/incomplete only. */
(function (global) {
  "use strict";

  var STORAGE_KEY = "scorm_stub_com.sos.jointFunctionsTest.v2";
  var FIND_LIMIT = 500;

  function findAPI(win) {
    var n = 0;
    while (win && n < FIND_LIMIT) {
      try {
        if (win.API_1484_11) return win.API_1484_11;
      } catch (e) {
        break;
      }
      n += 1;
      if (win.parent && win.parent !== win) {
        win = win.parent;
      } else {
        break;
      }
    }
    return null;
  }

  function locateAPI() {
    var api = findAPI(window);
    if (!api) {
      try {
        if (window.opener) api = findAPI(window.opener);
      } catch (e) {
        api = null;
      }
    }
    return api;
  }

  function makeStub() {
    var data = {};
    try {
      var saved = global.localStorage.getItem(STORAGE_KEY);
      if (saved) data = JSON.parse(saved) || {};
    } catch (e) {
      data = {};
    }
    function persist() {
      try {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) { /* private mode */ }
    }
    return {
      Initialize: function () { return "true"; },
      Terminate: function () { persist(); return "true"; },
      GetValue: function (k) {
        return Object.prototype.hasOwnProperty.call(data, k) ? String(data[k]) : "";
      },
      SetValue: function (k, v) {
        data[k] = String(v);
        return "true";
      },
      Commit: function () { persist(); return "true"; },
      GetLastError: function () { return "0"; },
      GetErrorString: function () { return "No Error"; },
      GetDiagnostic: function () { return "no-api-stub"; }
    };
  }

  var api = null;
  var usingStub = false;
  var initialized = false;
  var terminated = false;

  function truthy(v) {
    return v === "true" || v === true || v === 1 || v === "1";
  }

  var SCORM = {
    usingStub: function () { return usingStub; },
    isActive: function () { return initialized && !terminated; },

    initialize: function () {
      if (initialized) return true;
      api = locateAPI();
      if (!api) {
        api = makeStub();
        usingStub = true;
      }
      var ok = truthy(api.Initialize(""));
      initialized = ok;
      terminated = false;
      return ok;
    },

    getValue: function (element) {
      if (!api || !initialized || terminated) return "";
      try {
        var v = api.GetValue(element);
        return v == null ? "" : String(v);
      } catch (e) {
        return "";
      }
    },

    setValue: function (element, value) {
      if (!api || !initialized || terminated) return false;
      try {
        return truthy(api.SetValue(element, value == null ? "" : String(value)));
      } catch (e) {
        return false;
      }
    },

    commit: function () {
      if (!api || !initialized || terminated) return false;
      try {
        return truthy(api.Commit(""));
      } catch (e) {
        return false;
      }
    },

    terminate: function () {
      if (!api || !initialized || terminated) return false;
      var ok = false;
      try {
        ok = truthy(api.Terminate(""));
      } catch (e) {
        ok = false;
      }
      terminated = true;
      return ok;
    }
  };

  global.SCORM = SCORM;
})(window);
