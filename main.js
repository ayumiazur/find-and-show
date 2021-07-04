/* =========================================================

Find and Show - Adobe XD Plugin

------------------------------------------------------------

Ver 0.0.1

========================================================= */




const { Artboard, Text, Rectangle, Color, Group, SymbolInstance, selection, root } = require("scenegraph");
const { alert, error } = require("./lib/dialogs.js");

let panel;

function create(selection) {
  const HTML =
    `<style>
            .break {
                flex-wrap: wrap;
            }
            label.row > span {
                color: #8E8E8E;
                width: 20px;
                text-align: right;
                font-size: 9px;
            }
            label.row input {
                flex: 1 1 auto;
            }
            h1 {
              font-size: 13px;
              margin: 10px 0;
              letter-spacing: 0;
            }
            .chk {
              vertical-align: middle;
            }
            input[type=checkbox] {
              margin-right: 6px;
            }
            .Keyword {
              display: block;
              margin: 5px 0;
              padding: 3px;
              font-size: 15px;
              font-weight: bold;
              background: #ededed;
            }
            .resultNum {
              display: block;
              text-align: right;
            }
            .noResult {
              display: block;
              margin: 20px 0 0;
              text-align: center;
            }
            .link {
              display: block;
              padding: 10px 20px 10px 10px;
              border-bottom: 1px solid #ddd;
              background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJpY29ubW9uc3RyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB3aWR0aD0iMjRweCIgaGVpZ2h0PSIyNHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI0IDI0OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6I0NDQ0NDQzt9Cjwvc3R5bGU+Cjxwb2x5Z29uIGlkPSJhcnJvdy0yNSIgY2xhc3M9InN0MCIgcG9pbnRzPSI1LDMgOC4wNTcsMCAyMCwxMiA4LjA1NywyNCA1LDIxIDE0LDEyICIvPgo8L3N2Zz4K');
              background-size: 6%;
              background-position: right 5px center;
            }
            .artboard {
              display: block;
              font-size: 90%;
              color: #999;
              padding: 0 0 5px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .text {
              display: block;
            }
            .obj {
              display: inline-block;
              background: #e3e3e3;
              padding: 2px 3px;
              font-size: 90%;
              margin: 0 0 5px;
              border-radius: 2px;
            }
            .obj--symbol {
              color: #51AD7F;
            }
            .obj--group {
              color: #4CA3DD;
            }
            .highlight {
              background: #FFD700;
              font-weight: bold;
            }
            a:hover {
              background-color: #fff;
            }
            .show {
                display: block;
                width: auto;
            }
            .hide {
                display: none;
            }
        </style>
        <form method="dialog" id="main">
            <div class="">
                <label class="row">
                    <input type="text" uxp-quiet="true" id="txtV" value="" placeholder="Search Text..." />
                </label>
            </div>
            <footer>
              <button id="ok" type="submit" uxp-variant="cta">Search</button>
            </footer>
        </form>
        <div id="result"></div>
        <p id="warning">This plugin requires you to select a text in the document. Please select a text.</p>
        `

  function searchText(e) {

    const sTxtValue = document.querySelector("#txtV").value;

    if ((sTxtValue == '') || (sTxtValue == undefined)) {

      showError();

    } else if (sTxtValue.length < 2) {

      showError();

    } else if (sTxtValue && (sTxtValue.length > 1)) {

      document.querySelector("#txtV").value = sTxtValue;
      document.getElementById("result").className = "show";

      let aNode = document.getElementById("result");
      for (let i = aNode.childNodes.length - 1; i >= 0; i--) {
        aNode.removeChild(aNode.childNodes[i]);
      }

      const { editDocument } = require("application");
      const viewport = require("viewport");

      let resultTitle = document.createElement('h1');
      document.getElementById("result").appendChild(resultTitle);

      const regexp = new RegExp(sTxtValue, 'gi');

      let ul = document.createElement('ul');
      document.getElementById("result").appendChild(ul);

      let artboard = root.children;
      for (let i = 0; i < artboard.length; i++) {

        let abObj = artboard.at(i).children;
        for (let j = 0; j < abObj.length; j++) {

          if (abObj.at(j) instanceof Text) {

            _regexp(artboard.at(i), abObj.at(j));

          } else if ((abObj.at(j) instanceof SymbolInstance) || (abObj.at(j) instanceof Group)) {

            grpToText(artboard.at(i), abObj.at(j).children);

          }

        }
      }

      function grpToText(artboard, group) {

        for (let i = 0; i < group.length; i++) {

          if (group.at(i) instanceof Text) {

            _regexp(artboard, group.at(i), group.at(i).parent)

          } else if ((group.at(i) instanceof SymbolInstance) || (group.at(i) instanceof Group)) {

            for (let j = 0; j < group.at(i).children.length; j++) {
              if (group.at(i).children.at(j) instanceof Text) {

                _regexp(artboard, group.at(i).children.at(j), group.at(i).children.at(j).parent)

              }

            }

          }

        }
      }



      function _regexp(artboard, obj, parent) {

        if (obj.text.toLowerCase().indexOf(sTxtValue.toLowerCase()) !== -1) {
          let x = obj.globalBounds.x;
          let y = obj.globalBounds.y;
          let w = obj.globalBounds.width;
          let h = obj.globalBounds.height;

          let li = document.createElement('li');
          ul.appendChild(li);

          let objKind;
          if (parent) {
            if (parent instanceof SymbolInstance) {
              objKind = '<span class="obj obj--symbol">Component</span>';
            } else if (parent instanceof Group) {
              objKind = '<span class="obj obj--group">Group</span>';
            }
          }

          if (obj.text.toUpperCase() == sTxtValue.toUpperCase()) {

            if (parent) {
              li.innerHTML = list(x, y, w, h, artboard.name, obj.text, objKind);
            } else {
              li.innerHTML = list(x, y, w, h, artboard.name, obj.text);
            }

          } else {

            let replaceTxt = obj.text.replace(new RegExp(sTxtValue, 'gi'), (match) => `<span class="highlight">${match}</span>`);

            if (parent) {
              li.innerHTML = list(x, y, w, h, artboard.name, replaceTxt, objKind);
            } else {
              li.innerHTML = list(x, y, w, h, artboard.name, replaceTxt);
            }

          }

        }

      }

      function list(x, y, w, h, artboard, text, label) {
        let output;
        if (label) {
          output = '<a class="link" data-x="' + x + '" data-y="' + y + '" data-w="' + w + '" data-h="' + h + '"><span class="artboard">' + artboard + '</span>' + label + '<span class="text">' + text + '</span></a>';
        } else {
          output = '<a class="link" data-x="' + x + '" data-y="' + y + '" data-w="' + w + '" data-h="' + h + '"><span class="artboard">' + artboard + '</span><span class="text">' + text + '</span></a>';
        }
        return output;
      }

      let link = document.getElementsByClassName("link");
      for (let i = 0; i < link.length; i++) {
        link[i].addEventListener('click', onSelect);
      }

      resultTitle.innerHTML = 'Search Keyword: <span class="Keyword">' + sTxtValue + '</span>';

      if (link.length == 0) {
        resultTitle.innerHTML += '<span class="noResult">No results found</span>';
      } else {
        resultTitle.innerHTML += '<span class="resultNum">' + link.length + ' results</span>';
      }

    }

  }


  function onSelect(e) {

    const { editDocument } = require("application");
    const viewport = require("viewport");

    editDocument(selection => {
      let x = e.currentTarget.getAttribute('data-x');
      let y = e.currentTarget.getAttribute('data-y');
      let w = e.currentTarget.getAttribute('data-w');
      let h = e.currentTarget.getAttribute('data-h');
      viewport.scrollToCenter(Number(x), Number(y)); //現在の画面拡大率の状態で画面の真ん中にフォーカス
    })

  }

  panel = document.createElement("div");
  panel.innerHTML = HTML;
  panel.querySelector("form").addEventListener("submit", searchText);

  return panel;
}

function show(event) {
  if (!panel) event.node.appendChild(create());
}

function update(selection) {
  const isSelection = selection.items.length;
  let form = document.querySelector("form");
  let warning = document.querySelector("#warning");
  let result = document.querySelector("#result");

  form.className = "show";
  warning.className = "hide";

  if ((isSelection >= 2) || !(isSelection)) {
    document.querySelector("#txtV").value = '';
  } else if (isSelection == 1) {
    document.querySelector("#txtV").value = selection.items[0].text;
  }

}

async function showError() {
  await error('Error!',
    'This plugin requires you to input search text.',
    'Please check:',
    '* Try again input text.',
    '* Please input 2 or more characters.');
}

module.exports = {
  panels: {
      search: {
      show,
      update,
      showError
    }
  }
};