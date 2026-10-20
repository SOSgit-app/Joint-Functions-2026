/* From Competition to Crisis — player: intro → Road to War → missions → debrief → closeout.
   Decision model (v2.0): staff recommendation first, then AF Core Function, then Joint Function.
   Scoring: 4 points per mission (2 / 1 / 1). Correct on first attempt = full credit; correct after
   reassess = partial credit (one point lost); incorrect after reassess = no credit. Max 120. */
(function () {
  "use strict";

  var POINTS_PER_MISSION = 4;
  var REASSESS_PENALTY = 1;
  var MAX_ATTEMPTS = 2;
  var STATE_VERSION = 3;

  /* Illustrative references. Named aircraft follow the instruction-point asset.
     Missions that name no aircraft use a scene that fits the scenario. */
  var VISUALS = {
    scenarios: {
      "1": { src: "img/s1-road.jpg", alt: "A long-range bomber over a frozen arctic coastline", caption: "Arctic maritime approach — illustrative" },
      "2": { src: "img/s2-road.jpg", alt: "Fighters on the ramp of a desert aerial port and logistics hub", caption: "Desert theater logistics hub — illustrative" },
      "3": { src: "img/s3-road.jpg", alt: "A stealth fighter climbing over a forested border", caption: "Eastern border air picture — illustrative" },
      "4": { src: "img/s4-road.jpg", alt: "A stealth fighter dispersed on a small Pacific island airstrip", caption: "Dispersed island-chain airfield — illustrative" },
      "5": { src: "img/s5a-road.jpg", alt: "A coastal radar with aircraft sharing the same airspace", caption: "Shared joint airspace — illustrative" },
      "6": { src: "img/s5b-road.jpg", alt: "A remotely piloted aircraft on a savanna airstrip", caption: "Partner-support airstrip — illustrative" }
    },
    missions: {
      "1.1": { src: "img/m11.jpg", alt: "B-52H Stratofortress over arctic sea ice", caption: "B-52H Stratofortress — illustrative" },
      "1.2": { src: "img/m12.jpg", alt: "Arctic radar site overlooking a frozen fjord", caption: "Northern air picture — illustrative" },
      "1.3": { src: "img/m13.jpg", alt: "RC-135V/W Rivet Joint flying along a coastline with a concealed missile launcher ashore", caption: "RC-135V/W Rivet Joint and coastal missile launcher — illustrative" },
      "1.4": { src: "img/m14.jpg", alt: "C-17 Globemaster III approaching a snowy austere airstrip", caption: "C-17 Globemaster III — illustrative" },
      "1.5": { src: "img/m15.jpg", alt: "KC-46A Pegasus refueling a fighter above arctic cloud", caption: "KC-46A Pegasus — illustrative" },
      "2.1": { src: "img/m21.jpg", alt: "F-15E Strike Eagle over a desert logistics hub", caption: "F-15E Strike Eagle — illustrative" },
      "2.2": { src: "img/m22.jpg", alt: "A fighter climbing toward small one-way attack drones above a desert fuel depot", caption: "Defensive counterair and one-way attack drones — illustrative" },
      "2.3": { src: "img/m23.jpg", alt: "AC-130J Ghostrider gunship over a desert wadi", caption: "AC-130J Ghostrider — illustrative" },
      "2.4": { src: "img/m24.jpg", alt: "EA-37B Compass Call electronic-attack jet over a desert command post", caption: "EA-37B Compass Call — illustrative" },
      "2.5": { src: "img/m25.jpg", alt: "Fighter, tanker, and transport aircraft parked apart on a desert ramp", caption: "Flexible airpower allocation — illustrative" },
      "3.1": { src: "img/m31.jpg", alt: "A fighter continuing over a forested border past dark radio masts", caption: "Operations after communications loss — illustrative" },
      "3.2": { src: "img/m32.jpg", alt: "E-11A Battlefield Airborne Communications Node above forested hills", caption: "E-11A Battlefield Airborne Communications Node — illustrative" },
      "3.3": { src: "img/m33.jpg", alt: "F-22 Raptor climbing through cloud", caption: "F-22 Raptor — illustrative" },
      "3.4": { src: "img/m34.jpg", alt: "High view of a forested border valley under broken cloud", caption: "Airborne confirmation of effects — illustrative" },
      "3.5": { src: "img/m35.jpg", alt: "Network equipment racks inside a dim communications shelter", caption: "Defensive cyberspace operations — illustrative" },
      "4.1": { src: "img/m41.jpg", alt: "F-35A Lightning II dispersed under camouflage netting on an island airstrip", caption: "F-35A Lightning II — illustrative" },
      "4.2": { src: "img/m42.jpg", alt: "C-130J Super Hercules with its ramp open on a Pacific expeditionary strip", caption: "C-130J Super Hercules — illustrative" },
      "4.3": { src: "img/m43.jpg", alt: "A small stack of pallets and fuel bladders on an island airstrip", caption: "Reduced logistics footprint — illustrative" },
      "4.4": { src: "img/m44.jpg", alt: "A fighter at the end of an island runway at dusk beside a dark radio mast", caption: "Sortie generation during a network outage — illustrative" },
      "4.5": { src: "img/m45.jpg", alt: "F-35A Lightning II over open ocean near a small island outpost", caption: "F-35A Lightning II — illustrative" },
      "5.1": { src: "img/m5a1.jpg", alt: "Fighter, helicopter, and transport aircraft sharing a coastal sky", caption: "Unified airspace — illustrative" },
      "5.2": { src: "img/m5a2.jpg", alt: "A surface-to-air missile launcher, radar, and fighter covering the same coastline", caption: "Integrated air and missile defense — illustrative" },
      "5.3": { src: "img/m5a3.jpg", alt: "Fighters, a tanker, and a transport parked in order on a ramp", caption: "Air allocation — illustrative" },
      "5.4": { src: "img/m5a4.jpg", alt: "A military transport flying a clear lane over coastal water, ships off to the side", caption: "Mobility corridor — illustrative" },
      "5.5": { src: "img/m5a5.jpg", alt: "Radar dishes on a coastal hill at dusk", caption: "Common operational picture — illustrative" },
      "6.1": { src: "img/m5b1.jpg", alt: "MQ-9 Reaper over dry savanna", caption: "MQ-9 Reaper — illustrative" },
      "6.2": { src: "img/m5b2.jpg", alt: "U-2S Dragon Lady above a thin cloud deck", caption: "U-2S Dragon Lady — illustrative" },
      "6.3": { src: "img/m5b3.jpg", alt: "Controllers on a dry hillside watching a propeller aircraft overhead", caption: "Partner air-ground coordination — illustrative" },
      "6.4": { src: "img/m5b4.jpg", alt: "C-130J Super Hercules releasing supply bundles over dry scrub", caption: "C-130J Super Hercules — illustrative" },
      "6.5": { src: "img/m5b5.jpg", alt: "A transport on a dirt airstrip with a medical litter waiting on the ramp", caption: "Aeromedical evacuation — illustrative" }
    }
  };

  var content = null;
  var appEl = null;
  var overlayEl = null;
  var lastFocus = null;
  var TOTAL_MISSIONS = 30;
  var MAX_SCORE = 120;

  var state = {
    view: "intro", /* intro | road | mission | debrief | complete */
    scenarioIndex: 0,
    missionIndex: 0,
    answers: {} /* id -> { opt, af, jf, attempts, status, points } */
  };

  /* ---------- helpers ---------- */

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function paras(list, cls) {
    return (list || []).map(function (p) {
      return "<p" + (cls ? " class=\"" + cls + "\"" : "") + ">" + esc(p) + "</p>";
    }).join("");
  }

  function visualFigure(v, cls) {
    if (!v) return "";
    return (
      "<figure class=\"" + cls + "\">" +
        "<img src=\"" + esc(v.src) + "\" alt=\"" + esc(v.alt) + "\">" +
        "<figcaption>" + esc(v.caption) + "</figcaption>" +
      "</figure>"
    );
  }

  function bullets(list, tag) {
    tag = tag || "ul";
    if (!list || !list.length) return "";
    return "<" + tag + ">" + list.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</" + tag + ">";
  }

  function scenario(i) { return content.scenarios[i]; }
  function mission(si, mi) { return content.scenarios[si].missions[mi]; }
  function currentMission() { return mission(state.scenarioIndex, state.missionIndex); }

  function answerFor(id) {
    if (!state.answers[id]) {
      state.answers[id] = { opt: "", af: "", jf: "", attempts: 0, status: "open", points: 0 };
    }
    return state.answers[id];
  }

  function isResolved(ans) {
    return ans.status === "correct" || ans.status === "failed";
  }

  function forEachMission(fn) {
    var si, mi;
    for (si = 0; si < content.scenarios.length; si += 1) {
      for (mi = 0; mi < content.scenarios[si].missions.length; mi += 1) {
        fn(content.scenarios[si].missions[mi], si, mi);
      }
    }
  }

  function countResolved() {
    var n = 0;
    forEachMission(function (m) {
      if (state.answers[m.id] && isResolved(state.answers[m.id])) n += 1;
    });
    return n;
  }

  function resolvedInScenario(si) {
    var n = 0;
    scenario(si).missions.forEach(function (m) {
      if (state.answers[m.id] && isResolved(state.answers[m.id])) n += 1;
    });
    return n;
  }

  function scenarioDone(si) {
    return resolvedInScenario(si) === scenario(si).missions.length;
  }

  function totalScore() {
    var s = 0;
    forEachMission(function (m) {
      if (state.answers[m.id]) s += state.answers[m.id].points || 0;
    });
    return s;
  }

  function allResolved() {
    return countResolved() >= TOTAL_MISSIONS;
  }

  /* ---------- location / persistence ---------- */

  function locationKey() {
    if (state.view === "intro") return "intro";
    if (state.view === "complete") return "complete";
    if (state.view === "road") return "road:" + scenario(state.scenarioIndex).id;
    if (state.view === "debrief") return "debrief:" + scenario(state.scenarioIndex).id;
    return "m:" + currentMission().id;
  }

  function scenarioIndexById(id) {
    var i;
    for (i = 0; i < content.scenarios.length; i += 1) {
      if (content.scenarios[i].id === id) return i;
    }
    return -1;
  }

  function applyLocation(loc) {
    if (!loc) return;
    if (loc === "intro" || loc === "complete") {
      state.view = loc;
      return;
    }
    var parts = loc.split(":");
    var kind = parts[0];
    var id = parts.slice(1).join(":");
    var si;
    if (kind === "road" || kind === "debrief") {
      si = scenarioIndexById(id);
      if (si >= 0) {
        state.view = kind;
        state.scenarioIndex = si;
        state.missionIndex = 0;
      }
      return;
    }
    if (kind === "m") {
      forEachMission(function (m, s, i) {
        if (m.id === id) {
          state.view = "mission";
          state.scenarioIndex = s;
          state.missionIndex = i;
        }
      });
    }
  }

  function serialize() {
    var compact = {};
    Object.keys(state.answers).forEach(function (id) {
      var a = state.answers[id];
      compact[id] = { o: a.opt || "", f: a.af || "", j: a.jf || "", n: a.attempts || 0, s: a.status || "open", p: a.points || 0 };
    });
    return JSON.stringify({ v: STATE_VERSION, a: compact });
  }

  function restoreSuspend(raw) {
    if (!raw) return;
    try {
      var data = JSON.parse(raw);
      if (!data || data.v !== STATE_VERSION || !data.a) return;
      Object.keys(data.a).forEach(function (id) {
        var x = data.a[id];
        state.answers[id] = {
          opt: x.o || "",
          af: x.f || "",
          jf: x.j || "",
          attempts: x.n || 0,
          status: x.s || "open",
          points: x.p || 0
        };
      });
    } catch (e) {
      /* ignore corrupt bookmark */
    }
  }

  function reportScore() {
    var raw = totalScore();
    SCORM.setValue("cmi.score.min", "0");
    SCORM.setValue("cmi.score.max", String(MAX_SCORE));
    SCORM.setValue("cmi.score.raw", String(raw));
    SCORM.setValue("cmi.score.scaled", (raw / MAX_SCORE).toFixed(4));
  }

  function persist(opts) {
    opts = opts || {};
    var n = countResolved();
    var done = n >= TOTAL_MISSIONS;
    SCORM.setValue("cmi.location", locationKey());
    SCORM.setValue("cmi.suspend_data", serialize());
    SCORM.setValue("cmi.progress_measure", (n / TOTAL_MISSIONS).toFixed(4));
    reportScore();
    if (done) {
      SCORM.setValue("cmi.completion_status", "completed");
      SCORM.setValue("cmi.exit", "normal");
    } else {
      SCORM.setValue("cmi.completion_status", "incomplete");
      if (opts.unloading) SCORM.setValue("cmi.exit", "suspend");
    }
    SCORM.commit();
  }

  function markCompleteAndCommit() {
    SCORM.setValue("cmi.completion_status", "completed");
    SCORM.setValue("cmi.progress_measure", "1.0000");
    SCORM.setValue("cmi.exit", "normal");
    SCORM.setValue("cmi.location", "complete");
    SCORM.setValue("cmi.suspend_data", serialize());
    reportScore();
    SCORM.commit();
  }

  /* ---------- score bands (doc §16.3) ---------- */

  function bandFor(score) {
    var bands = content.intro.scoring.bands.slice(1); /* skip header row */
    var i, r, lo;
    for (i = 0; i < bands.length; i += 1) {
      r = bands[i].range;
      if (/^Below\s+(\d+)/.test(r)) {
        if (score < parseInt(r.match(/^Below\s+(\d+)/)[1], 10)) return bands[i];
      } else {
        lo = parseInt(r.split(/[–-]/)[0], 10);
        if (score >= lo) return bands[i];
      }
    }
    return bands[bands.length - 1];
  }

  /* ---------- render ---------- */

  function render() {
    closeDialog(true);
    if (state.view === "intro") {
      appEl.innerHTML = introHTML();
      bindIntro();
    } else if (state.view === "road") {
      appEl.innerHTML = roadHTML();
      bindRoad();
    } else if (state.view === "debrief") {
      appEl.innerHTML = debriefHTML();
      bindDebrief();
    } else if (state.view === "complete") {
      appEl.innerHTML = completeHTML();
      bindComplete();
    } else {
      appEl.innerHTML = missionHTML();
      bindMission();
    }
    window.scrollTo(0, 0);
  }

  function masthead(chips, right) {
    return (
      "<header class=\"masthead\">" +
        "<div class=\"masthead-row\">" +
          "<span class=\"brand\">SOS · USAF Staff Terminal</span>" +
          chips.map(function (c) {
            return "<span class=\"chip-sep\">|</span><span class=\"chip\">" + c + "</span>";
          }).join("") +
          (right ? "<span class=\"progress-meta\">" + right + "</span>" : "") +
        "</div>" +
      "</header>"
    );
  }

  function progressText() {
    return countResolved() + " / " + TOTAL_MISSIONS + " missions · " + totalScore() + " / " + MAX_SCORE + " points";
  }

  /* ----- intro ----- */

  function introHTML() {
    var c = content.course;
    var it = content.intro;
    var sc = it.scoring;
    var stub = SCORM.usingStub()
      ? "<p class=\"preview-note\">Local preview — no LMS detected. Progress is stored in this browser only.</p>"
      : "";

    function twoCol(rows) {
      return "<table class=\"score-table\">" + rows.map(function (r, i) {
        var tag = i === 0 ? "th" : "td";
        var vals = Object.keys(r).map(function (k) { return r[k]; });
        return "<tr><" + tag + ">" + esc(vals[0]) + "</" + tag + "><" + tag + ">" + esc(vals[1]) + "</" + tag + "></tr>";
      }).join("") + "</table>";
    }

    var beginLabel = countResolved() > 0 ? "Resume" : "Begin";

    function card(inner) {
      return "<section class=\"intro-card\">" + inner + "</section>";
    }

    return (
      "<div class=\"screen flow\">" +
        masthead([esc(c.canvasAssignment)]) +
        "<main class=\"flow-page intro-page\" id=\"main\">" +
          "<header class=\"intro-hero\">" +
            "<p class=\"assignment-name\">" + esc(c.kicker) + "</p>" +
            "<h1>" + esc(c.title) + "</h1>" +
            "<p class=\"subtitle\">" + esc(c.subtitle) + "</p>" +
            "<p class=\"intro-purpose\">" + esc(c.purpose) + "</p>" +
            "<blockquote class=\"opening\">" + paras(it.opening) + "</blockquote>" +
            "<div class=\"cta-row\">" +
              "<button type=\"button\" class=\"btn btn-primary btn-begin\">" + esc(beginLabel) + "</button>" +
            "</div>" +
          "</header>" +

          card(
            "<h2>" + esc(it.why.heading) + "</h2>" +
            "<p>" + esc(it.why.paragraphs[0]) + "</p>" +
            "<p>" + esc(it.why.paragraphs[1]) + "</p>" +
            bullets(it.why.items) +
            "<p>" + esc(it.why.paragraphs[2]) + "</p>"
          ) +

          "<div class=\"intro-grid\">" +
            card(
              "<h2>" + esc(it.responsibility.heading) + "</h2>" +
              "<p>" + esc(it.responsibility.paragraphs[0]) + "</p>" +
              "<p class=\"role-setting\">" + esc(it.responsibility.paragraphs[1]) + "</p>" +
              "<p>" + esc(it.responsibility.paragraphs[2]) + "</p>"
            ) +
            card(
              "<h2>" + esc(it.identity.heading) + "</h2>" +
              "<p class=\"role-setting\">" + esc(it.identity.text) + "</p>" +
              "<p><strong>" + esc(it.identity.responsibility) + "</strong></p>"
            ) +
          "</div>" +

          "<div class=\"intro-grid\">" +
            card(
              "<h2>" + esc(it.promise.heading) + "</h2>" +
              "<p>" + esc(it.promise.intro) + "</p>" +
              bullets(it.promise.items, "ol")
            ) +
            card(
              "<h2>" + esc(it.behaviors.heading) + "</h2>" +
              "<p>" + esc(it.behaviors.intro) + "</p>" +
              bullets(it.behaviors.items)
            ) +
          "</div>" +

          card(
            "<h2>" + esc(it.decisionSequence.heading) + "</h2>" +
            "<p>" + esc(it.decisionSequence.intro) + "</p>" +
            "<ol class=\"step-grid\">" + it.decisionSequence.steps.map(function (s, i) {
              return "<li><span class=\"step-index\">" + (i + 1) + "</span><strong>" + esc(s.title.replace(/^Step \d+ — /, "")) + "</strong><span>" + esc(s.text) + "</span></li>";
            }).join("") + "</ol>" +
            bullets(it.decisionSequence.submitNotes)
          ) +

          card(
            "<h2>" + esc(sc.heading) + "</h2>" +
            "<p>" + esc(sc.intro) + "</p>" +
            "<p class=\"score-total\">" + esc(sc.total) + "</p>" +
            "<div class=\"score-grid\">" +
              twoCol(sc.table) +
              twoCol(sc.attemptTable) +
              twoCol(sc.bands) +
            "</div>" +
            "<p>" + esc(sc.principleIntro) + "</p>" +
            bullets(sc.principle)
          ) +

          "<div class=\"cta-row\">" +
            "<button type=\"button\" class=\"btn btn-primary btn-begin\">" + esc(beginLabel) + "</button>" +
          "</div>" +
          stub +
        "</main>" +
      "</div>"
    );
  }

  function bindIntro() {
    Array.prototype.forEach.call(document.querySelectorAll(".btn-begin"), function (btn) {
      btn.addEventListener("click", function () {
      state.view = "road";
      state.scenarioIndex = 0;
      state.missionIndex = 0;
      /* resume: jump to the first unresolved scenario's road-to-war (or its open mission) */
      var si, mi, found = false;
      for (si = 0; si < content.scenarios.length && !found; si += 1) {
        for (mi = 0; mi < scenario(si).missions.length; mi += 1) {
          var a = state.answers[scenario(si).missions[mi].id];
          if (!a || !isResolved(a)) {
            state.scenarioIndex = si;
            state.missionIndex = mi;
            state.view = mi === 0 ? "road" : "mission";
            found = true;
            break;
          }
        }
      }
      if (!found && allResolved()) state.view = "complete";
      persist();
      render();
      });
    });
  }

  /* ----- road to war ----- */

  function roadHTML() {
    var sc = scenario(state.scenarioIndex);
    var r = sc.roadToWar;
    var scNum = state.scenarioIndex + 1;
    return (
      "<div class=\"screen flow\">" +
        masthead([
          "<strong>Phase:</strong>&nbsp;" + esc(r.phase),
          "<strong>Scenario " + scNum + " of " + content.scenarios.length + "</strong>&nbsp;·&nbsp;" + esc(sc.name)
        ], progressText()) +
        "<main class=\"flow-page\" id=\"main\">" +
          "<p class=\"assignment-name\">Road to War</p>" +
          "<h1>" + esc(r.subtitle) + "</h1>" +
          "<p class=\"meta-line\"><span>Scenario: " + esc(r.scenario) + "</span><span>Phase: " + esc(r.phase) + "</span></p>" +
          visualFigure(VISUALS.scenarios[sc.id], "scenario-visual") +
          "<div class=\"responsibility\"><span class=\"resp-label\">Your Responsibility</span><p>" + esc(r.responsibility) + "</p></div>" +
          r.sections.map(function (s) {
            return "<h2>" + esc(s.heading) + "</h2>" + paras(s.paragraphs) + bullets(s.items);
          }).join("") +
          "<h2>" + esc(r.understand.heading) + "</h2>" +
          "<p>" + esc(r.understand.paragraphs[0]) + "</p>" +
          (r.understand.paragraphs.length > 1 ? "<p>" + esc(r.understand.paragraphs[1]) + "</p>" : "") +
          bullets(r.understand.items) +
          (r.understand.paragraphs.length > 2 ? "<p>" + esc(r.understand.paragraphs[2]) + "</p>" : "") +
          "<h2>" + esc(r.missionSet.heading) + "</h2>" +
          bullets(r.missionSet.items, "ol") +
          "<div class=\"cta-row btn-row\">" +
            "<button type=\"button\" class=\"btn btn-ghost\" id=\"btn-back\">Back</button>" +
            "<button type=\"button\" class=\"btn btn-primary\" id=\"btn-begin-scenario\">Begin Mission " + esc(sc.missions[0].id) + "</button>" +
          "</div>" +
        "</main>" +
      "</div>"
    );
  }

  function bindRoad() {
    document.getElementById("btn-begin-scenario").addEventListener("click", function () {
      state.view = "mission";
      state.missionIndex = 0;
      persist();
      render();
    });
    document.getElementById("btn-back").addEventListener("click", function () {
      if (state.scenarioIndex === 0) {
        state.view = "intro";
      } else {
        state.scenarioIndex -= 1;
        state.view = "debrief";
      }
      persist();
      render();
    });
  }

  /* ----- debrief ----- */

  function debriefHTML() {
    var sc = scenario(state.scenarioIndex);
    var d = sc.debrief;
    var scNum = state.scenarioIndex + 1;
    var last = state.scenarioIndex >= content.scenarios.length - 1;
    var pts = 0;
    sc.missions.forEach(function (m) { if (state.answers[m.id]) pts += state.answers[m.id].points || 0; });
    return (
      "<div class=\"screen flow\">" +
        masthead([
          "<strong>Scenario " + scNum + " of " + content.scenarios.length + "</strong>&nbsp;·&nbsp;" + esc(sc.name),
          "Scenario Debrief"
        ], progressText()) +
        "<main class=\"flow-page\" id=\"main\">" +
          "<p class=\"assignment-name\">Scenario " + esc(sc.id) + " Debrief</p>" +
          "<h1>" + esc(d.title) + "</h1>" +
          "<p class=\"meta-line\"><span>Scenario score: " + pts + " / " + (sc.missions.length * POINTS_PER_MISSION) + "</span></p>" +
          "<p>" + esc(d.lead) + "</p>" +
          "<p>" + esc(d.retainIntro) + "</p>" +
          bullets(d.retain) +
          "<h2>" + esc(d.takeawayHeading) + "</h2>" +
          "<p class=\"role-setting\">" + esc(d.takeaway) + "</p>" +
          "<div class=\"cta-row btn-row\">" +
            "<button type=\"button\" class=\"btn btn-ghost\" id=\"btn-back\">Back</button>" +
            "<button type=\"button\" class=\"btn btn-primary\" id=\"btn-next\">" +
              (last ? "Complete Course" : "Continue to Scenario " + esc(scenario(state.scenarioIndex + 1).id)) +
            "</button>" +
          "</div>" +
        "</main>" +
      "</div>"
    );
  }

  function bindDebrief() {
    document.getElementById("btn-back").addEventListener("click", function () {
      state.view = "mission";
      state.missionIndex = scenario(state.scenarioIndex).missions.length - 1;
      persist();
      render();
    });
    document.getElementById("btn-next").addEventListener("click", function () {
      if (state.scenarioIndex >= content.scenarios.length - 1) {
        if (!allResolved()) return;
        state.view = "complete";
      } else {
        state.scenarioIndex += 1;
        state.missionIndex = 0;
        state.view = "road";
      }
      persist();
      render();
    });
  }

  /* ----- complete ----- */

  function completeHTML() {
    var c = content.closeout;
    var score = totalScore();
    var band = bandFor(score);
    return (
      "<div class=\"screen flow\">" +
        masthead(["Course complete"]) +
        "<main class=\"flow-page\" id=\"main\">" +
          "<div class=\"complete-mark\" aria-hidden=\"true\">✓</div>" +
          "<h1>" + esc(c.heading) + "</h1>" +
          "<div class=\"score-card\">" +
            "<div class=\"score-big\">" + score + " <span>/ " + MAX_SCORE + "</span></div>" +
            "<div class=\"score-band\"><span class=\"band-range\">" + esc(band.range) + "</span> " + esc(band.assessment) + "</div>" +
          "</div>" +
          "<p>" + esc(c.paragraphs[0]) + "</p>" +
          "<p>" + esc(c.paragraphs[1]) + "</p>" +
          "<p>" + esc(c.paragraphs[2]) + "</p>" +
          bullets(c.items, "ol") +
          "<p class=\"role-setting\">" + esc(c.paragraphs[3]) + "</p>" +
          "<p class=\"preview-note\">" + esc(c.completionNote) + "</p>" +
        "</main>" +
      "</div>"
    );
  }

  function bindComplete() {
    markCompleteAndCommit();
  }

  /* ----- mission ----- */

  function missionHTML() {
    var sc = scenario(state.scenarioIndex);
    var m = currentMission();
    var ans = answerFor(m.id);
    var scNum = state.scenarioIndex + 1;
    var mNum = state.missionIndex + 1;
    var locked = isResolved(ans);
    var reassessing = !locked && ans.attempts > 0;
    var canSubmit = !locked && !!ans.opt && !!ans.af && !!ans.jf;
    var lastInScenario = state.missionIndex >= sc.missions.length - 1;
    var canNext = locked;

    var ticks = sc.missions.map(function (mm, idx) {
      var a = state.answers[mm.id];
      var cls = "tick";
      if (a && a.status === "correct") cls += " done";
      if (a && a.status === "failed") cls += " failed";
      if (idx === state.missionIndex) cls += " current";
      return "<span class=\"" + cls + "\" title=\"Mission " + esc(mm.id) + "\"></span>";
    }).join("");

    function choiceRadios(name, choices, selected, idKey) {
      return choices.map(function (o) {
        var value = idKey ? o.id : o.text;
        var checked = selected === value ? " checked" : "";
        var selCls = selected === value ? " selected" : "";
        var lockCls = locked ? " locked" : "";
        var dis = locked ? " disabled" : "";
        var mark = "";
        if (locked && selected === value) {
          mark = ans.status === "correct" ? " is-correct" : " is-wrong";
        }
        return (
          "<label class=\"radio" + selCls + lockCls + mark + "\">" +
            "<input type=\"radio\" name=\"" + name + "\" value=\"" + esc(value) + "\"" + checked + dis + ">" +
            "<span class=\"opt-id\">" + esc(o.label || o.id) + "</span>" +
            "<span class=\"opt-text\">" + esc(o.text) + "</span>" +
          "</label>"
        );
      }).join("");
    }

    var radios = choiceRadios("recommendation", m.options, ans.opt, true);

    var status = "";
    if (ans.status === "correct") {
      status = "<p class=\"status-lock status-ok\" role=\"status\">Recommendation submitted · " + ans.points + " / " + POINTS_PER_MISSION + " points" +
        (ans.attempts > 1 ? " (partial credit after reassess)" : "") + "</p>";
    } else if (ans.status === "failed") {
      status = "<p class=\"status-lock status-bad\" role=\"status\">No credit · 0 / " + POINTS_PER_MISSION + " points</p>";
    } else if (reassessing) {
      status = "<p class=\"status-lock status-warn\" role=\"status\">" + esc(content.reassessTemplate.heading) + " · revise and resubmit (final attempt)</p>";
    }

    var capability = "";
    if (m.relevantCapability && m.relevantCapability.length) {
      capability = "<div class=\"block\"><h2>Relevant Capability</h2><ul class=\"capability\">" + m.relevantCapability.map(function (c) {
        return "<li><span class=\"cap-label\">" + esc(c.label) + ":</span> " + esc(c.text) + "</li>";
      }).join("") + "</ul></div>";
    }

    var backLabel = state.missionIndex === 0 ? "Road to War" : "Back";
    var nextLabel = lastInScenario ? "Scenario Debrief" : "Next Mission";

    return (
      "<div class=\"screen\">" +
        "<header class=\"masthead\">" +
          "<div class=\"masthead-row\">" +
            "<span class=\"chip\"><strong>Phase:</strong>&nbsp;" + esc(m.phase) + "</span>" +
            "<span class=\"chip-sep\">|</span>" +
            "<span class=\"chip\"><strong>Scenario " + scNum + " of " + content.scenarios.length + "</strong>&nbsp;·&nbsp;" + esc(sc.name) + "</span>" +
            "<span class=\"chip-sep\">|</span>" +
            "<span class=\"chip\"><strong>Mission:</strong>&nbsp;" + esc(m.missionLine) + "</span>" +
            "<span class=\"progress-meta\">" + progressText() + "</span>" +
          "</div>" +
          "<div class=\"item-bar\">" +
            "<h1>" + esc(m.title) + "</h1>" +
            "<span class=\"item-count\">Mission " + mNum + " of " + sc.missions.length + "</span>" +
            "<div class=\"ticks\" aria-hidden=\"true\">" + ticks + "</div>" +
          "</div>" +
          "<div class=\"responsibility bar\"><span class=\"resp-label\">Your Responsibility</span><p>" + esc(m.responsibility) + "</p></div>" +
        "</header>" +
        "<div class=\"workspace\">" +
          "<section class=\"panel panel-left\" aria-label=\"Mission Brief\">" +
            "<p class=\"panel-kicker\">Mission Brief</p>" +
            visualFigure(VISUALS.missions[m.id], "brief-visual") +
            "<div class=\"block\"><h2>Commander’s Context</h2><p>" + esc(m.commandersContext) + "</p></div>" +
            "<div class=\"block op-problem\"><h2>Joint Operational Problem</h2><p>" + esc(m.jointOperationalProblem) + "</p></div>" +
            "<div class=\"block\"><h2>Staff Tension</h2><p>" + esc(m.staffTension) + "</p></div>" +
            "<div class=\"block\"><h2>Decision Required</h2><p>" + esc(m.decisionRequired) + "</p></div>" +
            capability +
          "</section>" +
          "<section class=\"panel panel-right\" aria-label=\"Student Decision\">" +
            "<p class=\"panel-kicker\">Student Decision</p>" +
            "<div class=\"step\">" +
              "<div class=\"step-num\">Step 1</div>" +
              "<h2>Select the Staff Statement</h2>" +
              "<fieldset class=\"radios\">" +
                "<legend class=\"field-label\">Select the statement the staff should advance</legend>" +
                radios +
              "</fieldset>" +
            "</div>" +
            "<div class=\"step\">" +
              "<div class=\"step-num\">Step 2</div>" +
              "<h2>Match the Air Force Core Function</h2>" +
              "<fieldset class=\"radios\">" +
                "<legend class=\"field-label\">Match the function the statement is employing — not a function you wish it employed</legend>" +
                choiceRadios("af-function", m.afChoices, ans.af, false) +
              "</fieldset>" +
            "</div>" +
            "<div class=\"step\">" +
              "<div class=\"step-num\">Step 3</div>" +
              "<h2>Match the Joint Function</h2>" +
              "<fieldset class=\"radios\">" +
                "<legend class=\"field-label\">Which Joint Function is that same statement advancing? One Joint Function only</legend>" +
                choiceRadios("jf-function", m.jfChoices, ans.jf, false) +
              "</fieldset>" +
            "</div>" +
            status +
            (canNext
              ? "<div class=\"next-item-wrap\"><button type=\"button\" class=\"btn btn-next\" id=\"btn-next-inline\">" + nextLabel + "</button></div>"
              : "") +
          "</section>" +
        "</div>" +
        "<footer class=\"foot\">" +
          "<button type=\"button\" class=\"btn btn-ghost\" id=\"btn-back\">" + esc(backLabel) + "</button>" +
          "<button type=\"button\" class=\"btn\" id=\"btn-review\"" + (locked ? "" : " disabled") + ">Review Instruction Point</button>" +
          "<span class=\"spacer\"></span>" +
          "<button type=\"button\" class=\"btn btn-primary\" id=\"btn-submit\"" + (canSubmit ? "" : " disabled") + ">Submit Recommendation</button>" +
          "<button type=\"button\" class=\"btn btn-next\" id=\"btn-next\"" + (canNext ? "" : " disabled") + ">" + nextLabel + "</button>" +
        "</footer>" +
      "</div>"
    );
  }

  function bindMission() {
    var m = currentMission();
    var ans = answerFor(m.id);
    function refreshSubmit() {
      var btn = document.getElementById("btn-submit");
      if (btn) btn.disabled = !(!isResolved(ans) && ans.opt && ans.af && ans.jf);
    }

    function bindRadios(name, apply) {
      var radios = document.querySelectorAll("input[name=\"" + name + "\"]");
      Array.prototype.forEach.call(radios, function (r) {
        r.addEventListener("change", function () {
          apply(r.value);
          Array.prototype.forEach.call(document.querySelectorAll("input[name=\"" + name + "\"]"), function (input) {
            input.parentNode.classList.toggle("selected", input.checked);
          });
          persist();
          refreshSubmit();
        });
      });
    }

    bindRadios("recommendation", function (value) { ans.opt = value; });
    bindRadios("af-function", function (value) { ans.af = value; });
    bindRadios("jf-function", function (value) { ans.jf = value; });

    document.getElementById("btn-back").addEventListener("click", goBack);
    document.getElementById("btn-submit").addEventListener("click", submitRecommendation);
    document.getElementById("btn-review").addEventListener("click", function () {
      if (!isResolved(ans)) return;
      openInstructionPoint(m, ans.status === "correct");
    });
    document.getElementById("btn-next").addEventListener("click", goNext);
    var inline = document.getElementById("btn-next-inline");
    if (inline) inline.addEventListener("click", goNext);
  }

  function submitRecommendation() {
    var m = currentMission();
    var ans = answerFor(m.id);
    if (isResolved(ans)) return;
    if (!ans.opt || !ans.af || !ans.jf) return;

    ans.attempts += 1;
    var recOk = ans.opt === m.correctOption;
    var afOk = ans.af === m.correctAfFunction;
    var jfOk = ans.jf === m.correctJointFunction;
    var allOk = recOk && afOk && jfOk;

    if (allOk) {
      ans.status = "correct";
      ans.points = ans.attempts === 1 ? POINTS_PER_MISSION : POINTS_PER_MISSION - REASSESS_PENALTY;
      persist();
      render();
      openInstructionPoint(m, true);
      return;
    }

    if (ans.attempts >= MAX_ATTEMPTS) {
      ans.status = "failed";
      ans.points = 0;
      persist();
      render();
      openReassess(m, ans.opt, recOk, true);
      return;
    }

    persist();
    render();
    openReassess(m, ans.opt, recOk, false);
  }

  function goBack() {
    if (state.missionIndex === 0) {
      state.view = "road";
    } else {
      state.missionIndex -= 1;
    }
    persist();
    render();
  }

  function goNext() {
    var sc = scenario(state.scenarioIndex);
    var ans = answerFor(currentMission().id);
    if (!isResolved(ans)) return;
    if (state.missionIndex < sc.missions.length - 1) {
      state.missionIndex += 1;
    } else {
      if (!scenarioDone(state.scenarioIndex)) return;
      state.view = "debrief";
    }
    persist();
    render();
  }

  /* ---------- dialogs ---------- */

  function row(label, text) {
    return "<p class=\"ip-row\"><span class=\"ip-label\">" + esc(label) + ":</span> " + esc(text) + "</p>";
  }

  function openInstructionPoint(m, wasCorrect) {
    var ip = m.instructionPoint;
    var title = wasCorrect ? "CORRECT — " + ip.outcome : "Instruction Point — " + ip.outcome;
    var body =
      row("Instruction Point", ip.instructionPoint) +
      row("Why This Works", ip.whyThisWorks) +
      row("Air Force Contribution", ip.airForceContribution) +
      row("Joint Force Value", ip.jointForceValue) +
      (ip.asset ? row(ip.assetLabel, ip.asset) : "");
    openDialog(title, body, "Continue", wasCorrect ? "ok" : "");
  }

  function openReassess(m, selectedOpt, recOk, finalAttempt) {
    var t = content.reassessTemplate;
    var body = "";
    if (!recOk && m.reassess[selectedOpt]) {
      body += "<p>" + esc(m.reassess[selectedOpt].text) + "</p>";
    }
    body += "<p>" + esc(t.close) + "</p>";
    if (finalAttempt) {
      body += "<p class=\"ip-note\">No credit for this mission. Use Review Instruction Point to see the recommended answer.</p>";
    }
    openDialog(t.heading, body, finalAttempt ? "Continue" : "Review the Operational Problem", "warn");
  }

  function openDialog(title, bodyHTML, buttonLabel, tone) {
    lastFocus = document.activeElement;
    overlayEl.hidden = false;
    var dlg = overlayEl.querySelector(".dialog");
    dlg.className = "dialog" + (tone ? " tone-" + tone : "");
    document.getElementById("dialog-title").textContent = title;
    document.getElementById("dialog-body").innerHTML = bodyHTML;
    var closeBtn = document.getElementById("dialog-close");
    closeBtn.textContent = buttonLabel || "Close";
    closeBtn.focus();
    overlayEl.addEventListener("click", onOverlayClick);
    document.addEventListener("keydown", onDialogKey);
  }

  function onOverlayClick(e) {
    if (e.target === overlayEl) closeDialog();
  }

  function onDialogKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeDialog();
    }
  }

  function closeDialog(silent) {
    if (!overlayEl || overlayEl.hidden) return;
    overlayEl.hidden = true;
    overlayEl.removeEventListener("click", onOverlayClick);
    document.removeEventListener("keydown", onDialogKey);
    if (!silent && lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  /* ---------- lifecycle ---------- */

  var unloaded = false;
  function onUnload() {
    if (unloaded) return;
    unloaded = true;
    persist({ unloading: true });
    SCORM.terminate();
  }

  function loadContent() {
    if (typeof COURSE_DATA !== "undefined" && COURSE_DATA) {
      return Promise.resolve(COURSE_DATA);
    }
    return fetch("data/content.json").then(function (r) {
      if (!r.ok) throw new Error("content.json missing");
      return r.json();
    });
  }

  function boot() {
    appEl = document.getElementById("app");
    overlayEl = document.getElementById("overlay");
    document.getElementById("dialog-close").addEventListener("click", function () {
      closeDialog();
    });

    loadContent().then(function (data) {
      content = data;
      TOTAL_MISSIONS = 0;
      content.scenarios.forEach(function (s) { TOTAL_MISSIONS += s.missions.length; });
      MAX_SCORE = TOTAL_MISSIONS * POINTS_PER_MISSION;

      SCORM.initialize();
      restoreSuspend(SCORM.getValue("cmi.suspend_data"));
      applyLocation(SCORM.getValue("cmi.location"));
      if (SCORM.getValue("cmi.completion_status") !== "completed") {
        SCORM.setValue("cmi.completion_status", "incomplete");
      }
      persist();
      render();
    }).catch(function (err) {
      appEl.innerHTML = "<p class=\"boot\">Unable to load course content.</p>";
      console.error(err);
    });

    window.addEventListener("pagehide", onUnload);
    window.addEventListener("beforeunload", onUnload);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
